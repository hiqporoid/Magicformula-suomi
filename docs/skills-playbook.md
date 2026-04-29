# Skills playbook (projektin käyttöohje)

## Milloin käytetään mitäkin
- `financial-data-normalization`: aina kun universe/financials-skeema muuttuu tai lisätään uusi pörssi.
- `magic-formula-ranking`: aina kun ROC-/EBIT/EV-logiikka, tasatilanteet tai ranking-järjestys muuttuu.
- `finance-validation-and-disclaimer`: aina kun poissulkuperusteet, riskitekstit tai metodologiarajaukset muuttuvat.
- `nextjs-finance-table-ui` / `finance-research-ui`: aina kun taulukon suodatus, lajittelu tai UI-hierarkia muuttuu.
- `github-actions-data-refresh`: aina kun data-refreshin CI-putki muuttuu.

## Pakollinen minimitarkistus skillityön jälkeen
1. `pytest -q`
2. `npm run lint`
3. `npm run build`
4. Tarkista, että `src/data/ranking-v1.json` sisältää odotetut `raw_universe`, `rows`, `excluded`-määrät.
5. Aja `python python_pipeline/scripts/audit_universe.py` ja varmista että rank-sekvenssi on OK.

## Pörssilaajennuksen (HEL -> HEL+STO) checklista
1. Päivitä universe skeemaan `exchange`.
2. Lisää symboliresoluutio financials-generaattoriin.
3. Aja export ja varmista pörssikohtaiset lukumäärät.
4. Lisää UI:hin pörssisuodatin.
5. Päivitä metodologia- ja disclaimer-dokumentit ennen mergeä.
