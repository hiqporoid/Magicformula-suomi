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
      title: "YhtiÃ¶tÃ¤ ei lÃ¶ytynyt",
      alternates: {
        canonical: `/yhtio/${params.ticker}`
      }
    };
  }

  const description = row
    ? `${company.company} on mukana Magicformula-suomi-aineistossa sijoituksella ${row.rank}. Sivulla nÃ¤kyvÃ¤t ROC, EBIT/EV, markkina-arvo ja rankingin taustadata.`
    : `${company.company} kuuluu Main Market -raakauniversumiin, mutta on suljettu pois Magic Formula -rankingista. Syy: ${excluded?.reasons[0] ?? "poissulkusyy nÃ¤kyy sivulla"}`;

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
    { label: "LÃ¤hdetunnus", value: snapshot.sourceSymbol ?? "Ei saatavilla" },
    { label: "Markkina-arvo", value: formatMarketCap(snapshot.marketCap) },
    { label: "EBIT", value: formatMillions(snapshot.ebit) },
    { label: "Yritysarvo", value: formatMillions(snapshot.enterpriseValue) },
    { label: "Sijoitettu pÃ¤Ã¤oma", value: formatMillions(snapshot.investedCapital) },
    { label: "EV-lÃ¤hde", value: snapshot.evSource ?? "Ei saatavilla" }
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
          <p className="heroLead">
            Sivulla nÃ¤kyvÃ¤t yrityksen perustiedot, rankingin pohjana oleva finanssidata sekÃ¤ mahdollinen poissulun syy
            tai datalaatuhuomio.
          </p>
          <div className="heroMetaStrip">
            <span>PÃ¤ivitetty: {formatTimestamp(dataset.generatedAt)}</span>
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
                : excluded?.reasons[0] ?? "Poissulun syytÃ¤ ei lÃ¶ytynyt aineistosta."}
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
          <p>{isRanked ? "Magic Formula -sijoitus nykyisessÃ¤ viennissÃ¤." : "YhtiÃ¶tÃ¤ ei rankattu tÃ¤hÃ¤n vientiin."}</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Markkina-arvo</span>
          <strong>{formatMarketCap(financialSnapshot?.marketCap ?? null)}</strong>
          <p>NykyisessÃ¤ financials-exportissa mukana oleva markkina-arvo.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">EBIT/EV</span>
          <strong>{isRanked && row ? formatPercent(row.ebitEv) : "-"}</strong>
          <p>Tulostuotto suhteessa yritysarvoon.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">ROC</span>
          <strong>{isRanked && row ? formatPercent(row.roc) : "-"}</strong>
          <p>Operatiivisen pÃ¤Ã¤oman tuotto nykyisellÃ¤ datalla.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Datan laatu</span>
          <strong>{dataQualityText}</strong>
          <p>{isRanked ? "Perustuu tÃ¤mÃ¤n rivin validointihuomioihin." : "Poissulku nÃ¤kyy erillisessÃ¤ osiossa."}</p>
        </article>
      </section>

      <section className="contentGrid wideFirstGrid">
        <article className="contentPanel">
          <p className="eyebrow">1) Yrityksen tiedot</p>
          <h2>Perustiedot</h2>
          <div className="definitionList compactDefinitionList">
            <div>
              <span className="definitionLabel">Ticker</span>
              <strong>{company.ticker}</strong>
            </div>
            <div>
              <span className="definitionLabel">YhtiÃ¶</span>
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
          <h2>Rankingin pohjana olevat luvut</h2>
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
            <p>Financials-riviÃ¤ ei lÃ¶ytynyt tÃ¤hÃ¤n yhtiÃ¶Ã¶n nykyisestÃ¤ exportista.</p>
          )}
        </article>
      </section>

      <section className="contentGrid wideFirstGrid">
        <article className={`contentPanel ${isRanked ? "mutedPanel" : "cautionPanel"}`}>
          <p className="eyebrow">3) Status ja huomiot</p>
          <h2>{isRanked ? "Datalaatu ja ranking-status" : "Poissulun syy"}</h2>
          {isRanked && row ? (
            row.validationWarnings.length > 0 ? (
              <ul className="plainList compactList">
                {row.validationWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : (
              <p>Rivi lÃ¤pÃ¤isi nykyiset kelpoisuussÃ¤Ã¤nnÃ¶t ilman erillisiÃ¤ validointihuomioita.</p>
            )
          ) : (
            <ul className="plainList compactList">
              {(excluded?.reasons ?? ["Poissulun syytÃ¤ ei lÃ¶ytynyt aineistosta."]).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </article>

        <article className="contentPanel">
          <p className="eyebrow">4) LisÃ¤huomiot</p>
          <h2>MitÃ¤ tÃ¤stÃ¤ kannattaa katsoa seuraavaksi</h2>
          <ul className="plainList compactList">
            <li>Tarkista yrityssivun luvut suhteessa koko ranking-taulukkoon.</li>
            <li>Katso metodologiasivulta, miten ROC ja EBIT/EV lasketaan.</li>
            <li>Jos yhtiÃ¶ on poissuljettu, tarkista johtuuko se metodologiasta vai puuttuvasta datasta.</li>
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
