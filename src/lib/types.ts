export type SourceInfo = {
  label: string;
  detail: string;
  path: string;
};

export type FinancialSnapshot = {
  statementDate: string | null;
  sourceSymbol: string | null;
  evSource: string | null;
  marketCap: number | null;
  ebit: number;
  enterpriseValue: number;
  investedCapital: number;
};

export type RankingRow = {
  rank: number;
  ticker: string;
  company: string;
  sector: string | null;
  exchange: string;
  isFinancial: boolean;
  magicFormulaScore: number;
  ebitEv: number;
  roc: number;
  qualityScore: number;
  validationWarnings: string[];
  financialSnapshot: FinancialSnapshot;
};

export type UniverseCompany = {
  ticker: string;
  company: string;
  sector: string | null;
  exchange: string;
  isFinancial: boolean;
  status: "ranked" | "excluded";
  exclusionReasons: string[];
  financialSnapshot: FinancialSnapshot | null;
};

export type ExcludedCompany = {
  ticker: string;
  company: string;
  sector: string | null;
  exchange: string;
  isFinancial: boolean;
  reasons: string[];
  financialSnapshot: FinancialSnapshot | null;
};

export type RankingDataset = {
  generatedAt: string;
  universe: string;
  methodologyVersion: string;
  universeSource: string;
  financialsSource: string;
  dataSources: {
    universe: SourceInfo;
    financials: SourceInfo;
  };
  rawUniverse: UniverseCompany[];
  rows: RankingRow[];
  excluded: ExcludedCompany[];
};

export type ValidationSummary = {
  rawUniverseCount: number;
  rankedCount: number;
  excludedCount: number;
  financeExcludedCount: number;
  warningCount: number;
};
