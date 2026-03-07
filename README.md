# Magicformula-suomi

Suomenkielinen v1-julkaisu Nasdaq Helsinki Main Market -yhtioiden arvoseulontaan. Projekti yhdistaa Python-pipelinen, staattisen JSON-exportin ja Next.js-kayttoliittyman samaan tutkimusnakymaan.

## Mita repo tekee

- muodostaa yhtioukon Nasdaq Helsinki Main Market -universumista
- generoi talousluvut Yahoo Finance -lahteesta tiedostoon `python_pipeline/data/financials.csv`
- laskee Magic Formula-, EBIT/EV- ja quality overlay -luvut
- exporttaa tulokset tiedostoon `src/data/ranking-v1.json`
- renderoi ranking-, metodologia- ja yhtiosivut samasta datasetista

## Python-datan lahteet v1:ssa

- `python_pipeline/data/main_market_universe.csv`: yllapidettava Main Market -raakauniverse
- `python_pipeline/data/financials.csv`: generoitu talouslukutaulu rankingiin tarvittaville kentille
- `src/data/ranking-v1.json`: frontendin suoraan kayttama export

`financials.csv` muodostetaan skriptilla `python_pipeline/scripts/generate_financials_csv.py`.
Skripti hakee Yahoo Financesta vuosittaiset statementit, kayttaa ensisijaisesti suoraa `.HE`-symbolia, tekee tunnetuille tickerimuutoksille alias-korjaukset ja laskee enterprise valuen tarvittaessa market capin ja nettovelan kautta.

## Suositeltu julkaisutapa v1:lle

Yksinkertaisin ja vakain vaihtoehto talle repossa olevalle Next.js-sovellukselle on Vercel.

Miksi:
- Next.js tunnistuu suoraan ilman omaa deploy-konfiguraatiota
- `main`-branchin pushit voidaan julkaista automaattisesti
- app router, metadata, sitemap ja OG-kuvat toimivat ilman erillista palvelin- tai CDN-rakennetta
- projekti ei tarvitse tietokantaa, authia tai omaa backendia, joten lisainfra olisi turhaa

## Vercel deploy vaihe vaiheelta

1. Tuo repo Verceliin ja valitse frameworkiksi Next.js.
2. Aseta Production Branchiksi `main`.
3. Aseta environment variable `NEXT_PUBLIC_SITE_URL=https://oma-tuotantodomain.fi`.
4. Pida install-komento oletuksena `npm install` tai `npm ci`.
5. Pida build-komento oletuksena `npm run build`.
6. Ala maarita erillista Output Directorya.
7. Varmista ennen deployta, etta `python_pipeline/data/financials.csv` ja `src/data/ranking-v1.json` ovat ajantasalla repossa.
8. Kaynnista ensimmainen deploy `main`-branchista.

Julkaisun jalkeen:
- Vercel rakentaa sovelluksen repoon commitoidusta staattisesta datasetista.
- `NEXT_PUBLIC_SITE_URL` ohjaa canonical-, robots-, sitemap- ja Open Graph -urlit oikeaan tuotantodomainiin.
- Jokainen `main`-branchin datapaivitys laukaisee uuden tuotantodeployn ilman erillista backendia.

## Windows-lokaalikehitys

### 1. Luo Python-virtuaaliymparisto

```powershell
py -3.11 -m venv .venv
```

### 2. Aktivoi venv

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Asenna Python-riippuvuudet

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Generoi financials.csv

```powershell
python python_pipeline\scripts\generate_financials_csv.py
```

Komento paivittaa tiedoston `python_pipeline/data/financials.csv` koko universelle niin laajasti kuin lahde sallii.

### 5. Generoi ranking JSON

```powershell
python python_pipeline\scripts\export_ranking_json.py
```

Komento paivittaa tiedoston `src/data/ranking-v1.json`, jota frontend kayttaa suoraan.

### 6. Asenna frontend-riippuvuudet

```powershell
npm install
```

Huomio: jos ymparistossa on yritysproxy, sen on sallittava npm-registry tai tarjottava corporate mirror. Muuten `npm install` voi epaonnistua jo metadatan haussa.

### 7. Kaynnista frontend

```powershell
npm run dev
```

Avaa selaimessa `http://localhost:3000`.

### 8. Aja Python-testit

```powershell
.\.venv\Scripts\pytest.exe -q
```

### 9. Aja lint

```powershell
npm run lint
```

### 10. Tee production build

```powershell
npm run build
```

## Tyypillinen paivitysflow

1. Paivita tarvittaessa Main Market -universe tiedostossa `python_pipeline/data/main_market_universe.csv`.
2. Aja `python python_pipeline/scripts/generate_financials_csv.py`.
3. Aja `python python_pipeline/scripts/export_ranking_json.py`.
4. Aja Python-testit.
5. Aja `npm run lint` ja `npm run build`.
6. Tarkista reitit `/`, `/metodologia` ja `/yhtio/<ticker>`.
7. Pushaa `main`-branchiin.

## GitHub Actions data refresh v1:ssa

Workflow `.github/workflows/data-refresh.yml`:
- asentaa Python-riippuvuudet tiedostosta `requirements.txt`
- asentaa frontend-riippuvuudet komennolla `npm ci`
- ajaa `pytest -q`
- ajaa `python python_pipeline/scripts/generate_financials_csv.py`
- ajaa `python python_pipeline/scripts/export_ranking_json.py`
- validoi, etta `src/data/ranking-v1.json` syntyi
- ajaa `npm run lint` ja `npm run build`
- upload-aa `financials.csv`:n ja `ranking-v1.json`:n artifacteina
- commitoi muuttuneet datafilet takaisin `main`-branchiin, jos datasetti muuttui

Miksi automaattinen push on v1:ssa perusteltu:
- tuotanto lukee suoraan repoon commitoidun staattisen datasetin
- Vercel deployaa `main`-pushit ilman lisainfraa
- workflow ei kuuntele `push`-eventia, joten commit ei luo CI-looppausta

V1-kayttotapa:
- ajastettu ajo paivittaa datasetin maanantaisin
- `workflow_dispatch` sopii manuaaliseen paivitykseen universen muokkauksen jalkeen
- muulla branchilla workflow toimii verifiointina, mutta ei puske dataa tuotantobranchiin

## Universen ja ranking-kelpoisuuden paivitys nykyarkkitehtuurissa

- paivita raw universe tiedostossa `python_pipeline/data/main_market_universe.csv`
- generoi talousluvut tiedostoon `python_pipeline/data/financials.csv`
- aja export uudelleen komennolla `python python_pipeline/scripts/export_ranking_json.py`
- tarkista JSON:sta ja UI:sta erikseen `raw_universe`, `rows` ja `excluded`
- huomioi, etta finanssiyhtiot nakyvat poissuljettuina metodologisesta syysta, eivat datavirheena
- huomioi, etta kaikki Main Market -yhtiot eivat valttamatta saa financials-rivia, jos lahteesta puuttuu vaadittu statement-data

## Keskeiset komennot yhdessa paikassa

```powershell
python python_pipeline\scripts\generate_financials_csv.py
python python_pipeline\scripts\export_ranking_json.py
.\.venv\Scripts\pytest.exe -q
npm install
npm run lint
npm run dev
npm run build
```

## Rajaukset v1:ssa

- ei tietokantaa
- ei kirjautumista
- ei live-backendia
- ei sijoitusneuvontaa
- ei sampledatan fallback-polkuja kaytossa
- raw universe voi olla laajempi kuin rankattu joukko, koska kelpoisuussaannot ja datan saatavuus erotetaan yhtiolistasta
