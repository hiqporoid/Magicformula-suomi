from __future__ import annotations

import csv
import sys
from dataclasses import dataclass
from pathlib import Path

import yfinance as yf

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from python_pipeline.magicformula.financials import compute_enterprise_value, latest_numeric_value
from python_pipeline.magicformula.universe import normalize_universe_company

UNIVERSE_PATH = REPO_ROOT / "python_pipeline" / "data" / "main_market_universe.csv"
OUTPUT_PATH = REPO_ROOT / "python_pipeline" / "data" / "financials.csv"

YAHOO_SYMBOL_OVERRIDES = {
    "NDA": "NDA-FI.HE",
    "CGCBV": "HIAB.HE",
    "OKDAV": "ORIOLA.HE",
    "KSLAV": "KSL.HE",
    "HKSAV": "HKFOODS.HE",
    "PUMU": "REBL.HE",
    "EAB": "EVLI.HE",
    "SIEVI": "KHG.HE",
    "STOCKA": "LINDEX.HE",
    "MOCORP": "METSO.HE",
    "TMTR": "TAMTRON.HE",
    "WITM": "WITTED.HE",
    "FELLOW": "ALISA.HE",
}

CASH_ROW_NAMES = (
    "Cash Cash Equivalents And Short Term Investments",
    "Cash And Cash Equivalents",
    "Cash And Short Term Investments",
    "Cash Equivalents",
)


@dataclass(frozen=True)
class ExtractedFinancials:
    ticker: str
    source_symbol: str
    statement_date: str | None
    ev_source: str
    market_cap: float | None
    ebit: float
    enterprise_value: float
    current_assets: float
    current_liabilities: float
    net_ppe: float
    roic: float | None
    debt_to_ebitda: float | None


def load_universe() -> list[dict[str, str]]:
    return list(csv.DictReader(UNIVERSE_PATH.read_text(encoding="utf-8").splitlines()))


def latest_row_value(frame, row_name: str) -> tuple[float | None, str | None]:
    if row_name not in frame.index:
        return None, None

    series = frame.loc[row_name].dropna()
    if series.empty:
        return None, None

    value = latest_numeric_value(series)
    if value is None:
        return None, None

    return value, str(series.index[0].date())


def first_available_row_value(frame, row_names: tuple[str, ...]) -> tuple[float | None, str | None]:
    for row_name in row_names:
        value, date = latest_row_value(frame, row_name)
        if value is not None:
            return value, date

    return None, None


def build_candidate_symbols(ticker: str, company: str) -> list[str]:
    candidates: list[str] = []
    override = YAHOO_SYMBOL_OVERRIDES.get(ticker)
    if override:
        candidates.append(override)

    default_symbol = f"{ticker}.HE"
    if default_symbol not in candidates:
        candidates.append(default_symbol)

    try:
        search = yf.Search(company, max_results=8)
        for quote in search.quotes:
            symbol = quote.get("symbol")
            exchange = quote.get("exchange")
            if not symbol or exchange != "HEL" or symbol in candidates:
                continue
            candidates.append(symbol)
    except Exception:
        pass

    return candidates


def extract_financials(ticker: str, company: str) -> ExtractedFinancials | None:
    candidates = build_candidate_symbols(ticker, company)

    for symbol in candidates:
        try:
            instrument = yf.Ticker(symbol)
            balance_sheet = instrument.balance_sheet
            income_statement = instrument.income_stmt
            info = instrument.info
        except Exception:
            continue

        ebit, ebit_date = latest_row_value(income_statement, "EBIT")
        current_assets, current_assets_date = latest_row_value(balance_sheet, "Current Assets")
        current_liabilities, current_liabilities_date = latest_row_value(balance_sheet, "Current Liabilities")
        net_ppe, net_ppe_date = latest_row_value(balance_sheet, "Net PPE")
        total_debt, _ = latest_row_value(balance_sheet, "Total Debt")
        ebitda, _ = latest_row_value(income_statement, "EBITDA")
        cash_values = [first_available_row_value(balance_sheet, (row_name,))[0] for row_name in CASH_ROW_NAMES]
        enterprise_value = compute_enterprise_value(
            info.get("enterpriseValue"),
            info.get("marketCap"),
            total_debt,
            cash_values,
        )
        if enterprise_value is None:
            continue
        if None in (ebit, current_assets, current_liabilities, net_ppe):
            continue

        debt_to_ebitda = None
        if total_debt is not None and ebitda not in (None, 0):
            debt_to_ebitda = round(total_debt / ebitda, 6)

        statement_dates = [date for date in (ebit_date, current_assets_date, current_liabilities_date, net_ppe_date) if date]
        statement_date = max(statement_dates) if statement_dates else None
        ev_source = "reported_enterprise_value" if info.get("enterpriseValue") is not None else "market_cap_plus_net_debt"
        market_cap = info.get("marketCap")
        market_cap_value = round(float(market_cap), 6) if isinstance(market_cap, (int, float)) else None

        return ExtractedFinancials(
            ticker=ticker,
            source_symbol=symbol,
            statement_date=statement_date,
            ev_source=ev_source,
            market_cap=market_cap_value,
            ebit=round(ebit, 6),
            enterprise_value=round(enterprise_value, 6),
            current_assets=round(current_assets, 6),
            current_liabilities=round(current_liabilities, 6),
            net_ppe=round(net_ppe, 6),
            roic=None,
            debt_to_ebitda=debt_to_ebitda,
        )

    return None


def main() -> None:
    companies = [normalize_universe_company(row) for row in load_universe()]
    extracted_rows: list[dict[str, str | float | None]] = []
    missing: list[str] = []

    for index, company in enumerate(companies, start=1):
        if index % 25 == 0:
            print(f"Kasitelty {index}/{len(companies)} yhtiota")

        extracted = extract_financials(company.ticker, company.company)
        if extracted is None:
            missing.append(company.ticker)
            continue

        extracted_rows.append(
            {
                "ticker": extracted.ticker,
                "source_symbol": extracted.source_symbol,
                "statement_date": extracted.statement_date or "",
                "ev_source": extracted.ev_source,
                "market_cap": extracted.market_cap if extracted.market_cap is not None else "",
                "ebit": extracted.ebit,
                "enterprise_value": extracted.enterprise_value,
                "current_assets": extracted.current_assets,
                "current_liabilities": extracted.current_liabilities,
                "net_ppe": extracted.net_ppe,
                "roic": "",
                "debt_to_ebitda": extracted.debt_to_ebitda if extracted.debt_to_ebitda is not None else "",
            }
        )

    fieldnames = [
        "ticker",
        "source_symbol",
        "statement_date",
        "ev_source",
        "market_cap",
        "ebit",
        "enterprise_value",
        "current_assets",
        "current_liabilities",
        "net_ppe",
        "roic",
        "debt_to_ebitda",
    ]
    with OUTPUT_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(sorted(extracted_rows, key=lambda row: str(row["ticker"])))

    print(f"Kirjoitettu {OUTPUT_PATH}")
    print(f"Financial rows: {len(extracted_rows)} / {len(companies)}")
    if missing:
        print("Puuttuvat tickerit:", ", ".join(sorted(missing)))


if __name__ == "__main__":
    main()
