import Link from "next/link";

export default function MethodologyPage() {
  return (
    <main className="container">
      <h1>Metodologia ja vastuuvapaus</h1>

      <section className="notes">
        <h2>Kaavat (v1)</h2>
        <ul>
          <li>ROC = EBIT / (Net PPE + (Current Assets - Current Liabilities))</li>
          <li>Earnings Yield = EBIT / Enterprise Value</li>
          <li>Magic Formula -piste = ROC-rank + Earnings Yield -rank</li>
          <li>Laatupiste on kevyt 0-100 overlay (ROIC, velkaisuus, vakauskomponentti)</li>
        </ul>
      </section>

      <section className="notes">
        <h2>Datan laaturiskit</h2>
        <ul>
          <li>Puuttuvat tai nollajakajaan johtavat arvot poistetaan rankingista.</li>
          <li>Talousdata voi sisältää viivettä, oikaisuja ja kertaluonteisia eriä.</li>
          <li>Näkymä ei huomioi kaikkia sijoittajan riskejä tai verotusta.</li>
        </ul>
      </section>

      <section className="notes">
        <h2>Vastuuvapaus</h2>
        <p>
          Tämä sovellus on tutkimus- ja koulutuskäyttöön. Sisältö ei ole sijoitusneuvontaa eikä henkilökohtainen
          sijoitussuositus.
        </p>
      </section>

      <p>
        <Link href="/">← Takaisin rankingiin</Link>
      </p>
    </main>
  );
}
