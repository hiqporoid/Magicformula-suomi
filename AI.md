# AI.md

## Mika projekti on?
Magicformula-suomi on suomenkielinen sijoitustutkimuksen web-sovellus, joka keskittyy Nasdaq Helsinki Main Market -yhtioihin. Tavoite on tarjota lapinakyva, toistettava ja helposti esiteltava tapa vertailla yhtioita arvo- ja laatumittareilla.

## Liikeidea
- Muodostetaan yhdenmukainen yhtiouniversumi (Helsingin paalista).
- Normalisoidaan talousdata vertailukelpoiseksi.
- Lasketaan rankingit (Magic Formula, EBIT/EV, quality overlay).
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
- V1 ei tee sijoitussuosituksia, vaan tarjoaa tutkimusnakyman.

## Rajaukset
- Vain Nasdaq Helsinki Main Market v1:ssa.
- Ei reaaliaikaista kaupankayntia, ei broker-integraatioita.
- Ei kayttajakohtaisia portfolioita v1:ssa.
- Ei tietokantaa, kirjautumista tai live-backendia.

## Repon workflow
1. Paivita suunnitelma (`PLANS.md`) ennen isompaa toteutusta.
2. Aja JSON-export tarvittaessa ennen frontend-verifiointia.
3. Aja tarkistukset: `pytest`, `npm run lint`, `npm run build`.
4. Tarkista keskeiset reitit (`/`, `/metodologia`, `/yhtio/<ticker>`, `/robots.txt`, `/sitemap.xml`).
5. Pushaa `main`-branchiin, jonka Vercel deployaa tuotantoon.
6. Anna GitHub Actionsin paivittaa ranking-JSON ajastetusti tai kaynnista refresh manuaalisesti.
7. Paivita `progress.md` ja `lessons.md`.

## AGENTS.md:n rooli
`AGENTS.md` on auktoritatiivinen Codex-ajonaikainen ohjaustiedosto (miten agentti toimii tassa repossa).

`AI.md` on ihmisille suunnattu projektikasikirja, joka tukee tulevia yllapitajia ja kontribuoijia mutta ei ohita `AGENTS.md`:n toimintaohjeita.