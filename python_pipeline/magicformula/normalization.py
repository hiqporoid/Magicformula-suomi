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


def normalize_record(raw: dict) -> FinancialRecord:
    missing = [field for field in REQUIRED_FIELDS if field not in raw or raw[field] in (None, "")]
    if missing:
        raise ValueError(f"Puuttuvat pakolliset kentät: {', '.join(missing)}")

    ebit = float(raw["ebit"])
    enterprise_value = float(raw["enterprise_value"])
    current_assets = float(raw["current_assets"])
    current_liabilities = float(raw["current_liabilities"])
    net_ppe = float(raw["net_ppe"])

    return FinancialRecord(
        ticker=str(raw["ticker"]).strip().upper(),
        company=str(raw["company"]).strip(),
        ebit=ebit,
        enterprise_value=enterprise_value,
        current_assets=current_assets,
        current_liabilities=current_liabilities,
        net_ppe=net_ppe,
        roic=float(raw["roic"]) if raw.get("roic") not in (None, "") else None,
        debt_to_ebitda=float(raw["debt_to_ebitda"]) if raw.get("debt_to_ebitda") not in (None, "") else None,
    )


def validate_record(record: FinancialRecord) -> list[str]:
    errors: list[str] = []
    invested_capital = record.net_ppe + (record.current_assets - record.current_liabilities)

    if record.enterprise_value <= 0:
        errors.append("enterprise_value_non_positive")
    if invested_capital <= 0:
        errors.append("invested_capital_non_positive")

    return errors
