from __future__ import annotations

import csv
from pathlib import Path

import yfinance as yf
from yfinance import EquityQuery

OUTPUT_PATH = Path('/tmp/nordic_universe.csv')
MARKET_CAP_MIN = 50_000_000
EXCHANGES = ('HEL', 'STO')


def fetch_exchange(exchange: str) -> list[dict[str, str]]:
    query = EquityQuery(
        'and',
        [
            EquityQuery('eq', ['exchange', exchange]),
            EquityQuery('gte', ['intradaymarketcap', MARKET_CAP_MIN]),
        ],
    )

    offset = 0
    page_size = 250
    collected: list[dict[str, str]] = []

    while True:
        payload = yf.screen(query, size=page_size, offset=offset, sortField='ticker', sortAsc=True)
        quotes = payload.get('quotes', [])
        if not quotes:
            break

        for quote in quotes:
            ticker_yf = str(quote.get('symbol') or '').strip().upper()
            if not ticker_yf:
                continue
            ticker_local = ticker_yf.split('.')[0]
            company = str(quote.get('shortName') or quote.get('longName') or ticker_local).strip()
            sector = str(quote.get('sector') or '').strip() or 'Unknown'
            country = str(quote.get('country') or ('Finland' if exchange == 'HEL' else 'Sweden')).strip()

            collected.append(
                {
                    'ticker_yf': ticker_yf,
                    'ticker_local': ticker_local,
                    'company': company,
                    'sector': sector,
                    'country': country,
                    'exchange': exchange,
                }
            )

        if len(quotes) < page_size:
            break
        offset += page_size

    return collected


def main() -> None:
    rows: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    for exchange in EXCHANGES:
        fetched = fetch_exchange(exchange)
        for row in fetched:
            key = (row['exchange'], row['ticker_local'])
            if key in seen:
                continue
            seen.add(key)
            rows.append(row)

    rows.sort(key=lambda row: (row['exchange'], row['ticker_local']))

    with OUTPUT_PATH.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(
            f,
            fieldnames=['ticker_yf', 'ticker_local', 'company', 'sector', 'country', 'exchange'],
        )
        writer.writeheader()
        writer.writerows(rows)

    hel_count = sum(1 for row in rows if row['exchange'] == 'HEL')
    sto_count = sum(1 for row in rows if row['exchange'] == 'STO')
    print(f'Wrote {OUTPUT_PATH}')
    print(f'HEL: {hel_count}, STO: {sto_count}, Total: {len(rows)}')


if __name__ == '__main__':
    main()
