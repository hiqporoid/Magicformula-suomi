export const siteConfig = {
  name: "Magicformula Suomi",
  shortName: "Magicformula",
  description:
    "Suomenkielinen tutkimusnäkymä Nasdaq Helsingin ja Stockholmin Main Market -yhtiöiden Magic Formula-, EBIT/EV- ja laatuvertailuun.",
  defaultTitle: "Magicformula Suomi | Helsinki ja Tukholma"
};

function ensureAbsoluteUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getSiteUrl(): string {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicitUrl) {
    return ensureAbsoluteUrl(explicitUrl);
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelUrl) {
    return ensureAbsoluteUrl(vercelUrl);
  }

  return "http://localhost:3000";
}
