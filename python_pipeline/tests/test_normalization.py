import pytest

from python_pipeline.magicformula.normalization import normalize_record, validate_record


def test_normalize_record_uppercases_ticker() -> None:
    record = normalize_record(
        {
            "ticker": "upm",
            "company": "UPM-Kymmene Oyj",
            "sector": "Manufacturing",
            "ebit": 100,
            "enterprise_value": 1000,
            "current_assets": 400,
            "current_liabilities": 150,
            "net_ppe": 350,
            "cash": 0,
            "short_term_debt": 0,
        }
    )
    assert record.ticker == "UPM"


def test_validate_record_rejects_non_positive_ebit() -> None:
    record = normalize_record(
        {
            "ticker": "AAA",
            "company": "A Oyj",
            "sector": "Manufacturing",
            "ebit": 0,
            "enterprise_value": 1000,
            "current_assets": 300,
            "current_liabilities": 100,
            "net_ppe": 300,
            "cash": 0,
            "short_term_debt": 0,
        }
    )
    assert "ebit_non_positive" in validate_record(record)


def test_validate_record_rejects_non_positive_ev() -> None:
    record = normalize_record(
        {
            "ticker": "AAA",
            "company": "A Oyj",
            "sector": "Manufacturing",
            "ebit": 100,
            "enterprise_value": 0,
            "current_assets": 300,
            "current_liabilities": 100,
            "net_ppe": 300,
            "cash": 0,
            "short_term_debt": 0,
        }
    )
    assert "enterprise_value_non_positive" in validate_record(record)


def test_validate_record_rejects_non_positive_invested_capital() -> None:
    record = normalize_record(
        {
            "ticker": "BBB",
            "company": "B Oyj",
            "sector": "Manufacturing",
            "ebit": 100,
            "enterprise_value": 900,
            "current_assets": 100,
            "current_liabilities": 250,
            "net_ppe": 100,
            "cash": 0,
            "short_term_debt": 0,
        }
    )
    assert "invested_capital_non_positive" in validate_record(record)


def test_normalize_record_raises_on_missing_field() -> None:
    with pytest.raises(ValueError):
        normalize_record({"ticker": "BBB"})

@pytest.mark.parametrize("value", [float("nan"), float("inf"), float("-inf"), "NaN", "Infinity"])
def test_normalization_rejects_non_finite_values(value):
    with pytest.raises(ValueError):
        normalize_record({"ticker": "A", "company": "A", "ebit": value, "enterprise_value": 100,
                          "current_assets": 10, "current_liabilities": 3, "net_ppe": 4,
                          "cash": 0, "short_term_debt": 0})


def test_negative_balance_sheet_values_rejected():
    record = normalize_record({"ticker": "A", "company": "A", "ebit": 1, "enterprise_value": 100,
                               "current_assets": 10, "current_liabilities": -3, "net_ppe": 4,
                               "cash": 0, "short_term_debt": 0})
    assert "negative_balance_sheet_value" in validate_record(record)

def test_derived_capital_overflow_is_rejected():
    from python_pipeline.magicformula.models import FinancialRecord
    record = FinancialRecord("A", "A", 1, 1, 1e308, 0, 1e308)
    assert validate_record(record) == ["non_finite_financial_value"]


def test_derived_ratio_overflow_is_rejected():
    from python_pipeline.magicformula.models import FinancialRecord
    record = FinancialRecord("A", "A", 1e308, 1e-308, 1, 0, 1)
    assert validate_record(record) == ["non_finite_financial_value"]

def test_invalid_optional_quality_values_do_not_contaminate_magic_formula():
    record = normalize_record({"ticker": "A", "company": "A", "ebit": 1, "enterprise_value": 100,
                               "current_assets": 10, "current_liabilities": 3, "net_ppe": 4,
                               "cash": 0, "short_term_debt": 0, "roic": "NaN", "debt_to_ebitda": "bad"})
    assert record.roic is None and record.debt_to_ebitda is None
    assert validate_record(record) == []
