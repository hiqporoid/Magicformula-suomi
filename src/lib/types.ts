export type RankingRow = {
  rank: number;
  ticker: string;
  company: string;
  sector: string | null;
  isFinancial: boolean;
  magicFormulaScore: number;
  ebitEv: number;
  roc: number;
  qualityScore: number;
  validationWarnings: string[];
};

export type UniverseCompany = {
  ticker: string;
  company: string;
  sector: string | null;
  isFinancial: boolean;
  status: "ranked" | "excluded";
  exclusionReasons: string[];
};

export type ExcludedCompany = {
  ticker: string;
  company: string;
  sector: string | null;
  isFinancial: boolean;
  reasons: string[];
};

export type RankingDataset = {
  generatedAt: string;
  universe: string;
  methodologyVersion: string;
  universeSource: string;
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
