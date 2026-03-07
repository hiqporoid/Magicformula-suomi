import { RankingTable } from "@/components/RankingTable";
import { sampleRows } from "@/lib/sampleData";

export default function Page() {
  return (
    <main className="container">
      <h1>Magic Formula -tutkimusnäkymä</h1>
      <p className="subtitle">Nasdaq Helsinki Main Market (v1 shell)</p>
      <RankingTable rows={sampleRows} />
      <section className="notes">
        <h2>Metodologia ja vastuuvapaus</h2>
        <p>
          Tämä näkymä on tutkimuskäyttöön eikä muodosta sijoitussuositusta.
          Katso tarkempi metodologia dokumentaatiosta.
        </p>
      </section>
    </main>
  );
}
