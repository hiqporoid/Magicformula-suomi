from __future__ import annotations

import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from python_pipeline.magicformula.eligibility import assess_company
from python_pipeline.magicformula.quality import quality_score
from python_pipeline.magicformula.ranking import rank_magic_formula
from python_pipeline.magicformula.universe import normalize_universe_company, translate_reasons

UNIVERSE_PATH = REPO_ROOT / "python_pipeline" / "data" / "main_market_universe.csv"
FINANCIALS_PATH = REPO_ROOT / "python_pipeline" / "data" / "financials.csv"
OUTPUT_PATH = REPO_ROOT / "src" / "data" / "ranking-v1.json"


def load_csv(path: Path) -> list[dict[str, str]]:
    return list(csv.DictReader(path.read_text(encoding="utf-8").splitlines()))


def read_float(value: str | None) -> float | None:
    if value in (None, ""):
        return None

    return float(value)


def build_financial_snapshot(row: dict[str, str] | None) -> dict[str, object] | None:
    if row is None:
        return None

    current_assets = read_float(row.get("current_assets"))
    current_liabilities = read_float(row.get("current_liabilities"))
    net_ppe = read_float(row.get("net_ppe"))
    ebit = read_float(row.get("ebit"))
    enterprise_value = read_float(row.get("enterprise_value"))

    if None in (current_assets, current_liabilities, net_ppe, ebit, enterprise_value):
        return None

    invested_capital = current_assets - current_liabilities + net_ppe

    return {
        "statement_date": row.get("statement_date") or None,
        "source_symbol": row.get("source_symbol") or None,
        "ev_source": row.get("ev_source") or None,
        "market_cap": read_float(row.get("market_cap")),
        "ebit": round(ebit, 6),
        "enterprise_value": round(enterprise_value, 6),
        "invested_capital": round(invested_capital, 6),
    }


def main() -> None:
    universe_rows = load_csv(UNIVERSE_PATH)
    financial_rows = load_csv(FINANCIALS_PATH)

    companies = [normalize_universe_company(row) for row in universe_rows]
    company_by_ticker = {company.ticker: company for company in companies}
    financial_by_ticker = {str(row["ticker"]).strip().upper(): row for row in financial_rows}

    eligible_records = []
    eligible_record_by_ticker = {}
    raw_universe = []
    excluded = []

    for company in companies:
        financial_row = financial_by_ticker.get(company.ticker)
        financial_snapshot = build_financial_snapshot(financial_row)
        record, exclusion_codes = assess_company(company, financial_row)
        translated_reasons = translate_reasons(exclusion_codes)
        is_ranked = record is not None

        raw_universe.append(
            {
                "ticker": company.ticker,
                "company": company.company,
                "sector": company.sector,
                "exchange": company.exchange,
                "is_financial": company.is_financial,
                "status": "ranked" if is_ranked else "excluded",
                "exclusion_reasons": translated_reasons,
                "financial_snapshot": financial_snapshot,
            }
        )

        if not is_ranked:
            excluded.append(
                {
                    "ticker": company.ticker,
                    "company": company.company,
                    "sector": company.sector,
                    "exchange": company.exchange,
                    "is_financial": company.is_financial,
                    "reasons": translated_reasons,
                    "financial_snapshot": financial_snapshot,
                }
            )
            continue

        eligible_records.append(record)
        eligible_record_by_ticker[company.ticker] = record

    ranked = rank_magic_formula(eligible_records)
    rank_by_ticker = {item.ticker: idx + 1 for idx, item in enumerate(ranked)}

    payload_rows = []
    for item in ranked:
        source = eligible_record_by_ticker[item.ticker]
        universe_company = company_by_ticker[item.ticker]
        financial_snapshot = build_financial_snapshot(financial_by_ticker.get(item.ticker))
        if financial_snapshot is None:
            raise ValueError(f"Puuttuva financial_snapshot rankatulle yhtiolle {item.ticker}")

        payload_rows.append(
            {
                "rank": rank_by_ticker[item.ticker],
                "ticker": item.ticker,
                "company": item.company,
                "sector": source.sector,
                "exchange": universe_company.exchange,
                "is_financial": bool(source.sector == "Financial and insurance activities"),
                "magic_formula_score": item.magic_formula_rank,
                "ebit_ev": round(item.ebit_ev, 6),
                "roc": round(item.roc, 6),
                "quality_score": quality_score(source),
                "validation_warnings": [],
                "financial_snapshot": financial_snapshot,
            }
        )

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "universe": "Nasdaq Helsinki Main Market",
        "methodology_version": "v1-main-market",
        "universe_source": "Nasdaq Helsinki Main Market -universe",
        "financials_source": "Yahoo Finance -financials-aineisto",
        "data_sources": {
            "universe": {
                "label": "Nasdaq Helsinki Main Market -universe",
                "detail": "Universe yllÃ¤pidetÃ¤Ã¤n omana lÃ¤hteenÃ¤Ã¤n Nasdaq Helsingin pÃ¤Ã¤listan yhtiÃ¶ille.",
                "path": "Nasdaq Helsinki Main Market",
            },
            "financials": {
                "label": "Yahoo Finance -> financials.csv",
                "detail": "Talousluvut generoidaan Yahoo Financesta ja viedÃ¤Ã¤n staattiseen vÃ¤litiedostoon ennen rankingia.",
                "path": "Yahoo Finance / financials-aineisto",
            },
        },
        "raw_universe": raw_universe,
        "rows": payload_rows,
        "excluded": excluded,
    }

    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Kirjoitettu {OUTPUT_PATH}")
    print(f"Universe: {len(raw_universe)}, ranked: {len(payload_rows)}, excluded: {len(excluded)}")


if __name__ == "__main__":
    main()
