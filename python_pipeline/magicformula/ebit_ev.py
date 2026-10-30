"""EBIT/EV-arvostusmittari erillään ROC- ja quality-laskennasta."""
from __future__ import annotations

import math

from .models import FinancialRecord


def calculate_earnings_yield(record: FinancialRecord) -> float:
    if not all(math.isfinite(value) and value > 0 for value in (record.ebit, record.enterprise_value)):
        raise ValueError("EBITin ja EV:n on oltava positiivisia äärellisiä lukuja")
    result = record.ebit / record.enterprise_value
    if not math.isfinite(result):
        raise ValueError("EBIT/EV ei ole äärellinen")
    return result


def rank_ebit_ev(records: list[FinancialRecord]) -> list[FinancialRecord]:
    if len({row.listing_id for row in records}) != len(records):
        raise ValueError("EBIT/EV-rankingissa on listausduplikaatti")
    return sorted(records, key=lambda row: (-calculate_earnings_yield(row), row.listing_id))
