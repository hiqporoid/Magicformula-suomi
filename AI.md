# AI.md

## Mika projekti on?
Magicformula-suomi on suomenkielinen sijoitustutkimuksen web-sovellus, joka keskittyy Nasdaq Helsinki Main Market -yhtioihin. Tavoite on tarjota lapinakyva, toistettava ja helposti esiteltava tapa vertailla yhtioita arvo- ja laatumittareilla.

## Liikeidea
- Muodostetaan yhdenmukainen yhtiouniversumi (Helsingin paalista).
- Universe-riveilla kaytetaan `exchange`-kenttaa, jotta usean porssin tuki voidaan lisata ilman datamallin rikkomista.
- Yllapidetaan universe ja generoitu financials-taulu erillisina lahteina.
- Lasketaan rankingit (Magic Formula, EBIT/EV, quality overlay) vain kelpoisille riveille.
- Esitetaan tulokset selkeassa taulukko-UI:ssa metodologian, datalaatuviestien ja disclaimerien kanssa.

## Tuotetavoitteet v1
1. Toimiva universe-rajauksen prosessi.
2. Deterministinen datanormalisointi ja ranking-laskenta.
3. Siisti ja uskottava kayttoliittyma rankinglistoille.
4. Dokumentoitu metodologia ja vastuuvapautus.
5. Julkaisupolku, jossa deploy ja datapaivitys toimivat ilman live-backendia.

## Menetelmalliset periaatteet
- Kaikki kaavat dokumentoidaan (`docs/methodology`).
- Rankingin tasatilanteet ratkaistaan eksplisiittisesti.
- Puuttuvat tai poikkeavat arvot kasitellaan ennalta maaratetyilla saannoilla.
- Raw-universe, ranking-kelpoisuus ja poissulut pidetaan erillisina kasitteina.
- V1 ei tee sijoitussuosituksia, vaan tarjoaa tutkimusnakyman.

## Rajaukset
- Vain Nasdaq Helsinki Main Market v1:ssa.
- Ei reaaliaikaista kaupankayntia, ei broker-integraatioita.
- Ei kayttajakohtaisia portfolioita v1:ssa.
- Ei tietokantaa, kirjautumista tai live-backendia.

## Repon workflow
1. Paivita suunnitelma (`PLANS.md`) ennen isompaa toteutusta.
2. Paivita tarvittaessa `python_pipeline/data/main_market_universe.csv` (sis. `exchange`, esim. `HEL`).
   - Hae ensin koko HEL+STO universe (>=50M markkina-arvo) komennolla `python python_pipeline/scripts/fetch_nordic_universe.py`, joka kirjoittaa tiedoston `/tmp/nordic_universe.csv`.
   - Tuo sen jälkeen yhdistetty lista projektiin komennolla `python python_pipeline/scripts/import_nordic_universe.py` (skripti varmistaa minimitason HEL>=96 ja STO>=151).
3. Generoi financials-taulu komennolla `python python_pipeline/scripts/generate_financials_csv.py`.
4. Aja JSON-export komennolla `python python_pipeline/scripts/export_ranking_json.py`.
5. Aja universe-audit komennolla `python python_pipeline/scripts/audit_universe.py`.
6. Aja tarkistukset: `pytest -q`, `npm run lint`, `npm run build`.
7. Tarkista keskeiset reitit (`/`, `/metodologia`, `/yhtio/<ticker>`, `/robots.txt`, `/sitemap.xml`).
8. Tee kehitysmuutokset omassa `codex/<tehtävä>`-haarassa. Kun tehtävässä on lupa puskea, vie tarkistettu haara GitHubiin ja yhdistä se katselmoinnin jälkeen `main`-haaraan; Vercel julkaisee `main`-päivityksen. Noudata tehtäväkohtaista push- ja julkaisurajausta.
9. GitHub Actionsin `data-refresh.yml` voi paivittaa `financials.csv`:n ja `ranking-v1.json`:n ajastetusti tai manuaalisesti suoraan `main`-branchiin.
10. Paivita `progress.md` ja `lessons.md`.

## Paikallinen jatkokehitys Codexilla

- Lue aluksi `AGENTS.md`, `PLANS.md` sekä `progress.md` ja `lessons.md`.
- Tarkista `git status --short --branch` ja hae tuore etätila komennolla `git fetch origin`. Säilytä keskeneräinen työ commitissa tai nimetyssä stashissa ennen haaran vaihtoa tai päivitystä.
- Päivitä puhdas `main` komennolla `git merge --ff-only origin/main` ja aloita uusi tehtävä komennolla `git switch -c codex/<tehtävä>`. Jos fast-forward ei onnistu, selvitä haarojen ero ennen jatkamista.
- Toteuta yksi rajattu tehtävä, aja Python-testit, lint ja build sekä tarkista muuttunut toiminto. Muodosta datan export uudelleen vain, jos tehtävä koskee dataa tai exportin sisältöä.
- Päivitä suunnitelma ja lokit, tarkista diff ja tee paikallinen commit. Pushaa tehtävän sallimissa rajoissa komennolla `git push -u origin codex/<tehtävä>` ja tee pull request.
- Data Refresh voi päivittää GitHubin `main`-haaraa kehitystyön aikana. Hae siksi etätila uudelleen ennen yhdistämistä ja aja tarkistukset uudelleen, jos yhdistämisessä muuttuu koodia tai dataa.
- Tarkistukset ja commit eivät itsessään julkaise sivua. `main`-haaran push tai pull requestin yhdistäminen voi käynnistää tuotantojulkaisun; muun haaran push voi käynnistää esikatselubuildin.

## AGENTS.md:n rooli
`AGENTS.md` on auktoritatiivinen Codex-ajonaikainen ohjaustiedosto (miten agentti toimii tassa repossa).

`AI.md` on ihmisille suunnattu projektikasikirja, joka tukee tulevia yllapitajia ja kontribuoijia mutta ei ohita `AGENTS.md`:n toimintaohjeita.
