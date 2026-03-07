export type RankingRow = {
  rank: number;
  ticker: string;
  company: string;
  magicFormulaScore: number;
  ebitEv: number;
  roc: number;
  qualityScore: number;
  validationWarnings: string[];
};

export type ExcludedCompany = {
  ticker: string;
  reasons: string[];
};

export type RankingDataset = {
  generatedAt: string;
  universe: string;
  methodologyVersion: string;
  rows: RankingRow[];
  excluded: ExcludedCompany[];
};
