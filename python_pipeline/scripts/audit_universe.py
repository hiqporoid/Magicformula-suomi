from __future__ import annotations

import argparse
import json
import math
from collections import Counter
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
RANKING_PATH = REPO_ROOT / "src/data/ranking-v1.json"


def load_dataset(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"), parse_constant=lambda x: (_ for _ in ()).throw(ValueError(f"Invalid JSON number: {x}")))


def summarize(dataset: dict) -> dict:
    raw, rows, excluded = dataset["raw_universe"], dataset["rows"], dataset["excluded"]
    exchange_counts = Counter(item.get("exchange", "UNKNOWN") for item in raw)
    reasons = Counter(reason for item in excluded for reason in item.get("reasons", []))
    ranks = [int(item["rank"]) for item in rows]
    return {
        "raw_count": len(raw), "ranked_count": len(rows), "excluded_count": len(excluded),
        "exchange_counts": dict(sorted(exchange_counts.items())),
        "excluded_reason_counts": dict(sorted(reasons.items(), key=lambda x: (-x[1], x[0]))),
        "rank_sequence_ok": sorted(ranks) == list(range(1, len(rows) + 1)) and len(set(ranks)) == len(ranks),
        "coverage": dataset.get("coverage", {}),
    }


def validate_dataset(dataset: dict) -> list[str]:
    errors = []
    raw, rows, excluded = dataset["raw_universe"], dataset["rows"], dataset["excluded"]
    def keys(items):
        return [item["listing_id"] for item in items]
    for label, items in (("raw", raw), ("ranked", rows), ("excluded", excluded)):
        if len(set(keys(items))) != len(items):
            errors.append(f"{label}: duplicate listing_id")
        for item in items:
            if item["listing_id"] != f'{item["exchange"]}:{item["ticker"]}':
                errors.append(f"{label}: invalid listing_id")
    if set(keys(rows)) & set(keys(excluded)) or set(keys(raw)) != set(keys(rows)) | set(keys(excluded)):
        errors.append("raw != ranked + excluded (disjoint)")
    ranked_keys = set(keys(rows))
    for item in raw:
        if (item.get("status") == "ranked") != (item["listing_id"] in ranked_keys):
            errors.append(f'{item["listing_id"]}: raw status mismatch')
        if item["listing_id"] not in ranked_keys and item.get("exclusion_category") not in {"data", "methodology"}:
            errors.append(f'{item["listing_id"]}: missing exclusion category')
    if not summarize(dataset)["rank_sequence_ok"]:
        errors.append("rank sequence")
    issuers = [row.get("issuer_id") for row in rows]
    if None in issuers or len(set(issuers)) != len(issuers):
        errors.append("ranked issuers missing or duplicated")
    def finite(value):
        if isinstance(value, float) and not math.isfinite(value):
            errors.append("non-finite number")
        elif isinstance(value, dict):
            for val in value.values():
                finite(val)
        elif isinstance(value, list):
            for val in value:
                finite(val)
    finite(dataset)
    for row in rows:
        snapshot = row["financial_snapshot"]
        if snapshot.get("source_reconciliation_status") == "mismatch":
            errors.append(f'{row["listing_id"]}: unresolved source mismatch')
        if row.get("market_segment") != "Main Market":
            errors.append(f'{row["listing_id"]}: ranked listing is not Main Market')
        try:
            capital = snapshot["current_assets"] - snapshot["cash"] - snapshot["current_liabilities"] + snapshot["short_term_debt"] + snapshot["net_ppe"]
            if not row["listing_verified"] or snapshot["market_cap_eur"] < 50_000_000:
                errors.append(f'{row["listing_id"]}: ineligible listing/market cap')
            if not (capital > 0 and snapshot["enterprise_value"] > 0 and snapshot["ebit"] > 0):
                errors.append(f'{row["listing_id"]}: nonpositive input')
            for actual, expected in ((row["roc"], snapshot["ebit"] / capital), (row["ebit_ev"], snapshot["ebit"] / snapshot["enterprise_value"]),
                                     (snapshot["invested_capital"], capital), (row["magic_formula_score"], row["roc_rank"] + row["earnings_yield_rank"])):
                if not math.isclose(actual, expected, rel_tol=1e-9, abs_tol=1e-12):
                    errors.append(f'{row["listing_id"]}: formula mismatch')
            if not all(snapshot.get(field) for field in ("currency", "price_currency", "statement_date", "retrieved_at", "market_data_date", "source_url")):
                errors.append(f'{row["listing_id"]}: missing provenance')
        except (KeyError, TypeError, ZeroDivisionError):
            errors.append(f'{row["listing_id"]}: incomplete input')
    for field in ("roc_rank", "earnings_yield_rank"):
        if sorted(row[field] for row in rows) != list(range(1, len(rows) + 1)):
            errors.append(f"{field}: sequence")
    for metric, rank_field in (("roc", "roc_rank"), ("ebit_ev", "earnings_yield_rank")):
        for expected, row in enumerate(sorted(rows, key=lambda r: (-r[metric], r["listing_id"])), 1):
            if row[rank_field] != expected:
                errors.append(f"{rank_field}: order")
    if keys(rows) != keys(sorted(rows, key=lambda r: (r["magic_formula_score"], r["listing_id"]))):
        errors.append("combined ranking order")
    for exchange, coverage in dataset.get("coverage", {}).items():
        listings = [item for item in raw if item["exchange"] == exchange]
        expected = {
            "candidate_listings": len(listings),
            "verified_listings": sum(bool(item["listing_verified"]) for item in listings),
            "ranked": sum(item["status"] == "ranked" for item in listings),
            "methodology_excluded": sum(item["exclusion_category"] == "methodology" for item in listings),
            "data_missing": sum(item["exclusion_category"] == "data" for item in listings),
        }
        for field, count in expected.items():
            if coverage.get(field) != count:
                errors.append(f"{exchange}: coverage {field}")
    return sorted(set(errors))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--require-complete", action="store_true", help="Estä julkaisu, jos kumpaakaan Main Market -listaa ei ole kokonaan varmennettu.")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    dataset = load_dataset(RANKING_PATH)
    report = summarize(dataset)
    report["integrity_errors"] = validate_dataset(dataset)
    report["release_ready"] = not report["integrity_errors"] and all(
        dataset.get("coverage", {}).get(exchange, {}).get("complete_main_market_verified") is True for exchange in ("HEL", "STO")
    ) and not any(item.get("exclusion_category") == "data" for item in dataset["excluded"])
    if any(row.get("financial_snapshot", {}).get("source_reconciliation_status") != "verified" for row in dataset["rows"]):
        report["release_ready"] = False
    text = json.dumps(report, ensure_ascii=False, indent=2)
    print(text)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text + "\n", encoding="utf-8", newline="\n")
    if report["integrity_errors"]:
        raise SystemExit("Datasetin eheystarkistus epäonnistui")
    if args.require_complete and not report["release_ready"]:
        raise SystemExit("Julkaisu estetty: Main Market -kattavuus, datan puutteet tai lähdetäsmäytykset ovat avoinna")


if __name__ == "__main__":
    main()
