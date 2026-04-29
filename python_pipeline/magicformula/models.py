from dataclasses import dataclass


@dataclass(frozen=True)
class UniverseCompany:
    ticker: str
    company: str
    sector: str | None = None
    exchange: str = "HEL"
    country: str | None = None

    @property
    def is_financial(self) -> bool:
        return self.sector == "Financial and insurance activities"

    @property
    def is_utility(self) -> bool:
        return self.sector == "Electricity, gas, steam and air conditioning supply"

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


@dataclass(frozen=True)
class RankedRecord:
    ticker: str
    company: str
    roc: float
    earnings_yield: float
    ebit_ev: float
    magic_formula_rank: int
    ebit_ev_rank: int
