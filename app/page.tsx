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
    "Avaa Nasdaq Helsinki Main Market -yhtiÃ¶iden ranking yhdessÃ¤ nÃ¤kymÃ¤ssÃ¤. Mukana Magic Formula, EBIT/EV, laatupisteet ja datalaadun rajaukset.",
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
            <p className="eyebrow">TutkimusnÃ¤kymÃ¤</p>
            <span className="softBadge">{dataset.methodologyVersion}</span>
          </div>
          <h1>Magic Formula -screener Nasdaq Helsingin pÃ¤Ã¤listalle.</h1>
          <p className="heroLead">
            NÃ¤kymÃ¤ kokoaa rankatut yhtiÃ¶t, poissulut ja datalÃ¤hteet samaan tyÃ¶pÃ¶ytÃ¤Ã¤n. Tarkoitus on nopea seulonta ja
            lÃ¤pinÃ¤kyvÃ¤ taustadata.
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
            <span>PÃ¤ivitetty: {formatTimestamp(dataset.generatedAt)}</span>
          </div>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">TÃ¤mÃ¤n viennin kÃ¤rki</p>
            <h2>
              {leadCompany.company} <span className="inlineTicker">({leadCompany.ticker})</span>
            </h2>
            <p>
              Sijoitus #{leadCompany.rank}, markkina-arvo {formatMarketCap(leadCompany.financialSnapshot.marketCap)}, ROC {" "}
              {formatPercent(leadCompany.roc)} ja EBIT/EV {formatPercent(leadCompany.ebitEv)}.
            </p>
          </div>
          <div className="sideCardSection sideCardDivider">
            <p className="eyebrow">MitÃ¤ tÃ¤stÃ¤ nÃ¤kee</p>
            <ul className="plainList compactList">
              <li>Koko Main Market -universen yhdestÃ¤ viennistÃ¤.</li>
              <li>Markkina-arvo nÃ¤kyy taulukossa ja toimii suodattimena.</li>
              <li>Yrityssivu nÃ¤yttÃ¤Ã¤ rankingin taustalla olevat luvut ja poissulut.</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="summaryGrid fourUpGrid">
        <article className="summaryCard emphasisCard">
          <span className="summaryLabel">Raakauniversumi</span>
          <strong>{summary.rawUniverseCount}</strong>
          <p>Main Market -yhtiÃ¶t nykyisessÃ¤ universessa.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Rankatut</span>
          <strong>{summary.rankedCount}</strong>
          <p>YhtiÃ¶t, jotka lÃ¤pÃ¤isivÃ¤t kelpoisuussÃ¤Ã¤nnÃ¶t.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Poissuljetut</span>
          <strong>{summary.excludedCount}</strong>
          <p>YhtiÃ¶t, jotka jÃ¤ivÃ¤t ulos ennen rankingia.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Finanssipoissulut</span>
          <strong>{summary.financeExcludedCount}</strong>
          <p>Metodologisesti erikseen rajatut finanssiyhtiÃ¶t.</p>
        </article>
      </section>

      <section className="contentGrid dataSourceGrid">
        <article className="contentPanel">
          <p className="eyebrow">Data source / PÃ¤ivitetty</p>
          <h2>MistÃ¤ data tulee?</h2>
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
              <span className="definitionLabel">PÃ¤ivitetty</span>
              <strong>{formatTimestamp(dataset.generatedAt)}</strong>
              <p>Sama exportti nÃ¤kyy etusivulla, metodologiassa ja yrityssivuilla.</p>
            </div>
          </div>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">KÃ¤yttÃ¶tapa</p>
          <h2>Lyhyt tyÃ¶jÃ¤rjestys</h2>
          <ul className="plainList compactList">
            <li>Rajaa ensin taulukkoa haulla, markkina-arvolla ja datan laadulla.</li>
            <li>Avaa yrityssivu, kun haluat nÃ¤hdÃ¤ rankingin pohjaluvut.</li>
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
            <h2>MistÃ¤ sijoitus syntyy?</h2>
            <p>Magic Formula -sijoitus muodostuu ROC:n ja EBIT/EV:n yhdistelmÃ¤stÃ¤. Tasatilanteissa ticker ratkaisee.</p>
          </section>

          <section className="sidePanel cautionPanel">
            <p className="eyebrow">Kelpoisuusrajat</p>
            <h2>MikÃ¤ sulkee yhtiÃ¶n pois?</h2>
            <ul className="plainList compactList">
              <li>Finanssisektori rajataan pois v1-metodologian vuoksi.</li>
              <li>Puuttuvat statementit estÃ¤vÃ¤t laskennan.</li>
              <li>EBIT â‰¤ 0, EV â‰¤ 0 tai negatiivinen sijoitettu pÃ¤Ã¤oma pudottavat rivin pois.</li>
            </ul>
          </section>

          <ExclusionList excluded={dataset.excluded} />
        </aside>
      </section>
    </main>
  );
}