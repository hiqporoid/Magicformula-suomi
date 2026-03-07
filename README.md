# Magicformula-suomi

Suomenkielinen v1-demo Nasdaq Helsinki Main Market -yhtioiden arvoseulontaan. Projekti yhdistaa Python-pipelinen, staattisen JSON-exportin ja Next.js-kayttoliittyman samaan tutkimusnakymaan.

## Mita repo tekee

- muodostaa yhtiojoukon Nasdaq Helsinki Main Market -universumista
- normalisoi talousdatan ranking-laskentaa varten
- laskee Magic Formula-, EBIT/EV- ja quality overlay -luvut
- exporttaa tulokset tiedostoon `src/data/ranking-v1.json`
- renderoi ranking-, metodologia- ja yhtiosivut samasta datasetista

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

Repo sisaltaa valmiin `.eslintrc.json`-konfiguraation, joten komento ei saa avata interaktiivista `next lint` -init-polkua.

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

## Ticker-universen paivitys nykyarkkitehtuurissa

- muokkaa tiedostoa `python_pipeline/data/universe.csv`
- varmista, etta pakolliset kentat ovat saatavilla normalisointia varten
- aja export uudelleen komennolla `python python_pipeline\scripts\export_ranking_json.py`
- tarkista poissulut ja validointiviestit UI:ssa ja tarvittaessa JSON:ssa

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


