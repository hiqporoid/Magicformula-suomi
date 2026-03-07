from __future__ import annotations

from .models import FinancialRecord


REQUIRED_FIELDS = (
    "ticker",
    "company",
    "ebit",
    "enterprise_value",
    "current_assets",
    "current_liabilities",
    "net_ppe",
)


def _read_float(raw: dict, field: str) -> float:
    value = raw.get(field)
    if value in (None, ""):
        raise ValueError(f"Puuttuva talouskenttä: {field}")

    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Virheellinen talouskenttä: {field}") from exc


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
        sector=str(raw["sector"]).strip() if raw.get("sector") not in (None, "") else None,
        roic=float(raw["roic"]) if raw.get("roic") not in (None, "") else None,
        debt_to_ebitda=float(raw["debt_to_ebitda"]) if raw.get("debt_to_ebitda") not in (None, "") else None,
    )


def validate_record(record: FinancialRecord) -> list[str]:
    errors: list[str] = []
    invested_capital = record.net_ppe + (record.current_assets - record.current_liabilities)

    if record.ebit <= 0:
        errors.append("ebit_non_positive")
    if record.enterprise_value <= 0:
        errors.append("enterprise_value_non_positive")
    if invested_capital <= 0:
        errors.append("invested_capital_non_positive")

    return errors
