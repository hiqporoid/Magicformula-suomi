from python_pipeline.magicformula.eligibility import assess_company
from python_pipeline.magicformula.universe import normalize_universe_company, translate_reasons


def test_assess_company_excludes_financials_for_methodology() -> None:
    company = normalize_universe_company(
        {
            "ticker": "NDA",
            "company": "Nordea Bank AB",
            "sector": "Financial and insurance activities",
        }
    )
    record, reasons = assess_company(
        company,
        {
            "ticker": "NDA",
            "ebit": 7000,
            "enterprise_value": 65000,
            "current_assets": 120000,
            "current_liabilities": 90000,
            "net_ppe": 5000,
        },
    )
    assert record is None
    assert reasons == ["financial_sector_methodology"]
    assert translate_reasons(reasons)[0].startswith("Finanssiyhtiö")


def test_assess_company_excludes_financials_without_data_error_label() -> None:
    company = normalize_universe_company(
        {
            "ticker": "AKTIA",
            "company": "Aktia Bank Abp",
            "sector": "Financial and insurance activities",
        }
    )
    record, reasons = assess_company(company, None)
    assert record is None
    assert reasons == ["financial_sector_methodology"]


def test_assess_company_excludes_missing_statements() -> None:
    company = normalize_universe_company(
        {
            "ticker": "NOKIA",
            "company": "Nokia Oyj",
            "sector": "Telecommunications, computer programming, consultancy, computing infrastructure, and other information service activities",
        }
    )
    record, reasons = assess_company(company, None)
    assert record is None
    assert reasons == ["missing_financial_statements"]


def test_assess_company_excludes_utility_sector() -> None:
    company = normalize_universe_company(
        {
            "ticker": "FORTUM",
            "company": "Fortum Oyj",
            "sector": "Electricity, gas, steam and air conditioning supply",
            "exchange": "HEL",
        }
    )
    record, reasons = assess_company(company, None)
    assert record is None
    assert reasons == ["utility_sector_methodology"]


def test_assess_company_excludes_foreign_company() -> None:
    company = normalize_universe_company(
        {
            "ticker": "ABB",
            "company": "ABB Ltd",
            "sector": "Manufacturing",
            "exchange": "STO",
            "country": "CH",
        }
    )
    record, reasons = assess_company(company, None)
    assert record is None
    assert reasons == ["foreign_company_methodology"]


def test_assess_company_excludes_below_market_cap_threshold() -> None:
    company = normalize_universe_company(
        {
            "ticker": "SMALL",
            "company": "Small Cap Oyj",
            "sector": "Manufacturing",
            "exchange": "HEL",
        }
    )
    record, reasons = assess_company(
        company,
        {
            "ticker": "SMALL",
            "market_cap": "49000000",
            "ebit": 100,
            "enterprise_value": 1000,
            "current_assets": 400,
            "current_liabilities": 100,
            "net_ppe": 300,
        },
    )
    assert record is None
    assert reasons == ["market_cap_below_threshold"]


def test_assess_company_excludes_missing_sector_even_if_financials_exist() -> None:
    company = normalize_universe_company(
        {
            "ticker": "AAA",
            "company": "A Oyj",
            "sector": "",
        }
    )
    record, reasons = assess_company(
        company,
        {
            "ticker": "AAA",
            "ebit": 100,
            "enterprise_value": 1000,
            "current_assets": 400,
            "current_liabilities": 100,
            "net_ppe": 300,
        },
    )
    assert record is None
    assert reasons == ["missing_sector"]


def test_assess_company_returns_record_for_eligible_company() -> None:
    company = normalize_universe_company(
        {
            "ticker": "UPM",
            "company": "UPM-Kymmene Oyj",
            "sector": "Manufacturing",
        }
    )
    record, reasons = assess_company(
        company,
        {
            "ticker": "UPM",
            "ebit": 1800,
            "enterprise_value": 24000,
            "current_assets": 7000,
            "current_liabilities": 4100,
            "net_ppe": 6000,
            "roic": 0.14,
            "debt_to_ebitda": 2.8,
        },
    )
    assert reasons == []
    assert record is not None
    assert record.ticker == "UPM"
