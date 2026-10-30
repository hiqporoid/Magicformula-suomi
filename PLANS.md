# PLANS.md

## Helsinki + Stockholm: luotettavuuskorjaus (29.10.2026)

Julkaisualue on Nasdaq Helsinki ja Nasdaq Stockholm Main Market. First North ei kuulu julkaisuun. Aiemmat julkaisuvalmiusmerkinnät kuvaavat teknistä demoa, eivät varmennettua markkinakattavuutta.

19. [x] **P0: varmennettu listausuniversumi ja laskennan virheportit**
    - Erottele todistettu Main Market -listaus, metodologinen poissulku ja datapuute; poista Yahoo-exchange/minimimäärä kattavuustodisteena.
    - Korjaa maakoodit, sektorit, listaus-/yhtiöavaimet, osakesarjat ja rinnakkaislistaukset.
    - Varmenna valuutat, 50 M€ -raja, yhteinen tilikausi, ROC-pääoma ja äärelliset luvut regressiotestein.
    - Tulos: Nasdaq Main Market HEL 148 / STO 409; segmentti-/sivutustodiste ja kanoniset tiedostotiivisteet. GLEIF-yhtiötunnisteet 136/148 ja 401/409 listauksella. Todistetut maakoodi-, sektori-, valuutta-, periodi-, tunniste- ja puuttuvan arvon virheet korjattu.
20. [x] **P1: läpinäkyvä export ja tutkimusnäkymä**
    - Yhteinen HEL+STO-ranking; markkinasuodatus ei muuta vertailujoukkoa.
    - Osarankingit, lähdeluvut, valuutat, ajankohdat, poissulkusyyt ja kattavuus pörsseittäin.
    - Tulos: yhteisranking 230 yhtiötä, tarkat lähdeluvut valuuttoineen/päivineen, osarankit sekä datapuute-/metodologialuokat. Selainvarmennus: HEL 62 / STO 168, suodattimet eivät muuta sijoituksia, neljä lähdeotosta näkyy yhtiösivuilla oikein.
21. [ ] **in-progress — P1: varmennus ja tarkistettava toimitus**
    - Python, lint, build, data-audit, selain ja pieni ensisijaisiin lähteisiin jäljitetty HEL/STO-otos.
    - Datapäivitys ei saa julkaista todentamatonta universumia tai ylikirjoittaa mainia tarkistamatta.
    - Päivitä menetelmä/ohjeet/lokit, tarkistetut commitit, push ja draft-PR. Ei mergeä eikä tuotantojulkaisua.
22. [ ] **Seuraava tärkein milestone: lähdekomponenttien täsmäytys ennen julkaisua**
    - Ratkaise KONE/UPM/Volvo-otoksen luokitteluerot, Atlas Copcon kassakomponentti sekä EV:n ja osakesarjojen yhtiötason arvostusperusta.
    - Sulje raportointi-/noteerausvaluutan erojen 34 lähdeaukkoa, puuttuvat issuer-tunnisteet ja muut talousdata-aukot; älä nosta rankattujen määrää oikeellisuustodisteeksi.
    - ESEF-lähteet tai lisensoitu fundamenttidata: toteutuspäätös ja mahdolliset käyttö-/uudelleenjakeluoikeudet erikseen. Ei maksullisia hankintoja tässä työssä.

Auditin lähtöhavainnot:
- **Todistetut virheet:** Sweden katkaistaan SW:ksi; ticker yksin yhdistämisavaimena; Unknown pääsee sektoritarkistuksesta; Yahoo-exchange sisältää First Northia; 50 miljoonan raja ilman valuuttaa; lähdeperiodit voivat erota; puuttuva käteinen muuttuu nollaksi.
- **Epävarmuudet:** nykyisen listan oikea Main Market -kattavuus, toimittajan valuutat/EV/periodit ja yhtiötunnisteet.
- **Puuttuvat ominaisuudet:** lähteellä varmennettu listausuniversumi, osarankit ja jäljitettävä valuutta-/päivämetadata UI:ssa sekä julkaisemisen estävä laatutarkistus.

## Paikallisen jatkokehityksen valmistelu (21.10.2026)

18. [x] Synkronoi paikallinen työ GitHubin uusimpaan main-haaraan
   - [x] Varmuuskopioi muutokset ja Git-historia sekä selvitä paikalliset erot.
   - [x] Päivitä main, säilytä tarpeelliset korjaukset ja poista datan konfliktit.
   - [x] Aja Python-testit, frontend-lint ja build sekä dokumentoi jatkokehityksen työjärjestys.
   - Tulos: main = origin/main (`93c86f6`), valmistelut haarassa `codex/paikallinen-jatkokehitys`; 24 testiä, lint ja build läpäisty.
   - Ei pushia tai julkaisua tässä tehtävässä.

## Seuraavat selvitettävät asiat

- [x] Unknown-sektorit korjattu virallisella Nasdaq-sektorilla; puuttuva sektori on datapuute.
- [x] SW/SE normalisoitu; kotimaa ei aiheuta virheellistä foreign-poissulkua.
- [x] Helsinki+Stockholm-rajauksen ristiriitaiset projektiohjeet päivitetty.

## v1 Toteutussuunnitelma (milestones)

1. [x] Repository bootstrap
   - AGENTS.md, AI.md, progress.md, lessons.md, PLANS.md
   - Repo-skillien runko

2. [x] Market universe data source
   - Helsingin paalistan universe-strategia
   - Sisaan/ulos-kriteerit dokumentoituna

3. [x] Financial normalization pipeline
   - Syotedatan skeema
   - Normalisointisaannot ja validoinnit

4. [x] Magic Formula ranking engine
   - ROC + Earnings Yield
   - Deterministinen ranking ja testit

5. [x] EBIT/EV ranking engine
   - EBIT/EV laskenta ja testit

6. [x] Quality overlay
   - Kevyt laatupisteytys
   - Yhdistelmapisteet ja painotus

7. [x] Frontend UI
   - Ranking-taulukko, lajittelu, suodatus
   - Metodologia- ja disclaimer-linkit

8. [x] Methodology and disclaimers
   - Kaavat, oletukset, datarajat
   - Riskit ja ei-sijoitussuositus -teksti

9. [x] GitHub automation
   - Ajastettu datapaivitysworkflow
   - Perusvalidointi CI:ssa

10. [x] Validation and launch readiness
   - End-to-end tarkistuslistat
   - Julkaisupaatoksen kriteerit

11. [x] Full Main Market universe before deploy
   - Eroteltu raw universe, ranking-kelpoiset ja poissuljetut syineen
   - Finanssipoissulut tehty nakyviksi datassa, UI:ssa ja metodologiassa

12. [x] Financials coverage expansion before deploy
   - Yahoo-pohjainen financials-generator koko universelle
   - Valtaosa yhtiosta siirtynyt missing-statements-tilasta oikeaan rankingiin tai perusteltuun poissulkuun
13. [x] Static deploy and data refresh readiness
   - Vercel-deployohjeet ja metadata lukittu v1-julkaisuun
   - Data-refresh generoi financials.csv:n ja ranking-v1.json:n seka commitoi muuttuneen datasetin hallitusti
14. [x] AI/tech visual identity pass
   - Dark-first research-tool design system, yhtenÃƒÂ¤iset pinnat, kontrollit ja status-tilat
   - Hillitty motion, taulukoiden luettavuuden nosto ja state-sivujen visuaalinen yhtenÃƒÂ¤istÃƒÂ¤minen
15. [x] Screener information pass
   - Etusivulle datalÃ¤hde- ja pÃ¤ivitysalue sekÃ¤ markkina-arvo nÃ¤kyvÃ¤ksi
   - Yrityssivu yksinkertaistettu perustietoihin, finanssidataan ja poissulkuihin
16. [x] Methodology and density pass
   - Typografia ja spacing tiivistetty finance-dashboard -henkisiksi
   - Metodologiasivu tiivistetty laskentaselosteeksi lähteineen
17. [x] Nordic expansion readiness + exchange filter
   - Varmista universen kattavuus ja poissulkujen laatu Helsingin päälistalla audit-scriptillä
   - Lisää exchange-kenttä universen skeemaan ja UI:hin pörssisuodatin (HEL valmisteltu, STO seuraava)
   - Dokumentoi Ruotsi-laajennuksen minimivaatimukset (uusi universe + financials-symbolikartta + disclaimer-päivitys)
