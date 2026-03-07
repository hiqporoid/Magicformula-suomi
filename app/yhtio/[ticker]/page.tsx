import Link from "next/link";
import { notFound } from "next/navigation";
import { getRankingDataset } from "@/lib/rankingData";

type Props = {
  params: {
    ticker: string;
  };
};

export default function CompanyPage({ params }: Props) {
  const dataset = getRankingDataset();
  const ticker = params.ticker.toUpperCase();
  const row = dataset.rows.find((item) => item.ticker === ticker);

  if (!row) {
    notFound();
  }

  return (
    <main className="container">
      <h1>
        {row.company} ({row.ticker})
      </h1>
      <p className="subtitle">Yhtiödetailin v1-shell nykyisellä dataset-muodolla.</p>

      <section className="notes">
        <h2>Rankingmittarit</h2>
        <ul>
          <li>Kokonaissijoitus: {row.rank}</li>
          <li>Magic Formula -piste: {row.magicFormulaScore}</li>
          <li>ROC: {row.roc.toFixed(4)}</li>
          <li>EBIT/EV: {row.ebitEv.toFixed(4)}</li>
          <li>Laatupiste: {row.qualityScore.toFixed(2)}</li>
        </ul>
      </section>

      <section className="notes">
        <h2>Datan laatu</h2>
        <p>{row.validationWarnings.length === 0 ? "Ei validointivaroituksia tälle riville." : row.validationWarnings.join(", ")}</p>
      </section>

      <p>
        <Link href="/">← Takaisin rankingiin</Link>
      </p>
    </main>
  );
}
