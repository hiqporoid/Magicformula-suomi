import copy
import json
from datetime import datetime, timezone

import pytest

from python_pipeline.scripts.export_ranking_json import build_dataset, index_financials
from python_pipeline.scripts.audit_universe import validate_dataset
from python_pipeline.magicformula.universe import normalize_universe_company
from python_pipeline.tests.test_eligibility import row as financial


def listing(exchange='HEL', ticker='UPM', issuer_id='issuer-upm', **changes):
    return {'ticker': ticker, 'company': f'{exchange} {ticker}', 'sector': 'Industrials',
            'exchange': exchange, 'country': 'FI', 'market_segment': 'Main Market',
            'listing_verified': 'true', 'source_url': 'https://www.nasdaq.com/verified-list',
            'source_date': datetime.now(timezone.utc).date().isoformat(),
            'isin': 'FI0009005987', 'issuer_id': issuer_id, **changes}


def data(exchange='HEL', ticker='UPM', **changes):
    return financial(exchange=exchange, ticker=ticker, listing_id=f'{exchange}:{ticker}', **changes)


def test_export_rejects_unknown_and_first_north_segments():
    for segment in ('First North', 'Spotlight', 'Unknown', ''):
        dataset = build_dataset([listing(market_segment=segment)], [data()])
        assert dataset['rows'] == []
        assert dataset['coverage']['HEL']['verified_listings'] == 0


def test_same_ticker_across_exchanges_has_independent_financials():
    companies = [listing('HEL', 'SAME', 'issuer-fi'), listing('STO', 'SAME', 'issuer-se', isin='SE0000115446')]
    rows = [data('HEL', 'SAME', ebit=100), data('STO', 'SAME', ebit=200)]
    dataset = build_dataset(companies, rows)
    assert {row['listing_id'] for row in dataset['rows']} == {'HEL:SAME', 'STO:SAME'}
    assert {row['listing_id']: row['ebit_ev'] for row in dataset['rows']} == {'HEL:SAME': .1, 'STO:SAME': .2}
    assert validate_dataset(dataset) == []


def test_issuer_share_classes_and_cross_listing_count_once():
    companies = [listing('STO', 'UPM-B'), listing('HEL', 'UPM-A'), listing('STO', 'UPM-A')]
    dataset = build_dataset(companies, [data(c['exchange'], c['ticker']) for c in companies])
    assert [row['listing_id'] for row in dataset['rows']] == ['HEL:UPM-A']
    assert {row['exclusion_codes'][0] for row in dataset['excluded']} == {'duplicate_issuer_listing'}
    assert dataset['coverage']['HEL']['verified_listings'] == 1
    assert dataset['coverage']['STO']['verified_listings'] == 2
    assert dataset['coverage']['STO']['methodology_excluded'] == 2


def test_missing_financials_for_first_share_does_not_hide_eligible_other_class():
    companies = [listing('STO', 'UPM-A'), listing('STO', 'UPM-B')]
    dataset = build_dataset(companies, [data('STO', 'UPM-B')])
    assert [row['ticker'] for row in dataset['rows']] == ['UPM-B']
    assert dataset['excluded'][0]['exclusion_codes'] == ['missing_financial_statements']


def test_unqualified_legacy_financials_are_not_assigned_to_ambiguous_ticker():
    companies = [normalize_universe_company(listing('HEL')), normalize_universe_company(listing('STO'))]
    assert index_financials([{'ticker': 'UPM', 'ebit': 10}], companies) == {}


def test_unqualified_unambiguous_legacy_snapshot_is_displayed_but_does_not_rank():
    dataset = build_dataset([listing()], [{'ticker': 'UPM', 'ebit': 10}])
    assert dataset['rows'] == []
    assert dataset['excluded'][0]['financial_snapshot']['ebit'] == 10
    assert dataset['excluded'][0]['exclusion_codes'] == ['financial_identity_mismatch']


def test_duplicate_financial_listing_is_an_error():
    with pytest.raises(ValueError, match='duplikaatti'):
        build_dataset([listing()], [data(), data()])


def test_one_security_cannot_be_assigned_to_different_issuers_across_venues():
    with pytest.raises(ValueError, match='ISIN'):
        build_dataset([listing('HEL', issuer_id='one'), listing('STO', issuer_id='other')],
                      [data('HEL'), data('STO')])


def test_unknown_sector_and_listing_candidate_counts_are_separate():
    companies = [listing(), listing(ticker='UNKNOWN', sector='Unknown', issuer_id='other', isin='FI0009013403'),
                 listing(ticker='CANDIDATE', listing_verified='false', issuer_id='third', isin='FI0009000681')]
    dataset = build_dataset(companies, [data()])
    assert dataset['coverage']['HEL'] == {
        'candidate_listings': 3, 'listings': 2, 'verified_listings': 2, 'ranked': 1,
        'methodology_excluded': 0, 'data_missing': 2, 'complete_main_market_verified': False, 'issuer_resolved': 3,
    }
    assert validate_dataset(dataset) == []


def test_unknown_segment_is_data_gap_not_confirmed_non_main_market():
    dataset = build_dataset([listing(market_segment='')], [data()])
    assert dataset['excluded'][0]['exclusion_category'] == 'data'
    assert dataset['coverage']['HEL']['methodology_excluded'] == 0


def test_nonfinite_legacy_snapshot_serializes_as_null():
    dataset = build_dataset([listing()], [{'ticker': 'UPM', 'ebit': float('nan'), 'enterprise_value': float('inf')}])
    snapshot = dataset['excluded'][0]['financial_snapshot']
    assert snapshot['ebit'] is None and snapshot['enterprise_value'] is None
    json.dumps(dataset, allow_nan=False)


def test_audit_rejects_non_main_market_ranked_row():
    dataset = build_dataset([listing()], [data()])
    dataset['rows'][0]['market_segment'] = 'First North'
    assert any('listing' in message or 'segment' in message for message in validate_dataset(dataset))


def test_audit_rejects_forged_coverage():
    dataset = build_dataset([listing()], [data()])
    corrupted = copy.deepcopy(dataset)
    corrupted['coverage']['HEL']['verified_listings'] += 1
    assert 'HEL: coverage verified_listings' in validate_dataset(corrupted)


def test_confirmed_source_mismatch_blocks_ranking_and_keeps_source_detail():
    check = {'listing_id': 'HEL:UPM', 'statement_date': data()['statement_date'],
             'status': 'mismatch', 'source_url': 'https://www.upm.com/report.pdf', 'detail': 'Current debt differs.'}
    dataset = build_dataset([listing()], [data()], source_checks=[check])
    assert dataset['rows'] == []
    assert dataset['excluded'][0]['exclusion_category'] == 'data'
    assert 'source_reconciliation_required' in dataset['excluded'][0]['exclusion_codes']
    assert dataset['excluded'][0]['financial_snapshot']['reconciliation_detail'] == 'Current debt differs.'
