from datetime import date, datetime, timezone

import pytest

from python_pipeline.magicformula.eligibility import assess_company, financial_metadata_errors
from python_pipeline.magicformula.universe import normalize_universe_company
from python_pipeline.magicformula.models import UniverseCompany


def row(**overrides):
    today = datetime.now(timezone.utc).date().isoformat()
    return {
        "ticker": "UPM", "exchange": "HEL", "listing_id": "HEL:UPM",
        "currency": "EUR", "enterprise_value_currency": "EUR", "price_currency": "EUR",
        "statement_date": today, "market_data_date": today, "retrieved_at": today,
        "source_url": "https://finance.yahoo.com/quote/UPM.HE/financials/",
        "period_type": "annual", "amount_unit": "units", "fx_date": today,
        "market_cap": 100_000_000, "market_cap_eur": 100_000_000, "fx_rate_to_eur": 1,
        "ebit": 100, "enterprise_value": 1000, "current_assets": 400,
        "current_liabilities": 100, "net_ppe": 300, "cash": 50, "short_term_debt": 20,
        **overrides,
    }


def company(**overrides):
    return UniverseCompany(**{"ticker": "UPM", "company": "UPM", "sector": "Industrials",
                              "listing_verified": True, "market_segment": "Main Market", **overrides})


@pytest.mark.parametrize("sector,code", [
    ("Financial and insurance activities", "financial_sector_methodology"),
    ("Financial Services", "financial_sector_methodology"),
    ("Financials", "financial_sector_methodology"),
    ("Utilities", "utility_sector_methodology"),
    ("Electricity, gas, steam and air conditioning supply", "utility_sector_methodology"),
    ("Unknown", "missing_sector"), ("", "missing_sector"),
])
def test_sector_exclusions_precede_statement_errors(sector, code):
    assert assess_company(company(sector=sector), None) == (None, [code])


def test_foreign_domicile_is_not_an_exclusion():
    record, reasons = assess_company(company(country="CH"), row())
    assert record is not None and reasons == []


def test_missing_statements():
    assert assess_company(company(), None) == (None, ["missing_financial_statements"])


def test_eligible_record_uses_operating_capital():
    record, errors = assess_company(company(), row())
    assert errors == []
    assert record.invested_capital == 570


def test_cross_exchange_identity_conflict_is_rejected():
    assert assess_company(company(), row(exchange="STO", listing_id="STO:UPM"))[1] == ["financial_identity_mismatch"]


@pytest.mark.parametrize("cap_sek,expected", [(50_000_000, "market_cap_below_threshold"), (600_000_000, None)])
def test_sek_cap_threshold_is_in_euros(cap_sek, expected):
    data = row(price_currency="SEK", market_cap=cap_sek, fx_rate_to_eur=0.09, market_cap_eur=cap_sek * 0.09)
    errors = financial_metadata_errors(data)
    assert (expected in errors) if expected else not errors


@pytest.mark.parametrize("field,value,expected", [
    ("market_cap", "NaN", "missing_market_cap_or_fx"),
    ("market_cap", float("inf"), "missing_market_cap_or_fx"),
    ("market_cap", "", "missing_market_cap_or_fx"),
    ("fx_rate_to_eur", 0, "missing_market_cap_or_fx"),
    ("market_cap_eur", 1, "market_cap_fx_mismatch"),
    ("enterprise_value_currency", "SEK", "financial_currency_mismatch"),
    ("amount_unit", "millions", "unsupported_financial_basis"),
    ("currency", "", "missing_financial_metadata"),
    ("statement_date", "2020-01-01", "stale_financial_statements"),
    ("market_data_date", "2020-01-01", "inconsistent_financial_dates"),
    ("statement_date", "2099-01-01", "future_financial_date"),
])
def test_metadata_validation(field, value, expected):
    assert expected in financial_metadata_errors(row(**{field: value}))


@pytest.mark.parametrize("field", ["cash", "short_term_debt", "ebit", "net_ppe"])
def test_missing_required_financial_values_are_not_imputed(field):
    assert assess_company(company(), row(**{field: ""}))[1] == ["missing_or_invalid_financial_values"]


def test_statement_must_not_postdate_market_data():
    data = row(statement_date="2026-10-29", market_data_date="2026-10-28", retrieved_at="2026-10-29", fx_date="2026-10-29")
    assert financial_metadata_errors(data, as_of=date(2026, 10, 29)) == ["inconsistent_financial_dates"]


def test_unverified_listings_do_not_rank():
    assert assess_company(company(listing_verified=False), row())[1] == ["unverified_listing"]


def test_first_north_does_not_rank_even_when_verified_flag_is_wrong():
    assert assess_company(company(market_segment="Nasdaq First North"), row())[1] == ["non_main_market"]


@pytest.mark.parametrize("segment", [None, "Unknown", "Nasdaq Stockholm", "First North Growth Market"])
def test_only_exact_verified_main_market_can_rank(segment):
    expected = "unverified_listing" if segment in (None, "Unknown") else "non_main_market"
    assert assess_company(company(market_segment=segment), row())[1] == [expected]

def test_known_source_reconciliation_mismatch_cannot_rank():
    assert assess_company(company(), row(source_reconciliation_status="mismatch"))[1] == ["source_reconciliation_required"]
