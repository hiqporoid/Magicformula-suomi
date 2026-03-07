import Link from "next/link";
import { RankingTable } from "@/components/RankingTable";
import { getRankingDataset } from "@/lib/rankingData";

export default function Page() {
  const dataset = getRankingDataset();

  return (
    <main className="container">
      <h1>Magic Formula -tutkimusnäkymä</h1>
      <p className="subtitle">{dataset.universe}</p>
      <p className="meta">
        Päivitetty: {new Date(dataset.generatedAt).toLocaleString("fi-FI")} · Metodologia: {dataset.methodologyVersion}
      </p>

      <RankingTable rows={dataset.rows} />

      <section className="notes">
        <h2>Datan laatu ja rajaukset</h2>
        <p>
          Ranking käyttää vain rivejä, joilla EV ja sijoitettu pääoma ovat positiivisia. Poissuljetut yhtiöt: {dataset.excluded.length}.
        </p>
        <p>
          Tämä sovellus on tutkimuskäyttöön eikä muodosta sijoitussuositusta. Lue{" "}
          <Link href="/metodologia">metodologia ja vastuuvapaus</Link>.
        </p>
      </section>
    </main>
  );
}
