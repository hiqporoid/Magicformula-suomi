from __future__ import annotations

import argparse
import csv
import json
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

import requests
import yfinance as yf

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from python_pipeline.magicformula.financials import is_valid_number
from python_pipeline.magicformula.universe_sources import load_all_universe_rows
from python_pipeline.magicformula.universe import normalize_universe_company

OUTPUT_PATH = REPO_ROOT / "python_pipeline" / "data" / "financials.csv"
ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"
# Vain saman nykyisen listauksen tunnettu tunniste, ei yritysoston/sulautumisen seuraajaa.
YAHOO_SYMBOL_OVERRIDES = {("HEL", "NDA"): "NDA-FI.HE"}
BALANCE_ROWS = {
    "current_assets": ("Current Assets",),
    "current_liabilities": ("Current Liabilities",),
    "net_ppe": ("Net PPE",),
    "cash": ("Cash Cash Equivalents And Short Term Investments", "Cash And Cash Equivalents"),
    "short_term_debt": ("Current Debt And Capital Lease Obligation", "Current Debt"),
}
EBIT_ROWS = ("Total Operating Income As Reported", "Operating Income")


class FinancialExtractionError(ValueError):
    """Koneellisesti luettava puutteen syy talousdatan audit-raporttiin."""


def fetch_ecb_rates() -> tuple[str, dict[str, float]]:
    response = requests.get(ECB_URL, timeout=30)
    response.raise_for_status()
    root = ET.fromstring(response.content)
    day = next(element for element in root.iter() if "time" in element.attrib)
    rates = {element.attrib["currency"]: float(element.attrib["rate"])
             for element in day if "currency" in element.attrib}
    rates["EUR"] = 1.0
    return day.attrib["time"], rates


def value_at(frame, row_names: tuple[str, ...], period) -> tuple[float | None, str | None]:
    if period not in frame.columns:
        return None, None
    for name in row_names:
        if name in frame.index:
            value = frame.loc[name, period]
            if is_valid_number(value):
                return float(value), name
    return None, None


def latest_common_period(balance, income):
    """Ei poimita puuttuvaa tase-erää vanhemmasta tilikaudesta."""
    common = sorted(set(balance.columns) & set(income.columns), reverse=True)
    if not common:
        return None
    # Käytä uusinta yhteistä periodia; puutteellinen uusin data jää puutteelliseksi.
    return common[0]


def build_candidate_symbols(ticker: str, company: str, exchange: str, source_symbol: str | None = None) -> list[str]:
    if source_symbol:
        return [source_symbol]
    override = YAHOO_SYMBOL_OVERRIDES.get((exchange, ticker))
    return [override or f"{ticker.replace(' ', '-').replace('.', '-')}.{'ST' if exchange == 'STO' else 'HE'}"]


def extract_financials(ticker: str, company: str, exchange: str,
                       fx_date: str, rates: dict[str, float], source_symbol: str | None = None) -> dict | None:
    symbol = build_candidate_symbols(ticker, company, exchange, source_symbol)[0]
    instrument = yf.Ticker(symbol)
    balance, income, info = instrument.balance_sheet, instrument.income_stmt, instrument.info
    if info.get("symbol") != symbol or info.get("quoteType") != "EQUITY":
        raise FinancialExtractionError("financial_instrument_identity_mismatch")
    expected = "STO" if exchange == "STO" else "HEL"
    if info.get("exchange") != expected:
        raise FinancialExtractionError("financial_exchange_mismatch")
    period = latest_common_period(balance, income)
    if period is None:
        raise FinancialExtractionError("missing_common_annual_period")
    values, fields = {}, {}
    for key, names in BALANCE_ROWS.items():
        values[key], fields[key] = value_at(balance, names, period)
    ebit, ebit_field = value_at(income, EBIT_ROWS, period)
    if ebit is None or any(value is None for value in values.values()):
        raise FinancialExtractionError("missing_critical_statement_fields")
    currency, price_currency = info.get("financialCurrency"), info.get("currency")
    if currency not in rates or price_currency not in rates:
        raise FinancialExtractionError("missing_currency_or_ecb_rate")
    # Yahoo ei dokumentoi quoteSummaryn EV-valuuttaa riittävän yksiselitteisesti
    # ristiinvaluuttatapauksiin. Niitä ei rankata arvaamalla EV:n yksikköä.
    if currency != price_currency:
        raise FinancialExtractionError("unsupported_ev_currency_basis")
    cap, ev = info.get("marketCap"), info.get("enterpriseValue")
    market_time = info.get("regularMarketTime")
    if not is_valid_number(cap) or cap <= 0 or not is_valid_number(ev) or not is_valid_number(market_time):
        raise FinancialExtractionError("missing_valuation_or_market_date")
    # Valuutta on kelpoistettu samaksi; ei vahvistamatonta ristiinvaluutta-EV:tä.
    quote_to_financial = rates[currency] / rates[price_currency]
    return {
        "ticker": ticker, "exchange": exchange, "listing_id": f"{exchange}:{ticker}",
        "source_symbol": symbol, "source": "Yahoo Finance",
        "source_url": f"https://finance.yahoo.com/quote/{symbol}/financials/",
        "statement_date": str(period.date()), "period_type": "annual", "amount_unit": "units",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "market_data_date": datetime.fromtimestamp(market_time, timezone.utc).date().isoformat(),
        "currency": currency, "financial_currency": currency, "price_currency": price_currency,
        "enterprise_value_currency": currency, "ev_source": "reported_enterprise_value_converted",
        "market_cap": cap, "market_cap_eur": cap / rates[price_currency],
        "fx_rate_to_eur": 1 / rates[price_currency], "fx_date": fx_date, "fx_source_url": ECB_URL,
        "ev_fx_rate": quote_to_financial, "ebit_source_field": ebit_field,
        "ebit": ebit, "enterprise_value": ev * quote_to_financial,
        **values, "source_fields": json.dumps(fields, ensure_ascii=False),
        # Ei ROIC/velkavipuoletuksia, eikä vakauden keksittyä vakiopistettä.
        "roic": "", "debt_to_ebitda": "",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tickers", help="Rajattu lähdeotos, esim. HEL:KNEBV,STO:VOLV-B")
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument("--skip-methodological", action="store_true",
                        help="Älä hae teollisuuskaavaan soveltumattomia financials/utility-tilinpäätöksiä")
    args = parser.parse_args()
    companies = [normalize_universe_company(row) for row in load_all_universe_rows()]
    selected = set(args.tickers.split(",")) if args.tickers else None
    if selected:
        companies = [company for company in companies if company.listing_id in selected]
    else:
        companies = [company for company in companies if company.listing_verified]
    if not companies:
        raise SystemExit("Ei varmennettuja listauksia. Vanhaa financials.csv:tä ei ylikirjoiteta.")
    fx_date, rates = fetch_ecb_rates()
    rows, missing, skipped = [], [], []
    for index, company in enumerate(companies, start=1):
        if args.skip_methodological and (company.is_financial or company.is_utility):
            skipped.append({"listing_id": company.listing_id,
                            "reason": "financial_sector_methodology" if company.is_financial else "utility_sector_methodology"})
            continue
        for attempt in range(2):
            try:
                result = extract_financials(company.ticker, company.company, company.exchange,
                                            fx_date, rates, company.source_symbol)
                if result:
                    rows.append(result)
                else:
                    missing.append({"listing_id": company.listing_id, "reason": "missing_comparable_financials"})
                break
            except FinancialExtractionError as exc:
                missing.append({"listing_id": company.listing_id, "reason": str(exc)})
                break
            except Exception as exc:
                if attempt == 0:
                    time.sleep(1)
                else:
                    missing.append({"listing_id": company.listing_id, "reason": type(exc).__name__})
        if index % 25 == 0:
            print(f"Käsitelty {index}/{len(companies)}; talousrivejä {len(rows)}; puutteita {len(missing)}", flush=True)
        time.sleep(0.1)
    if not rows:
        raise SystemExit(f"Yhtään vertailukelpoista talousriviä ei saatu; vanha tiedosto säilyy. {missing}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda row: row["listing_id"]))
    report = {"retrieved_at": datetime.now(timezone.utc).isoformat(), "requested": len(companies),
              "written": len(rows), "missing": missing, "methodological_skips": skipped,
              "partial_sample": bool(selected)}
    args.output.with_suffix(".audit.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
