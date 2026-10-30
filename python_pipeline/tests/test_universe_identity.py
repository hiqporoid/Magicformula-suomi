import pytest
from datetime import datetime, timedelta, timezone

from python_pipeline.magicformula.universe import normalize_country, normalize_universe_company
from python_pipeline.magicformula import universe_sources


@pytest.mark.parametrize('raw', ['SW', 'SE', 'Sweden', 'Sverige'])
def test_sweden_codes(raw: str) -> None:
    assert normalize_country(raw) == 'SE'


def test_unknown_sector_and_domicile_are_missing() -> None:
    company = normalize_universe_company({'ticker': 'A', 'company': 'A', 'sector': 'Unknown', 'exchange': 'STO'})
    assert company.sector is None
    assert company.country is None
    assert company.listing_id == 'STO:A'
    assert not company.listing_verified


def test_exchange_only_is_not_main_market_evidence() -> None:
    company = normalize_universe_company({'ticker': 'A', 'company': 'A', 'exchange': 'HEL',
                                          'listing_verified': 'true'})
    assert not company.listing_verified


def metadata(**changes):
    return {'ticker': 'UPM', 'company': 'UPM', 'sector': 'Industrials', 'exchange': 'HEL',
            'listing_verified': 'true', 'market_segment': 'Main Market',
            'source_url': 'https://www.upm.com/investors/',
            'source_date': datetime.now(timezone.utc).date().isoformat(),
            'isin': 'FI0009005987', 'issuer_id': '213800EC6PW5VU4J9U64', **changes}


@pytest.mark.parametrize('change', [
    {'market_segment': 'First North'}, {'market_segment': 'Spotlight'},
    {'source_date': 'bad'}, {'source_date': '2099-01-01'}, {'source_date': '2020-01-01'},
    {'source_url': 'http://untrusted.example'}, {'source_url': 'https://'},
    {'isin': 'FI0009005988'},
])
def test_verification_cannot_be_enabled_with_invalid_provenance(change) -> None:
    assert not normalize_universe_company(metadata(**change)).listing_verified


def test_verified_listing_metadata_accepted() -> None:
    assert normalize_universe_company(metadata()).listing_verified
    assert normalize_universe_company(metadata(issuer_id='')).listing_verified


def test_listing_review_expires_after_31_days() -> None:
    today = datetime.now(timezone.utc).date()
    assert normalize_universe_company(metadata(source_date=(today - timedelta(days=31)).isoformat())).listing_verified
    assert not normalize_universe_company(metadata(source_date=(today - timedelta(days=32)).isoformat())).listing_verified


@pytest.mark.parametrize('sector', ['Financials', 'Financial Services', 'Financial and insurance activities'])
def test_financial_sector_aliases(sector: str) -> None:
    assert normalize_universe_company({'ticker': 'A', 'company': 'A', 'sector': sector}).is_financial


@pytest.mark.parametrize('sector', ['Utilities', 'Electricity, gas, steam and air conditioning supply'])
def test_utility_sector_aliases(sector: str) -> None:
    assert normalize_universe_company({'ticker': 'A', 'company': 'A', 'sector': sector}).is_utility


def test_loader_rejects_duplicate_within_venue(tmp_path, monkeypatch) -> None:
    path = tmp_path / 'hel.csv'
    path.write_text('ticker,company,exchange\nA,One,HEL\nA,Other,HEL\n', encoding='utf-8')
    monkeypatch.setattr(universe_sources, 'UNIVERSE_FILES', {'HEL': path})
    with pytest.raises(ValueError, match='Päällekkäinen listaus'):
        universe_sources.load_all_universe_rows()


def test_loader_preserves_cross_venue_ticker_collision(tmp_path, monkeypatch) -> None:
    paths = {}
    for venue in ('HEL', 'STO'):
        paths[venue] = tmp_path / f'{venue}.csv'
        paths[venue].write_text(f'ticker,company,exchange\nA,{venue} Company,{venue}\n', encoding='utf-8')
    monkeypatch.setattr(universe_sources, 'UNIVERSE_FILES', paths)
    assert len(universe_sources.load_all_universe_rows()) == 2


def test_manifest_digest_is_stable_across_windows_and_linux_checkouts(tmp_path):
    lf, crlf = tmp_path / 'lf.csv', tmp_path / 'crlf.csv'
    lf.write_bytes(b'ticker,company\nUPM,UPM\n')
    crlf.write_bytes(b'ticker,company\r\nUPM,UPM\r\n')
    assert universe_sources.canonical_file_sha256(lf) == universe_sources.canonical_file_sha256(crlf)
