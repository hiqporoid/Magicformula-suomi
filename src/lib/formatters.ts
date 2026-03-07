const percentFormatter = new Intl.NumberFormat("fi-FI", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const scoreFormatter = new Intl.NumberFormat("fi-FI", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const moneyCompactFormatter = new Intl.NumberFormat("fi-FI", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
});

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export function formatScore(value: number): string {
  return scoreFormatter.format(value);
}

export function formatMarketCap(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return "Ei saatavilla";
  }

  if (value >= 1_000_000_000) {
    return `${moneyCompactFormatter.format(value / 1_000_000_000)} B€`;
  }

  return `${moneyCompactFormatter.format(value / 1_000_000)} M€`;
}

export function formatMillions(value: number): string {
  if (!Number.isFinite(value)) {
    return "Ei saatavilla";
  }

  if (Math.abs(value) >= 1_000_000_000) {
    return `${moneyCompactFormatter.format(value / 1_000_000_000)} B€`;
  }

  return `${moneyCompactFormatter.format(value / 1_000_000)} M€`;
}

export function formatDataQualityLabel(warnings: string[]): string {
  return warnings.length === 0 ? "Puhdas" : `${warnings.length} huomio${warnings.length > 1 ? "ta" : ""}`;
}

export function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("fi-FI", {
    dateStyle: "short",
    timeStyle: "short"
  });
}