import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSiteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

const shareImage = "/social-card.svg";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.defaultTitle,
    template: "%s | Magicformula Suomi"
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Magic Formula",
    "Nasdaq Helsinki",
    "arvosijoittaminen",
    "EBIT/EV",
    "suomalaiset osakkeet"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "fi_FI",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [
      {
        url: shareImage,
        width: 1200,
        height: 630,
        alt: siteConfig.defaultTitle
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [shareImage]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}