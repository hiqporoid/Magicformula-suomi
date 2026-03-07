import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Metodologia ja vastuuvapaus",
  description:
    "Lue miten Magic Formula, EBIT/EV, quality overlay, poissulut ja datan laadun käsittely on toteutettu Magicformula-suomi v1-aineistossa.",
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
    note: "Arvioi tulostuottoa suhteessa yritysarvoon. EV ≤ 0 tai EBIT ≤ 0 ei tuota mielekästä vertailulukua v1:ssä."
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
          <h1>Miten universe, kelpoisuus ja ranking liittyvät toisiinsa?</h1>
          <p className="heroLead">
            Tavoite ei ole piilottaa laskentaa siistin käyttöliittymän alle, vaan tehdä kaavat, poissulut, datan laatu
            ja ylläpidettävä Main Market -universe helposti tarkistettaviksi samalla kun näkymä pysyy rauhallisena.
          </p>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">Nopea yhteenveto</p>
            <ul className="plainList compactList">
              <li>Raakauniversessa säilytetään kaikki Main Market -yhtiöt.</li>
              <li>Ranking käyttää vain kelpoiset ei-finanssiyhtiöt.</li>
              <li>Poissulut ja syyt näytetään käyttöliittymässä avoimesti.</li>
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
          <p className="eyebrow">Universen hallinta</p>
          <h2>Mitä kuuluu v1-raakauniversumiin</h2>
          <ul className="plainList">
            <li>Vain Nasdaq Helsinki Main Market -yhtiöt.</li>
            <li>Universe ylläpidetään tiedostossa `python_pipeline/data/main_market_universe.csv`.</li>
            <li>Talousluvut ylläpidetään erillisessä `python_pipeline/data/financials.csv`-tiedostossa.</li>
            <li>Universe ja ranking-kelpoisuus erotetaan tarkoituksella eri vaiheisiin.</li>
          </ul>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">Julkaisusäännöt</p>
          <h2>Milloin yhtiö ei pääse mukaan rankingiin</h2>
          <ul className="plainList">
            <li>Yhtiö on finanssisektorilla ja jää ulos metodologisesta syystä.</li>
            <li>Rankingiin tarvittavat statementit puuttuvat tai ovat virheellisessä muodossa.</li>
            <li>EBIT on nolla tai negatiivinen.</li>
            <li>Enterprise Value on nolla tai negatiivinen.</li>
            <li>Sijoitetun pääoman nimittäjä on nolla tai negatiivinen.</li>
            <li>Sektoritieto puuttuu eikä metodologista rajaa voida varmistaa.</li>
          </ul>
        </article>
      </section>

      <section className="contentGrid">
        <article className="contentPanel">
          <p className="eyebrow">Miten poissulku näkyy tuotteessa</p>
          <h2>Käyttäjän näkökulma</h2>
          <ul className="plainList">
            <li>Etusivu näyttää raakauniversen, rankatut yhtiöt, poissulut ja finanssipoissulut erikseen.</li>
            <li>Poissululista kertoo syyn selkeällä suomenkielisellä tekstillä.</li>
            <li>Yhtiösivu aukeaa myös poissuljetuille riveille ja kertoo miksi yhtiö ei rankkaudu.</li>
          </ul>
        </article>

        <article className="contentPanel cautionPanel">
          <p className="eyebrow">Vastuuvapauslauseke</p>
          <h2>Ei sijoitusneuvontaa</h2>
          <p>
            Sovellus on henkilökohtaisen tutkimusprosessin tutkimusnäkymä. Sisältö ei ole sijoitusneuvontaa, kehotus ostaa tai
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
