from __future__ import annotations

from .models import FinancialRecord, RankedRecord


def calculate_roc(record: FinancialRecord) -> float:
    invested_capital = record.net_ppe + (record.current_assets - record.current_liabilities)
    if invested_capital <= 0:
        raise ValueError("Sijoitetun pääoman nimittäjä <= 0")
    return record.ebit / invested_capital


def calculate_earnings_yield(record: FinancialRecord) -> float:
    if record.enterprise_value <= 0:
        raise ValueError("Enterprise value <= 0")
    return record.ebit / record.enterprise_value


def rank_magic_formula(records: list[FinancialRecord]) -> list[RankedRecord]:
    computed: list[tuple[FinancialRecord, float, float]] = []
    for record in records:
        roc = calculate_roc(record)
        ey = calculate_earnings_yield(record)
        computed.append((record, roc, ey))

    roc_rank = {
        item[0].ticker: idx + 1
        for idx, item in enumerate(sorted(computed, key=lambda x: (-x[1], x[0].ticker)))
    }
    ey_rank = {
        item[0].ticker: idx + 1
        for idx, item in enumerate(sorted(computed, key=lambda x: (-x[2], x[0].ticker)))
    }

    ranked: list[RankedRecord] = []
    for record, roc, ey in computed:
        ranked.append(
            RankedRecord(
                ticker=record.ticker,
                company=record.company,
                roc=roc,
                earnings_yield=ey,
                ebit_ev=ey,
                magic_formula_rank=roc_rank[record.ticker] + ey_rank[record.ticker],
                ebit_ev_rank=ey_rank[record.ticker],
            )
        )

    return sorted(ranked, key=lambda r: (r.magic_formula_rank, r.ticker))
