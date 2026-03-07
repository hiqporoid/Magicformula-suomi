# AGENTS.md

## Projektin missio
Rakentaa suomenkielinen tutkimuspainotteinen verkkosovellus Nasdaq Helsinki Main Market -yhtiöiden arvosijoitusvertailuun (Magic Formula, EBIT/EV, laatu-overlay), läpinäkyvästi ja toistettavasti.

## Tuotteen luonne
- Tämä repository rakentaa **henkilökohtaista sijoitustutkimussovellusta**, ei sijoitusneuvontaohjelmistoa.
- Kaikki tuotokset esitetään tutkimuksellisina, ei sijoitussuosituksina.

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

## Skill-arkkitehtuuri ja käyttö
Käytä vain repositoryn omia, rajattuja skillejä. Yksi tehtävä voi käyttää useaa skilliä, mutta valitse pienin toimiva joukko.

1. `helsinki-universe`
   - Käytä kun muokkaat universen sisään/ulos-kriteerejä tai listauslähteitä.
   - Tiedostot: `docs/methodology/universe.md`, `python_pipeline/data/*`.
2. `financial-data-normalization`
   - Käytä kun muutat syöteskeemaa, puuttuvien arvojen logiikkaa tai validointia.
   - Tiedostot: `python_pipeline/magicformula/normalization.py`, `python_pipeline/tests/test_normalization.py`.
3. `magic-formula-ranking`
   - Käytä kun muutat ROC/Earnings Yield/EBIT/EV-kaavoja, tie-breakereita tai rankkien yhdistämistä.
   - Tiedostot: `python_pipeline/magicformula/ranking.py`, `python_pipeline/tests/test_ranking.py`, `docs/methodology/*`.
4. `value-quality-overlay`
   - Käytä kun muutat laatupisteytyksen komponentteja, painoja tai yhdistelmäpisteen logiikkaa.
   - Tiedostot: `python_pipeline/magicformula/quality.py`, `python_pipeline/tests/test_quality.py`.
5. `nextjs-finance-table-ui`
   - Käytä kun muutat ranking-taulukon rakennetta, sarakkeita tai datalaadun näkyvyyttä.
   - Tiedostot: `app/*`, `src/components/*`, `src/lib/*`.
6. `finance-validation-and-disclaimer`
   - Käytä kun muutat validointikriteerejä, riskiviestejä tai disclaimer-tekstiä.
   - Tiedostot: `docs/methodology/disclaimer.md`, validointilogiikka pipeline-moduuleissa, UI-varoitustekstit.
7. `github-actions-data-refresh`
   - Käytä kun muutat datapäivityksen ajoitusta, CI-pipelinea tai artifact-raportointia.
   - Tiedostot: `.github/workflows/data-refresh.yml`.

Jos skill on liian geneerinen tehtävään nähden, täsmennä skilliä ennen laajaa toteutusta.

## Sub-agent-strategia (käytännöllinen)
Käytä sub-agentteja vain, kun työ ulottuu useaan komponenttiin tai vaatii rinnakkaista domain-työtä.

- **Data agent**: syöteskeema, normalisointi, poissulut, laaturaportit.
- **Finance methodology agent**: kaavojen oikeellisuus, fallback-logiikka, sektoripoikkeukset.
- **Frontend agent**: ranking-taulukon informaatioarkkitehtuuri, selitteet, datalaadun näkyvyys.
- **Validation/risk agent**: validointisäännöt, riski/disclaimer-tekstit, julkaisuportit.

Työjärjestys:
1. Anna agentille tarkka rajattu alitehtävä + output-muoto.
2. Odota kaikki tuotokset.
3. Konsolidoi yhdeksi päätoteutukseksi ilman päällekkäisiä refaktoreita.
4. Varmista yhteinen terminologia dokumenteissa ja koodissa.

## Dokumentaation päivityssäännöt
- Päivitä AI.md kun tavoitteet, menetelmä tai workflow muuttuu.
- Päivitä PLANS.md kun milestone valmistuu tai prioriteetti muuttuu.
- Päivitä metodologiadokit (`docs/methodology/*`) kun kaavat tai disclaimerit muuttuvat.

## progress.md ja lessons.md -päivitysvelvoite
Jokaisen **merkittävän tehtävän** lopussa:
1. Lisää `progress.md`:ään uusi numeroitu lokirivi (mitä tehtiin, tulos, seuraava askel).
2. Lisää `lessons.md`:ään vähintään yksi konkreettinen oppi (virhe, korjaus tai uudelleenkäytettävä malli).

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
