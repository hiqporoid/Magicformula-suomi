import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Metodologia ja vastuuvapaus",
  description:
    "Lue miten Magic Formula, EBIT/EV, quality overlay, poissulut ja datan laadun käsittely on toteutettu Magicformula-suomi v1-demossa.",
  alternates: {
    canonical: "/metodologia"
  }
};

const formulaRows = [
  {
    title: "ROC",
    formula: "EBIT / (Net PPE + nettokäyttöpääoma)",
    note: "Mittaa operatiivisen pääoman tuottoa. Nimittäjän on oltava positiivinen, muuten rivi poistuu rankingista."
  },
  {
    title: "Earnings Yield / EBIT/EV",
    formula: "EBIT / Enterprise Value",
    note: "Arvioi tulostuottoa suhteessa yritysarvoon. EV ≤ 0 ei tuota mielekästä vertailulukua v1:ssä."
  },
  {
    title: "Magic Formula -piste",
    formula: "ROC-rank + Earnings Yield -rank",
    note: "Pienempi yhteispiste on parempi. Tasapisteissä ticker ratkaisee järjestyksen deterministisesti."
  },
  {
    title: "Quality overlay",
    formula: "Kevyt 0–100 pisteytys",
    note: "Mukana on kannattavuus-, velkaisuus- ja vakauskomponentteja. Se tukee tulkintaa, ei korvaa perusrankingia."
  }
];

export default function MethodologyPage() {
  return (
    <main className="shellContainer pageStack pageOffset">
      <section className="heroSurface heroSurfaceCompact">
        <div className="heroMainCard">
          <div className="eyebrowRow">
            <p className="eyebrow">Metodologia</p>
            <span className="softBadge">Selitettävä v1</span>
          </div>
          <h1>Miten ranking muodostuu ja mitä tästä demosta saa tulkita?</h1>
          <p className="heroLead">
            Tavoite ei ole piilottaa laskentaa siistin käyttöliittymän alle, vaan tehdä kaavat, poissulut, datan laatu
            ja vastuuvapauslauseke helposti tarkistettaviksi samalla kun näkymä pysyy rauhallisena.
          </p>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">Nopea yhteenveto</p>
            <ul className="plainList compactList">
              <li>ROC ja EBIT/EV muodostavat perusrankingin.</li>
              <li>Laatupiste auttaa priorisoimaan jatkotutkimusta.</li>
              <li>Poissulut ja datalaatuviestit näytetään avoimesti.</li>
            </ul>
          </div>
          <div className="sideCardSection sideCardDivider">
            <Link href="/" className="textLink">
              Takaisin rankingiin
            </Link>
          </div>
        </aside>
      </section>

      <section className="methodGrid">
        {formulaRows.map((item) => (
          <article key={item.title} className="methodCard">
            <p className="eyebrow">Kaava</p>
            <h2>{item.title}</h2>
            <p className="formulaValue">{item.formula}</p>
            <p>{item.note}</p>
          </article>
        ))}
      </section>

      <section className="contentGrid">
        <article className="contentPanel">
          <p className="eyebrow">Julkaisusäännöt</p>
          <h2>Milloin rivi ei pääse mukaan</h2>
          <ul className="plainList">
            <li>Pakollinen talouskenttä puuttuu tai ei ole numeerinen.</li>
            <li>Enterprise Value on nolla tai negatiivinen.</li>
            <li>Sijoitetun pääoman nimittäjä on nolla tai negatiivinen.</li>
            <li>Rivi on muuten niin puutteellinen, ettei vertailu ole enää rehellinen.</li>
          </ul>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">Datan laatu</p>
          <h2>Mitä käyttäjän kannattaa huomioida</h2>
          <ul className="plainList">
            <li>Talousdata voi olla viiveellistä ja myöhemmin korjattua.</li>
            <li>Kertaluonteiset erät voivat vääristää tunnuslukuja hetkellisesti.</li>
            <li>Finanssisektoria ei mallinneta erikseen v1:ssä, joten tulkinta vaatii harkintaa.</li>
            <li>Laatupiste on tulkintaa tukeva overlay, ei itsenäinen sijoitussuositus.</li>
          </ul>
        </article>
      </section>

      <section className="contentGrid">
        <article className="contentPanel">
          <p className="eyebrow">Käyttöliittymässä näkyvä selitettävyys</p>
          <h2>Miten luvut näkyvät tuotteen eri näkymissä</h2>
          <ul className="plainList">
            <li>Ranking-sivulla näkyvät sijoitus, Magic Formula -piste, ROC, EBIT/EV ja laatupiste.</li>
            <li>Yhtiösivu toistaa samat luvut ja kertoo, onko rivillä validointivaroituksia.</li>
            <li>Datan laatu, poissulut ja vastuuvapauslauseke ovat helposti löydettävissä omissa osioissaan.</li>
          </ul>
        </article>

        <article className="contentPanel cautionPanel">
          <p className="eyebrow">Vastuuvapauslauseke</p>
          <h2>Ei sijoitusneuvontaa</h2>
          <p>
            Sovellus on henkilökohtaisen tutkimusprosessin demo. Sisältö ei ole sijoitusneuvontaa, kehotus ostaa tai
            myydä arvopapereita eikä korvaa omaa analyysiä.
          </p>
          <p>
            Jokainen käyttäjä vastaa itse siitä, miten tunnuslukuja tulkitsee, mitä lisätietoa hankkii ja sopiiko
            mahdollinen sijoitus omaan tilanteeseen.
          </p>
        </article>
      </section>
    </main>
  );
}