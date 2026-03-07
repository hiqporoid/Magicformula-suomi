import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Metodologia",
  description:
    "Lue miten Magic Formula, EBIT/EV, ROC, poissulut ja puuttuva data käsitellään Magicformula-suomi v1 -aineistossa.",
  alternates: {
    canonical: "/metodologia"
  }
};

const formulaRows = [
  {
    title: "Halpa suhteessa tulokseen",
    formula: "EBIT / Enterprise Value",
    note: "Tällä sivulla earnings yield tarkoittaa EBIT/EV-lukua. Mitä korkeampi luku, sitä parempi sijoitus rankissa."
  },
  {
    title: "Hyvä suhteessa pääomaan",
    formula: "EBIT / (Net PPE + nettokäyttöpääoma)",
    note: "ROC mittaa operatiivisen pääoman tuottoa. Nimittäjän on oltava positiivinen, muuten rivi ei ole vertailukelpoinen."
  },
  {
    title: "Lopullinen sijoitus",
    formula: "ROC-rank + EBIT/EV-rank",
    note: "Pienempi yhteispiste on parempi. Tasatilanteissa ticker toimii vakioituna tie-breakerina."
  }
];

const sourceRows = [
  {
    title: "Joel Greenblatt / Magic Formula Investing",
    href: "https://www.magicformulainvesting.com/How-It-Works",
    note: "Alkuperäisen idean tiivis kuvaus ja taustalogiikka."
  },
  {
    title: "Investopedia: Magic Formula Investing",
    href: "https://www.investopedia.com/terms/m/magic-formula-investing.asp",
    note: "Selkeä yhteenveto menetelmästä ja sen käytännön tulkinnasta."
  },
  {
    title: "Nasdaq: Helsinki listed companies",
    href: "https://www.nasdaq.com/solutions/european-listed-companies?market=helsinki",
    note: "Tausta Helsingin pörssin listatuille yhtiöille ja markkinaluokille."
  }
];

export default function MethodologyPage() {
  return (
    <main className="shellContainer pageStack pageOffset">
      <section className="heroSurface heroSurfaceCompact">
        <div className="heroMainCard">
          <div className="eyebrowRow">
            <p className="eyebrow">Metodologia</p>
            <span className="softBadge">Läpinäkyvä v1</span>
          </div>
          <h1>Miten tämä ranking lasketaan</h1>
          <p className="heroLead">
            Tällä sivulla Magic Formula tarkoittaa käytännössä kahta asiaa: halpa suhteessa tulokseen ja hyvä suhteessa
            operatiiviseen pääomaan. Alla näkyy, miten ne on laskettu tässä työkalussa.
          </p>
        </div>

        <aside className="heroSideCard">
          <div className="sideCardSection">
            <p className="eyebrow">Tiivistettynä</p>
            <ul className="plainList compactList">
              <li>Universe: Nasdaq Helsinki Main Market.</li>
              <li>Ranking: ROC + EBIT/EV vain kelpoisille ei-finanssiyhtiöille.</li>
              <li>Poissulut ja puuttuva data näytetään avoimesti UI:ssa.</li>
            </ul>
          </div>
          <div className="sideCardSection sideCardDivider">
            <Link href="/" className="textLink">
              Takaisin rankingiin
            </Link>
          </div>
        </aside>
      </section>

      <section className="contentGrid">
        <article className="contentPanel">
          <p className="eyebrow">Magic Formula</p>
          <h2>Mikä se on?</h2>
          <p>
            Joel Greenblattin Magic Formula on sääntöpohjainen arvosijoitusidea. Sen ydin on etsiä yhtiöitä, jotka ovat
            samaan aikaan tuottavia ja hinnaltaan houkuttelevia.
          </p>
          <p>
            Tässä sovelluksessa tuottavuutta mitataan ROC-luvulla ja hintaa EBIT/EV-luvulla. Tämä ei ole vain yleinen
            kuvaus strategiasta, vaan tarkka kuvaus siitä, miten ranking muodostuu tällä sivulla.
          </p>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">Tämän sivun toteutus</p>
          <h2>Mitä tunnuslukuja käytetään?</h2>
          <ul className="plainList compactList">
            <li>Earnings yield toteutetaan EBIT/EV-lukuna.</li>
            <li>Return on capital toteutetaan EBIT / (Net PPE + nettokäyttöpääoma).</li>
            <li>Rankingiin otetaan vain yhtiöt, joille molemmat luvut voidaan laskea järkevästi.</li>
            <li>Laatupiste näkyy mukana tulkinnan tukena, mutta ei muuta Magic Formula -sijoitusta.</li>
          </ul>
        </article>
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
          <p className="eyebrow">Näin pisteytys muodostuu</p>
          <h2>Miten laskenta tehdään tällä sivulla</h2>
          <ul className="plainList compactList">
            <li>Yhtiöjoukko alkaa Helsingin päälistan universesta.</li>
            <li>Financials-aineistosta haetaan EBIT, EV ja ROC:n tarvitsema pääomapohja.</li>
            <li>Jokainen kelpoinen yhtiö saa erillisen ROC-rankin ja EBIT/EV-rankin.</li>
            <li>Nämä kaksi rankia summataan yhdeksi Magic Formula -pisteeksi.</li>
            <li>Pienin yhteispiste on paras sijoitus.</li>
          </ul>
        </article>

        <article className="contentPanel cautionPanel">
          <p className="eyebrow">Poissulut</p>
          <h2>Miksi kaikki yhtiöt eivät rankkaudu</h2>
          <ul className="plainList compactList">
            <li>Finanssiyhtiöt rajataan pois metodologisena valintana.</li>
            <li>Puuttuvat statementit estävät laskennan.</li>
            <li>EBIT ≤ 0 tai EV ≤ 0 tekee EBIT/EV-luvusta epäkäytännöllisen.</li>
            <li>Negatiivinen tai nollaan menevä sijoitettu pääoma estää ROC-luvun vertailun.</li>
          </ul>
        </article>
      </section>

      <section className="contentGrid">
        <article className="contentPanel">
          <p className="eyebrow">Puuttuva data</p>
          <h2>Miten data käsitellään</h2>
          <ul className="plainList compactList">
            <li>Jos pakollinen luku puuttuu, yhtiötä ei pakoteta rankingiin.</li>
            <li>Poissulku näkyy etusivulla ja yrityssivulla suomenkielisenä syynä.</li>
            <li>Raw-universe säilyy näkyvissä, vaikka yksittäinen yhtiö ei olisi kelpoinen rankingiin.</li>
          </ul>
        </article>

        <article className="contentPanel mutedPanel">
          <p className="eyebrow">Lähteet ja lisälukeminen</p>
          <h2>Jos haluat tarkistaa taustan</h2>
          <ul className="plainList compactList">
            {sourceRows.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="textLink" target="_blank" rel="noreferrer">
                  {item.title}
                </Link>
                <div className="tableSubline">{item.note}</div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}