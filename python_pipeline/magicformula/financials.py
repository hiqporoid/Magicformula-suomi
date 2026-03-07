from __future__ import annotations

import math
from collections.abc import Iterable


def is_valid_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not math.isnan(float(value))


def latest_numeric_value(series: object) -> float | None:
    if series is None or not hasattr(series, "dropna"):
        return None

    cleaned = series.dropna()
    if getattr(cleaned, "empty", True):
        return None

    for value in cleaned.tolist():
        if is_valid_number(value):
            return float(value)

    return None


def compute_enterprise_value(
    reported_enterprise_value: object,
    market_cap: object,
    total_debt: object,
    cash_values: Iterable[object],
) -> float | None:
    if is_valid_number(reported_enterprise_value):
        return float(reported_enterprise_value)

    if not is_valid_number(market_cap) or float(market_cap) <= 0 or not is_valid_number(total_debt):
        return None

    cash = 0.0
    for value in cash_values:
        if is_valid_number(value):
            cash = float(value)
            break

    return float(market_cap) + float(total_debt) - cash