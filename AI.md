# AI.md

## Mikä projekti on?
Magicformula-suomi on uusi sijoitustutkimuksen web-sovellus, joka keskittyy Nasdaq Helsinki Main Market -yhtiöihin. Tavoite on tarjota läpinäkyvä, toistettava ja suomenkielinen tapa vertailla yhtiöitä arvo- ja laatumittareilla.

## Liikeidea
- Muodostetaan yhdenmukainen yhtiöuniversumi (Helsingin päälista).
- Normalisoidaan talousdata vertailukelpoiseksi.
- Lasketaan rankingit (Magic Formula, EBIT/EV, quality overlay).
- Esitetään tulokset selkeässä taulukko-UI:ssa metodologian ja riskihuomioiden kanssa.

## Tuotetavoitteet v1
1. Toimiva universe-rajauksen prosessi.
2. Deterministinen datanormalisointi ja ranking-laskenta.
3. Selkeä käyttöliittymä rankinglistoille.
4. Dokumentoitu metodologia ja vastuuvapautus.
5. Automatisoitu datapäivityksen perusrunko GitHub Actionsilla.

## Menetelmälliset periaatteet
- Kaikki kaavat dokumentoidaan (`docs/methodology`).
- Rankingin tasatilanteet ratkaistaan eksplisiittisesti.
- Puuttuvat/poikkeavat arvot käsitellään ennalta määritetyillä säännöillä.
- V1 ei tee sijoitussuosituksia, vaan tarjoaa tutkimusnäkymän.

## Rajaukset
- Vain Nasdaq Helsinki Main Market v1:ssä.
- Ei reaaliaikaista kaupankäyntiä, ei broker-integraatioita.
- Ei käyttäjäkohtaisia portfolioita v1:ssä.

## Repon workflow
1. Päivitä suunnitelma (`PLANS.md`) ennen isompaa toteutusta.
2. Toteuta pienissä, testattavissa paloissa.
3. Aja testit/tarkistukset.
4. Päivitä `progress.md` ja `lessons.md`.
5. Tee commit ja PR.

## AGENTS.md:n rooli
`AGENTS.md` on **auktoritatiivinen Codex-ajonaikainen ohjaustiedosto** (miten agentti toimii tässä repossa).

`AI.md` on **ihmisille suunnattu projektikäsikirja**, joka tukee tulevia ylläpitäjiä ja kontribuoijia mutta ei ohita AGENTS.md:n toimintaohjeita.
