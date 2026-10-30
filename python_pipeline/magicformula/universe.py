from __future__ import annotations

from datetime import date, datetime, timezone
from urllib.parse import urlparse

from .models import UniverseCompany


def normalize_country(value: object) -> str | None:
    """Country is issuer domicile metadata, never inferred from the listing venue."""
    text = str(value or "").strip().upper()
    aliases = {"SW": "SE", "SWEDEN": "SE", "SVERIGE": "SE", "FINLAND": "FI", "SUOMI": "FI"}
    result = aliases.get(text, text)
    return result if len(result) == 2 and result.isalpha() else None


def normalize_sector(value: object) -> str | None:
    text = str(value or "").strip()
    return None if text.casefold() in {"", "unknown", "n/a", "none", "nan"} else text


def valid_isin(value: str) -> bool:
    """ISO 6166 identifier shape and Luhn checksum; not a listing proof by itself."""
    if len(value) != 12 or not value.isascii() or not value[:2].isalpha() or not value.isalnum() or not value[-1].isdigit():
        return False
    expanded = ''.join(str(ord(char) - 55) if char.isalpha() else char for char in value)
    total = 0
    for position, char in enumerate(reversed(expanded)):
        digit = int(char) * (2 if position % 2 else 1)
        total += digit // 10 + digit % 10
    return total % 10 == 0


def valid_listing_metadata(metadata: dict, as_of: date | None = None) -> bool:
    if metadata.get('market_segment') != 'Main Market':
        return False
    if not valid_isin(metadata.get('isin') or ''):
        return False
    try:
        source = urlparse(metadata.get('source_url') or '')
        checked = date.fromisoformat(metadata.get('source_date') or '')
    except ValueError:
        return False
    age = ((as_of or datetime.now(timezone.utc).date()) - checked).days
    # Monthly admission review is required; an old check must not silently remain verified.
    return source.scheme == 'https' and bool(source.hostname) and 0 <= age <= 31


REASON_LABELS = {
    "source_reconciliation_required": "Lähderaportin ja toimittajan tase-erien vastaavuus vaatii tarkistuksen; laskenta on estetty.",
    "missing_issuer_id": "Yhtiön yksilöivä tunniste puuttuu; osakesarjojen päällekkäisyyttä ei voida estää.",
    "unverified_listing": "Main Market -listauksen lähdevarmennus puuttuu; rivi on tarkistettava kandidaatti.",
    "financial_identity_mismatch": "Talousdatan pörssi- tai listausavain ei vastaa yhtiön listausta.",
    "missing_financial_metadata": "Talousdatan valuutta, yksikkö, periodi tai lähdepäivä puuttuu.",
    "unsupported_financial_basis": "Talouslukujen periodi tai yksikkö ei vastaa vuosilaskentaa perusvaluuttayksiköissä.",
    "financial_currency_mismatch": "EBITin ja yritysarvon valuutat eivät vastaa toisiaan.",
    "invalid_financial_dates": "Talousdatan päivämäärät ovat puutteellisia tai virheellisiä.",
    "future_financial_date": "Talousdatassa on tulevaisuuteen päivätty lähdeluku.",
    "inconsistent_financial_dates": "Tilinpäätös-, markkina- ja hakupäivien järjestys ei ole johdonmukainen.",
    "stale_financial_statements": "Tilinpäätös on yli 550 päivää vanha.",
    "stale_market_data": "Markkinadata tai valuuttakurssi on yli 10 päivää vanha.",
    "missing_market_cap_or_fx": "Markkina-arvo tai euroiksi muuntamiseen tarvittava valuuttakurssi puuttuu tai on virheellinen.",
    "market_cap_fx_mismatch": "Euromääräinen markkina-arvo ei vastaa lähdearvon valuuttamuunnosta.",
    "missing_or_invalid_financial_values": "Laskennan lähdeluku puuttuu tai ei ole äärellinen numero.",
    "non_finite_financial_value": "Talousluvussa on NaN tai ääretön arvo.",
    "negative_balance_sheet_value": "Taseen laskentakomponentti on negatiivinen ja vaatii lähdetarkistuksen.",
    "inconsistent_balance_sheet": "Kassa tai lyhytaikainen korollinen velka ylittää vastaavan taseen kokonaiserän.",
    "listing_unverified": "Main Market -listauksen lähdevarmennus puuttuu; rivi on tarkistettava kandidaatti.",
    "non_main_market": "Listaus ei kuulu Nasdaq Helsinki / Stockholm Main Market -markkinoille.",
    "duplicate_issuer_listing": "Sama yhtiö on mukana toisella osakesarjalla tai rinnakkaislistauksella; rankingissa käytetään yhtä edustavaa listausta.",
    "missing_sector": "Sektoritieto puuttuu, joten metodologinen rajaus ei ole varmennettavissa.",
    "financial_sector_methodology": "Finanssiyhtiö on rajattu pois Magic Formula -rankkauksesta v1-metodologiassa.",
    "utility_sector_methodology": "Yleis­hyödyllinen yhtiö (utility) on rajattu pois Magic Formula -rankkauksesta v1-metodologiassa.",
    "foreign_company_methodology": "Ulkomainen yhtiö on rajattu pois Greenblatt-rajauksen mukaisesti.",
    "market_cap_below_threshold": "Markkina-arvo on alle 50 M€; listaus säilyy aineistossa mutta ei rankingissa.",
    "missing_financial_statements": "Yhtiöltä puuttuvat rankingiin tarvittavat talousluvut tässä viennissä.",
    "ebit_non_positive": "EBIT on nolla tai negatiivinen, joten tulostuotto ei ole v1:ssä vertailukelpoinen.",
    "enterprise_value_non_positive": "Enterprise value on nolla tai negatiivinen.",
    "invested_capital_non_positive": "Sijoitetun pääoman nimittäjä on nolla tai negatiivinen.",
}


def normalize_universe_company(raw: dict) -> UniverseCompany:
    ticker = str(raw.get("ticker", "")).strip().upper()
    company = str(raw.get("company", "")).strip()
    sector = normalize_sector(raw.get("sector"))
    exchange = str(raw.get("exchange", "HEL")).strip().upper() or "HEL"
    country = normalize_country(raw.get("country"))

    if not ticker:
        raise ValueError("Universe-riviltä puuttuu ticker")
    if not company:
        raise ValueError(f"Universe-riviltä puuttuu yhtiön nimi: {ticker}")
    if exchange not in {"HEL", "STO"}:
        raise ValueError(f"Tuntematon pörssi: {exchange}")

    metadata = {key: str(raw.get(key) or "").strip() or None for key in (
        "market_segment", "source_url", "source_date", "isin", "issuer_id", "source_symbol"
    )}
    verified = str(raw.get("listing_verified", "")).strip().casefold() in {"true", "1"}
    # A provider exchange code alone never proves Main Market admission.
    verified = verified and valid_listing_metadata(metadata)
    return UniverseCompany(ticker=ticker, company=company, sector=sector, exchange=exchange,
                           country=country, listing_verified=bool(verified), **metadata)


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
