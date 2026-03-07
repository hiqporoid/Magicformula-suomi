import type { MetadataRoute } from "next";
import { getRankingDataset } from "@/lib/rankingData";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const dataset = getRankingDataset();
  const lastModified = new Date(dataset.generatedAt);
  const siteUrl = getSiteUrl();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/metodologia`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7
    },
    ...dataset.rows.map((row) => ({
      url: `${siteUrl}/yhtio/${row.ticker}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6
    }))
  ];
}