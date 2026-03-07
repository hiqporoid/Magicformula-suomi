# Magicformula-suomi

Suomenkielinen v1-demo Nasdaq Helsinki Main Market -yhtioiden arvoseulontaan. Projekti yhdistaa Python-pipelinen, staattisen JSON-exportin ja Next.js-kayttoliittyman samaan tutkimusnakymaan.

## Mita repo tekee

- muodostaa yhtiojoukon Nasdaq Helsinki Main Market -universumista
- normalisoi talousdatan ranking-laskentaa varten
- laskee Magic Formula-, EBIT/EV- ja quality overlay -luvut
- exporttaa tulokset tiedostoon `src/data/ranking-v1.json`
- renderoi ranking-, metodologia- ja yhtiosivut samasta datasetista

## Suositeltu julkaisutapa v1:lle

Yksinkertaisin ja vakain vaihtoehto talle repossa olevalle Next.js-demolle on Vercel.

Miksi:
- Next.js tunnistuu suoraan ilman omaa deploy-konfiguraatiota
- `main`-branchin pushit voidaan julkaista automaattisesti
- app router, metadata, sitemap ja OG-kuvat toimivat ilman erillista palvelin- tai CDN-rakennetta
- projekti ei tarvitse tietokantaa, authia tai omaa backendia, joten lisainfra olisi turhaa

## Vercel deploy vaihe vaiheelta

### 1. Tuo repo Verceliin

- kirjaudu Verceliin GitHub-tililla
- valitse `New Project`
- importoi repo `Magicformula-suomi`
- anna frameworkin pysya valinnassa `Next.js`

### 2. Aseta tuotanto-URL ymparistomuuttujaksi

Lisaa Vercel-projektin Environment Variables -asetuksiin:

```text
NEXT_PUBLIC_SITE_URL=https://oma-domain.fi
```

Jos kaytat ensin Vercelin omaa domainia, voit asettaa sen muodossa:

```text
NEXT_PUBLIC_SITE_URL=https://magicformula-suomi.vercel.app
```

Tata arvoa kaytetaan canonical-URL:eihin, sitemapiin, robotsiin ja share-preview-metadatan pohjaksi.

### 3. Build-asetukset

Vercelin oletukset riittavat:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output: Next.js oletus

### 4. Julkaisu

- ensimmainen deploy syntyy importin yhteydessa
- jatkossa jokainen push `main`-branchiin laukaisee uuden tuotantodeployn
- halutessasi lisaa custom domain Vercelin Domain-asetuksista

## Datan paivitys tuotannossa

Repo sisaltaa workflow'n `.github/workflows/data-refresh.yml`, joka ajaa viikoittaisen datapaivityksen.

Workflow tekee seuraavat asiat:
- ajaa Python-testit
- generoi `src/data/ranking-v1.json`-tiedoston uudelleen
- ajaa frontendin lintin ja production buildin
- tallentaa ranking-JSON:n artifactiksi
- commitoi paivittyneen JSON:n suoraan `main`-branchiin vain jos data muuttui

Koska Vercel deployaa `main`-branchin automaattisesti, paivittynyt ranking menee julkaisuun ilman live-backendia.

### Manuaalinen datarefresh GitHubissa

- avaa GitHubissa `Actions`
- valitse `Data Refresh`
- paina `Run workflow`

### Ajastus

Nykyinen cron:

```text
0 6 * * 1
```

Tama tarkoittaa joka maanantai klo 06:00 UTC.

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
pip install pytest
```

Jos projektiin lisataan myohemmin `requirements.txt`, asenna myos se samalla komennolla.

### 4. Generoi ranking JSON

```powershell
python python_pipeline\scripts\export_ranking_json.py
```

Komento paivittaa tiedoston `src/data/ranking-v1.json`, jota frontend kayttaa suoraan.

### 5. Asenna frontend-riippuvuudet

```powershell
npm install
```

Huomio: jos ymparistossa on yritysproxy, sen on sallittava npm-registry tai tarjottava corporate mirror. Muuten `npm install` voi epaonnistua jo metadatan haussa.

### 6. Kaynnista frontend

```powershell
npm run dev
```

Avaa selaimessa `http://localhost:3000`.

### 7. Aja Python-testit

```powershell
.\.venv\Scripts\pytest.exe -q
```

`pytest.ini` huolehtii import-polusta, joten `PYTHONPATH`-muuttujaa ei tarvitse asettaa erikseen.

### 8. Aja lint

```powershell
npm run lint
```

Repo sisaltaa valmiin `.eslintrc.json`-konfiguraation, joten komento ei avaa interaktiivista `next lint` -init-polkua.

### 9. Tee production build

```powershell
npm run build
```

## Tyypillinen paivitysflow

1. Paivita tarvittaessa universedata tiedostossa `python_pipeline/data/universe.csv`.
2. Aja JSON-export uudelleen.
3. Aja Python-testit.
4. Aja `npm run lint` ja `npm run build`.
5. Tarkista reitit `/`, `/metodologia` ja `/yhtio/<ticker>`.
6. Pushaa `main`-branchiin, jolloin Vercel deployaa muutoksen.

## Ticker-universen paivitys nykyarkkitehtuurissa

- muokkaa tiedostoa `python_pipeline/data/universe.csv`
- varmista, etta pakolliset kentat ovat saatavilla normalisointia varten
- aja export uudelleen komennolla `python python_pipeline\scripts\export_ranking_json.py`
- tarkista poissulut ja validointiviestit UI:ssa ja tarvittaessa JSON:ssa
- jos haluat tuotantopaivityksen heti, kaynnista GitHubissa `Data Refresh` manuaalisesti tai pushaa paivitetty JSON `main`:iin

## Keskeiset komennot yhdessa paikassa

```powershell
python python_pipeline\scripts\export_ranking_json.py
.\.venv\Scripts\pytest.exe -q
npm install
npm run lint
npm run dev
npm run build
```

## Rajaukset v1-demossa

- ei tietokantaa
- ei kirjautumista
- ei live-backendia
- ei sijoitusneuvontaa
- ei sampledatan fallback-polkuja kaytossa