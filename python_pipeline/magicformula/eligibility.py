from __future__ import annotations

import math
from datetime import date, datetime, timezone

from .models import FinancialRecord, UniverseCompany
from .normalization import normalize_record, validate_record
from .universe import dedupe_codes

MIN_MARKET_CAP_EUR = 50_000_000


def _number(row: dict, field: str) -> float | None:
    try:
        value = float(row[field])
        return value if math.isfinite(value) else None
    except (KeyError, TypeError, ValueError):
        return None


def financial_metadata_errors(row: dict, as_of: date | None = None) -> list[str]:
    """Tuntematon yksikkö, valuutta tai ajankohta estää julkaistavan laskennan."""
    required = ("currency", "price_currency", "enterprise_value_currency", "statement_date",
                "market_data_date", "retrieved_at", "source_url", "period_type", "amount_unit")
    if any(not row.get(field) for field in required):
        return ["missing_financial_metadata"]
    if row["period_type"] != "annual" or row["amount_unit"] != "units":
        return ["unsupported_financial_basis"]
    if row["currency"] != row["enterprise_value_currency"]:
        return ["financial_currency_mismatch"]
    today = as_of or datetime.now(timezone.utc).date()
    try:
        statement = date.fromisoformat(row["statement_date"])
        market = date.fromisoformat(row["market_data_date"])
        retrieved = datetime.fromisoformat(row["retrieved_at"]).date()
        fx_date = date.fromisoformat(row["fx_date"])
    except (TypeError, ValueError, KeyError):
        return ["invalid_financial_dates"]
    if any(value > today for value in (statement, market, retrieved, fx_date)):
        return ["future_financial_date"]
    if not statement <= market <= retrieved or fx_date > retrieved:
        return ["inconsistent_financial_dates"]
    errors = []
    if (today - statement).days > 550:
        errors.append("stale_financial_statements")
    if (today - market).days > 10 or (today - fx_date).days > 10:
        errors.append("stale_market_data")
    cap = _number(row, "market_cap")
    cap_eur = _number(row, "market_cap_eur")
    fx = _number(row, "fx_rate_to_eur")
    if cap is None or cap_eur is None or fx is None or min(cap, cap_eur, fx) <= 0:
        errors.append("missing_market_cap_or_fx")
    elif not math.isclose(cap * fx, cap_eur, rel_tol=1e-6, abs_tol=0.01):
        errors.append("market_cap_fx_mismatch")
    elif cap_eur < MIN_MARKET_CAP_EUR:
        errors.append("market_cap_below_threshold")
    return errors


def assess_company(company: UniverseCompany, financial_row: dict | None) -> tuple[FinancialRecord | None, list[str]]:
    if not company.market_segment or company.market_segment.casefold() in {"unknown", "n/a"}:
        return None, ["unverified_listing"]
    if company.market_segment != "Main Market":
        return None, ["non_main_market"]
    if not company.listing_verified:
        return None, ["unverified_listing"]
    if not company.sector or company.sector.casefold() in {"unknown", "n/a"}:
        return None, ["missing_sector"]
    if company.is_financial:
        return None, ["financial_sector_methodology"]
    if company.is_utility:
        return None, ["utility_sector_methodology"]
    # Kotimaa ei ole poissulku: rajaus perustuu varmennettuun Main Market -listaukseen.
    if financial_row is None:
        return None, ["missing_financial_statements"]
    if financial_row.get("exchange") != company.exchange or financial_row.get("listing_id") != company.listing_id:
        return None, ["financial_identity_mismatch"]
    errors = financial_metadata_errors(financial_row)
    if errors:
        return None, dedupe_codes(errors)
    try:
        record = normalize_record({**financial_row, "ticker": company.ticker,
                                   "company": company.company, "sector": company.sector,
                                   "exchange": company.exchange})
    except ValueError:
        return None, ["missing_or_invalid_financial_values"]
    errors = validate_record(record)
    if financial_row.get("source_reconciliation_status") == "mismatch":
        errors.append("source_reconciliation_required")
    return (None, errors) if errors else (record, [])
