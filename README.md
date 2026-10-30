# Magicformula-suomi

Suomenkielinen tutkimustyökalu Nasdaq Helsingin ja Nasdaq Stockholmin Main Market -yhtiöiden vertailuun. Python muodostaa lähteillä varmennetun listausuniversumin, normalisoi talousluvut ja tuottaa Next.js:n käyttämän staattisen JSON-aineiston.

Alusta on kehitysvaiheessa. Täysi listauskattavuus ei tarkoita täyttä talousdatan kattavuutta tai kaikkien lähdelukujen oikeellisuutta. Katso [aktiivinen suunnitelma](PLANS.md), [laskentatapa](docs/methodology/calculation.md) ja [lähdeotos](docs/methodology/source-audit-2026-10-29.md).

## Paikallinen kehitys

Luo Python-ympäristö ja asenna nykyiset riippuvuudet:

```powershell
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
npm ci
```

Käytä omaa codex/-haaraa. Tarkista ensin työpuu ja origin/main, säilytä keskeneräinen työ. Valmisteluhaara codex/paikallinen-jatkokehitys ja sen commit on säilytetty tämän kehityksen historiassa. Pushaa vain tehtävän sallimissa rajoissa ja avaa draft-PR; mainin yhdistäminen voi käynnistää tuotantojulkaisun.

## Datapäivitys

```powershell
python python_pipeline/scripts/fetch_nordic_universe.py
python python_pipeline/scripts/generate_financials_csv.py --skip-methodological
python python_pipeline/scripts/export_ranking_json.py
python python_pipeline/scripts/audit_universe.py --output output/data-audit.json
```

Nasdaq-haku tarkistaa HEL/STO Main Marketin Large/Mid/Small Cap- ja SPAC-segmentit sekä sivutuksen. Se päivittää samalla GLEIFin viralliset ISIN–LEI-linkit; Suomen täsmällisen juridisen nimiosuman fallback ei hyväksy sumeita osumia. Nasdaqin listausvarmennus ja yhtiötunnisteen ratkaisu ovat erillisiä vaiheita. Puuttuva LEI estää yhden yhtiön osakesarjojen luotettavan yhdistämisen, joten rivi ei pääse rankingiin.

Universe-CSV:t, universe_manifest.json, docs/audit/-lähdeotos, financials.csv ja financials.audit.json muodostavat yhden aineistokokonaisuuden. financial_source_checks.csv säilyttää käsin tarkistetut raporttivastaavuudet ja avoimet ristiriidat. Manifesti varmistaa listausjoukon ja tiedostojen tiivisteet ennen exporttia.

Taloushaku ei arvaa puuttuvaa kassaa, velkaa, periodia, valuuttaa tai EV:tä. Sen audit sisältää myös hakupuute- ja metodologiapoissulkusyyt. Rajattu lähdeotos voidaan kirjoittaa erilliseen tiedostoon:

```powershell
python python_pipeline/scripts/generate_financials_csv.py --tickers HEL:KNEBV,HEL:UPM,STO:ATCO-B,STO:VOLV-B --output output/sample.csv
```

## Tarkistukset

```powershell
python -m pytest -q
npm run lint
npm run build
npm run start -- --port 3000
```

Avaa http://localhost:3000. Varmenna Suomi/Ruotsi/yhteinen näkymä, haku, lajittelu, euromääräinen kokoraja, datalaatusuodatus ja poissulut sekä yhtiösivut (esimerkiksi /yhtio/HEL%3AKNEBV ja /yhtio/STO%3AATCO-B). Markkinasuodatus rajaa yhteisrankingin näkymää, eikä laske osarankkeja uudelleen.

Erillinen julkaisuportti:

```powershell
python python_pipeline/scripts/audit_universe.py --require-complete
```

Portti epäonnistuu tarkoituksella, kun listauskattavuus, datapuute tai lähdetäsmäytys on avoin. Tavallinen audit voi läpäistä aineiston sisäisen eheyden tämän silti ollessa keskeneräinen.

Windowsin sandbox voi estää pytestin temp-hakemiston tai Nextin realpath-operaation. Käytä sallittua työtilan temp-hakemistoa tai tavallisia kehitysoikeuksia; älä muuta riippuvuuksia ympäristövirheen peittämiseksi. Yritysproxyn sertifikaatit tulee asentaa luotettuun CA-ketjuun. TLS-tarkistusta ei poisteta käytöstä.

## Automaattinen päivitys ja julkaisu

.github/workflows/data-refresh.yml ajaa maanantaisin ja manuaalisesti listaus-/issuer-haun, taloushaun, exportin, auditin, lintin ja buildin. Se tallentaa aineiston artefaktiksi myös epäonnistuneella ajolla. Lähteiden ja kattavuuden julkaisuportin on mentävä läpi ennen automaattisen draft-data-PR:n avaamista. Workflow ei pushaa suoraan mainiin.

Staattinen sovellus voidaan myöhemmin julkaista Vercelissä; NEXT_PUBLIC_SITE_URL määrittää canonical- ja sitemap-osoitteet. Nykyinen tehtävä ei yhdistä mainiin eikä julkaise tuotantoon. Ei kirjautumista, salkkuja, kaupankäyntiä, backtestausta tai muita pörssejä.

Sisältö ei ole sijoitusneuvontaa eikä sijoitussuositus. Tarkista lähderaportit, päivät ja valuutat ennen tulkintaa.
