from __future__ import annotations

from .models import FinancialRecord, UniverseCompany
from .normalization import normalize_record, validate_record
from .universe import dedupe_codes


def assess_company(company: UniverseCompany, financial_row: dict | None) -> tuple[FinancialRecord | None, list[str]]:
    codes: list[str] = []

    if company.sector is None:
        codes.append("missing_sector")
    elif company.is_financial:
        codes.append("financial_sector_methodology")

    if financial_row is None:
        codes.append("missing_financial_statements")
        return None, dedupe_codes(codes)

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
        codes.append("invalid_financial_statements")
        return None, dedupe_codes(codes)

    codes.extend(validate_record(record))
    if codes:
        return None, dedupe_codes(codes)

    return record, []
