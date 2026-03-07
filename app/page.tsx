import type { Metadata } from "next";
import Link from "next/link";
import { ExclusionList } from "@/components/ExclusionList";
import { RankingTable } from "@/components/RankingTable";
import { formatMarketCap, formatPercent, formatTimestamp } from "@/lib/formatters";
import { getRankingDataset, getValidationSummary } from "@/lib/rankingData";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.defaultTitle,
  description:
    "Avaa Nasdaq Helsinki Main Market -yhtiöiden ranking yhdessä näkymässä. Mukana Magic Formula, EBIT/EV, laatupisteet ja datalaadun rajaukset.",
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
          <h1>Magic Formula -screener Nasdaq Helsingin päälistalle.</h1>
          <p className="heroLead">
            Näkymä kokoaa rankatut yhtiöt, poissulut ja datalähteet samaan työpöytään. Tarkoitus on nopea seulonta ja
            läpinäkyvä taustadata.
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
            <span>Raakauniversumi: {summary.rawUniverseCount}</span>
            <span>Rankatut: {summary.rankedCount}</span>
            <span>Poissulut: {summary.excludedCount}</span>
            <span>Päivitetty: {formatTimestamp(dataset.generatedAt)}</span>
          </div>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">Tämän viennin kärki</p>
            <h2>
              {leadCompany.company} <span className="inlineTicker">({leadCompany.ticker})</span>
            </h2>
            <p>
              Sijoitus #{leadCompany.rank}, markkina-arvo {formatMarketCap(leadCompany.financialSnapshot.marketCap)}, ROC {" "}
              {formatPercent(leadCompany.roc)} ja EBIT/EV {formatPercent(leadCompany.ebitEv)}.
            </p>
          </div>
          <div className="sideCardSection sideCardDivider">
            <p className="eyebrow">Mitä tästä näkee</p>
            <ul className="plainList compactList">
              <li>Koko Main Market -universen yhdestä viennistä.</li>
              <li>Markkina-arvo näkyy taulukossa ja toimii suodattimena.</li>
              <li>Yrityssivu näyttää rankingin taustalla olevat luvut ja poissulut.</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="summaryGrid fourUpGrid">
        <article className="summaryCard emphasisCard">
          <span className="summaryLabel">Raakauniversumi</span>
          <strong>{summary.rawUniverseCount}</strong>
          <p>Main Market -yhtiöt nykyisessä universessa.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Rankatut</span>
          <strong>{summary.rankedCount}</strong>
          <p>Yhtiöt, jotka läpäisivät kelpoisuussäännöt.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Poissuljetut</span>
          <strong>{summary.excludedCount}</strong>
          <p>Yhtiöt, jotka jäivät ulos ennen rankingia.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Finanssipoissulut</span>
          <strong>{summary.financeExcludedCount}</strong>
          <p>Metodologisesti erikseen rajatut finanssiyhtiöt.</p>
        </article>
      </section>

      <section className="contentGrid dataSourceGrid">
        <article className="contentPanel">
          <p className="eyebrow">Data source / Päivitetty</p>
          <h2>Mistä data tulee?</h2>
          <div className="definitionList">
            <div>
              <span className="definitionLabel">Universe</span>
              <strong>{dataset.dataSources.universe.label}</strong>
              <p>Universe kattaa Nasdaq Helsingin päälistan yhtiöt nykyisessä vientiajossa.</p>
            </div>
            <div>
              <span className="definitionLabel">Financials</span>
              <strong>{dataset.dataSources.financials.label}</strong>
              <p>Talousluvut haetaan financials-aineistosta ennen rankingin laskentaa.</p>
            </div>
            <div>
              <span className="definitionLabel">Päivitetty</span>
              <strong>{formatTimestamp(dataset.generatedAt)}</strong>
              <p>Sama exportti näkyy etusivulla, metodologiassa ja yrityssivuilla.</p>
            </div>
          </div>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">Käyttötapa</p>
          <h2>Lyhyt työjärjestys</h2>
          <ul className="plainList compactList">
            <li>Rajaa ensin taulukkoa haulla, markkina-arvolla ja datan laadulla.</li>
            <li>Avaa yrityssivu, kun haluat nähdä rankingin pohjaluvut.</li>
            <li>Tarkista metodologiasivulta poissulut ja laskentatapa ennen tulkintaa.</li>
          </ul>
          <Link href="/metodologia" className="textLink">
            Avaa metodologia ja rajaukset
          </Link>
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
            <p>Magic Formula -sijoitus muodostuu ROC:n ja EBIT/EV:n yhdistelmästä. Tasatilanteissa ticker ratkaisee.</p>
          </section>

          <section className="sidePanel cautionPanel">
            <p className="eyebrow">Kelpoisuusrajat</p>
            <h2>Mikä sulkee yhtiön pois?</h2>
            <ul className="plainList compactList">
              <li>Finanssisektori rajataan pois v1-metodologian vuoksi.</li>
              <li>Puuttuvat statementit estävät laskennan.</li>
              <li>EBIT ≤ 0, EV ≤ 0 tai negatiivinen sijoitettu pääoma pudottavat rivin pois.</li>
            </ul>
          </section>

          <ExclusionList excluded={dataset.excluded} />
        </aside>
      </section>
    </main>
  );
}