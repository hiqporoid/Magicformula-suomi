import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Magicformula Suomi",
  description: "Nasdaq Helsinki Main Market -arvoseulonta"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}
