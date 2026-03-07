# Python data pipeline (v1 scaffold)

## Vaiheet
1. Universe-syote (`data/universe.csv`)
2. Normalisointi (`magicformula/normalization.py`)
3. Ranking-laskenta (`magicformula/ranking.py`)

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
