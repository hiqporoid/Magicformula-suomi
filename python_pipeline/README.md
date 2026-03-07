# Python data pipeline (v1)

## Vaiheet
1. Main Market -universe (`data/main_market_universe.csv`)
2. Financials-generointi (`scripts/generate_financials_csv.py`)
3. Kelpoisuusarviointi (`magicformula/eligibility.py`)
4. Normalisointi (`magicformula/normalization.py`)
5. Ranking-laskenta (`magicformula/ranking.py`)
6. JSON-export (`scripts/export_ranking_json.py`)

## Paikallinen Python-setup
1. Luo virtuaaliymparisto repojuureen: `python -m venv .venv`
2. Aktivoi venv (PowerShell): `.venv\Scripts\Activate.ps1`
3. Asenna riippuvuudet: `pip install -r requirements.txt`

## Talouslukujen generointi

```bash
python python_pipeline/scripts/generate_financials_csv.py
```

Skripti:
- lukee Main Market -universen tiedostosta `data/main_market_universe.csv`
- hakee Yahoo Financesta vuosittaiset statementit ja enterprise valuen
- kayttaa tarvittaessa alias-tickerikarttaa ja Yahoo-hakufallbackia
- kirjoittaa kayttokelpoiset rivit tiedostoon `data/financials.csv`

## Aja JSON-export

```bash
python python_pipeline/scripts/export_ranking_json.py
```

## Aja testit
Repojuuren `pytest.ini` asettaa import-pathin automaattisesti, joten `PYTHONPATH`-muuttujaa ei tarvita.

```bash
pytest -q
```

## Datamalli lyhyesti
- `main_market_universe.csv` sisaltaa yhtiometadatan koko raakauniverselle.
- `financials.csv` sisaltaa ne talouslukurivit, joilta vaaditut kentat saatiin haettua luotettavasti.
- Export erottaa tuloksessa `raw_universe`, `rows` ja `excluded`.
- Finanssiyhtiot suljetaan pois Magic Formula -rankingista metodologisena valintana.
## GitHub Actions data refresh

Workflow `.github/workflows/data-refresh.yml` asentaa riippuvuudet, ajaa `pytest -q`, generoi `data/financials.csv`:n, exporttaa `src/data/ranking-v1.json`:n, validoi exportin ja ajaa frontendin `lint`- ja `build`-tarkistukset.

Jos datasetti muuttuu ja ajo tapahtuu `main`-branchissa, workflow commitoi paivitetyt tiedostot takaisin repoon. Muilla brancheilla sama workflow toimii vain verifiointina.

