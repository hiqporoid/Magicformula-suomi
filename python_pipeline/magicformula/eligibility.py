from __future__ import annotations

import math
from collections.abc import Iterable

from .models import FinancialRecord, UniverseCompany
from .normalization import normalize_record, validate_record
from .universe import dedupe_codes


def assess_company(company: UniverseCompany, financial_row: dict | None) -> tuple[FinancialRecord | None, list[str]]:
    codes: list[str] = []

    if company.sector is None:
        codes.append("missing_sector")
        return None, dedupe_codes(codes)

    # Finance names remain a methodological exclusion in v1. We do not label them as
    # missing statements even when Yahoo's statement layout differs from industrial companies.
    if company.is_financial:
        codes.append("financial_sector_methodology")
        return None, dedupe_codes(codes)

    if company.is_utility:
        codes.append("utility_sector_methodology")
        return None, dedupe_codes(codes)

    if company.is_foreign_to_exchange:
        codes.append("foreign_company_methodology")
        return None, dedupe_codes(codes)

    if financial_row is None:
        codes.append("missing_financial_statements")
        return None, dedupe_codes(codes)

    market_cap_value = financial_row.get("market_cap")
    try:
        if market_cap_value not in (None, "") and float(market_cap_value) < 50_000_000:
            codes.append("market_cap_below_threshold")
            return None, dedupe_codes(codes)
    except (TypeError, ValueError):
        pass

    try:
        record = normalize_record(
            {
                **financial_row,
                "ticker": company.ticker,
                "company": company.company,
                "sector": company.sector or "",
            }
        )
    except ValueError:
        codes.append("missing_financial_statements")
        return None, dedupe_codes(codes)

    codes.extend(validate_record(record))
    if codes:
        return None, dedupe_codes(codes)

    return record, []
