from __future__ import annotations

import csv
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "python_pipeline" / "data"

UNIVERSE_FILES = {
    "HEL": DATA_DIR / "main_market_universe.csv",
    "STO": DATA_DIR / "stockholm_main_market_universe.csv",
}


def load_all_universe_rows() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for exchange, path in UNIVERSE_FILES.items():
        if not path.exists():
            continue
        file_rows = list(csv.DictReader(path.read_text(encoding="utf-8").splitlines()))
        for row in file_rows:
            normalized = dict(row)
            normalized["exchange"] = (row.get("exchange") or exchange).strip().upper()
            rows.append(normalized)
    return rows
