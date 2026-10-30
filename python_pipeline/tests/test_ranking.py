from python_pipeline.magicformula.models import FinancialRecord
from python_pipeline.magicformula.ranking import (
    calculate_earnings_yield,
    calculate_roc,
    rank_magic_formula,
)


def test_calculate_roc() -> None:
    record = FinancialRecord("AAA", "A Oyj", 100, 1000, 400, 200, 300)
    assert round(calculate_roc(record), 4) == 0.2


def test_calculate_earnings_yield() -> None:
    record = FinancialRecord("AAA", "A Oyj", 100, 1000, 400, 200, 300)
    assert round(calculate_earnings_yield(record), 4) == 0.1


def test_rank_magic_formula_is_deterministic_with_ties() -> None:
    records = [
        FinancialRecord("BBB", "B Oyj", 100, 1000, 300, 100, 300),
        FinancialRecord("AAA", "A Oyj", 100, 1000, 300, 100, 300),
    ]
    ranked = rank_magic_formula(records)
    assert ranked[0].ticker == "AAA"
    assert ranked[1].ticker == "BBB"


def test_operating_working_capital_excludes_cash_and_current_debt():
    record = FinancialRecord("A", "A", 100, 1000, 400, 200, 300, cash=80, short_term_debt=30)
    assert record.invested_capital == 450
    assert calculate_roc(record) == 100 / 450


def test_part_ranks_sum_and_final_rank_are_distinct():
    records = [FinancialRecord("A", "A", 100, 1000, 300, 100, 300),
               FinancialRecord("B", "B", 100, 500, 500, 100, 600),
               FinancialRecord("C", "C", 100, 2000, 200, 100, 100)]
    ranked = rank_magic_formula(records)
    by_id = {r.ticker: r for r in ranked}
    assert (by_id["A"].roc_rank, by_id["A"].ebit_ev_rank, by_id["A"].rank_sum) == (2, 2, 4)
    assert [r.magic_formula_rank for r in ranked] == [1, 2, 3]
    assert [r.ticker for r in ranked] == ["A", "B", "C"]


def test_identical_tickers_on_two_exchanges_remain_distinct():
    records = [FinancialRecord("A", "A Sweden", 100, 1000, 300, 100, 300, exchange="STO"),
               FinancialRecord("A", "A Finland", 100, 1000, 300, 100, 300, exchange="HEL")]
    ranked = rank_magic_formula(records)
    assert [r.listing_id for r in ranked] == ["HEL:A", "STO:A"]
    assert [r.roc_rank for r in ranked] == [1, 2]


def test_duplicate_listing_rejected():
    import pytest
    record = FinancialRecord("A", "A", 100, 1000, 300, 100, 300)
    with pytest.raises(ValueError):
        rank_magic_formula([record, record])


def test_direct_nonfinite_input_rejected():
    import pytest
    record = FinancialRecord("A", "A", float("nan"), 1000, 300, 100, 300)
    with pytest.raises(ValueError):
        calculate_roc(record)
