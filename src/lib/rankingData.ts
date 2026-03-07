import rawDataset from "@/data/ranking-v1.json";
import type { RankingDataset } from "@/lib/types";

type RawRow = {
  rank: number;
  ticker: string;
  company: string;
  magic_formula_score: number;
  ebit_ev: number;
  roc: number;
  quality_score: number;
  validation_warnings: string[];
};

type RawExcluded = {
  ticker: string;
  reasons: string[];
};

type RawDataset = {
  generated_at: string;
  universe: string;
  methodology_version: string;
  rows: RawRow[];
  excluded: RawExcluded[];
};

const dataset = rawDataset as RawDataset;

export function getRankingDataset(): RankingDataset {
  return {
    generatedAt: dataset.generated_at,
    universe: dataset.universe,
    methodologyVersion: dataset.methodology_version,
    rows: dataset.rows.map((row) => ({
      rank: row.rank,
      ticker: row.ticker,
      company: row.company,
      magicFormulaScore: row.magic_formula_score,
      ebitEv: row.ebit_ev,
      roc: row.roc,
      qualityScore: row.quality_score,
      validationWarnings: row.validation_warnings
    })),
    excluded: dataset.excluded.map((item) => ({
      ticker: item.ticker,
      reasons: item.reasons
    }))
  };
}
