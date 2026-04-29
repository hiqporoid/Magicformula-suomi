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
   - Voit tuoda yhdistetyn HEL+STO-listan tiedostoon `/tmp/nordic_universe.csv` (kentat: `ticker_yf,ticker_local,company,sector,country,exchange`) ja ajaa `python python_pipeline/scripts/import_nordic_universe.py`.
3. Generoi financials-taulu komennolla `python python_pipeline/scripts/generate_financials_csv.py`.
4. Aja JSON-export komennolla `python python_pipeline/scripts/export_ranking_json.py`.
5. Aja universe-audit komennolla `python python_pipeline/scripts/audit_universe.py`.
6. Aja tarkistukset: `pytest -q`, `npm run lint`, `npm run build`.
7. Tarkista keskeiset reitit (`/`, `/metodologia`, `/yhtio/<ticker>`, `/robots.txt`, `/sitemap.xml`).
8. Pushaa `main`-branchiin, jonka Vercel deployaa tuotantoon.
9. GitHub Actionsin `data-refresh.yml` voi paivittaa `financials.csv`:n ja `ranking-v1.json`:n ajastetusti tai manuaalisesti suoraan `main`-branchiin.
10. Paivita `progress.md` ja `lessons.md`.

## AGENTS.md:n rooli
`AGENTS.md` on auktoritatiivinen Codex-ajonaikainen ohjaustiedosto (miten agentti toimii tassa repossa).

`AI.md` on ihmisille suunnattu projektikasikirja, joka tukee tulevia yllapitajia ja kontribuoijia mutta ei ohita `AGENTS.md`:n toimintaohjeita.
