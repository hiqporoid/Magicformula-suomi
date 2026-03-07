import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPercent, formatScore, formatTimestamp } from "@/lib/formatters";
import { getRankingDataset } from "@/lib/rankingData";

const dataset = getRankingDataset();

function getCompanyRow(rawTicker: string) {
  return dataset.rows.find((item) => item.ticker === rawTicker.toUpperCase());
}

type Props = {
  params: {
    ticker: string;
  };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return dataset.rows.map((row) => ({
    ticker: row.ticker
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const row = getCompanyRow(params.ticker);

  if (!row) {
    return {
      title: "Yhtiota ei loytynyt",
      alternates: {
        canonical: `/yhtio/${params.ticker}`
      }
    };
  }

  return {
    title: `${row.company} (${row.ticker})`,
    description: `${row.company} on mukana Magicformula-suomi v1-demossa sijoituksella ${row.rank}. Sivulla naytetaan ROC, EBIT/EV, laatupiste ja datalaadun status.`,
    alternates: {
      canonical: `/yhtio/${row.ticker}`
    }
  };
}

export default function CompanyPage({ params }: Props) {
  const row = getCompanyRow(params.ticker);

  if (!row) {
    notFound();
  }

  const percentile = Math.round(((dataset.rows.length - row.rank) / Math.max(dataset.rows.length - 1, 1)) * 100);

  return (
    <main className="container pageStack">
      <section className="panel heroSlim">
        <p className="eyebrow">Yhtioprofiili</p>
        <h1>
          {row.company} ({row.ticker})
        </h1>
        <p className="heroLead">
          Sama datasetti, sama rankinglogiikka ja sama disclaimer kuin etusivulla. Taman sivun tarkoitus on kertoa,
          miksi rivi paatyi mukaan juuri talla sijoituksella.
        </p>
        <div className="inlineMeta">
          <span>Paivitetty {formatTimestamp(dataset.generatedAt)}</span>
          <span>Universumi: {dataset.universe}</span>
        </div>
      </section>

      <section className="metricGrid">
        <article className="panel statCard">
          <span className="metricLabel">Kokonaissijoitus</span>
          <strong>#{row.rank}</strong>
          <p>Magic Formula -jarjestys tassa exportissa.</p>
        </article>
        <article className="panel statCard">
          <span className="metricLabel">ROC</span>
          <strong>{formatPercent(row.roc)}</strong>
          <p>Operatiivisen paoman tuotto nykyisen datan perusteella.</p>
        </article>
        <article className="panel statCard">
          <span className="metricLabel">EBIT/EV</span>
          <strong>{formatPercent(row.ebitEv)}</strong>
          <p>Tulostuotto suhteessa yritysarvoon.</p>
        </article>
        <article className="panel statCard">
          <span className="metricLabel">Laatupiste</span>
          <strong>{formatScore(row.qualityScore)}</strong>
          <p>Kevyt overlay, joka auttaa priorisoimaan jatkotutkimusta.</p>
        </article>
      </section>

      <section className="infoGrid">
        <article className="panel">
          <p className="eyebrow">Miten tulkita</p>
          <h2>Miksi taman rivin kannattaa kiinnostaa</h2>
          <p>
            Yhtio sijoittuu percentiiliin {percentile} taman pienen v1-demon sisaisessa vertailussa. Tarkoitus ei ole
            julistaa voittajaa, vaan nostaa esiin rivit, joissa kannattavuus ja arvostus kohtaavat samassa datasetissa.
          </p>
          <p>
            Magic Formula -piste {row.magicFormulaScore} on yhdistelma ROC- ja EBIT/EV-rankeista. Mita pienempi piste,
            sita vahvempi yhdistelmasijoitus.
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">Datan laatu</p>
          <h2>Lapaisiko rivi validoinnin puhtaasti?</h2>
          {row.validationWarnings.length === 0 ? (
            <p>
              Kylla. Rivi lapaisi v1-minimivalidoinnit ilman huomautuksia: pakolliset kentat loytyivat, EV oli
              positiivinen ja ROC:n nimittaja oli mielekas.
            </p>
          ) : (
            <ul className="plainList">
              {row.validationWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="panel notesGrid">
        <div>
          <p className="eyebrow">Seuraava askel analyysissa</p>
          <h2>Mita taman jalkeen kannattaa tarkistaa</h2>
          <ul className="plainList">
            <li>Onko EBIT normalisoitu vai sisaltyyko siihen kertaluonteisia eria?</li>
            <li>Miten velkaisuus, sykli ja sektorikohtaiset piirteet vaikuttavat tunnuslukuihin?</li>
            <li>Tukeeko laadullinen analyysi sita tarinaa, jonka ranking antaa?</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Taustalinkit</p>
          <h2>Siirry takaisin kokonaiskuvaan</h2>
          <p>
            <Link href="/" className="textLink">
              Takaisin rankingiin
            </Link>
          </p>
          <p>
            <Link href="/metodologia" className="textLink">
              Avaa metodologia ja vastuuvapaus
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}