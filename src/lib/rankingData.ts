import rawDataset from "@/data/ranking-v1.json";
import type { ExcludedCompany, RankingDataset, RankingRow, ValidationSummary } from "@/lib/types";

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

function readNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Ranking JSON field ${field} must be a finite number.`);
  }

  return value;
}

function readStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Ranking JSON field ${field} must be a string array.`);
  }

  return value;
}

function parseRow(value: unknown, index: number): RankingRow {
  if (!isRecord(value)) {
    throw new Error(`Ranking JSON row ${index} must be an object.`);
  }

  return {
    rank: readNumber(value.rank, `rows[${index}].rank`),
    ticker: readString(value.ticker, `rows[${index}].ticker`),
    company: readString(value.company, `rows[${index}].company`),
    magicFormulaScore: readNumber(value.magic_formula_score, `rows[${index}].magic_formula_score`),
    ebitEv: readNumber(value.ebit_ev, `rows[${index}].ebit_ev`),
    roc: readNumber(value.roc, `rows[${index}].roc`),
    qualityScore: readNumber(value.quality_score, `rows[${index}].quality_score`),
    validationWarnings: readStringArray(value.validation_warnings, `rows[${index}].validation_warnings`)
  };
}

function parseExcluded(value: unknown, index: number): ExcludedCompany {
  if (!isRecord(value)) {
    throw new Error(`Ranking JSON excluded row ${index} must be an object.`);
  }

  return {
    ticker: readString(value.ticker, `excluded[${index}].ticker`),
    reasons: readStringArray(value.reasons, `excluded[${index}].reasons`)
  };
}

function parseDataset(value: unknown): RankingDataset {
  if (!isRecord(value)) {
    throw new Error("Ranking JSON root must be an object.");
  }

  const rows = value.rows;
  const excluded = value.excluded;

  if (!Array.isArray(rows)) {
    throw new Error("Ranking JSON field rows must be an array.");
  }

  if (!Array.isArray(excluded)) {
    throw new Error("Ranking JSON field excluded must be an array.");
  }

  return {
    generatedAt: readString(value.generated_at, "generated_at"),
    universe: readString(value.universe, "universe"),
    methodologyVersion: readString(value.methodology_version, "methodology_version"),
    rows: rows.map(parseRow),
    excluded: excluded.map(parseExcluded)
  };
}

const dataset = parseDataset(rawDataset);

export function getRankingDataset(): RankingDataset {
  return dataset;
}

export function getValidationSummary(input: RankingDataset): ValidationSummary {
  return {
    rankedCount: input.rows.length,
    excludedCount: input.excluded.length,
    warningCount: input.rows.filter((row) => row.validationWarnings.length > 0).length
  };
}

