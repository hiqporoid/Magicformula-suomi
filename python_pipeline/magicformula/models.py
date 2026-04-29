from dataclasses import dataclass


@dataclass(frozen=True)
class UniverseCompany:
    ticker: str
    company: str
    sector: str | None = None
    exchange: str = "HEL"

    @property
    def is_financial(self) -> bool:
        return self.sector == "Financial and insurance activities"


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
