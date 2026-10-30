import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatDataQualityLabel,
  formatMarketCap,
  formatSourceAmount,
  formatPercent,
  formatScore,
  formatTimestamp
} from "@/lib/formatters";
import {
  getExcludedCompanyByTicker,
  getRankingDataset,
  getRankedRowByTicker,
  getUniverseCompanyByTicker
} from "@/lib/rankingData";
import type { FinancialSnapshot } from "@/lib/types";

const dataset = getRankingDataset();

type Props = {
  params: {
    ticker: string;
  };
};

export const dynamicParams = false;

export function generateStaticParams() {
  const ids = dataset.rawUniverse.map((row) => row.listingId);
  const counts = new Map<string, number>();
  for (const row of dataset.rawUniverse) counts.set(row.ticker, (counts.get(row.ticker) ?? 0) + 1);
  const legacy = dataset.rawUniverse.filter((row) => counts.get(row.ticker) === 1).map((row) => row.ticker);
  return [...ids, ...legacy].map((ticker) => ({ ticker }));
}

export function generateMetadata({ params }: Props): Metadata {
  const company = getUniverseCompanyByTicker(params.ticker);
  const row = getRankedRowByTicker(params.ticker);
  const excluded = getExcludedCompanyByTicker(params.ticker);

  if (!company) {
    return {
      title: "Yhtiötä ei löytynyt",
      alternates: {
        canonical: `/yhtio/${params.ticker}`
      }
    };
  }

  const description = row
    ? `${company.company} on mukana Magicformula-suomi-aineistossa sijoituksella ${row.rank}. Sivulla näkyvät ROC, EBIT/EV, markkina-arvo ja rankingin taustadata.`
    : `${company.company} on mukana listausaineistossa, mutta ei Magic Formula -rankingissa. Syy: ${excluded?.reasons[0] ?? "poissulkusyy näkyy sivulla"}`;

  return {
    title: `${company.company} (${company.ticker})`,
    description,
    alternates: {
      canonical: `/yhtio/${encodeURIComponent(company.listingId)}`
    }
  };
}

function buildFinancialRows(snapshot: FinancialSnapshot | null) {
  if (!snapshot) {
    return [];
  }

  return [
    { label: "Tilinpäätöspäivä", value: snapshot.statementDate ?? "Ei saatavilla" },
    { label: "Lähdetunnus", value: snapshot.sourceSymbol ?? "Ei saatavilla" },
    { label: "Tilikausityyppi", value: snapshot.periodType === "annual" ? "Vuositilinpäätös" : snapshot.periodType ?? "Ei saatavilla" },
    { label: "Markkinadatan päivä", value: snapshot.marketDataDate ?? "Ei saatavilla" },
    { label: "Lähdedata haettu", value: snapshot.retrievedAt ? formatTimestamp(snapshot.retrievedAt) : "Ei saatavilla" },
    { label: "Laskentavaluutta", value: snapshot.currency ?? "Ei saatavilla" },
    { label: "Markkina-arvo alkuperäisessä valuutassa", value: formatSourceAmount(snapshot.marketCap, snapshot.priceCurrency) },
    { label: "Markkina-arvo euroina", value: formatSourceAmount(snapshot.marketCapEur, "EUR") },
    { label: "Valuuttakurssi euroon", value: snapshot.fxRateToEur === null ? "Ei saatavilla" : `${snapshot.fxRateToEur} (${snapshot.fxDate ?? "päivä puuttuu"})` },
    { label: "EBIT", value: formatSourceAmount(snapshot.ebit, snapshot.currency) },
    { label: "EBITin lähdekenttä", value: snapshot.ebitSourceField ?? "Ei saatavilla" },
    { label: "Lähdelukujen yksikkö", value: snapshot.amountUnit === "units" ? "Valuutan perusyksikkö" : snapshot.amountUnit ?? "Ei saatavilla" },
    { label: "Yritysarvo (EV)", value: formatSourceAmount(snapshot.enterpriseValue, snapshot.currency) },
    { label: "Vaihtuvat vastaavat", value: formatSourceAmount(snapshot.currentAssets, snapshot.currency) },
    { label: "Rahavarat", value: formatSourceAmount(snapshot.cash, snapshot.currency) },
    { label: "Lyhytaikaiset velat", value: formatSourceAmount(snapshot.currentLiabilities, snapshot.currency) },
    { label: "Lyhytaikaiset korolliset velat", value: formatSourceAmount(snapshot.shortTermDebt, snapshot.currency) },
    { label: "Aineelliset käyttöomaisuushyödykkeet netto (Net PPE)", value: formatSourceAmount(snapshot.netPpe, snapshot.currency) },
    { label: "Sijoitettu pääoma", value: formatSourceAmount(snapshot.investedCapital, snapshot.currency) },
    { label: "EV-lähde", value: snapshot.evSource ?? "Ei saatavilla" }
  ];
}

export default function CompanyPage({ params }: Props) {
  const company = getUniverseCompanyByTicker(params.ticker);
  const row = getRankedRowByTicker(params.ticker);
  const excluded = getExcludedCompanyByTicker(params.ticker);

  if (!company) {
    notFound();
  }

  const isRanked = Boolean(row);
  const financialSnapshot = row?.financialSnapshot ?? excluded?.financialSnapshot ?? company.financialSnapshot;
  const financialRows = buildFinancialRows(financialSnapshot);
  const dataQualityText = row ? formatDataQualityLabel(row.validationWarnings) : "Ei rankattu";
  const statementAge = financialSnapshot?.statementDate
    ? Math.floor((Date.parse(dataset.generatedAt) - Date.parse(financialSnapshot.statementDate)) / 86_400_000)
    : null;
  const marketAge = financialSnapshot?.marketDataDate
    ? Math.floor((Date.parse(dataset.generatedAt) - Date.parse(financialSnapshot.marketDataDate)) / 86_400_000)
    : null;

  return (
    <main className="shellContainer pageStack pageOffset">
      <section className="heroSurface heroSurfaceCompact">
        <div className="heroMainCard">
          <div className="eyebrowRow">
            <p className="eyebrow">Yrityssivu</p>
            <span className={`softBadge ${isRanked ? "softBadgeOk" : "softBadgeWarn"}`}>
              {isRanked ? "Rankattu" : "Poissuljettu"}
            </span>
          </div>
          <h1>
            {company.company} <span className="inlineTicker">({company.ticker})</span>
          </h1>
          <p className="heroLead">Perustiedot, rankingin pohjaluvut ja mahdollinen poissulun syy samassa näkymässä.</p>
          <div className="heroMetaStrip">
            <span>Vienti luotu: {formatTimestamp(dataset.generatedAt)}</span>
            <span>Listaus: {company.listingId}</span>
            <span>Sektori: {company.sector ?? "Ei tiedossa"}</span>
            <span>Markkina-arvo: {formatMarketCap(financialSnapshot?.marketCapEur ?? null, "EUR")}</span>
          </div>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">Yhteenveto</p>
            <h2>{isRanked ? `Sijoitus #${row?.rank}` : "Ei mukana rankingissa"}</h2>
            <p>
              {isRanked
                ? `ROC ${formatPercent(row!.roc)}, EBIT/EV ${formatPercent(row!.ebitEv)} ja datan laatu ${dataQualityText.toLowerCase()}.`
                : excluded?.reasons[0] ?? "Poissulun syytä ei löytynyt aineistosta."}
            </p>
          </div>
          <div className="sideCardSection sideCardDivider">
            <Link href="/" className="textLink">
              Takaisin rankingiin
            </Link>
          </div>
        </aside>
      </section>

      <section className="summaryGrid companySummaryGrid">
        <article className="summaryCard emphasisCard">
          <span className="summaryLabel">Status</span>
          <strong>{isRanked ? `#${row?.rank}` : "Ulkona"}</strong>
          <p>{isRanked ? "Yhteissijoitus Suomen ja Ruotsin kelpoisessa universumissa." : company.exclusionCategory === "methodology" ? "Metodologinen poissulku." : "Datan puute tai vertailukelvottomuus estää laskennan."}</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Markkina-arvo</span>
          <strong>{formatMarketCap(financialSnapshot?.marketCapEur ?? null, "EUR")}</strong>
          <p>Financials-exportin markkina-arvo.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">EBIT/EV</span>
          <strong>{isRanked && row ? formatPercent(row.ebitEv) : "-"}</strong>
          <p>Tulostuotto suhteessa yritysarvoon.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">ROC</span>
          <strong>{isRanked && row ? formatPercent(row.roc) : "-"}</strong>
          <p>Operatiivisen pääoman tuotto.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Datan laatu</span>
          <strong>{dataQualityText}</strong>
          <p>{isRanked ? "Mahdolliset validointihuomiot tällä rivillä." : "Poissulku näkyy alempana."}</p>
        </article>
      </section>

      <section className="contentGrid wideFirstGrid">
        <article className="contentPanel">
          <p className="eyebrow">1) Perustiedot</p>
          <h2>Yhtiö</h2>
          <div className="definitionList compactDefinitionList">
            <div>
              <span className="definitionLabel">Main Market -listaus</span>
              <strong>{company.listingVerified ? "Lähdevarmennettu" : "Varmentamaton kandidaatti"}</strong>
              <p>Lähteen päivämäärä: {company.listingSourceDate ?? "Ei saatavilla"}</p>
              {company.listingSourceUrl && /^https?:\/\//i.test(company.listingSourceUrl) ? <a href={company.listingSourceUrl} className="textLink" target="_blank" rel="noreferrer">Avaa listauslähde</a> : null}
            </div>
            <div>
              <span className="definitionLabel">Ticker</span>
              <strong>{company.listingId}</strong>
            </div>
            <div><span className="definitionLabel">ISIN</span><strong>{company.isin ?? "Ei saatavilla"}</strong></div>
            <div><span className="definitionLabel">Yhtiötunniste (LEI)</span><strong>{company.issuerId ?? "Ei varmennettu"}</strong></div>
            <div><span className="definitionLabel">Kotimaa</span><strong>{company.country ?? "Ei varmennettu"}</strong><p>Kotimaa ei ole automaattinen poissulkusääntö.</p></div>
            <div>
              <span className="definitionLabel">Yhtiö</span>
              <strong>{company.company}</strong>
            </div>
            <div>
              <span className="definitionLabel">Sektori</span>
              <strong>{company.sector ?? "Ei tiedossa"}</strong>
            </div>
            <div>
              <span className="definitionLabel">Universe</span>
              <strong>{dataset.universe}</strong>
            </div>
          </div>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">2) Finanssidata</p>
          <h2>Rankingin pohjaluvut</h2>
          {financialRows.length > 0 ? (
            <div className="definitionList compactDefinitionList">
              {financialRows.map((item) => (
                <div key={item.label}>
                  <span className="definitionLabel">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
              {isRanked && row ? (
                <>
                  <div>
                    <span className="definitionLabel">ROC-rank + EBIT/EV-rank</span>
                    <strong>{row.rocRank ?? "Ei saatavilla"} + {row.earningsYieldRank ?? "Ei saatavilla"} = {row.magicFormulaScore}</strong>
                  </div>
                  <div>
                    <span className="definitionLabel">MF-piste</span>
                    <strong>{row.magicFormulaScore}</strong>
                  </div>
                  <div>
                    <span className="definitionLabel">Laatupiste (ei vaikuta Magic Formulaan)</span>
                    <strong>{formatScore(row.qualityScore)}</strong>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <p>Tähän yhtiöön ei löytynyt financials-riviä nykyisestä exportista.</p>
          )}
          {financialSnapshot?.sourceUrl && /^https?:\/\//i.test(financialSnapshot.sourceUrl) ? <p><a href={financialSnapshot.sourceUrl} target="_blank" rel="noreferrer" className="textLink">Avaa talouslukujen lähde</a></p> : null}
          {financialSnapshot?.reconciliationDetail ? <p className="sideNote">Lähdetarkistus: {financialSnapshot.reconciliationDetail}</p> : null}
          {financialSnapshot?.reconciliationSourceUrl && /^https:\/\//i.test(financialSnapshot.reconciliationSourceUrl) ? <p><a href={financialSnapshot.reconciliationSourceUrl} target="_blank" rel="noreferrer" className="textLink">Avaa lähdetarkistuksen raportti</a></p> : null}
          <p className="sideNote">ROC = EBIT / [(vaihtuvat vastaavat − rahavarat) − (lyhytaikaiset velat − lyhytaikaiset korolliset velat) + Net PPE]. Puuttuvia lukuja ei korvata nollilla.</p>
        </article>
      </section>

      <section className="contentGrid wideFirstGrid">
        <article className={`contentPanel ${isRanked ? "mutedPanel" : "cautionPanel"}`}>
          <p className="eyebrow">3) Status</p>
          <h2>{isRanked ? "Datan laatu ja ranking" : "Poissulun syy"}</h2>
          <p className="sideNote">Tilinpäätöksen ikä vientihetkellä: {statementAge !== null && Number.isFinite(statementAge) ? `${statementAge} päivää${statementAge > 550 ? " — yli 18 kuukautta vanha" : ""}` : "ei tiedossa"}. Markkinadatan ikä: {marketAge !== null && Number.isFinite(marketAge) ? `${marketAge} päivää${marketAge > 14 ? " — yli kaksi viikkoa vanha" : ""}` : "ei tiedossa"}.</p>
          {isRanked && row ? (
            row.validationWarnings.length > 0 ? (
              <ul className="plainList compactList">
                {row.validationWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : (
              <p>Rivi läpäisi nykyiset kelpoisuussäännöt ilman erillisiä validointihuomioita.</p>
            )
          ) : (
            <ul className="plainList compactList">
              {(excluded?.reasons ?? ["Poissulun syytä ei löytynyt aineistosta."]).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </article>

        <article className="contentPanel">
          <p className="eyebrow">4) Seuraavaksi</p>
          <h2>Mitä kannattaa tarkistaa</h2>
          <ul className="plainList compactList">
            <li>Vertaa yrityksen lukuja koko ranking-taulukkoon.</li>
            <li>Tarkista metodologiasivulta, miten ROC ja EBIT/EV lasketaan.</li>
            <li>Jos yhtiö on poissuljettu, katso johtuuko se datasta vai metodologiasta.</li>
          </ul>
          <div className="inlineLinkList">
            <Link href="/" className="textLink">
              Takaisin rankingiin
            </Link>
            <Link href="/metodologia" className="textLink">
              Avaa metodologia
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
