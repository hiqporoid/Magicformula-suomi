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


def main() -> None:
    universe_rows = load_csv(UNIVERSE_PATH)
    financial_rows = load_csv(FINANCIALS_PATH)

    companies = [normalize_universe_company(row) for row in universe_rows]
    financial_by_ticker = {str(row["ticker"]).strip().upper(): row for row in financial_rows}

    eligible_records = []
    eligible_record_by_ticker = {}
    raw_universe = []
    excluded = []

    for company in companies:
        record, exclusion_codes = assess_company(company, financial_by_ticker.get(company.ticker))
        translated_reasons = translate_reasons(exclusion_codes)
        is_ranked = record is not None

        raw_universe.append(
            {
                "ticker": company.ticker,
                "company": company.company,
                "sector": company.sector,
                "is_financial": company.is_financial,
                "status": "ranked" if is_ranked else "excluded",
                "exclusion_reasons": translated_reasons,
            }
        )

        if not is_ranked:
            excluded.append(
                {
                    "ticker": company.ticker,
                    "company": company.company,
                    "sector": company.sector,
                    "is_financial": company.is_financial,
                    "reasons": translated_reasons,
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
        payload_rows.append(
            {
                "rank": rank_by_ticker[item.ticker],
                "ticker": item.ticker,
                "company": item.company,
                "sector": source.sector,
                "is_financial": bool(source.sector == "Financial and insurance activities"),
                "magic_formula_score": item.magic_formula_rank,
                "ebit_ev": round(item.ebit_ev, 6),
                "roc": round(item.roc, 6),
                "quality_score": quality_score(source),
                "validation_warnings": [],
            }
        )

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "universe": "Nasdaq Helsinki Main Market",
        "methodology_version": "v1-main-market",
        "universe_source": "python_pipeline/data/main_market_universe.csv",
        "raw_universe": raw_universe,
        "rows": payload_rows,
        "excluded": excluded,
    }

    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Kirjoitettu {OUTPUT_PATH}")
    print(f"Universe: {len(raw_universe)}, ranked: {len(payload_rows)}, excluded: {len(excluded)}")


if __name__ == "__main__":
    main()
