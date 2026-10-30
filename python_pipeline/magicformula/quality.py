from __future__ import annotations

import math

from .models import FinancialRecord


def quality_score(record: FinancialRecord) -> float | None:
    """Erillinen laatumittari: ROIC 2/3, velka/EBITDA 1/3. Ei imputointia."""
    if record.roic is None or record.debt_to_ebitda is None:
        return None
    if not all(math.isfinite(value) for value in (record.roic, record.debt_to_ebitda)):
        return None
    roic_component = min(max(record.roic * 200, 0), 50)
    debt_component = min(max((4 - record.debt_to_ebitda) * 8.33, 0), 25)
    return round((roic_component + debt_component) / 75 * 100, 2)
