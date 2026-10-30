from __future__ import annotations

from dataclasses import replace

from .models import FinancialRecord, RankedRecord
from .normalization import validate_record
from .ebit_ev import calculate_earnings_yield


def _validate(record: FinancialRecord) -> None:
    errors = validate_record(record)
    if errors:
        raise ValueError(f"{record.listing_id}: {', '.join(errors)}")


def calculate_roc(record: FinancialRecord) -> float:
    _validate(record)
    return record.ebit / record.invested_capital


def rank_magic_formula(records: list[FinancialRecord]) -> list[RankedRecord]:
    if len({record.listing_id for record in records}) != len(records):
        raise ValueError("Rankingissa on sama listaus useaan kertaan")
    computed = [(record, calculate_roc(record), calculate_earnings_yield(record)) for record in records]
    # Osarankingin tasatilanteet ja lopullinen rankkisumma ratkaistaan pörssi:tickerillä.
    roc_rank = {item[0].listing_id: index + 1 for index, item in
                enumerate(sorted(computed, key=lambda item: (-item[1], item[0].listing_id)))}
    ey_rank = {item[0].listing_id: index + 1 for index, item in
               enumerate(sorted(computed, key=lambda item: (-item[2], item[0].listing_id)))}
    ranked = [RankedRecord(
        ticker=record.ticker, company=record.company, exchange=record.exchange,
        roc=roc, earnings_yield=ey, ebit_ev=ey, magic_formula_rank=0,
        ebit_ev_rank=ey_rank[record.listing_id], roc_rank=roc_rank[record.listing_id],
        rank_sum=roc_rank[record.listing_id] + ey_rank[record.listing_id],
    ) for record, roc, ey in computed]
    return [replace(record, magic_formula_rank=index + 1) for index, record in
            enumerate(sorted(ranked, key=lambda item: (item.rank_sum, item.listing_id)))]
