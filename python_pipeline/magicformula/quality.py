from __future__ import annotations

from .models import FinancialRecord


def quality_score(record: FinancialRecord) -> float:
    """Kevyt v1-laatupisteytys välille 0-100."""
    roic_component = min(max((record.roic or 0.0) * 200, 0), 50)
    debt_component = 25
    if record.debt_to_ebitda is not None:
        debt_component = min(max((4 - record.debt_to_ebitda) * 8.33, 0), 25)

    stability_component = 25  # Placeholder v1:lle
    return round(roic_component + debt_component + stability_component, 2)
