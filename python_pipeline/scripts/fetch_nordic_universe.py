"""Fetch Nasdaq's public Main Market lists, with explicit venue/segment and pagination proof."""
from __future__ import annotations

import csv
import hashlib
import io
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

import requests

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))
from python_pipeline.magicformula.universe import normalize_sector, valid_isin
from python_pipeline.magicformula.universe_sources import load_all_universe_rows, canonical_file_sha256
from python_pipeline.scripts import import_nordic_universe as importer
from python_pipeline.scripts.refresh_issuer_mapping import refresh_mapping

BASE_URL = 'https://api.nasdaq.com/api/nordic/screener/shares'
EXCHANGES = ('HEL', 'STO')
SEGMENTS = ('LARGE_CAP', 'MID_CAP', 'SMALL_CAP', 'SPAC')
OUTPUT_PATH = REPO_ROOT / 'output' / 'verified_nordic_listings.csv'
MANIFEST_PATH = REPO_ROOT / 'python_pipeline' / 'data' / 'universe_manifest.json'


def parse_segment(payload: dict, exchange: str, segment: str, source_url: str,
                  checked: str, known_by_isin: dict) -> tuple[list[dict], dict]:
    if payload.get('status', {}).get('rCode') != 200 or not payload.get('data'):
        raise ValueError(f'Nasdaq-lähde epäonnistui: {exchange}/{segment}')
    data = payload['data']
    pagination = data['pagination']
    rows = data['instrumentListing']['rows'] or []
    if pagination['page'] != 1 or pagination['totalPages'] != 1 or pagination['total'] != len(rows):
        raise ValueError(f'Nasdaq-listan sivutus jäi vajaaksi: {exchange}/{segment}')
    source_segments = next(item['options'] for item in data['filters'] if item['key'] == 'segment')
    if {item['value'] for item in source_segments} != set(SEGMENTS):
        raise ValueError('Nasdaqin segmenttijoukko muuttui; tarkista uusi listausrakenne')
    output = []
    for row in rows:
        symbol = str(row.get('symbol') or '').strip()
        isin = str(row.get('isin') or '').strip().upper()
        if row.get('assetClass') != 'SHARES' or not symbol or not valid_isin(isin) or not row.get('orderbookId'):
            raise ValueError(f'Virheellinen Nasdaq-listaus: {exchange}/{symbol}')
        known = known_by_isin.get(isin, {})
        ticker = '-'.join(symbol.upper().split())
        output.append({
            'ticker': ticker, 'company': row['fullName'], 'sector': normalize_sector(row.get('sector')) or '',
            'exchange': exchange, 'country': known.get('country') or '',
            'market_segment': 'Main Market', 'listing_verified': 'true',
            'source_url': source_url, 'source_date': checked, 'isin': isin,
            # The screener identifies securities, not issuers. Never turn ISIN into a fake issuer ID.
            'issuer_id': known.get('issuer_id') or '',
            'source_symbol': ticker + ('.HE' if exchange == 'HEL' else '.ST'),
            'nasdaq_symbol': symbol, 'orderbook_id': row['orderbookId'],
            'list_segment': segment, 'listing_currency': row.get('currency') or '',
        })
    proof = {'exchange': exchange, 'segment': segment, 'url': source_url,
             'pagination': pagination, 'total_pages': pagination['totalPages'],
             'row_count': len(rows), 'listings': output}
    return output, proof


def fetch_all(session, known_by_isin: dict, checked: str) -> tuple[list[dict], list[dict]]:
    rows, sources = [], []
    for exchange in EXCHANGES:
        for segment in SEGMENTS:
            params = {'category': 'MAIN_MARKET', 'market': exchange, 'segment': segment,
                      'tableonly': 'false', 'size': 1000, 'page': 1}
            url = BASE_URL + '?' + urlencode(params)
            response = session.get(url, timeout=40)
            response.raise_for_status()
            segment_rows, proof = parse_segment(response.json(), exchange, segment, url, checked, known_by_isin)
            proof['payload_sha256'] = hashlib.sha256(response.content).hexdigest()
            rows.extend(segment_rows)
            sources.append(proof)
    if len({(row['exchange'], row['ticker']) for row in rows}) != len(rows):
        raise ValueError('Nasdaqin segmenttilistoissa on päällekkäisiä listausavaimia')
    return rows, sources


def main() -> None:
    now = datetime.now(timezone.utc)
    checked = now.date().isoformat()
    known_by_isin = {}
    for row in load_all_universe_rows():
        if row.get('isin') and row.get('issuer_id'):
            known_by_isin[row['isin']] = row
    mapping_path = REPO_ROOT / 'python_pipeline' / 'data' / 'isin_lei_mapping.csv'
    if mapping_path.exists():
        with mapping_path.open(encoding='utf-8-sig', newline='') as stream:
            for mapping in csv.DictReader(stream):
                known = known_by_isin.setdefault(mapping['isin'], {})
                if known.get('issuer_id') and known['issuer_id'] != mapping['lei']:
                    raise ValueError(f"ISIN–LEI-lähteiden ristiriita: {mapping['isin']}")
                known['issuer_id'] = mapping['lei']
    session = requests.Session()
    session.headers.update({'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.nasdaq.com/',
                            'Accept': 'application/json'})
    rows, sources = fetch_all(session, known_by_isin, checked)
    # Import validation runs before any tracked data is overwritten.
    prepared = importer.prepare_rows(rows)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    buffer = io.StringIO(newline='')
    writer = csv.DictWriter(buffer, fieldnames=importer.FIELDNAMES, lineterminator='\n')
    writer.writeheader()
    writer.writerows(row for exchange in EXCHANGES for row in prepared[exchange])
    OUTPUT_PATH.write_text(buffer.getvalue(), encoding='utf-8')
    # Resolve security-to-issuer links from a separate official source. A missing
    # LEI never invalidates the Nasdaq listing evidence, but prevents deduped ranking.
    refresh_mapping(OUTPUT_PATH, mapping_path, as_of=now.date(), session=session)
    with mapping_path.open(encoding='utf-8-sig', newline='') as stream:
        issuer_by_isin = {item['isin']: item['lei'] for item in csv.DictReader(stream)}
    for row in rows:
        lei = issuer_by_isin.get(row['isin'])
        if lei and row['issuer_id'] and lei != row['issuer_id']:
            raise ValueError(f"Nasdaq/GLEIF issuer-ristiriita: {row['isin']}")
        row['issuer_id'] = lei or row['issuer_id']
    prepared = importer.prepare_rows(rows)
    buffer = io.StringIO(newline='')
    writer = csv.DictWriter(buffer, fieldnames=importer.FIELDNAMES, lineterminator='\n')
    writer.writeheader()
    writer.writerows(row for exchange in EXCHANGES for row in prepared[exchange])
    OUTPUT_PATH.write_text(buffer.getvalue(), encoding='utf-8')
    importer.main(OUTPUT_PATH)
    snapshot_path = REPO_ROOT / 'docs' / 'audit' / f'nasdaq-listings-{checked}.json'
    snapshot_path.parent.mkdir(parents=True, exist_ok=True)
    snapshot = {'retrieved_at': now.isoformat(), 'source_page': 'https://www.nasdaq.com/european-market-activity/shares',
                'category': 'MAIN_MARKET', 'sources': sources}
    snapshot_path.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    manifest = {'retrieved_at': now.isoformat(), 'snapshot_path': snapshot_path.relative_to(REPO_ROOT).as_posix(),
                'snapshot_sha256': canonical_file_sha256(snapshot_path), 'markets': {}}
    for exchange, path in [('HEL', importer.HEL_PATH), ('STO', importer.STO_PATH)]:
        market_rows = prepared[exchange]
        manifest['markets'][exchange] = {
            'complete_main_market_verified': True, 'listing_count': len(market_rows),
            'csv_path': path.relative_to(REPO_ROOT).as_posix(),
            'csv_sha256': canonical_file_sha256(path),
            'listing_ids': sorted(f'{exchange}:{row["ticker"]}' for row in market_rows),
            'sources': [{key: proof[key] for key in ('url', 'segment', 'row_count', 'pagination', 'total_pages', 'payload_sha256')}
                        for proof in sources if proof['exchange'] == exchange],
        }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Nasdaqin kaikki Main Market -segmentit varmennettu: {MANIFEST_PATH}')
    print('Yhtiötunnisteet ja talousdatan kattavuus varmennetaan erikseen; listausmäärä ei todista niitä.')


if __name__ == '__main__':
    main()
