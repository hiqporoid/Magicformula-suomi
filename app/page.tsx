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
          <h1>Arvoseulonta Nasdaq Helsingin päälistalle.</h1>
          <p className="heroLead">
            Etusivu näyttää rankatut yhtiöt, poissulut ja datalähteet samassa näkymässä. Tavoite on nopea seulonta,
            ei valmis sijoitusnäkemys.
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
            <p className="eyebrow">Mitä näkymä näyttää</p>
            <ul className="plainList compactList">
              <li>Koko Main Market -universen yhdestä viennistä.</li>
              <li>Markkina-arvo näkyy taulukossa ja toimii suodattimena.</li>
              <li>Yrityssivu näyttää rankingin pohjana olevat talousluvut ilman ylimääräistä copya.</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="summaryGrid fourUpGrid">
        <article className="summaryCard emphasisCard">
          <span className="summaryLabel">Raakauniversumi</span>
          <strong>{summary.rawUniverseCount}</strong>
          <p>Yhtiöt, jotka kuuluvat ylläpidettävään Main Market -lähteeseen.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Rankatut yhtiöt</span>
          <strong>{summary.rankedCount}</strong>
          <p>Rivit, jotka läpäisivät nykyiset Magic Formula -kelpoisuussäännöt.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Poissuljetut</span>
          <strong>{summary.excludedCount}</strong>
          <p>Yhtiöt, jotka jäivät ulos ennen rankingia.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Finanssipoissulut</span>
          <strong>{summary.financeExcludedCount}</strong>
          <p>Metodologisesti pois rajatut finanssiyhtiöt.</p>
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
              <p>{dataset.dataSources.universe.detail}</p>
              <code>{dataset.dataSources.universe.path}</code>
            </div>
            <div>
              <span className="definitionLabel">Financials</span>
              <strong>{dataset.dataSources.financials.label}</strong>
              <p>{dataset.dataSources.financials.detail}</p>
              <code>{dataset.dataSources.financials.path}</code>
            </div>
            <div>
              <span className="definitionLabel">Päivitetty</span>
              <strong>{formatTimestamp(dataset.generatedAt)}</strong>
              <p>Etusivu käyttää tämän exportin aikaleimaa ja samoja tietoja kuin yrityssivut.</p>
            </div>
          </div>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">Miten tätä käytetään</p>
          <h2>Nopea seulonta, tarkempi tarkistus yrityssivulla</h2>
          <p>
            Aloita etusivun taulukosta, rajaa tarvittaessa markkina-arvon mukaan ja avaa yrityssivu, kun haluat nähdä
            rankingin taustalla olevat luvut tai poissulun syyn.
          </p>
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
            <p>
              Kokonaissijoitus muodostuu ROC:n ja Earnings Yieldin yhdistelmästä. Tasatilanteissa ticker toimii
              vakioituna tie-breakerina.
            </p>
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
