import type { MetadataRoute } from "next";
import { getSiteUrl, siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: getSiteUrl(),
    display: "standalone",
    background_color: "#f3efe7",
    theme_color: "#1f5c4d",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}