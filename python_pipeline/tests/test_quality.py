from python_pipeline.magicformula.models import FinancialRecord
from python_pipeline.magicformula.quality import quality_score


def test_quality_score_range() -> None:
    record = FinancialRecord("AAA", "A Oyj", 100, 1000, 400, 200, 300, roic=0.2, debt_to_ebitda=1.5)
    score = quality_score(record)
    assert 0 <= score <= 100
