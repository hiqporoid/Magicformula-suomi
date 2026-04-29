from __future__ import annotations

import csv
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
INPUT_PATH = Path('/tmp/nordic_universe.csv')
HEL_PATH = REPO_ROOT / 'python_pipeline' / 'data' / 'main_market_universe.csv'
STO_PATH = REPO_ROOT / 'python_pipeline' / 'data' / 'stockholm_main_market_universe.csv'
EXPECTED_HEL_MIN = 96
EXPECTED_STO_MIN = 151


def normalize_ticker(ticker_local: str, ticker_yf: str) -> str:
    base = (ticker_local or '').strip().upper()
    if base:
        return base
    return ticker_yf.split('.')[0].strip().upper()


def main() -> None:
    if not INPUT_PATH.exists():
        raise SystemExit(f'Missing input CSV: {INPUT_PATH}')

    rows = list(csv.DictReader(INPUT_PATH.read_text(encoding='utf-8').splitlines()))
    out = {'HEL': [], 'STO': []}
    seen = set()

    for row in rows:
        exchange = (row.get('exchange') or '').strip().upper()
        if exchange not in out:
            continue
        ticker = normalize_ticker(row.get('ticker_local', ''), row.get('ticker_yf', ''))
        if not ticker:
            continue
        key = (exchange, ticker)
        if key in seen:
            continue
        seen.add(key)
        out[exchange].append(
            {
                'ticker': ticker,
                'company': (row.get('company') or '').strip(),
                'sector': (row.get('sector') or '').strip(),
                'exchange': exchange,
                'country': (row.get('country') or '').strip()[:2].upper(),
            }
        )

    for exchange, path in [('HEL', HEL_PATH), ('STO', STO_PATH)]:
        with path.open('w', encoding='utf-8', newline='') as f:
            w = csv.DictWriter(f, fieldnames=['ticker', 'company', 'sector', 'exchange', 'country'])
            w.writeheader()
            w.writerows(sorted(out[exchange], key=lambda x: x['ticker']))

    print(f'HEL rows: {len(out["HEL"])} -> {HEL_PATH}')
    print(f'STO rows: {len(out["STO"])} -> {STO_PATH}')

    if len(out['HEL']) < EXPECTED_HEL_MIN or len(out['STO']) < EXPECTED_STO_MIN:
        hel_count = len(out['HEL'])
        sto_count = len(out['STO'])
        raise SystemExit(
            f'Universe incomplete: HEL={hel_count} (min {EXPECTED_HEL_MIN}), '
            f'STO={sto_count} (min {EXPECTED_STO_MIN}).'
        )


if __name__ == '__main__':
    main()
