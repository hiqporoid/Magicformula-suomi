# AGENTS.md

## Projektin missio
Rakentaa suomenkielinen tutkimuspainotteinen verkkosovellus Nasdaq Helsinki Main Market -yhtiöiden arvosijoitusvertailuun (Magic Formula, EBIT/EV, laatu-overlay), läpinäkyvästi ja toistettavasti.

## Työskentelysäännöt
- Tee kaikki tuotokset ensisijaisesti suomeksi.
- Pidä scope tiukkana: toteuta vain nykyisen tehtävän kannalta välttämätön.
- Suosi yksinkertaisia ratkaisuja ennen abstrahointia.
- Älä lisää uusia riippuvuuksia ilman selkeää hyötyä.
- Erottele data/pipeline, laskenta ja UI selkeisiin kerroksiin.

## Koodin laatuodotukset
- Käytä tyyppiturvallisuutta (TypeScript) UI-kerroksessa.
- Pidä funktiot pieninä ja testattavina.
- Dokumentoi ei-ilmeinen rahoituslogiikka heti koodin yhteydessä.
- Noudata determinististä lajittelua rankingissa (tasatilanteet ratkaistaan vakioidusti).

## Testausodotukset
- Lisää vähintään yksikkötestit ranking-laskennalle.
- Validioi datan normalisointi testitapauksilla (puuttuvat arvot, nollajakajat, negatiiviset arvot).
- Aja vähintään: Python-testit + frontend-lint/test (tai vastaava tarkistus).
- Älä mergeä ilman, että keskeiset laskentatestit menevät läpi.

## Arkkitehtuurirajat v1
- Universe: vain Nasdaq Helsinki Main Market.
- Datalähteet: metadata + talousluvut yhtenäistettyyn välitauluun.
- Ranking-moottorit: Magic Formula ja EBIT/EV erillisinä moduuleina.
- Quality overlay: kevyt pistemalli, ei ML:ää v1:ssä.
- UI: listaus- ja suodatusnäkymä, ei käyttäjätunnuksia v1:ssä.

## Dokumentaation päivityssäännöt
- Päivitä AI.md kun tavoitteet, menetelmä tai workflow muuttuu.
- Päivitä PLANS.md kun milestone valmistuu tai prioriteetti muuttuu.
- Päivitä metodologiadokit (`docs/methodology/*`) kun kaavat tai disclaimerit muuttuvat.

## progress.md ja lessons.md -päivitysvelvoite
Jokaisen **merkittävän tehtävän** lopussa:
1. Lisää `progress.md`:ään uusi numeroitu lokirivi (mitä tehtiin, tulos, seuraava askel).
2. Lisää `lessons.md`:ään vähintään yksi konkreettinen oppi (virhe, korjaus tai uudelleenkäytettävä malli).

## PLANS.md:n käyttö
- Käytä PLANS.md:tä aktiivisena etenemissuunnitelmana ennen laajaa toteutusta.
- Pilko työ milestoneihin ja pidä yksi milestone kerrallaan in-progress.
- Merkitse valmiit kohdat heti valmistumisen jälkeen.

## Sub-agenttien käyttö
Luo alitehtävä/sub-agentti kun:
- tarvitaan syvää domain-analyysiä (esim. rahoitusmetodologia),
- tehtävä voidaan tehdä rinnakkain ilman päällekkäisiä tiedostomuutoksia,
- tai epäselvä alue hyötyy erillisestä vaihtoehtovertailusta.

Sub-agentin jälkeen: konsolidoi tuotokset yhteen päätoteutukseen, poista ristiriidat, varmista yhteinen terminologia.

## Projektikohtaiset skillit (.agents/skills)
Käytä seuraavia taitoja tilanteen mukaan:
- `helsinki-universe`: universe-määrittely, listauskriteerit ja poissulut.
- `financial-data-normalization`: raakatalousdatan yhtenäistys ja validointi.
- `magic-formula-ranking`: ROC + Earnings Yield -rankinglogiikka.
- `value-quality-overlay`: arvon ja laadun yhdistetty pisteytys.
- `nextjs-finance-table-ui`: taulukkopohjainen Next.js-näkymä.
- `finance-research-ui`: finance/dashboard-tyylinen v1-käyttöliittymä, visuaalinen hierarkia, taulukoiden luettavuus, datan laadun esitys, suomenkielinen UI-copy sekä AI/tech-henkinen design-system ja hillitty motion-kieli. Käytä kun tehtävä koskee laajempaa UI-auditointia, UI-uudistusta, design-systemin viimeistelyä tai nykyisen näkymän uskottavuuden nostamista.
- `finance-validation-and-disclaimer`: validointisäännöt ja riskitekstit.
- `github-actions-data-refresh`: datapäivitysautomaation workflowt.

## Scope-kuri ja overengineeringin esto
- Toteuta v1:een vain pakolliset ominaisuudet, kirjaa ideat myöhempään backlogiin.
- Vältä geneeristä framework-kerrosta, jos yksinkertainen moduuli riittää.
- Lisää laajennuspiste vasta, kun vähintään kaksi todellista käyttötarvetta on olemassa.
