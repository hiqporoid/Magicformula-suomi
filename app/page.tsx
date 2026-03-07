import type { Metadata } from "next";
import Link from "next/link";
import { RankingTable } from "@/components/RankingTable";
import { formatPercent, formatTimestamp } from "@/lib/formatters";
import { getRankingDataset, getValidationSummary } from "@/lib/rankingData";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.defaultTitle,
  description:
    "Avaa Nasdaq Helsinki Main Market -yhtiöiden v1-ranking yhdessä näkymässä. Mukana Magic Formula, EBIT/EV, laatupisteet ja datalaadun rajaukset.",
  alternates: {
    canonical: "/"
  }
};

export default function Page() {
  const dataset = getRankingDataset();
  const summary = getValidationSummary(dataset);
  const leadCompany = dataset.rows[0];

  return (
    <main className="shellContainer pageStack pageOffset">
      <section className="heroSurface">
        <div className="heroMainCard">
          <div className="eyebrowRow">
            <p className="eyebrow">Tutkimusnäkymä</p>
            <span className="softBadge">{dataset.methodologyVersion}</span>
          </div>
          <h1>Arvoseulonta, jonka voi oikeasti avata uudelleen myöhemmin.</h1>
          <p className="heroLead">
            Magicformula Suomi yhdistää Magic Formula -rankingin, EBIT/EV-luvun ja kevyen quality overlayn samaan
            suomenkieliseen tutkimusnäkymään. Tavoite on auttaa ensimmäisessä seulonnassa, ei korvata omaa analyysiä.
          </p>
          <div className="actionRow">
            <Link href="#ranking" className="buttonPrimary">
              Avaa ranking
            </Link>
            <Link href="/metodologia" className="buttonSecondary">
              Lue metodologia
            </Link>
          </div>
          <div className="heroMetaStrip">
            <span>Universumi: {dataset.universe}</span>
            <span>Päivitetty: {formatTimestamp(dataset.generatedAt)}</span>
            <span>Poissulut: {summary.excludedCount}</span>
          </div>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">Tämän viennin kärki</p>
            <h2>
              {leadCompany.company} <span className="inlineTicker">({leadCompany.ticker})</span>
            </h2>
            <p>
              Kokonaissijoitus #{leadCompany.rank}, ROC {formatPercent(leadCompany.roc)} ja EBIT/EV
              {" "}{formatPercent(leadCompany.ebitEv)}.
            </p>
          </div>
          <div className="sideCardSection sideCardDivider">
            <p className="eyebrow">Mitä näkymä tarjoaa</p>
            <ul className="plainList compactList">
              <li>Deterministinen ranking samalla datasetillä joka ajossa.</li>
              <li>Näkyvät datalaadun huomiot ja poissulut.</li>
              <li>Suora polku metodologiaan ja yhtiönäkymään.</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="summaryGrid">
        <article className="summaryCard emphasisCard">
          <span className="summaryLabel">Rankatut yhtiöt</span>
          <strong>{summary.rankedCount}</strong>
          <p>Rivit, jotka läpäisivät v1-minimivalidoinnit.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Validointihuomiot</span>
          <strong>{summary.warningCount}</strong>
          <p>Rankatut rivit, joilla näkyy datalaadun huomio.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Poissuljetut</span>
          <strong>{summary.excludedCount}</strong>
          <p>Yhtiöt, jotka jätettiin pois ennen julkaisua.</p>
        </article>
      </section>

      <section className="workspaceLayout" id="ranking">
        <div className="workspaceMain">
          <RankingTable rows={dataset.rows} />
        </div>

        <aside className="workspaceSidebar">
          <section className="sidePanel">
            <p className="eyebrow">Tulosten lukutapa</p>
            <h2>Mistä sijoitus syntyy?</h2>
            <p>
              Kokonaissijoitus muodostuu ROC:n ja Earnings Yieldin yhdistelmästä. Tasatilanteissa ticker toimii
              vakioituna tie-breakerina.
            </p>
          </section>

          <section className="sidePanel mutedPanel">
            <p className="eyebrow">Datan laatu</p>
            <h2>Mitä julkaistaan?</h2>
            <p>
              Julkaistavaksi päätyvät vain rivit, joilla EV ja sijoitettu pääoma ovat positiivisia ja pakolliset kentät
              löytyvät. Poissulut ja varoitukset näytetään käyttöliittymässä avoimesti.
            </p>
            {dataset.excluded.length === 0 ? (
              <p className="sideNote">Tässä viennissä yksikään yhtiö ei pudonnut pois validoinnissa.</p>
            ) : (
              <ul className="plainList compactList">
                {dataset.excluded.map((company) => (
                  <li key={company.ticker}>
                    <strong>{company.ticker}</strong>: {company.reasons.join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="sidePanel cautionPanel">
            <p className="eyebrow">Vastuuvapauslauseke</p>
            <h2>Tutkimusdemo, ei sijoitusneuvontaa</h2>
            <p>
              Tämä v1-demo on tarkoitettu oman tutkimusprosessin tueksi. Sisältö ei ole henkilökohtainen
              sijoitussuositus eikä huomioi sijoittajan riskejä, verotusta tai salkun kokonaisuutta.
            </p>
            <Link href="/metodologia" className="textLink">
              Avaa metodologia ja rajaukset
            </Link>
          </section>
        </aside>
      </section>
    </main>
  );
}