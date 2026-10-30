"""Refresh only the needed ISIN–LEI links from GLEIF; unresolved issuers stay missing."""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import tempfile
import unicodedata
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zipfile import ZipFile

import requests

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = REPO_ROOT / 'python_pipeline/data/isin_lei_mapping.csv'
FIELDS = ['isin', 'lei', 'source_date', 'source_url', 'source_sha256']
API_URL = 'https://api.gleif.org/api/v1/lei-records'


def normalized_name(value: str) -> str:
    return ' '.join(unicodedata.normalize('NFKC', value).casefold().split())


def issuer_name_candidate(name: str) -> str:
    # Explicit share-class labels can be removed from the search query only.
    # Acceptance still requires equality with the registered legal name.
    return re.sub(r'\s+(?:[ABCR]|Vaihto-osake|Kanta-osake)$', '', name.strip())


def exact_legal_match(payload: dict, candidate: str, country: str = 'FI') -> dict | None:
    records = payload.get('data') or []
    pagination = payload.get('meta', {}).get('pagination', {})
    if pagination.get('total', len(records)) > len(records):
        return None  # Never assert uniqueness from an incomplete result page.
    matches = []
    for record in records:
        attributes = record['attributes']
        entity = attributes['entity']
        if normalized_name(entity['legalName']['name']) != normalized_name(candidate):
            continue
        if entity.get('status') != 'ACTIVE' or entity['legalAddress']['country'] != country:
            continue
        if attributes['registration']['status'] not in {'ISSUED', 'LAPSED'}:
            continue
        matches.append({
            'lei': record['id'], 'legal_name': entity['legalName']['name'],
            'country': country, 'registration_id': entity.get('registeredAs'),
        })
    return matches[0] if len(matches) == 1 else None


def read_bulk_mapping(session, wanted: set[str], as_of: date) -> tuple[dict, dict]:
    # Monday morning / public holidays may still expose the previous business day.
    for offset in range(7):
        source_date = (as_of - timedelta(days=offset)).isoformat()
        url = f'https://isinmapping.gleif.org/api/v2/isin-lei/{source_date}/download'
        response = session.get(url, timeout=90, stream=True, headers={'Accept': 'application/zip, application/octet-stream, */*'})
        if response.status_code in {404, 204}:
            response.close()
            continue
        response.raise_for_status()
        digest = hashlib.sha256()
        # The large CSV is read inside the ZIP; no full extract or repository dump.
        with tempfile.TemporaryDirectory(prefix='magicformula-gleif-') as directory:
            archive_path = Path(directory) / 'mapping.zip'
            with archive_path.open('wb') as handle:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        handle.write(chunk)
                        digest.update(chunk)
            response.close()
            result = {}
            with ZipFile(archive_path) as archive:
                csv_names = [name for name in archive.namelist() if name.lower().endswith('.csv')]
                if len(csv_names) != 1:
                    raise ValueError('GLEIF ZIP: odotettiin yhtä CSV-tiedostoa')
                with archive.open(csv_names[0]) as source:
                    reader = csv.DictReader(io.TextIOWrapper(source, encoding='utf-8-sig'))
                    if reader.fieldnames != ['LEI', 'ISIN']:
                        raise ValueError('GLEIF ISIN–LEI-skeema muuttui')
                    for row in reader:
                        isin, lei = row['ISIN'].strip(), row['LEI'].strip()
                        if isin not in wanted:
                            continue
                        if isin in result and result[isin] != lei:
                            raise ValueError(f'GLEIF ISIN–LEI-ristiriita: {isin}')
                        result[isin] = lei
            return result, {'source_date': source_date, 'source_url': url, 'source_sha256': digest.hexdigest()}
    raise ValueError('GLEIF ISIN–LEI-tiedostoa ei saatavilla seitsemän päivän ikkunassa')


def refresh_mapping(universe_csv: Path, output_path: Path | None = None, *,
                    as_of: date | None = None, session=None) -> dict:
    output_path = output_path or DEFAULT_OUTPUT
    as_of = as_of or datetime.now(timezone.utc).date()
    session = session or requests.Session()
    with universe_csv.open(encoding='utf-8-sig', newline='') as handle:
        listings = list(csv.DictReader(handle))
    wanted = {row['isin'] for row in listings if row.get('isin')}
    cached = {}
    if output_path.exists():
        with output_path.open(encoding='utf-8-sig', newline='') as handle:
            for row in csv.DictReader(handle):
                if row['isin'] not in wanted:
                    continue
                if row['isin'] in cached and cached[row['isin']]['lei'] != row['lei']:
                    raise ValueError(f'Paikallisen ISIN–LEI-aineiston ristiriita: {row["isin"]}')
                cached[row['isin']] = row
    bulk, provenance = read_bulk_mapping(session, wanted, as_of)
    for isin, lei in bulk.items():
        if isin in cached and cached[isin]['lei'] != lei:
            raise ValueError(f'GLEIF ja aiempi issuer-varmennus eri mieltä: {isin}')
        cached[isin] = {'isin': isin, 'lei': lei, **provenance}
    resolutions, queried = [], set()
    for row in sorted(listings, key=lambda item: (item['exchange'], item['ticker'])):
        isin = row.get('isin')
        if not isin or isin in cached or isin in queried or row['exchange'] != 'HEL':
            continue
        queried.add(isin)
        candidate = issuer_name_candidate(row['company'])
        response = session.get(API_URL, params={'filter[entity.legalName]': candidate, 'page[size]': 100}, timeout=35)
        response.raise_for_status()
        match = exact_legal_match(response.json(), candidate)
        proof = {'isin': isin, 'query': candidate, 'match': match,
                 'source_url': response.url, 'source_date': as_of.isoformat(),
                 'source_sha256': hashlib.sha256(response.content).hexdigest()}
        resolutions.append(proof)
        if match:
            cached[isin] = {key: proof[key] for key in FIELDS if key != 'lei'} | {'lei': match['lei']}
    output_path.parent.mkdir(parents=True, exist_ok=True)
    buffer = io.StringIO(newline='')
    writer = csv.DictWriter(buffer, fieldnames=FIELDS, lineterminator='\n')
    writer.writeheader()
    writer.writerows(cached[isin] for isin in sorted(cached))
    output_path.write_text(buffer.getvalue(), encoding='utf-8')
    audit = {
        'retrieved_at': datetime.now(timezone.utc).isoformat(), 'bulk': provenance,
        'wanted_isins': len(wanted), 'resolved_isins': len(cached),
        'unresolved_isins': sorted(wanted - cached.keys()), 'exact_name_queries': resolutions,
        'policy': 'Certified ISIN–LEI mapping; HEL fallback requires unique exact current legalName, ACTIVE entity, FI legal address. No fuzzy matching.',
        'output_sha256': hashlib.sha256(output_path.read_bytes().replace(b'\r\n', b'\n')).hexdigest(),
    }
    output_path.with_suffix('.audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return audit


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--universe-csv', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument('--as-of', type=date.fromisoformat)
    args = parser.parse_args()
    audit = refresh_mapping(args.universe_csv, args.output, as_of=args.as_of)
    print(f'ISIN–LEI: {audit["resolved_isins"]}/{audit["wanted_isins"]}; puuttuvat jäävät data-aukoiksi')


if __name__ == '__main__':
    main()
