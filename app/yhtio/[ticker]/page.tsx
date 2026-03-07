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
      title: "Yhtiötä ei löytynyt",
      alternates: {
        canonical: `/yhtio/${params.ticker}`
      }
    };
  }

  return {
    title: `${row.company} (${row.ticker})`,
    description: `${row.company} on mukana Magicformula-suomi v1-demossa sijoituksella ${row.rank}. Sivulla näytetään ROC, EBIT/EV, laatupiste ja datalaadun status.`,
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
  const hasWarnings = row.validationWarnings.length > 0;

  return (
    <main className="shellContainer pageStack pageOffset">
      <section className="heroSurface heroSurfaceCompact">
        <div className="heroMainCard">
          <div className="eyebrowRow">
            <p className="eyebrow">Yhtiönäkymä</p>
            <span className={`softBadge ${hasWarnings ? "softBadgeWarn" : "softBadgeOk"}`}>
              {hasWarnings ? "Validointihuomio" : "Läpäissyt validoinnin"}
            </span>
          </div>
          <h1>
            {row.company} <span className="inlineTicker">({row.ticker})</span>
          </h1>
          <p className="heroLead">
            Tämä näkymä kokoaa saman viennin luvut yhtiökohtaisesti. Se kertoo miksi rivi päätyi mukaan, missä kohtaa
            rankingia yhtiö on ja mitä käyttäjän kannattaa tarkistaa ennen pidemmälle menevää analyysiä.
          </p>
          <div className="heroMetaStrip">
            <span>Päivitetty: {formatTimestamp(dataset.generatedAt)}</span>
            <span>Universumi: {dataset.universe}</span>
            <span>Sijoitus: #{row.rank}</span>
          </div>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">Sisäinen vertailuasema</p>
            <h2>Percentiili {percentile}</h2>
            <p>
              Yhtiö sijoittuu tämän pienen v1-viennin sisällä percentiiliin {percentile}. Tarkoitus ei ole julistaa
              voittajaa, vaan nostaa esiin jatkotutkimuksen arvoisia rivejä.
            </p>
          </div>
          <div className="sideCardSection sideCardDivider">
            <Link href="/" className="textLink">
              Takaisin rankingiin
            </Link>
          </div>
        </aside>
      </section>

      <section className="summaryGrid fourUpGrid">
        <article className="summaryCard emphasisCard">
          <span className="summaryLabel">Magic Formula -piste</span>
          <strong>{row.magicFormulaScore}</strong>
          <p>Pienempi yhteispiste tarkoittaa vahvempaa sijoitusta.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">ROC</span>
          <strong>{formatPercent(row.roc)}</strong>
          <p>Operatiivisen pääoman tuotto nykyisen datan perusteella.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">EBIT/EV</span>
          <strong>{formatPercent(row.ebitEv)}</strong>
          <p>Tulostuotto suhteessa yritysarvoon.</p>
        </article>
        <article className="summaryCard">
          <span className="summaryLabel">Laatupiste</span>
          <strong>{formatScore(row.qualityScore)}</strong>
          <p>Kevyt overlay jatkotutkimuksen priorisointiin.</p>
        </article>
      </section>

      <section className="contentGrid wideFirstGrid">
        <article className="contentPanel">
          <p className="eyebrow">Miten tätä kannattaa lukea</p>
          <h2>Miksi tämä rivi on mukana rankingissa</h2>
          <p>
            Magic Formula -piste {row.magicFormulaScore} on yhdistelmä ROC- ja EBIT/EV-rankeista. Mitä pienempi piste,
            sitä vahvempi yhdistelmäsijoitus nykyisessä datasetissä.
          </p>
          <p>
            Yhtiö sijoittuu sisäisessä vertailussa sijalle #{row.rank}. Tulosta kannattaa tarkastella lähtökohtana,
            jonka ympärille rakennetaan laadullinen analyysi, toimialaymmärrys ja mahdollisten kertaluonteisten erien
            tarkistus.
          </p>
        </article>

        <article className={`contentPanel ${hasWarnings ? "cautionPanel" : "mutedPanel"}`}>
          <p className="eyebrow">Datan laatu</p>
          <h2>Onko rivissä erityisiä huomioita?</h2>
          {hasWarnings ? (
            <ul className="plainList compactList">
              {row.validationWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : (
            <p>
              Kyllä. Rivi läpäisi v1-minimivalidoinnit ilman huomautuksia: pakolliset kentät löytyivät, EV oli
              positiivinen ja ROC:n nimittäjä oli mielekäs.
            </p>
          )}
        </article>
      </section>

      <section className="contentGrid">
        <article className="contentPanel">
          <p className="eyebrow">Seuraavat tarkistuskohdat</p>
          <h2>Mitä tämän jälkeen kannattaa tutkia</h2>
          <ul className="plainList">
            <li>Onko EBIT normalisoitu vai sisältääkö se kertaluonteisia eriä?</li>
            <li>Miten velkaisuus, sykli ja toimialan erityispiirteet vaikuttavat tunnuslukuihin?</li>
            <li>Tukeeko laadullinen analyysi sitä tarinaa, jonka ranking antaa?</li>
          </ul>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">Taustalinkit</p>
          <h2>Pidä kokonaiskuva mukana</h2>
          <p>
            Tarkista aina yhtiösivun rinnalla koko ranking ja metodologiasivu. Näin yksittäinen luku ei irtoa siitä
            kontekstista, jossa se on laskettu.
          </p>
          <div className="inlineLinkList">
            <Link href="/" className="textLink">
              Takaisin rankingiin
            </Link>
            <Link href="/metodologia" className="textLink">
              Avaa metodologia ja vastuuvapauslauseke
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}