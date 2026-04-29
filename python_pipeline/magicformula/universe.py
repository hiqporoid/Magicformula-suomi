from __future__ import annotations

from .models import UniverseCompany


REASON_LABELS = {
    "missing_sector": "Sektoritieto puuttuu, joten metodologinen rajaus ei ole varmennettavissa.",
    "financial_sector_methodology": "Finanssiyhtiö on rajattu pois Magic Formula -rankkauksesta v1-metodologiassa.",
    "utility_sector_methodology": "Yleis­hyödyllinen yhtiö (utility) on rajattu pois Magic Formula -rankkauksesta v1-metodologiassa.",
    "foreign_company_methodology": "Ulkomainen yhtiö on rajattu pois Greenblatt-rajauksen mukaisesti.",
    "market_cap_below_threshold": "Markkina-arvo on alle 50 M€, joten yhtiö rajataan ulos universesta.",
    "missing_financial_statements": "Yhtiöltä puuttuvat rankingiin tarvittavat talousluvut tässä viennissä.",
    "ebit_non_positive": "EBIT on nolla tai negatiivinen, joten tulostuotto ei ole v1:ssä vertailukelpoinen.",
    "enterprise_value_non_positive": "Enterprise value on nolla tai negatiivinen.",
    "invested_capital_non_positive": "Sijoitetun pääoman nimittäjä on nolla tai negatiivinen.",
}


def normalize_universe_company(raw: dict) -> UniverseCompany:
    ticker = str(raw.get("ticker", "")).strip().upper()
    company = str(raw.get("company", "")).strip()
    sector = str(raw.get("sector", "")).strip() or None
    exchange = str(raw.get("exchange", "HEL")).strip().upper() or "HEL"
    country = str(raw.get("country", "")).strip().upper() or None
    if country is None:
        country = {"HEL": "FI", "STO": "SE"}.get(exchange)

    if not ticker:
        raise ValueError("Universe-riviltä puuttuu ticker")
    if not company:
        raise ValueError(f"Universe-riviltä puuttuu yhtiön nimi: {ticker}")

    return UniverseCompany(ticker=ticker, company=company, sector=sector, exchange=exchange, country=country)


def dedupe_codes(codes: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for code in codes:
        if code not in seen:
            ordered.append(code)
            seen.add(code)
    return ordered


def translate_reasons(codes: list[str]) -> list[str]:
    return [REASON_LABELS[code] for code in dedupe_codes(codes)]
