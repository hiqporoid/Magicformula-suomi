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

export function formatScore(value: number | null): string {
  return value === null ? "Ei saatavilla" : scoreFormatter.format(value);
}

export function formatMarketCap(value: number | null, currency: string | null = null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return "Ei saatavilla";
  }

  if (value >= 1_000_000_000) {
    return `${moneyCompactFormatter.format(value / 1_000_000_000)} mrd. ${currency ?? "(valuutta puuttuu)"}`;
  }

  return `${moneyCompactFormatter.format(value / 1_000_000)} milj. ${currency ?? "(valuutta puuttuu)"}`;
}

export function formatMillions(value: number | null, currency: string | null = null): string {
  if (value === null || !Number.isFinite(value)) {
    return "Ei saatavilla";
  }

  if (Math.abs(value) >= 1_000_000_000) {
    return `${moneyCompactFormatter.format(value / 1_000_000_000)} mrd. ${currency ?? "(valuutta puuttuu)"}`;
  }

  return `${moneyCompactFormatter.format(value / 1_000_000)} milj. ${currency ?? "(valuutta puuttuu)"}`;
}

export function formatSourceAmount(value: number | null, currency: string | null): string {
  if (value === null || !Number.isFinite(value)) return "Ei saatavilla";
  return `${new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 2 }).format(value)} ${currency ?? "(valuutta puuttuu)"}`;
}

export function formatDataQualityLabel(warnings: string[]): string {
  return warnings.length === 0 ? "Ei automaattisia huomioita" : `${warnings.length} huomio${warnings.length > 1 ? "ta" : ""}`;
}

export function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("fi-FI", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Helsinki"
  });
}
