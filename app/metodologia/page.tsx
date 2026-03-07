import Link from "next/link";

const formulaRows = [
  {
    title: "ROC",
    formula: "EBIT / (Net PPE + nettokayttopaaoma)",
    note: "Mittaa operatiivisen paoman tuottoa. Nimittajan on oltava positiivinen, muuten rivi poistuu rankingista."
  },
  {
    title: "Earnings Yield / EBIT/EV",
    formula: "EBIT / Enterprise Value",
    note: "Arvioi tulostuottoa suhteessa yritysarvoon. EV <= 0 ei tuota mielekasta vertailulukua v1:ssa."
  },
  {
    title: "Magic Formula -piste",
    formula: "ROC-rank + Earnings Yield -rank",
    note: "Pienempi yhteispiste on parempi. Tasapisteissa ticker ratkaisee jarjestyksen deterministisesti."
  },
  {
    title: "Quality overlay",
    formula: "Kevyt 0-100 pisteytys",
    note: "Mukana on kannattavuus-, velkaisuus- ja vakauskomponentteja. Se ei kumoa perusrankingia, vaan auttaa tulkinnassa."
  }
];

export default function MethodologyPage() {
  return (
    <main className="container pageStack">
      <section className="panel heroSlim">
        <p className="eyebrow">Metodologia</p>
        <h1>Miten taman demon ranking muodostuu</h1>
        <p className="heroLead">
          v1-demo pyrkii olemaan selitettavissa rivi rivilta: mita mitataan, mita poistetaan, mita julkaistaan ja
          mita ei pideta sijoitusneuvontana.
        </p>
      </section>

      <section className="panel panelSpacious">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Kaavat</p>
            <h2>Nelja rakennuspalikkaa</h2>
          </div>
          <Link href="/" className="textLink">
            Takaisin rankingiin
          </Link>
        </div>
        <div className="formulaGrid">
          {formulaRows.map((item) => (
            <article key={item.title} className="formulaCard">
              <h3>{item.title}</h3>
              <p className="formulaValue">{item.formula}</p>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="infoGrid">
        <article className="panel">
          <p className="eyebrow">Poissulut</p>
          <h2>Milloin rivi ei paase mukaan</h2>
          <ul className="plainList">
            <li>Pakollinen talouskentta puuttuu tai ei ole numeerinen.</li>
            <li>Enterprise Value on nolla tai negatiivinen.</li>
            <li>Sijoitetun paoman nimittaja on nolla tai negatiivinen.</li>
            <li>Rivi olisi muuten niin puutteellinen, ettei ROC- tai EBIT/EV-vertailu ole mielekas.</li>
          </ul>
        </article>
        <article className="panel">
          <p className="eyebrow">Datan laatu</p>
          <h2>Mita kayttajan kannattaa huomioida</h2>
          <ul className="plainList">
            <li>Talousdata voi olla viiveellista ja myohemmin korjattua.</li>
            <li>Kertaluonteiset erat voivat nostaa tai painaa tunnuslukuja hetkellisesti.</li>
            <li>Finanssisektoria ei mallinneta erikseen v1:ssa, joten tulkinta vaatii harkintaa.</li>
            <li>Laatupiste on tulkintaa tukeva overlay, ei itsenainen sijoitussuositus.</li>
          </ul>
        </article>
      </section>

      <section className="panel notesGrid">
        <div>
          <p className="eyebrow">Selitettavyys UI:ssa</p>
          <h2>Mita naytetaan rankingin rinnalla</h2>
          <ul className="plainList">
            <li>Ranking-sivulla nakyvat erikseen sijoitus, MF-piste, ROC, EBIT/EV ja laatupiste.</li>
            <li>Yhtiosivu toistaa samat luvut ja kertoo, onko rivilla validointivaroituksia.</li>
            <li>Poissulut ja vastuuvapaus ovat omissa, helposti loydettavissa olevissa osioissaan.</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Vastuuvapaus</p>
          <h2>Ei sijoitusneuvontaa</h2>
          <p>
            Sovellus on henkilokohtaisen tutkimusprosessin demo. Sisalto ei ole sijoitusneuvontaa, ei kehotus ostaa
            tai myyda arvopapereita eika korvaa omaa analyysia.
          </p>
          <p>
            Jokainen kayttaja vastaa itse siita, miten tunnuslukuja tulkitsee, mita lisatietoa hankkii ja sopiiko
            mahdollinen sijoitus omaan tilanteeseen.
          </p>
        </div>
      </section>
    </main>
  );
}


