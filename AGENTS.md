# AGENTS.md

## Projektin missio
Rakentaa suomenkielinen tutkimuspainotteinen verkkosovellus Nasdaq Helsinki Main Market -yhtiöiden arvosijoitusvertailuun (Magic Formula, EBIT/EV, laatu-overlay), läpinäkyvästi ja toistettavasti.

## Tuotteen luonne
- Tämä repository rakentaa **henkilökohtaista sijoitustutkimussovellusta**, ei sijoitusneuvontaohjelmistoa.
- Kaikki tuotokset on esitettävä tutkimuksellisina, ei sijoitussuosituksina.

## Työskentelysäännöt
- Tee kaikki tuotokset ensisijaisesti suomeksi.
- Pidä scope tiukkana: toteuta vain nykyisen tehtävän kannalta välttämätön.
- Pidä diffit rajattuina ja vältä tehtävään liittymättömiä refaktorointeja.
- Suosi yksinkertaisia ratkaisuja ennen abstrahointia.
- Älä lisää uusia riippuvuuksia ilman selkeää hyötyä.
- Erottele data/pipeline, laskenta ja UI selkeisiin kerroksiin.

## Koodin laatuodotukset
- Käytä tyyppiturvallisuutta (TypeScript) UI-kerroksessa.
- Pidä funktiot pieninä ja testattavina.
- Dokumentoi ei-ilmeinen rahoituslogiikka heti koodin yhteydessä.
- Noudata determinististä lajittelua rankingissa (tasatilanteet ratkaistaan vakioidusti).
- Jokaisen tärkeän talousmittarin kaava ja fallback-logiikka on dokumentoitava.
- Puuttuvaa tai matalan luottamuksen dataa ei saa koskaan käsitellä hiljaisesti validina.

## Testausodotukset
- Lisää vähintään yksikkötestit ranking-laskennalle.
- Validioi datan normalisointi testitapauksilla (puuttuvat arvot, nollajakajat, negatiiviset arvot).
- Aja vähintään: Python-testit + frontend-lint/test (tai vastaava tarkistus).
- Älä mergeä ilman, että keskeiset laskentatestit menevät läpi.

## Arkkitehtuurirajat v1
- Universe: vain Nasdaq Helsinki Main Market.
- Datalähteet: metadata + talousluvut yhtenäistettyyn välitauluun.
- Ranking-moottorit: Magic Formula ja EBIT/EV erillisinä moduuleina.
- Magic Formula v1: **sulje finanssiyhtiöt pois**, ellei niitä varten ole erillinen eksplisiittinen malli.
- Quality overlay: kevyt pistemalli, ei ML:ää v1:ssä.
- UI: listaus- ja suodatusnäkymä, ei käyttäjätunnuksia v1:ssä.
- v1 pidetään yksinkertaisena: ei authia, ei billingiä, ei tietokantaa ilman selkeää välttämättömyyttä.
- Suosi staattisia tai generoituja JSON-tuotoksia live-backendin sijaan.

## Selitettävyys ja näkyvyys
- Jokainen ranking-ulostulo on oltava selitettävissä (mittarit, pisteytys, tie-breakerit).
- UI:n on näytettävä datan laatu, puuttuvat tiedot ja poissulut näkyvästi.

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

Jos työ ulottuu useaan komponenttiin (esim. pipeline + ranking + UI + dokumentaatio), käytä sub-agentteja ja konsolidoi tulokset yhteen yhtenäiseen toteutukseen.

Sub-agentin jälkeen: konsolidoi tuotokset yhteen päätoteutukseen, poista ristiriidat, varmista yhteinen terminologia.

## Projektikohtaiset skillit (.agents/skills)
Käytä seuraavia taitoja tilanteen mukaan:
- `helsinki-universe`: universe-määrittely, listauskriteerit ja poissulut.
- `financial-data-normalization`: raakatalousdatan yhtenäistys ja validointi.
- `magic-formula-ranking`: ROC + Earnings Yield -rankinglogiikka.
- `value-quality-overlay`: arvon ja laadun yhdistetty pisteytys.
- `nextjs-finance-table-ui`: taulukkopohjainen Next.js-näkymä.
- `finance-validation-and-disclaimer`: validointisäännöt ja riskitekstit.
- `github-actions-data-refresh`: datapäivitysautomaation workflowt.

## Scope-kuri ja overengineeringin esto
- Toteuta v1:een vain pakolliset ominaisuudet, kirjaa ideat myöhempään backlogiin.
- Vältä geneeristä framework-kerrosta, jos yksinkertainen moduuli riittää.
- Lisää laajennuspiste vasta, kun vähintään kaksi todellista käyttötarvetta on olemassa.

## Task closeout checklist
Ennen työsession päättämistä Codexin tulee varmistaa:
1. Tehtävän scope on täytetty ilman sivuvaikutteisia muutoksia.
2. Kaikki muuttuneet kaavat/fallbackit on dokumentoitu.
3. Testit/tarkistukset on ajettu tai ympäristörajoite raportoitu.
4. `progress.md` on päivitetty uudella numeroidulla kirjauksella.
5. `lessons.md` sisältää vähintään yhden konkreettisen opin.
6. Commit-viesti kuvaa muutoksen tarkoituksen selkeästi.
