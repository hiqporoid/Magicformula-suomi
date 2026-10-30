from python_pipeline.magicformula.models import FinancialRecord
from python_pipeline.magicformula.quality import quality_score


def test_quality_score_range() -> None:
    record = FinancialRecord("AAA", "A Oyj", 100, 1000, 400, 200, 300, roic=0.2, debt_to_ebitda=1.5)
    score = quality_score(record)
    assert 0 <= score <= 100


def test_missing_quality_components_do_not_receive_invented_points():
    assert quality_score(FinancialRecord("A", "A", 1, 1, 1, 0, 1)) is None


def test_quality_does_not_affect_magic_formula():
    from python_pipeline.magicformula.ranking import rank_magic_formula
    a = FinancialRecord("A", "A", 100, 1000, 400, 200, 300, roic=None)
    b = FinancialRecord("B", "B", 100, 1000, 400, 200, 300, roic=1.0, debt_to_ebitda=0)
    assert [r.ticker for r in rank_magic_formula([b, a])] == ["A", "B"]
