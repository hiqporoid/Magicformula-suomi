import pytest

from python_pipeline.magicformula.normalization import normalize_record, validate_record


def test_normalize_record_uppercases_ticker() -> None:
    record = normalize_record(
        {
            "ticker": "upm",
            "company": "UPM-Kymmene Oyj",
            "ebit": 100,
            "enterprise_value": 1000,
            "current_assets": 400,
            "current_liabilities": 150,
            "net_ppe": 350,
        }
    )
    assert record.ticker == "UPM"


def test_validate_record_rejects_non_positive_ev() -> None:
    record = normalize_record(
        {
            "ticker": "AAA",
            "company": "A Oyj",
            "ebit": 100,
            "enterprise_value": 0,
            "current_assets": 300,
            "current_liabilities": 100,
            "net_ppe": 300,
        }
    )
    assert "enterprise_value_non_positive" in validate_record(record)


def test_validate_record_rejects_non_positive_invested_capital() -> None:
    record = normalize_record(
        {
            "ticker": "BBB",
            "company": "B Oyj",
            "ebit": 100,
            "enterprise_value": 900,
            "current_assets": 100,
            "current_liabilities": 250,
            "net_ppe": 100,
        }
    )
    assert "invested_capital_non_positive" in validate_record(record)


def test_normalize_record_raises_on_missing_field() -> None:
    with pytest.raises(ValueError):
        normalize_record({"ticker": "BBB"})
