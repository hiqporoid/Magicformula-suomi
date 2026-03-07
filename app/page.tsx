import type { Metadata } from "next";
import Link from "next/link";
import { RankingTable } from "@/components/RankingTable";
import { formatTimestamp } from "@/lib/formatters";
import { getRankingDataset, getValidationSummary } from "@/lib/rankingData";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.defaultTitle,
  description:
    "Avaa Nasdaq Helsinki Main Market -yhtioiden v1-ranking yhdessa nakymassa. Mukana Magic Formula, EBIT/EV, laatupisteet ja datalaadun rajaukset.",
  alternates: {
    canonical: "/"
  }
};

export default function Page() {
  const dataset = getRankingDataset();
  const summary = getValidationSummary(dataset);

  return (
    <main className="container pageStack">
      <section className="hero panel">
        <div className="heroCopy">
          <p className="eyebrow">Magicformula-suomi v1-demo</p>
          <h1>Nasdaq Helsinki Main Market -arvoseulonta yhdessa nakymassa</h1>
          <p className="heroLead">
            Sovellus yhdistaa Magic Formula -rankingin, EBIT/EV-luvun ja kevyen quality overlayn samaan
            tutkimusnakymaan. Tavoite on nopea ensiseulonta, ei valmis sijoituspaatos.
          </p>
          <div className="heroActions">
            <Link href="#ranking" className="buttonPrimary">
              Siirry rankingiin
            </Link>
            <Link href="/metodologia" className="buttonSecondary">
              Metodologia ja vastuuvapaus
            </Link>
          </div>
        </div>

        <div className="heroMeta panelMuted">
          <div className="metricGrid compactMetrics">
            <div>
              <span className="metricLabel">Universumi</span>
              <strong>{dataset.universe}</strong>
            </div>
            <div>
              <span className="metricLabel">Paivitetty</span>
              <strong>{formatTimestamp(dataset.generatedAt)}</strong>
            </div>
            <div>
              <span className="metricLabel">Metodologia</span>
              <strong>{dataset.methodologyVersion}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="metricGrid">
        <article className="panel statCard">
          <span className="metricLabel">Rankatut yhtiot</span>
          <strong>{summary.rankedCount}</strong>
          <p>Rivit, jotka lapaisivat minimivalidoinnit tassa exportissa.</p>
        </article>
        <article className="panel statCard">
          <span className="metricLabel">Poissuljetut</span>
          <strong>{summary.excludedCount}</strong>
          <p>Yhtiot, joilta puuttui kriittista dataa tai joiden nimittajat eivat olleet mielekkaita.</p>
        </article>
        <article className="panel statCard">
          <span className="metricLabel">Validointivaroitukset</span>
          <strong>{summary.warningCount}</strong>
          <p>Rankatut rivit, joilla on mukana huomioitavia datalaadun merkintoja.</p>
        </article>
      </section>

      <section className="infoGrid">
        <article className="panel panelMuted">
          <p className="eyebrow">Selitettavyys</p>
          <h2>Mista sijoitus syntyy?</h2>
          <p>
            Kokonaissijoitus muodostuu ROC:n ja Earnings Yieldin deterministisesta yhdistelmarankista.
            Tasatilanteissa ticker toimii tie-breakerina.
          </p>
        </article>
        <article className="panel panelMuted">
          <p className="eyebrow">Datan laatu</p>
          <h2>Mita julkaistaan?</h2>
          <p>
            Julkaistavaksi paatyvat vain rivit, joilla EV ja sijoitettu paaoma ovat positiivisia ja pakolliset
            kentat loytyvat. Poissulut ja varoitukset naytetaan kayttoliittymassa, ei piiloteta.
          </p>
        </article>
      </section>

      <div id="ranking">
        <RankingTable rows={dataset.rows} />
      </div>

      <section className="panel notesGrid">
        <div>
          <p className="eyebrow">Validation pass</p>
          <h2>Poissulut ja rajaukset</h2>
          {dataset.excluded.length === 0 ? (
            <p>
              Nykyisessa `ranking-v1.json`-exportissa yksikaan yhtio ei pudonnut pois validoinnissa. Se on
              nakyva tila, ei hiljainen fallback.
            </p>
          ) : (
            <ul className="plainList">
              {dataset.excluded.map((company) => (
                <li key={company.ticker}>
                  <strong>{company.ticker}</strong>: {company.reasons.join(", ")}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="eyebrow">Vastuuvapaus</p>
          <h2>Tutkimusdemo, ei sijoitusneuvontaa</h2>
          <p>
            Tama v1-demo on tarkoitettu oman tutkimusprosessin tueksi. Sisalto ei ole henkilokohtainen
            sijoitussuositus, eika se huomioi sijoittajan riskinsietoa, verotusta tai koko salkkua.
          </p>
          <p>
            <Link href="/metodologia" className="textLink">
              Avaa metodologia, poissulut ja disclaimerit
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}