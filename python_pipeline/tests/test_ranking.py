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
