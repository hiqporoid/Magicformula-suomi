import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPercent, formatScore, formatTimestamp } from "@/lib/formatters";
import {
  getExcludedCompanyByTicker,
  getRankingDataset,
  getRankedRowByTicker,
  getUniverseCompanyByTicker,
} from "@/lib/rankingData";

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
    ? `${company.company} on mukana Magicformula-suomi v1-aineistossa sijoituksella ${row.rank}. Sivulla näytetään ROC, EBIT/EV, laatupiste ja datan tila.`
    : `${company.company} kuuluu Main Market -raakauniversumiin, mutta on suljettu pois Magic Formula -rankingista. Syy: ${excluded?.reasons[0] ?? "poissulkusyy näkyy sivulla"}`;

  return {
    title: `${company.company} (${company.ticker})`,
    description,
    alternates: {
      canonical: `/yhtio/${company.ticker}`
    }
  };
}

export default function CompanyPage({ params }: Props) {
  const company = getUniverseCompanyByTicker(params.ticker);
  const row = getRankedRowByTicker(params.ticker);
  const excluded = getExcludedCompanyByTicker(params.ticker);

  if (!company) {
    notFound();
  }

  const isRanked = Boolean(row);
  const percentile = row
    ? Math.round(((dataset.rows.length - row.rank) / Math.max(dataset.rows.length - 1, 1)) * 100)
    : null;

  return (
    <main className="shellContainer pageStack pageOffset">
      <section className="heroSurface heroSurfaceCompact">
        <div className="heroMainCard">
          <div className="eyebrowRow">
            <p className="eyebrow">Yhtiönäkymä</p>
            <span className={`softBadge ${isRanked ? "softBadgeOk" : "softBadgeWarn"}`}>
              {isRanked ? "Rankattu" : "Poissuljettu"}
            </span>
          </div>
          <h1>
            {company.company} <span className="inlineTicker">({company.ticker})</span>
          </h1>
          <p className="heroLead">
            Sivu näyttää, kuuluuko yhtiö raw-universeen, pääsikö se Magic Formula -rankingiiin ja millä perusteella.
            Näin yhtiö ei katoa näkyvistä vain siksi, ettei sitä voida rankata nykyisellä metodologialla.
          </p>
          <div className="heroMetaStrip">
            <span>Päivitetty: {formatTimestamp(dataset.generatedAt)}</span>
            <span>Universumi: {dataset.universe}</span>
            <span>Sektori: {company.sector ?? "Ei tiedossa"}</span>
          </div>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">Universestatus</p>
            <h2>{isRanked ? `Sijoitus #${row?.rank}` : "Ei mukana rankingissa"}</h2>
            <p>
              {isRanked
                ? `Yhtiö sijoittuu tämän viennin sisällä percentiiliin ${percentile}.`
                : excluded?.reasons.join(" ") ?? "Poissulun syytä ei löytynyt aineistosta."}
            </p>
          </div>
          <div className="sideCardSection sideCardDivider">
            <Link href="/" className="textLink">
              Takaisin rankingiin
            </Link>
          </div>
        </aside>
      </section>

      {isRanked && row ? (
        <>
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
                Magic Formula -piste {row.magicFormulaScore} on yhdistelmä ROC- ja EBIT/EV-rankeista. Mitä pienempi
                piste, sitä vahvempi yhdistelmäsijoitus nykyisessä datasetissä.
              </p>
              <p>
                Yhtiö sijoittuu sisäisessä vertailussa sijalle #{row.rank}. Tulosta kannattaa tarkastella lähtökohtana,
                jonka ympärille rakennetaan laadullinen analyysi, toimialaymmärrys ja mahdollisten kertaluonteisten erien
                tarkistus.
              </p>
            </article>

            <article className="contentPanel mutedPanel">
              <p className="eyebrow">Datan laatu</p>
              <h2>Onko rivissä erityisiä huomioita?</h2>
              {row.validationWarnings.length > 0 ? (
                <ul className="plainList compactList">
                  {row.validationWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p>
                  Rivi läpäisi nykyiset v1-kelpoisuussäännöt: yhtiö ei ole finanssisektorilla, pakolliset kentät
                  löytyivät, EBIT ja EV olivat positiivisia ja sijoitettu pääoma oli mielekäs.
                </p>
              )}
            </article>
          </section>
        </>
      ) : (
        <section className="contentGrid wideFirstGrid">
          <article className="contentPanel cautionPanel">
            <p className="eyebrow">Poissulun syyt</p>
            <h2>Miksi yhtiö ei ole mukana Magic Formula -rankingissa</h2>
            <ul className="plainList compactList">
              {(excluded?.reasons ?? ["Poissulun syytä ei löytynyt aineistosta."]).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </article>

          <article className="contentPanel mutedPanel">
            <p className="eyebrow">Metodologinen tulkinta</p>
            <h2>Mitä poissulku tarkoittaa käyttäjälle</h2>
            <p>
              Poissulku ei automaattisesti tarkoita, että yhtiössä olisi ongelma. Finanssiyhtiöiden kohdalla se kertoo
              vain siitä, ettei v1-malli käsittele pankki- ja vakuutusliiketoimintaa samalla rakenteella kuin muita
              sektoreita. Muissa tapauksissa poissulku kertoo, ettei nykyinen data riitä rehelliseen vertailuun.
            </p>
          </article>
        </section>
      )}

      <section className="contentGrid">
        <article className="contentPanel">
          <p className="eyebrow">Seuraavat tarkistuskohdat</p>
          <h2>Mitä tämän jälkeen kannattaa tutkia</h2>
          <ul className="plainList">
            <li>Onko yhtiöllä saatavilla puuttuvat statementit seuraavaan vientiin?</li>
            <li>Jos kyse on finanssiyhtiöstä, tarvitaanko erillinen sektorikohtainen metodologia myöhempään versioon?</li>
            <li>Tukeeko laadullinen analyysi sitä tarinaa, jonka ranking tai poissulku antaa?</li>
          </ul>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">Taustalinkit</p>
          <h2>Pidä kokonaiskuva mukana</h2>
          <p>
            Tarkista aina yhtiösivun rinnalla koko ranking ja metodologiasivu. Näin yksittäinen luku tai poissulku ei
            irtoa siitä kontekstista, jossa se on laskettu.
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
