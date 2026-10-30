export type SourceInfo = {
  label: string;
  detail: string;
  path: string;
};

export type FinancialSnapshot = {
  ebitSourceField: string | null;
  amountUnit: string | null;
  reconciliationStatus: string | null;
  reconciliationSourceUrl: string | null;
  reconciliationDetail: string | null;
  statementDate: string | null;
  sourceSymbol: string | null;
  evSource: string | null;
  marketCap: number | null;
  marketCapEur: number | null;
  ebit: number | null;
  enterpriseValue: number | null;
  investedCapital: number | null;
  currency: string | null;
  priceCurrency: string | null;
  retrievedAt: string | null;
  marketDataDate: string | null;
  fxDate: string | null;
  fxRateToEur: number | null;
  periodType: string | null;
  sourceUrl: string | null;
  currentAssets: number | null;
  currentLiabilities: number | null;
  cash: number | null;
  shortTermDebt: number | null;
  netPpe: number | null;
};

export type RankingRow = {
  listingId: string;
  rank: number;
  ticker: string;
  company: string;
  sector: string | null;
  exchange: string;
  isFinancial: boolean;
  magicFormulaScore: number;
  ebitEv: number;
  roc: number;
  rocRank: number | null;
  earningsYieldRank: number | null;
  qualityScore: number | null;
  validationWarnings: string[];
  financialSnapshot: FinancialSnapshot;
};

export type UniverseCompany = {
  issuerId: string | null;
  isin: string | null;
  country: string | null;
  listingId: string;
  listingVerified: boolean;
  listingSourceUrl: string | null;
  listingSourceDate: string | null;
  ticker: string;
  company: string;
  sector: string | null;
  exchange: string;
  isFinancial: boolean;
  status: "ranked" | "excluded";
  exclusionReasons: string[];
  exclusionCategory: string | null;
  financialSnapshot: FinancialSnapshot | null;
};

export type ExcludedCompany = {
  listingId: string;
  ticker: string;
  company: string;
  sector: string | null;
  exchange: string;
  isFinancial: boolean;
  reasons: string[];
  exclusionCategory: string | null;
  financialSnapshot: FinancialSnapshot | null;
};

export type RankingDataset = {
  coverage: Record<string, { listings: number; candidateListings: number; verifiedListings: number; issuerResolved: number; completeListingVerified: boolean; ranked: number; methodologyExcluded: number; dataMissing: number }>;
  universeRetrievedAt: string | null;
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
