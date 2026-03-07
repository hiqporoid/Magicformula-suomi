# Python data pipeline (v1)

## Vaiheet
1. Main Market -universe (`data/main_market_universe.csv`)
2. Erillinen talouslukusyöte (`data/financials.csv`)
3. Kelpoisuusarviointi (`magicformula/eligibility.py`)
4. Normalisointi (`magicformula/normalization.py`)
5. Ranking-laskenta (`magicformula/ranking.py`)
6. JSON-export (`scripts/export_ranking_json.py`)

## Paikallinen Python-setup
1. Luo virtuaaliymparisto repojuureen: `python -m venv .venv`
2. Aktivoi venv (PowerShell): `.venv\Scripts\Activate.ps1`
3. Asenna testiriippuvuus: `python -m pip install pytest`

## Aja testit
Repojuuren `pytest.ini` asettaa import-pathin automaattisesti, joten `PYTHONPATH`-muuttujaa ei tarvita.

```bash
pytest -q
```

Vaihtoehtoisesti:

```bash
python -m pytest -q
```

## Datamalli lyhyesti
- `main_market_universe.csv` sisaltaa yhtiometadatan koko raakauniverselle.
- `financials.csv` sisaltaa vain ne talousluvut, jotka ovat tassa viennissa saatavilla.
- Export erottaa tuloksessa `raw_universe`, `rows` ja `excluded`.
- Finanssiyhtiot suljetaan pois Magic Formula -rankingista metodologisena valintana.