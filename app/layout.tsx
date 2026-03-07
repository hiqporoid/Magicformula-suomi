import type { Metadata } from "next";
import Link from "next/link";
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
      <body>
        <div className="siteShell">
          <header className="siteHeader">
            <div className="shellContainer siteHeaderInner">
              <Link href="/" className="brandLink">
                <span className="brandMark">MF</span>
                <span>
                  <strong>Magicformula Suomi</strong>
                  <small>Nasdaq Helsinki Main Market</small>
                </span>
              </Link>

              <nav className="topNav" aria-label="Päänavigaatio">
                <Link href="/">Ranking</Link>
                <Link href="/metodologia">Metodologia</Link>
              </nav>

              <div className="headerBadge">v1-demo</div>
            </div>
          </header>

          <div className="siteContent">{children}</div>

          <footer className="siteFooter">
            <div className="shellContainer siteFooterInner">
              <div>
                <strong>Magicformula Suomi</strong>
                <p>Suomenkielinen tutkimusdemo Nasdaq Helsinki Main Market -yhtiöiden arvoseulontaan.</p>
              </div>
              <div>
                <p>Tämä palvelu ei ole sijoitusneuvontaa. Käytä näkymää oman analyysin lähtöpisteenä.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}