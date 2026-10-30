"""Import a source-verified HEL+STO snapshot; Yahoo exchange is insufficient evidence."""
from __future__ import annotations

import argparse
import csv
import io
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))
from python_pipeline.magicformula.universe import normalize_country, normalize_sector, valid_isin

INPUT_PATH = REPO_ROOT / 'output' / 'verified_nordic_listings.csv'
HEL_PATH = REPO_ROOT / 'python_pipeline' / 'data' / 'main_market_universe.csv'
STO_PATH = REPO_ROOT / 'python_pipeline' / 'data' / 'stockholm_main_market_universe.csv'
FIELDNAMES = ['ticker', 'company', 'sector', 'exchange', 'country', 'market_segment',
              'listing_verified', 'source_url', 'source_date', 'isin', 'issuer_id', 'source_symbol',
              'nasdaq_symbol', 'orderbook_id', 'list_segment', 'listing_currency']


def normalize_ticker(ticker_local: str, ticker_yf: str) -> str:
    base = (ticker_local or '').strip().upper()
    if base:
        return base
    symbol = ticker_yf.strip().upper()
    for suffix in ('.HE', '.ST'):
        if symbol.endswith(suffix):
            return symbol[:-len(suffix)]
    return symbol


def prepare_rows(rows: list[dict[str, str]]) -> dict[str, list[dict[str, str]]]:
    out: dict[str, list[dict[str, str]]] = {'HEL': [], 'STO': []}
    seen: set[tuple[str, str]] = set()
    isin_issuer: dict[str, str] = {}
    for row in rows:
        exchange = str(row.get('exchange') or '').strip().upper()
        if exchange not in out:
            raise ValueError(f'Tuntematon pörssi: {exchange}')
        ticker = normalize_ticker(row.get('ticker') or row.get('ticker_local', ''), row.get('ticker_yf', ''))
        company = str(row.get('company') or '').strip()
        if not ticker or not company:
            raise ValueError('Listaukselta puuttuu ticker tai yhtiön nimi')
        key = (exchange, ticker)
        if key in seen:
            raise ValueError(f'Päällekkäinen listaus: {exchange}:{ticker}')
        seen.add(key)
        if row.get('market_segment') != 'Main Market' or str(row.get('listing_verified')).lower() not in {'true', '1'}:
            raise ValueError(f'Main Market -segmenttiä ei ole varmennettu: {exchange}:{ticker}')
        source = str(row.get('source_url') or '').strip()
        if urlparse(source).scheme != 'https' or not urlparse(source).hostname:
            raise ValueError(f'Listauslähteen HTTPS-URL puuttuu: {exchange}:{ticker}')
        try:
            source_date = date.fromisoformat(row.get('source_date', ''))
            if source_date > date.today():
                raise ValueError('Lähdepäivä on tulevaisuudessa')
        except ValueError as error:
            raise ValueError(f'Virheellinen listauslähteen päivä: {exchange}:{ticker}') from error
        isin = str(row.get('isin') or '').strip().upper()
        issuer_id = str(row.get('issuer_id') or '').strip()
        if not valid_isin(isin):
            raise ValueError(f'Virheellinen ISIN: {exchange}:{ticker}')
        if issuer_id and isin in isin_issuer and isin_issuer[isin] != issuer_id:
            raise ValueError(f'ISIN on liitetty eri yhtiöihin: {isin}')
        if issuer_id:
            isin_issuer[isin] = issuer_id
        out[exchange].append({
            'ticker': ticker, 'company': company, 'sector': normalize_sector(row.get('sector')) or '',
            'exchange': exchange, 'country': normalize_country(row.get('country')) or '',
            'market_segment': 'Main Market', 'listing_verified': 'true', 'source_url': source,
            'source_date': source_date.isoformat(), 'isin': isin, 'issuer_id': issuer_id,
            'source_symbol': str(row.get('source_symbol') or row.get('ticker_yf') or '').strip().upper(),
            **{field: str(row.get(field) or '').strip() for field in (
                'nasdaq_symbol', 'orderbook_id', 'list_segment', 'listing_currency')},
        })
    # This checks two-market input, never claims completeness from a row count.
    if any(not out[exchange] for exchange in out):
        raise ValueError('Universe incomplete: lähdevarmennettuja rivejä tarvitaan molemmista pörsseistä')
    return out


def main(input_path: Path | None = None) -> None:
    path = input_path or INPUT_PATH
    if not path.exists():
        raise SystemExit(f'Lähdevarmennettu CSV puuttuu: {path}; Yahoo-kandidaatteja ei tuoda päälistaksi.')
    try:
        out = prepare_rows(list(csv.DictReader(io.StringIO(path.read_text(encoding='utf-8-sig')))))
    except ValueError as error:
        raise SystemExit(str(error)) from error
    # Validate the entire input BEFORE either destination is touched.
    for exchange, destination in [('HEL', HEL_PATH), ('STO', STO_PATH)]:
        buffer = io.StringIO(newline='')
        writer = csv.DictWriter(buffer, fieldnames=FIELDNAMES, lineterminator='\n')
        writer.writeheader()
        writer.writerows(sorted(out[exchange], key=lambda row: row['ticker']))
        temporary = destination.with_suffix('.csv.tmp')
        temporary.write_text(buffer.getvalue(), encoding='utf-8')
        temporary.replace(destination)
        print(f'{exchange}: {len(out[exchange])} lähdevarmennettua listausta. Kattavuutta ei päätellä määrästä.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, default=INPUT_PATH)
    main(parser.parse_args().input)
