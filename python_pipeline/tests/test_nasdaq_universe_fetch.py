from datetime import datetime, timezone

import pytest

from python_pipeline.scripts.fetch_nordic_universe import SEGMENTS, parse_segment


def payload(**changes):
    return {'status': {'rCode': 200}, 'data': {
        'pagination': {'page': 1, 'totalPages': 1, 'total': 1, 'size': 1000},
        'filters': [{'key': 'segment', 'options': [{'value': segment} for segment in SEGMENTS]}],
        'instrumentListing': {'rows': [{'fullName': 'Volvo B', 'symbol': 'VOLV B',
                                      'assetClass': 'SHARES', 'isin': 'SE0000115446',
                                      'orderbookId': 'TX123', 'sector': 'Industrials',
                                      'currency': 'SEK', **changes}]},
    }}


def parse(value, known=None):
    return parse_segment(value, 'STO', 'LARGE_CAP',
                         'https://api.nasdaq.com/api/nordic/screener/shares?category=MAIN_MARKET&market=STO&segment=LARGE_CAP',
                         datetime.now(timezone.utc).date().isoformat(), known or {})


def test_official_listing_has_symbol_isin_and_provenance_without_fake_issuer():
    rows, proof = parse(payload())
    row = rows[0]
    assert row['ticker'] == 'VOLV-B'
    assert row['source_symbol'] == 'VOLV-B.ST'
    assert row['nasdaq_symbol'] == 'VOLV B'
    assert row['issuer_id'] == ''
    assert row['country'] == ''
    assert row['listing_verified'] == 'true'
    assert row['listing_currency'] == 'SEK'
    assert proof['row_count'] == proof['pagination']['total'] == 1


def test_known_issuer_is_preserved_by_isin_across_markets():
    rows, _ = parse(payload(), {'SE0000115446': {'issuer_id': '549300HGV012CNC8JD22', 'country': 'SE'}})
    assert rows[0]['issuer_id'] == '549300HGV012CNC8JD22'
    assert rows[0]['country'] == 'SE'


@pytest.mark.parametrize('page,total,pages', [(1, 2, 1), (1, 1, 2), (2, 1, 1)])
def test_missing_pagination_never_claims_completeness(page, total, pages):
    value = payload()
    value['data']['pagination'].update(page=page, total=total, totalPages=pages)
    with pytest.raises(ValueError, match='sivutus'):
        parse(value)


def test_unknown_new_segment_requires_explicit_review():
    value = payload()
    value['data']['filters'][0]['options'].append({'value': 'NEW_SEGMENT'})
    with pytest.raises(ValueError, match='segmenttijoukko'):
        parse(value)


def test_empty_spac_segment_is_a_valid_checked_source():
    value = payload()
    value['data']['instrumentListing']['rows'] = None
    value['data']['pagination']['total'] = 0
    rows, proof = parse(value)
    assert rows == [] and proof['row_count'] == 0


@pytest.mark.parametrize('change', [{'isin': 'SE0000115447'}, {'symbol': ''}, {'orderbookId': ''}, {'assetClass': 'FUNDS'}])
def test_invalid_security_does_not_enter_main_market_snapshot(change):
    with pytest.raises(ValueError, match='listaus'):
        parse(payload(**change))
