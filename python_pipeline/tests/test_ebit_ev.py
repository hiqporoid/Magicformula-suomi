import pytest

from python_pipeline.magicformula.ebit_ev import calculate_earnings_yield, rank_ebit_ev
from python_pipeline.magicformula.models import FinancialRecord


def row(ticker="A", ebit=100, ev=1000, exchange="HEL"):
    return FinancialRecord(ticker, ticker, ebit, ev, 0, 10, 0, exchange=exchange)


def test_ebit_ev_does_not_require_a_valid_roc_denominator():
    assert calculate_earnings_yield(row()) == .1


@pytest.mark.parametrize("ebit,ev", [(0, 1), (1, 0), (-1, 1), (1, -1), (float("nan"), 1), (1, float("inf"))])
def test_invalid_ebit_ev_input_is_rejected(ebit, ev):
    with pytest.raises(ValueError):
        calculate_earnings_yield(row(ebit=ebit, ev=ev))


def test_ebit_ev_ranking_uses_listing_id_ties():
    assert [r.listing_id for r in rank_ebit_ev([row(exchange="STO"), row()])] == ["HEL:A", "STO:A"]
