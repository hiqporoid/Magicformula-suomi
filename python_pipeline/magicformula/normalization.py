from __future__ import annotations

import math

from .models import FinancialRecord


REQUIRED_FIELDS = (
    "ticker",
    "company",
    "ebit",
    "enterprise_value",
    "current_assets",
    "current_liabilities",
    "net_ppe",
    "cash",
    "short_term_debt",
)


def _read_float(raw: dict, field: str) -> float:
    value = raw.get(field)
    if value in (None, "") or isinstance(value, bool):
        raise ValueError(f"Puuttuva talouskenttä: {field}")

    try:
        result = float(value)
        if not math.isfinite(result):
            raise ValueError("Ei äärellinen")
        return result
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Virheellinen talouskenttä: {field}") from exc


def _read_optional_quality(raw: dict, field: str) -> float | None:
    # Overlayn puute/virhe ei saa muuttaa varsinaisen Magic Formulan kelpoisuutta.
    try:
        return _read_float(raw, field)
    except ValueError:
        return None


def normalize_record(raw: dict) -> FinancialRecord:
    missing = [field for field in REQUIRED_FIELDS if field not in raw or raw[field] in (None, "")]
    if missing:
        raise ValueError(f"Puuttuvat pakolliset kentät: {', '.join(missing)}")

    return FinancialRecord(
        ticker=str(raw["ticker"]).strip().upper(),
        company=str(raw["company"]).strip(),
        ebit=_read_float(raw, "ebit"),
        enterprise_value=_read_float(raw, "enterprise_value"),
        current_assets=_read_float(raw, "current_assets"),
        current_liabilities=_read_float(raw, "current_liabilities"),
        net_ppe=_read_float(raw, "net_ppe"),
        cash=_read_float(raw, "cash"),
        short_term_debt=_read_float(raw, "short_term_debt"),
        exchange=str(raw.get("exchange", "HEL")).strip().upper(),
        sector=str(raw["sector"]).strip() if raw.get("sector") not in (None, "") else None,
        roic=_read_optional_quality(raw, "roic"),
        debt_to_ebitda=_read_optional_quality(raw, "debt_to_ebitda"),
    )


def validate_record(record: FinancialRecord) -> list[str]:
    errors: list[str] = []
    values = (record.ebit, record.enterprise_value, record.current_assets,
              record.current_liabilities, record.net_ppe, record.cash, record.short_term_debt)
    if not all(math.isfinite(value) for value in values):
        return ["non_finite_financial_value"]
    invested_capital = record.invested_capital
    if not math.isfinite(invested_capital):
        return ["non_finite_financial_value"]
    if any(value < 0 for value in (record.current_assets, record.current_liabilities,
                                  record.net_ppe, record.cash, record.short_term_debt)):
        errors.append("negative_balance_sheet_value")
    if record.cash > record.current_assets or record.short_term_debt > record.current_liabilities:
        errors.append("inconsistent_balance_sheet")

    if record.ebit <= 0:
        errors.append("ebit_non_positive")
    if record.enterprise_value <= 0:
        errors.append("enterprise_value_non_positive")
    if invested_capital <= 0:
        errors.append("invested_capital_non_positive")
    if not errors and not all(math.isfinite(value) for value in (
        record.ebit / invested_capital, record.ebit / record.enterprise_value,
    )):
        errors.append("non_finite_financial_value")

    return errors
