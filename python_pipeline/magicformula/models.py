from dataclasses import dataclass


@dataclass(frozen=True)
class UniverseCompany:
    ticker: str
    company: str
    sector: str | None = None
    exchange: str = "HEL"
    country: str | None = None
    market_segment: str | None = None
    listing_verified: bool = False
    source_url: str | None = None
    source_date: str | None = None
    isin: str | None = None
    issuer_id: str | None = None
    source_symbol: str | None = None

    @property
    def listing_id(self) -> str:
        return f"{self.exchange}:{self.ticker}"

    @property
    def is_financial(self) -> bool:
        return (self.sector or "").casefold() in {
            "financial and insurance activities", "financial services", "financials",
            "finance", "banks", "insurance",
        }

    @property
    def is_utility(self) -> bool:
        return (self.sector or "").casefold() in {
            "electricity, gas, steam and air conditioning supply", "utilities", "utility",
        }

    @property
    def is_foreign_to_exchange(self) -> bool:
        exchange_country = {"HEL": "FI", "STO": "SE"}.get(self.exchange)
        if exchange_country is None:
            return False
        return self.country is not None and self.country != exchange_country


@dataclass(frozen=True)
class FinancialRecord:
    ticker: str
    company: str
    ebit: float
    enterprise_value: float
    current_assets: float
    current_liabilities: float
    net_ppe: float
    sector: str | None = None
    roic: float | None = None
    debt_to_ebitda: float | None = None
    exchange: str = "HEL"
    cash: float = 0.0
    short_term_debt: float = 0.0

    @property
    def listing_id(self) -> str:
        return f"{self.exchange}:{self.ticker}"

    @property
    def invested_capital(self) -> float:
        # Operating working capital excludes cash and current interest-bearing debt.
        return self.current_assets - self.cash - self.current_liabilities + self.short_term_debt + self.net_ppe


@dataclass(frozen=True)
class RankedRecord:
    ticker: str
    company: str
    roc: float
    earnings_yield: float
    ebit_ev: float
    magic_formula_rank: int
    ebit_ev_rank: int
    roc_rank: int = 0
    rank_sum: int = 0
    exchange: str = "HEL"

    @property
    def listing_id(self) -> str:
        return f"{self.exchange}:{self.ticker}"

    @property
    def earnings_yield_rank(self) -> int:
        return self.ebit_ev_rank
