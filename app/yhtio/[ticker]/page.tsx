import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatDataQualityLabel,
  formatMarketCap,
  formatMillions,
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
  return dataset.rawUniverse.map((row) => ({
    ticker: row.ticker
  }));
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
    : `${company.company} kuuluu Main Market -raakauniversumiin, mutta on suljettu pois Magic Formula -rankingista. Syy: ${excluded?.reasons[0] ?? "poissulkusyy näkyy sivulla"}`;

  return {
    title: `${company.company} (${company.ticker})`,
    description,
    alternates: {
      canonical: `/yhtio/${company.ticker}`
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
    { label: "Markkina-arvo", value: formatMarketCap(snapshot.marketCap) },
    { label: "EBIT", value: formatMillions(snapshot.ebit) },
    { label: "Yritysarvo", value: formatMillions(snapshot.enterpriseValue) },
    { label: "Sijoitettu pääoma", value: formatMillions(snapshot.investedCapital) },
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
            <span>Päivitetty: {formatTimestamp(dataset.generatedAt)}</span>
            <span>Sektori: {company.sector ?? "Ei tiedossa"}</span>
            <span>Markkina-arvo: {formatMarketCap(financialSnapshot?.marketCap ?? null)}</span>
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
          <p>{isRanked ? "Magic Formula -sijoitus nykyisessä viennissä." : "Yhtiö ei rankkaudu tähän vientiin."}</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Markkina-arvo</span>
          <strong>{formatMarketCap(financialSnapshot?.marketCap ?? null)}</strong>
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
              <span className="definitionLabel">Ticker</span>
              <strong>{company.ticker}</strong>
            </div>
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
                    <span className="definitionLabel">MF-piste</span>
                    <strong>{row.magicFormulaScore}</strong>
                  </div>
                  <div>
                    <span className="definitionLabel">Laatupiste</span>
                    <strong>{formatScore(row.qualityScore)}</strong>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <p>Tähän yhtiöön ei löytynyt financials-riviä nykyisestä exportista.</p>
          )}
        </article>
      </section>

      <section className="contentGrid wideFirstGrid">
        <article className={`contentPanel ${isRanked ? "mutedPanel" : "cautionPanel"}`}>
          <p className="eyebrow">3) Status</p>
          <h2>{isRanked ? "Datan laatu ja ranking" : "Poissulun syy"}</h2>
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