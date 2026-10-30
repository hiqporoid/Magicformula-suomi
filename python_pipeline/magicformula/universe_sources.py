from __future__ import annotations

import csv
import hashlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "python_pipeline" / "data"


def canonical_file_sha256(path: Path) -> str:
    """Git can convert LF/CRLF on checkout; provenance hashes canonical UTF-8 text."""
    return hashlib.sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()

UNIVERSE_FILES = {
    "HEL": DATA_DIR / "main_market_universe.csv",
    "STO": DATA_DIR / "stockholm_main_market_universe.csv",
}


def load_all_universe_rows() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for exchange, path in UNIVERSE_FILES.items():
        if not path.exists():
            raise FileNotFoundError(f"Universe-tiedosto puuttuu: {path}")
        file_rows = list(csv.DictReader(path.read_text(encoding="utf-8").splitlines()))
        for row in file_rows:
            normalized = dict(row)
            normalized["exchange"] = (row.get("exchange") or exchange).strip().upper()
            if normalized["exchange"] != exchange:
                raise ValueError(f"Väärä pörssi tiedostossa {path}: {normalized['exchange']}")
            key = (exchange, str(row.get("ticker") or "").strip().upper())
            if key in seen:
                raise ValueError(f"Päällekkäinen listaus: {exchange}:{key[1]}")
            seen.add(key)
            rows.append(normalized)
    return rows
