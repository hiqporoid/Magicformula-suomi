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
    "Avaa Nasdaq Helsinki + Stockholm Main Market -yhtiöiden ranking yhdessä näkymässä. Mukana Magic Formula, EBIT/EV, laatupisteet ja datalaadun rajaukset.",
  alternates: {
    canonical: "/"
  }
};

export default function Page() {
  const dataset = getRankingDataset();
  const summary = getValidationSummary(dataset);
  const leadCompany = dataset.rows[0];
  const exchanges = [...new Set(dataset.rawUniverse.map((row) => row.exchange))];

  return (
    <main className="shellContainer pageStack pageOffset">
      <section className="heroSurface">
        <div className="heroMainCard">
          <div className="eyebrowRow">
            <p className="eyebrow">Tutkimusnäkymä</p>
            <span className="softBadge">{dataset.methodologyVersion}</span>
          </div>
          <h1>Magic Formula -screener Helsingin ja Tukholman päälistoille.</h1>
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
            <span>Listauksia aineistossa: {summary.rawUniverseCount}</span>
            <span>Rankatut: {summary.rankedCount}</span>
            <span>Poissulut: {summary.excludedCount}</span>
            <span>Vienti luotu: {formatTimestamp(dataset.generatedAt)}</span>
          </div>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">Tämän viennin kärki</p>
            {leadCompany ? <>
              <h2>{leadCompany.company} <span className="inlineTicker">({leadCompany.listingId})</span></h2>
              <p>Yhteissija #{leadCompany.rank}, markkina-arvo {formatMarketCap(leadCompany.financialSnapshot.marketCapEur, "EUR")}, ROC {formatPercent(leadCompany.roc)} ja EBIT/EV {formatPercent(leadCompany.ebitEv)}.</p>
            </> : <><h2>Ei vertailukelpoisia rivejä</h2><p>Nykyisen aineiston tiedot eivät riitä luotettavaan rankingiin. Tarkista datan puutteet ja poissulut alempaa.</p></>}
          </div>
          <div className="sideCardSection sideCardDivider">
            <p className="eyebrow">Mitä tästä näkee</p>
            <ul className="plainList compactList">
              <li>Nykyisen listausaineiston ja kattavuuden markkinoittain.</li>
              <li>Markkina-arvo näkyy taulukossa ja toimii suodattimena.</li>
              <li>Yrityssivu näyttää rankingin taustalla olevat luvut ja poissulut.</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="contentPanel cautionPanel">
        <p className="eyebrow">Aineiston luotettavuus</p>
        <h2>Kattavuus markkinoittain</h2>
        <p>Listausaineisto, metodologiset poissulut ja datan estämä laskenta ovat eri asioita. Rivimäärä ei osoita koko Main Marketin kattavuutta. Viennin luontiaika ei ole talouslukujen päivitysaika.</p>
        <p>{Object.values(dataset.coverage).every((item) => item.completeListingVerified) ? "Nasdaqin Main Market -listausotos on varmennettu molemmille pörsseille. Talousdatan ja yhtiötunnisteiden puutteet rajaavat laskettavaa joukkoa." : "Täyttä listauskattavuutta ei ole varmennettu."} {dataset.universeRetrievedAt ? `Listauslähde haettu ${formatTimestamp(dataset.universeRetrievedAt)}.` : ""}</p>
        <div className="tableSurface"><table className="rankingTable">
          <thead><tr><th>Markkina</th><th className="numberCell">Aineiston kandidaatit</th><th className="numberCell">Varmennetut Main Market</th><th className="numberCell">Rankattu</th><th className="numberCell">Metodologinen poissulku</th><th className="numberCell">Datan estämä laskenta</th></tr></thead>
          <tbody>{["HEL", "STO"].map((exchange) => {
            const coverage = dataset.coverage[exchange];
            return <tr key={exchange}><td>{exchange === "HEL" ? "Suomi / Helsinki" : "Ruotsi / Tukholma"}</td><td className="numberCell">{coverage?.candidateListings ?? dataset.rawUniverse.filter((row) => row.exchange === exchange).length}</td><td className="numberCell">{coverage?.verifiedListings ?? "Ei varmennettu"}</td><td className="numberCell">{coverage?.ranked ?? dataset.rows.filter((row) => row.exchange === exchange).length}</td><td className="numberCell">{coverage?.methodologyExcluded ?? "Ei saatavilla"}</td><td className="numberCell">{coverage?.dataMissing ?? "Ei saatavilla"}</td></tr>;
          })}</tbody>
        </table></div>
      </section>

      <section className="summaryGrid fourUpGrid">
        <article className="summaryCard emphasisCard">
          <span className="summaryLabel">Listauksia aineistossa</span>
          <strong>{summary.rawUniverseCount}</strong>
          <p>Listauksia ennen laskennan poissulkuja. Yhtiöllä voi olla useita osakesarjoja.</p>
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
              <p>{dataset.dataSources.universe.detail}</p>
            </div>
            <div>
              <span className="definitionLabel">Financials</span>
              <strong>{dataset.dataSources.financials.label}</strong>
              <p>Talousluvut haetaan financials-aineistosta ennen rankingin laskentaa.</p>
            </div>
            <div>
              <span className="definitionLabel">Vienti luotu</span>
              <strong>{formatTimestamp(dataset.generatedAt)}</strong>
              <p>Lähdelukujen tilikausi, valuutta ja hakuajankohta näkyvät yhtiösivulla.</p>
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
          <RankingTable rows={dataset.rows} exchanges={exchanges} />
        </div>

        <aside className="workspaceSidebar">
          <section className="sidePanel">
            <p className="eyebrow">Tulosten lukutapa</p>
            <h2>Mistä sijoitus syntyy?</h2>
            <p>Yhteissijoitus lasketaan Suomen ja Ruotsin kelpoisista yhtiöistä. ROC-rank ja EBIT/EV-rank summataan. Tasatilanteet ratkaistaan vakioidusti listaustunnisteella. Laatupiste ei vaikuta sijoitukseen.</p>
          </section>

          <section className="sidePanel cautionPanel">
            <p className="eyebrow">Kelpoisuusrajat</p>
            <h2>Mikä sulkee yhtiön pois?</h2>
            <ul className="plainList compactList">
              <li>Finanssi- ja utility-yhtiöt rajataan pois metodologian vuoksi.</li>
              <li>Yhteinen markkina-arvoraja on 50 miljoonaa euroa.</li>
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
