from __future__ import annotations

import csv
import json
import math
import sys
from urllib.parse import parse_qs, urlparse
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from python_pipeline.magicformula.eligibility import assess_company
from python_pipeline.magicformula.quality import quality_score
from python_pipeline.magicformula.ranking import rank_magic_formula
from python_pipeline.magicformula.universe_sources import load_all_universe_rows, canonical_file_sha256
from python_pipeline.magicformula.universe import normalize_universe_company, translate_reasons

FINANCIALS_PATH = REPO_ROOT / "python_pipeline/data/financials.csv"
SOURCE_CHECKS_PATH = REPO_ROOT / "python_pipeline/data/financial_source_checks.csv"
MANIFEST_PATH = REPO_ROOT / "python_pipeline/data/universe_manifest.json"
FETCH_AUDIT_PATH = FINANCIALS_PATH.with_suffix(".audit.json")
FETCH_REASON_LABELS = {
    "unsupported_ev_currency_basis": "EV:n valuuttaperustaa ei ole varmennettu, kun raportointi- ja noteerausvaluutta eroavat.",
    "missing_common_annual_period": "Taseesta ja tuloslaskelmasta ei löytynyt yhteistä vuosiperiodia.",
    "missing_critical_statement_fields": "Yhteiseltä vuosiperiodilta puuttuu pakollinen tase- tai liiketuloskenttä.",
    "missing_valuation_or_market_date": "Markkina-arvo, EV tai markkinadatan päivä puuttuu lähteestä.",
    "financial_instrument_identity_mismatch": "Talousdatalähteen symbolia ja pörssiä ei saatu vastaamaan Nasdaq-listausta.",
}
OUTPUT_PATH = REPO_ROOT / "src/data/ranking-v1.json"
METHODOLOGY_CODES = {
    "financial_sector_methodology", "utility_sector_methodology", "non_main_market",
    "duplicate_issuer_listing", "market_cap_below_threshold", "ebit_non_positive",
    "enterprise_value_non_positive", "invested_capital_non_positive",
}


def load_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def read_float(value: object) -> float | None:
    if value in (None, ""):
        return None
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return result if math.isfinite(result) else None


def build_financial_snapshot(row: dict | None) -> dict | None:
    if row is None:
        return None
    numeric = ("market_cap", "market_cap_eur", "ebit", "enterprise_value", "current_assets",
               "current_liabilities", "cash", "short_term_debt", "net_ppe", "fx_rate_to_eur")
    result = {field: read_float(row.get(field)) for field in numeric}
    for field in ("statement_date", "source_symbol", "ev_source", "currency", "financial_currency",
                  "price_currency", "market_currency", "market_data_date", "retrieved_at", "fetched_at",
                  "fx_date", "period_type", "source_url", "fx_source_url", "ebit_source_field",
                  "enterprise_value_currency", "amount_unit", "source_fields", "source_reconciliation_status",
                  "reconciliation_source_url", "reconciliation_detail"):
        result[field] = row.get(field) or None
    parts = [result[x] for x in ("current_assets", "cash", "current_liabilities", "short_term_debt", "net_ppe")]
    result["invested_capital"] = None if any(x is None for x in parts) else parts[0] - parts[1] - parts[2] + parts[3] + parts[4]
    # Legacy provenance is never inferred from the export timestamp.
    for first, second in (("currency", "financial_currency"), ("price_currency", "market_currency"),
                          ("retrieved_at", "fetched_at")):
        result[first] = result[first] or result[second]
        result[second] = result[second] or result[first]
    return result


def index_financials(rows: list[dict], companies: list) -> dict[str, dict]:
    counts = Counter(company.ticker for company in companies)
    result = {}
    for row in rows:
        ticker = str(row["ticker"]).strip().upper()
        exchange = str(row.get("exchange") or "").strip().upper()
        key = row.get("listing_id") or (f"{exchange}:{ticker}" if exchange else None)
        # Old unqualified data is displayable only for an unambiguous listing.
        if not key and counts[ticker] == 1:
            key = next(c.listing_id for c in companies if c.ticker == ticker)
        if not key:
            continue
        if exchange and key != f"{exchange}:{ticker}":
            raise ValueError(f"Ristiriitainen talousdatan listausavain: {key}")
        if key in result:
            raise ValueError(f"Talousdatan duplikaatti: {key}")
        result[key] = row
    return result


def build_dataset(universe_rows: list[dict], financial_rows: list[dict], generated_at: str | None = None,
                  source_checks: list[dict] | None = None, universe_manifest: dict | None = None,
                  fetch_audit: dict | None = None) -> dict:
    companies = sorted((normalize_universe_company(row) for row in universe_rows), key=lambda c: c.listing_id)
    if len({c.listing_id for c in companies}) != len(companies):
        raise ValueError("Universumissa on listausavaimen duplikaatteja")
    issuer_by_isin = {}
    for company in companies:
        if company.isin and company.issuer_id:
            if company.isin in issuer_by_isin and issuer_by_isin[company.isin] != company.issuer_id:
                raise ValueError(f"ISIN on liitetty eri yhtiöihin: {company.isin}")
            issuer_by_isin[company.isin] = company.issuer_id
    financials = index_financials(financial_rows, companies)
    fetch_issues = {item["listing_id"]: item["reason"] for item in (fetch_audit or {}).get("missing", [])}
    for check in source_checks or []:
        row = financials.get(check["listing_id"])
        if row and row.get("statement_date") == check.get("statement_date"):
            financials[check["listing_id"]] = {
                **row, "source_reconciliation_status": check["status"],
                "reconciliation_source_url": check["source_url"], "reconciliation_detail": check["detail"],
            }
    eligible, raw, excluded = [], [], []
    representatives = {}
    assessed = {}
    for company in companies:
        record, codes = assess_company(company, financials.get(company.listing_id))
        assessed[company.listing_id] = (record, codes)
        if record is not None:
            issuer = company.issuer_id
            if not issuer:
                assessed[company.listing_id] = (None, ["missing_issuer_id"])
            elif issuer not in representatives:
                # Stable representative: first verified eligible listing by listing_id.
                representatives[issuer] = company.listing_id
            else:
                assessed[company.listing_id] = (None, ["duplicate_issuer_listing"])
    for company in companies:
        record, codes = assessed[company.listing_id]
        category = None if record else ("methodology" if codes and all(c in METHODOLOGY_CODES for c in codes) else "data")
        base = {
            "listing_id": company.listing_id, "issuer_id": company.issuer_id, "isin": company.isin,
            "ticker": company.ticker, "company": company.company, "sector": company.sector,
            "exchange": company.exchange, "country": company.country, "is_financial": company.is_financial,
            "listing_verified": company.listing_verified, "market_segment": company.market_segment,
            "listing_source_url": company.source_url, "listing_source_date": company.source_date,
            "exclusion_category": category, "exclusion_codes": codes,
            "financial_snapshot": build_financial_snapshot(financials.get(company.listing_id)),
        }
        reasons = translate_reasons(codes)
        if "missing_financial_statements" in codes and company.listing_id in fetch_issues:
            issue = fetch_issues[company.listing_id]
            reasons.append(FETCH_REASON_LABELS.get(issue, "Datalähteen haku epäonnistui; tiedot on tarkistettava ennen laskentaa."))
        raw.append({**base, "status": "ranked" if record else "excluded", "exclusion_reasons": reasons})
        if record:
            eligible.append(record)
        else:
            excluded.append({**base, "reasons": reasons})
    sources = {item["listing_id"]: item for item in raw}
    records = {item.listing_id: item for item in eligible}
    ranked = []
    for position, item in enumerate(rank_magic_formula(eligible), 1):
        base = sources[item.listing_id]
        snapshot = base["financial_snapshot"]
        warnings = ["Vuosiluvut ja markkina-arvo kuvaavat eri ajankohtia. Toimittajan EV:n velka-/kassapäivä ja oikaisut eivät ole täysin todennettavissa."]
        if snapshot and snapshot.get("source_reconciliation_status") != "verified":
            warnings.append("Kaikkia laskennan lähdekomponentteja ei ole täsmäytetty yhtiön omaan raporttiin.")
        if snapshot and snapshot.get("statement_date"):
            as_of = datetime.fromisoformat((generated_at or datetime.now(timezone.utc).isoformat()).replace("Z", "+00:00")).date()
            if (as_of - datetime.fromisoformat(snapshot["statement_date"]).date()).days > 550:
                warnings.append("Tilinpäätös on yli 550 päivää vanha.")
        ranked.append({
            **base, "rank": position, "roc_rank": item.roc_rank,
            "earnings_yield_rank": item.earnings_yield_rank, "magic_formula_score": item.rank_sum,
            "ebit_ev": item.ebit_ev, "roc": item.roc,
            "quality_score": quality_score(records[item.listing_id]), "validation_warnings": warnings,
        })
    coverage = {}
    for exchange in ("HEL", "STO"):
        listings = [item for item in raw if item["exchange"] == exchange]
        proof = (universe_manifest or {}).get("markets", {}).get(exchange, {})
        complete = (proof.get("complete_main_market_verified") is True
                    and proof.get("listing_count") == len(listings)
                    and set(proof.get("listing_ids", [])) == {item["listing_id"] for item in listings}
                    and all(item["listing_verified"] for item in listings))
        coverage[exchange] = {
            "candidate_listings": len(listings),
            "listings": sum(item["listing_verified"] for item in listings),
            "verified_listings": sum(item["listing_verified"] for item in listings),
            "ranked": sum(item["status"] == "ranked" for item in listings),
            "methodology_excluded": sum(item["exclusion_category"] == "methodology" for item in listings),
            "data_missing": sum(item["exclusion_category"] == "data" for item in listings),
            "complete_main_market_verified": complete,
            "issuer_resolved": sum(bool(item["issuer_id"]) for item in listings),
        }
    complete_universe = all(item["complete_main_market_verified"] for item in coverage.values())
    return {
        "generated_at": generated_at or datetime.now(timezone.utc).isoformat(),
        "universe": "Nasdaq Helsinki + Nasdaq Stockholm Main Market" + ("" if complete_universe else " (osittain varmennettu)"),
        "methodology_version": "v2-hel-sto-annual-operating-capital",
        "ranking_scope": "combined_hel_sto", "coverage": coverage,
        "universe_evidence": universe_manifest,
        "universe_source": "Nasdaq Main Market -listausotos" if complete_universe else "Varmennetut listaukset ja todentamaton kandidaattilista",
        "financials_source": "Yahoo Finance / vuosiraportit; rivikohtainen lähde ja valuutta",
        "data_sources": {
            "universe": {"label": "Nasdaq HEL + STO Main Market" if complete_universe else "HEL + STO: osittainen listausvarmennus", "detail": "Nasdaqin Main Market -rajapinnan listauskohtainen otos, sivutus ja segmentit on tarkistettu." if complete_universe else "Yahoo-exchange ei varmista Main Market -jäsenyyttä. Täyttä kattavuutta ei ole osoitettu.", "path": "https://www.nasdaq.com/european-market-activity/shares"},
            "financials": {"label": "Yahoo Finance / lähdekohtainen talousdata", "detail": "Lähde, valuutat ja päivämäärät näytetään yhtiösivulla. Puuttuvaa tietoa ei arvioida.", "path": "https://finance.yahoo.com/"},
        },
        "raw_universe": raw, "rows": ranked, "excluded": excluded,
    }


def load_verified_manifest() -> dict | None:
    if not MANIFEST_PATH.exists():
        return None
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    snapshot_path = (REPO_ROOT / manifest["snapshot_path"]).resolve()
    if not snapshot_path.is_relative_to(REPO_ROOT) or canonical_file_sha256(snapshot_path) != manifest["snapshot_sha256"]:
        raise ValueError("Universen lähdeotos ei vastaa manifestia")
    snapshot = json.loads(snapshot_path.read_text(encoding="utf-8"))
    if snapshot.get("category") != "MAIN_MARKET" or set(manifest["markets"]) != {"HEL", "STO"}:
        raise ValueError("Universen markkina-/segmenttirajaus on virheellinen")
    for exchange, market in manifest["markets"].items():
        path = (REPO_ROOT / market["csv_path"]).resolve()
        if not path.is_relative_to(REPO_ROOT) or canonical_file_sha256(path) != market["csv_sha256"]:
            raise ValueError("Universe CSV ei vastaa varmennettua manifestia; muodosta manifesti uudelleen lähdehausta")
        if any(source.get("total_pages") not in (0, 1) or (source.get("total_pages") == 0 and source.get("total", 0) != 0) for source in market["sources"]):
            raise ValueError("Universen lähteen sivutusta ei ole varmennettu")
        if {source["segment"] for source in market["sources"]} != {"LARGE_CAP", "MID_CAP", "SMALL_CAP", "SPAC"}:
            raise ValueError("Universen kaikkia Main Market -segmenttejä ei ole tarkistettu")
        snapshot_rows = []
        for source in market["sources"]:
            parsed = urlparse(source["url"])
            params = parse_qs(parsed.query)
            if parsed.hostname != "api.nasdaq.com" or params.get("category") != ["MAIN_MARKET"] or params.get("market") != [exchange] or params.get("segment") != [source["segment"]]:
                raise ValueError("Universen lähteen markkinasuodatin ei vastaa manifestia")
            proof = next((item for item in snapshot["sources"] if item["url"] == source["url"]), None)
            if not proof or proof["payload_sha256"] != source["payload_sha256"] or source["row_count"] != len(proof["listings"]) or proof["pagination"]["total"] != source["row_count"]:
                raise ValueError("Universen lähteen rivimäärä tai tiiviste ei täsmää")
            snapshot_rows.extend(proof["listings"])
        if len(snapshot_rows) != market["listing_count"] or {f'{row["exchange"]}:{row["ticker"]}' for row in snapshot_rows} != set(market["listing_ids"]):
            raise ValueError("Universen manifesti ei vastaa lähteen listausjoukkoa")
    return manifest


def main() -> None:
    payload = build_dataset(load_all_universe_rows(), load_csv(FINANCIALS_PATH),
                            source_checks=load_csv(SOURCE_CHECKS_PATH) if SOURCE_CHECKS_PATH.exists() else [],
                            universe_manifest=load_verified_manifest(),
                            fetch_audit=json.loads(FETCH_AUDIT_PATH.read_text(encoding="utf-8")) if FETCH_AUDIT_PATH.exists() else None)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False, allow_nan=False) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(payload["coverage"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
