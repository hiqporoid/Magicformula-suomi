from pathlib import Path

import pytest

from python_pipeline.scripts import import_nordic_universe as mod


def test_normalize_ticker_prefers_local() -> None:
    assert mod.normalize_ticker('nokia', 'NOKIA.HE') == 'NOKIA'
    assert mod.normalize_ticker('', 'NOKIA.HE') == 'NOKIA'


def test_import_rejects_unverified_yahoo_rows_before_overwriting(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    input_path = tmp_path / 'nordic.csv'
    input_path.write_text(
        'ticker_yf,ticker_local,company,sector,country,exchange\n'
        'NOKIA.HE,NOKIA,Nokia,Tech,Finland,HEL\n'
        'ERIC-B.ST,ERIC-B,Ericsson,Tech,Sweden,STO\n',
        encoding='utf-8',
    )
    hel_path = tmp_path / 'hel.csv'
    sto_path = tmp_path / 'sto.csv'
    hel_path.write_text('existing HEL', encoding='utf-8')
    sto_path.write_text('existing STO', encoding='utf-8')

    monkeypatch.setattr(mod, 'INPUT_PATH', input_path)
    monkeypatch.setattr(mod, 'HEL_PATH', hel_path)
    monkeypatch.setattr(mod, 'STO_PATH', sto_path)

    with pytest.raises(SystemExit, match='Main Market'):
        mod.main()
    assert hel_path.read_text(encoding='utf-8') == 'existing HEL'
    assert sto_path.read_text(encoding='utf-8') == 'existing STO'


def listing(exchange: str, ticker: str = 'SAME') -> dict[str, str]:
    return {'exchange': exchange, 'ticker': ticker, 'company': 'Company', 'sector': 'Industrials',
            'country': 'Sweden', 'market_segment': 'Main Market', 'listing_verified': 'true',
            'source_url': 'https://www.nasdaq.com/source', 'source_date': '2026-10-01',
            'isin': 'SE0000115446', 'issuer_id': 'verified-issuer'}


def test_cross_market_ticker_and_isin_are_not_duplicates() -> None:
    out = mod.prepare_rows([listing('HEL'), listing('STO')])
    assert len(out['HEL']) == len(out['STO']) == 1
    assert out['STO'][0]['country'] == 'SE'


def test_no_minimum_count_is_treated_as_main_market_evidence() -> None:
    # One real, explicitly sourced row per venue is a valid partial snapshot.
    out = mod.prepare_rows([listing('HEL'), listing('STO')])
    assert out['HEL'][0]['listing_verified'] == 'true'


@pytest.mark.parametrize('change', [
    {'market_segment': 'First North'}, {'source_url': ''}, {'source_date': 'invalid'},
    {'isin': ''}, {'source_date': '2099-01-01'},
    {'isin': 'SE0000115447'}, {'listing_verified': 'false'},
])
def test_listing_requires_provenance_and_identifiers(change: dict[str, str]) -> None:
    with pytest.raises(ValueError):
        mod.prepare_rows([{**listing('HEL'), **change}, listing('STO')])


def test_conflicting_duplicate_listing_rejected() -> None:
    with pytest.raises(ValueError, match='Päällekkäinen'):
        mod.prepare_rows([listing('HEL'), {**listing('HEL'), 'company': 'Other'}, listing('STO')])


def test_same_isin_cannot_identify_two_issuers() -> None:
    with pytest.raises(ValueError, match='eri yhtiöihin'):
        mod.prepare_rows([listing('HEL'), {**listing('STO'), 'issuer_id': 'different'}])


def test_listing_verification_does_not_invent_missing_issuer() -> None:
    prepared = mod.prepare_rows([{**listing('HEL'), 'issuer_id': ''}, listing('STO')])
    assert prepared['HEL'][0]['listing_verified'] == 'true'
    assert prepared['HEL'][0]['issuer_id'] == ''


def test_ticker_dot_is_preserved() -> None:
    assert mod.normalize_ticker('', 'ABC.B.ST') == 'ABC.B'


def test_import_source_snapshot(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    import csv
    source = tmp_path / 'source.csv'
    rows = [listing('HEL'), listing('STO')]
    with source.open('w', encoding='utf-8', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    hel, sto = tmp_path / 'hel.csv', tmp_path / 'sto.csv'
    monkeypatch.setattr(mod, 'HEL_PATH', hel)
    monkeypatch.setattr(mod, 'STO_PATH', sto)
    mod.main(source)
    for path in (hel, sto):
        imported = list(csv.DictReader(path.read_text(encoding='utf-8').splitlines()))
        assert len(imported) == 1
        assert imported[0]['listing_verified'] == 'true'
        assert imported[0]['country'] == 'SE'
