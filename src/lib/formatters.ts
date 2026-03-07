const percentFormatter = new Intl.NumberFormat("fi-FI", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const scoreFormatter = new Intl.NumberFormat("fi-FI", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export function formatScore(value: number): string {
  return scoreFormatter.format(value);
}

export function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("fi-FI", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

