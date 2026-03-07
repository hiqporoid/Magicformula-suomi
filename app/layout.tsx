import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Magicformula Suomi | Nasdaq Helsinki -rankingdemo",
  description: "Suomenkielinen v1-demo Nasdaq Helsinki Main Market -yhtioiden Magic Formula-, EBIT/EV- ja laatuvertailuun."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}

