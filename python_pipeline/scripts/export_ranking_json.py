from __future__ import annotations

import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from python_pipeline.magicformula.normalization import normalize_record, validate_record
from python_pipeline.magicformula.quality import quality_score
from python_pipeline.magicformula.ranking import rank_magic_formula

INPUT_PATH = REPO_ROOT / "python_pipeline" / "data" / "universe.csv"
OUTPUT_PATH = REPO_ROOT / "src" / "data" / "ranking-v1.json"


def main() -> None:
    raw_rows = list(csv.DictReader(INPUT_PATH.read_text(encoding="utf-8").splitlines()))

    normalized = []
    warnings_by_ticker: dict[str, list[str]] = {}
    for row in raw_rows:
        record = normalize_record(row)
        warnings = validate_record(record)
        warnings_by_ticker[record.ticker] = warnings
        if not warnings:
            normalized.append(record)

    ranked = rank_magic_formula(normalized)

    rank_by_ticker = {item.ticker: idx + 1 for idx, item in enumerate(ranked)}
    payload_rows = []
    for item in ranked:
        source = next(record for record in normalized if record.ticker == item.ticker)
        payload_rows.append(
            {
                "rank": rank_by_ticker[item.ticker],
                "ticker": item.ticker,
                "company": item.company,
                "magic_formula_score": item.magic_formula_rank,
                "ebit_ev": round(item.ebit_ev, 6),
                "roc": round(item.roc, 6),
                "quality_score": quality_score(source),
                "validation_warnings": warnings_by_ticker[item.ticker],
            }
        )

    excluded = [
        {"ticker": ticker, "reasons": reasons}
        for ticker, reasons in sorted(warnings_by_ticker.items())
        if reasons
    ]

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "universe": "Nasdaq Helsinki Main Market",
        "methodology_version": "v1-demo",
        "rows": payload_rows,
        "excluded": excluded,
    }

    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Kirjoitettu {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
