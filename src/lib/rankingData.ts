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
  if (typeof value !== "number" || Number.isNaN(value)) {
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
    sourceSymbol: readNullableString(value.source_symbol ?? null, `${field}.source_symbol`),
    evSource: readNullableString(value.ev_source ?? null, `${field}.ev_source`),
    marketCap: readNullableNumber(value.market_cap ?? null, `${field}.market_cap`),
    ebit: readNumber(value.ebit, `${field}.ebit`),
    enterpriseValue: readNumber(value.enterprise_value, `${field}.enterprise_value`),
    investedCapital: readNumber(value.invested_capital, `${field}.invested_capital`)
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
    rank: readNumber(value.rank, `rows[${index}].rank`),
    ticker: readString(value.ticker, `rows[${index}].ticker`),
    company: readString(value.company, `rows[${index}].company`),
    sector: readNullableString(value.sector ?? null, `rows[${index}].sector`),
    exchange: readString(value.exchange ?? "HEL", `rows[${index}].exchange`),
    isFinancial: readBoolean(value.is_financial, `rows[${index}].is_financial`),
    magicFormulaScore: readNumber(value.magic_formula_score, `rows[${index}].magic_formula_score`),
    ebitEv: readNumber(value.ebit_ev, `rows[${index}].ebit_ev`),
    roc: readNumber(value.roc, `rows[${index}].roc`),
    qualityScore: readNumber(value.quality_score, `rows[${index}].quality_score`),
    validationWarnings: readStringArray(value.validation_warnings, `rows[${index}].validation_warnings`),
    financialSnapshot
  };
}

function parseExcluded(value: unknown, index: number): ExcludedCompany {
  if (!isRecord(value)) {
    throw new Error(`Ranking JSON excluded row ${index} must be an object.`);
  }

  return {
    ticker: readString(value.ticker, `excluded[${index}].ticker`),
    company: readString(value.company, `excluded[${index}].company`),
    sector: readNullableString(value.sector ?? null, `excluded[${index}].sector`),
    exchange: readString(value.exchange ?? "HEL", `excluded[${index}].exchange`),
    isFinancial: readBoolean(value.is_financial, `excluded[${index}].is_financial`),
    reasons: readStringArray(value.reasons, `excluded[${index}].reasons`),
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
    ticker: readString(value.ticker, `raw_universe[${index}].ticker`),
    company: readString(value.company, `raw_universe[${index}].company`),
    sector: readNullableString(value.sector ?? null, `raw_universe[${index}].sector`),
    exchange: readString(value.exchange ?? "HEL", `raw_universe[${index}].exchange`),
    isFinancial: readBoolean(value.is_financial, `raw_universe[${index}].is_financial`),
    status,
    exclusionReasons: readStringArray(value.exclusion_reasons, `raw_universe[${index}].exclusion_reasons`),
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
const rowByTicker = new Map(dataset.rows.map((row) => [row.ticker, row]));
const excludedByTicker = new Map(dataset.excluded.map((row) => [row.ticker, row]));
const companyByTicker = new Map(dataset.rawUniverse.map((row) => [row.ticker, row]));

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
  return rowByTicker.get(rawTicker.toUpperCase());
}

export function getExcludedCompanyByTicker(rawTicker: string): ExcludedCompany | undefined {
  return excludedByTicker.get(rawTicker.toUpperCase());
}

export function getUniverseCompanyByTicker(rawTicker: string): UniverseCompany | undefined {
  return companyByTicker.get(rawTicker.toUpperCase());
}
