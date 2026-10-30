from datetime import datetime

import pandas as pd

from python_pipeline.magicformula.financials import compute_enterprise_value, is_valid_number
from python_pipeline.scripts.generate_financials_csv import latest_common_period, value_at, build_candidate_symbols


def test_infinity_and_boolean_are_not_valid_numbers():
    assert not is_valid_number(float("inf"))
    assert not is_valid_number(True)


def test_missing_cash_does_not_become_zero_in_ev():
    assert compute_enterprise_value(None, 100, 20, [None]) is None


def test_period_selection_does_not_mix_balance_sheet_years():
    latest = pd.Timestamp("2025-12-31")
    older = pd.Timestamp("2024-12-31")
    balance = pd.DataFrame({latest: [float("nan")], older: [100]}, index=["Current Assets"])
    income = pd.DataFrame({latest: [10], older: [8]}, index=["EBIT"])
    period = latest_common_period(balance, income)
    assert period == latest
    assert value_at(balance, ("Current Assets",), period) == (None, None)


def test_symbol_overrides_are_exchange_scoped_and_do_not_search_successors():
    assert build_candidate_symbols("NDA", "Nordea", "HEL") == ["NDA-FI.HE"]
    assert build_candidate_symbols("NDA", "Other", "STO") == ["NDA.ST"]
    assert build_candidate_symbols("EAB", "Old merged company", "HEL") == ["EAB.HE"]

def test_mixed_ev_currency_is_explicitly_unsupported(monkeypatch):
    import pytest
    from types import SimpleNamespace
    from python_pipeline.scripts import generate_financials_csv as generator
    period = pd.Timestamp("2025-12-31")
    balance = pd.DataFrame({period: [1, 1, 1, 0, 0]}, index=[
        "Current Assets", "Current Liabilities", "Net PPE",
        "Cash And Cash Equivalents", "Current Debt"])
    instrument = SimpleNamespace(balance_sheet=balance,
                                 income_stmt=pd.DataFrame({period: [1]}, index=["Operating Income"]),
                                 info={"symbol": "A.ST", "quoteType": "EQUITY", "exchange": "STO",
                                       "financialCurrency": "EUR", "currency": "SEK"})
    monkeypatch.setattr(generator.yf, "Ticker", lambda symbol: instrument)
    with pytest.raises(generator.FinancialExtractionError, match="unsupported_ev_currency_basis"):
        generator.extract_financials("A", "A", "STO", "2026-10-29", {"EUR": 1, "SEK": 11})

def test_reported_operating_income_prevents_yahoo_ebit_definition_drift():
    from python_pipeline.scripts.generate_financials_csv import EBIT_ROWS
    period = pd.Timestamp("2025-12-31")
    # KONE 2025: virallinen liiketulos 1336.2 M EUR; Yahoo EBIT sisältää eriä
    # joista johdettu 1367.2 M EUR ei vastaa yhtiön raportoimaa liiketulosta.
    frame = pd.DataFrame({period: [1_336_200_000.0, 1_367_200_000.0]},
                         index=["Total Operating Income As Reported", "EBIT"])
    assert value_at(frame, EBIT_ROWS, period) == (1_336_200_000.0, "Total Operating Income As Reported")
