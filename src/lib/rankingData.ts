import rawDataset from "@/data/ranking-v1.json";
import type {
  ExcludedCompany,
  FinancialSnapshot,
  RankingDataset,
  RankingRow,
  SourceInfo,
  UniverseCompany,
  ValidationSummary
} from "@/lib/types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`Ranking JSON field ${field} must be a string.`);
  }

  return value;
}

function readNullableString(value: unknown, field: string): string | null {
  if (value === null) {
    return null;
  }

  return readString(value, field);
}

function readBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Ranking JSON field ${field} must be a boolean.`);
  }

  return value;
}

function readNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Ranking JSON field ${field} must be a finite number.`);
  }

  return value;
}

function readNullableNumber(value: unknown, field: string): number | null {
  if (value === null) {
    return null;
  }

  return readNumber(value, field);
}

function readStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Ranking JSON field ${field} must be a string array.`);
  }

  return value;
}

function parseSourceInfo(value: unknown, field: string): SourceInfo {
  if (!isRecord(value)) {
    throw new Error(`Ranking JSON field ${field} must be an object.`);
  }

  return {
    label: readString(value.label, `${field}.label`),
    detail: readString(value.detail, `${field}.detail`),
    path: readString(value.path, `${field}.path`)
  };
}

function parseFinancialSnapshot(value: unknown, field: string): FinancialSnapshot | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isRecord(value)) {
    throw new Error(`Ranking JSON field ${field} must be an object.`);
  }

  return {
    statementDate: readNullableString(value.statement_date ?? null, `${field}.statement_date`),
    ebitSourceField: readNullableString(value.ebit_source_field ?? null, `${field}.ebit_source_field`),
    amountUnit: readNullableString(value.amount_unit ?? null, `${field}.amount_unit`),
    reconciliationStatus: readNullableString(value.source_reconciliation_status ?? null, `${field}.source_reconciliation_status`),
    reconciliationSourceUrl: readNullableString(value.reconciliation_source_url ?? null, `${field}.reconciliation_source_url`),
    reconciliationDetail: readNullableString(value.reconciliation_detail ?? null, `${field}.reconciliation_detail`),
    sourceSymbol: readNullableString(value.source_symbol ?? null, `${field}.source_symbol`),
    evSource: readNullableString(value.ev_source ?? null, `${field}.ev_source`),
    marketCap: readNullableNumber(value.market_cap ?? null, `${field}.market_cap`),
    marketCapEur: readNullableNumber(value.market_cap_eur ?? null, `${field}.market_cap_eur`),
    ebit: readNullableNumber(value.ebit ?? null, `${field}.ebit`),
    enterpriseValue: readNullableNumber(value.enterprise_value ?? null, `${field}.enterprise_value`),
    investedCapital: readNullableNumber(value.invested_capital ?? null, `${field}.invested_capital`),
    currency: readNullableString(value.currency ?? null, `${field}.currency`),
    priceCurrency: readNullableString(value.price_currency ?? null, `${field}.price_currency`),
    retrievedAt: readNullableString(value.retrieved_at ?? null, `${field}.retrieved_at`),
    marketDataDate: readNullableString(value.market_data_date ?? null, `${field}.market_data_date`),
    fxDate: readNullableString(value.fx_date ?? null, `${field}.fx_date`),
    fxRateToEur: readNullableNumber(value.fx_rate_to_eur ?? null, `${field}.fx_rate_to_eur`),
    periodType: readNullableString(value.period_type ?? null, `${field}.period_type`),
    sourceUrl: readNullableString(value.source_url ?? null, `${field}.source_url`),
    currentAssets: readNullableNumber(value.current_assets ?? null, `${field}.current_assets`),
    currentLiabilities: readNullableNumber(value.current_liabilities ?? null, `${field}.current_liabilities`),
    cash: readNullableNumber(value.cash ?? null, `${field}.cash`),
    shortTermDebt: readNullableNumber(value.short_term_debt ?? null, `${field}.short_term_debt`),
    netPpe: readNullableNumber(value.net_ppe ?? null, `${field}.net_ppe`)
  };
}

function parseRow(value: unknown, index: number): RankingRow {
  if (!isRecord(value)) {
    throw new Error(`Ranking JSON row ${index} must be an object.`);
  }

  const financialSnapshot = parseFinancialSnapshot(value.financial_snapshot, `rows[${index}].financial_snapshot`);
  if (!financialSnapshot) {
    throw new Error(`Ranking JSON row ${index} must contain financial_snapshot.`);
  }

  return {
    listingId: readString(value.listing_id ?? `${value.exchange}:${value.ticker}`, `rows[${index}].listing_id`),
    rank: readNumber(value.rank, `rows[${index}].rank`),
    ticker: readString(value.ticker, `rows[${index}].ticker`),
    company: readString(value.company, `rows[${index}].company`),
    sector: readNullableString(value.sector ?? null, `rows[${index}].sector`),
    exchange: readString(value.exchange ?? "HEL", `rows[${index}].exchange`),
    isFinancial: readBoolean(value.is_financial, `rows[${index}].is_financial`),
    magicFormulaScore: readNumber(value.magic_formula_score, `rows[${index}].magic_formula_score`),
    ebitEv: readNumber(value.ebit_ev, `rows[${index}].ebit_ev`),
    roc: readNumber(value.roc, `rows[${index}].roc`),
    rocRank: readNullableNumber(value.roc_rank ?? null, `rows[${index}].roc_rank`),
    earningsYieldRank: readNullableNumber(value.earnings_yield_rank ?? null, `rows[${index}].earnings_yield_rank`),
    qualityScore: readNullableNumber(value.quality_score ?? null, `rows[${index}].quality_score`),
    validationWarnings: readStringArray(value.validation_warnings, `rows[${index}].validation_warnings`),
    financialSnapshot
  };
}

function parseExcluded(value: unknown, index: number): ExcludedCompany {
  if (!isRecord(value)) {
    throw new Error(`Ranking JSON excluded row ${index} must be an object.`);
  }

  return {
    listingId: readString(value.listing_id ?? `${value.exchange}:${value.ticker}`, `excluded[${index}].listing_id`),
    ticker: readString(value.ticker, `excluded[${index}].ticker`),
    company: readString(value.company, `excluded[${index}].company`),
    sector: readNullableString(value.sector ?? null, `excluded[${index}].sector`),
    exchange: readString(value.exchange ?? "HEL", `excluded[${index}].exchange`),
    isFinancial: readBoolean(value.is_financial, `excluded[${index}].is_financial`),
    reasons: readStringArray(value.reasons, `excluded[${index}].reasons`),
    exclusionCategory: readNullableString(value.exclusion_category ?? null, `excluded[${index}].exclusion_category`),
    financialSnapshot: parseFinancialSnapshot(value.financial_snapshot, `excluded[${index}].financial_snapshot`)
  };
}

function parseRawUniverse(value: unknown, index: number): UniverseCompany {
  if (!isRecord(value)) {
    throw new Error(`Ranking JSON raw universe row ${index} must be an object.`);
  }

  const status = readString(value.status, `raw_universe[${index}].status`);
  if (status !== "ranked" && status !== "excluded") {
    throw new Error(`Ranking JSON raw universe row ${index} has invalid status.`);
  }

  return {
    listingId: readString(value.listing_id ?? `${value.exchange}:${value.ticker}`, `raw_universe[${index}].listing_id`),
    listingVerified: readBoolean(value.listing_verified ?? false, `raw_universe[${index}].listing_verified`),
    listingSourceUrl: readNullableString(value.listing_source_url ?? null, `raw_universe[${index}].listing_source_url`),
    listingSourceDate: readNullableString(value.listing_source_date ?? null, `raw_universe[${index}].listing_source_date`),
    ticker: readString(value.ticker, `raw_universe[${index}].ticker`),
    company: readString(value.company, `raw_universe[${index}].company`),
    sector: readNullableString(value.sector ?? null, `raw_universe[${index}].sector`),
    exchange: readString(value.exchange ?? "HEL", `raw_universe[${index}].exchange`),
    isFinancial: readBoolean(value.is_financial, `raw_universe[${index}].is_financial`),
    status,
    issuerId: readNullableString(value.issuer_id ?? null, `raw_universe[${index}].issuer_id`),
    isin: readNullableString(value.isin ?? null, `raw_universe[${index}].isin`),
    country: readNullableString(value.country ?? null, `raw_universe[${index}].country`),
    exclusionReasons: readStringArray(value.exclusion_reasons, `raw_universe[${index}].exclusion_reasons`),
    exclusionCategory: readNullableString(value.exclusion_category ?? null, `raw_universe[${index}].exclusion_category`),
    financialSnapshot: parseFinancialSnapshot(value.financial_snapshot, `raw_universe[${index}].financial_snapshot`)
  };
}

function parseDataset(value: unknown): RankingDataset {
  if (!isRecord(value)) {
    throw new Error("Ranking JSON root must be an object.");
  }

  const rows = value.rows;
  const excluded = value.excluded;
  const rawUniverse = value.raw_universe;
  const dataSources = value.data_sources;

  if (!Array.isArray(rows)) {
    throw new Error("Ranking JSON field rows must be an array.");
  }

  if (!Array.isArray(excluded)) {
    throw new Error("Ranking JSON field excluded must be an array.");
  }

  if (!Array.isArray(rawUniverse)) {
    throw new Error("Ranking JSON field raw_universe must be an array.");
  }

  if (!isRecord(dataSources)) {
    throw new Error("Ranking JSON field data_sources must be an object.");
  }

  return {
    coverage: isRecord(value.coverage) ? Object.fromEntries(Object.entries(value.coverage).map(([exchange, item]) => {
      if (!isRecord(item)) throw new Error(`Invalid coverage: ${exchange}`);
      return [exchange, {
        listings: readNumber(item.listings, `coverage.${exchange}.listings`),
        candidateListings: readNumber(item.candidate_listings, `coverage.${exchange}.candidate_listings`),
        verifiedListings: readNumber(item.verified_listings, `coverage.${exchange}.verified_listings`),
        issuerResolved: readNumber(item.issuer_resolved, `coverage.${exchange}.issuer_resolved`),
        completeListingVerified: readBoolean(item.complete_main_market_verified, `coverage.${exchange}.complete_main_market_verified`),
        ranked: readNumber(item.ranked, `coverage.${exchange}.ranked`),
        methodologyExcluded: readNumber(item.methodology_excluded, `coverage.${exchange}.methodology_excluded`),
        dataMissing: readNumber(item.data_missing, `coverage.${exchange}.data_missing`)
      }];
    })) : {},
    universeRetrievedAt: isRecord(value.universe_evidence) ? readNullableString(value.universe_evidence.retrieved_at ?? null, "universe_evidence.retrieved_at") : null,
    generatedAt: readString(value.generated_at, "generated_at"),
    universe: readString(value.universe, "universe"),
    methodologyVersion: readString(value.methodology_version, "methodology_version"),
    universeSource: readString(value.universe_source, "universe_source"),
    financialsSource: readString(value.financials_source, "financials_source"),
    dataSources: {
      universe: parseSourceInfo(dataSources.universe, "data_sources.universe"),
      financials: parseSourceInfo(dataSources.financials, "data_sources.financials")
    },
    rawUniverse: rawUniverse.map(parseRawUniverse),
    rows: rows.map(parseRow),
    excluded: excluded.map(parseExcluded)
  };
}

const dataset = parseDataset(rawDataset);
const rowByTicker = new Map(dataset.rows.map((row) => [row.listingId, row]));
const excludedByTicker = new Map(dataset.excluded.map((row) => [row.listingId, row]));
const companyByTicker = new Map(dataset.rawUniverse.map((row) => [row.listingId, row]));

function resolveListingId(rawTicker: string): string | undefined {
  let key: string;
  try {
    key = decodeURIComponent(rawTicker).toUpperCase();
  } catch {
    return undefined;
  }
  if (companyByTicker.has(key)) return key;
  const matches = dataset.rawUniverse.filter((row) => row.ticker === key);
  return matches.length === 1 ? matches[0].listingId : undefined;
}

export function getRankingDataset(): RankingDataset {
  return dataset;
}

export function getValidationSummary(input: RankingDataset): ValidationSummary {
  return {
    rawUniverseCount: input.rawUniverse.length,
    rankedCount: input.rows.length,
    excludedCount: input.excluded.length,
    financeExcludedCount: input.excluded.filter((company) => company.isFinancial).length,
    warningCount: input.rows.filter((row) => row.validationWarnings.length > 0).length
  };
}

export function getRankedRowByTicker(rawTicker: string): RankingRow | undefined {
  return rowByTicker.get(resolveListingId(rawTicker) ?? "");
}

export function getExcludedCompanyByTicker(rawTicker: string): ExcludedCompany | undefined {
  return excludedByTicker.get(resolveListingId(rawTicker) ?? "");
}

export function getUniverseCompanyByTicker(rawTicker: string): UniverseCompany | undefined {
  return companyByTicker.get(resolveListingId(rawTicker) ?? "");
}
