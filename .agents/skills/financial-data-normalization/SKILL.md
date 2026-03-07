---
name: financial-data-normalization
description: Yhtenäistä ja validoi talousdata ranking-laskentaan. Käytä kun tehtävä koskee syöteskeemaa, puuttuvien arvojen fallback-logiikkaa, datan luottamusluokitusta tai hylkäyssyiden kirjausta.
---

# financial-data-normalization

## Triggerit
- Muutokset `python_pipeline/magicformula/normalization.py` tai `python_pipeline/tests/test_normalization.py`.
- Uusi datalähde tai skeemamuutos.

## Tee
- Määritä pakolliset kentät eksplisiittisesti.
- Lisää fallback vain dokumentoituna sääntönä (ei hiljaista oletusta).
- Tuota hylkäyssyyt koneellisesti käsiteltävinä koodeina.
- Testaa puuttuvat arvot, nollajakajat, negatiiviset/epäkelvot arvot.

## Vältä
- Ranking-laskennan logiikan sekoittamista normalisointiin.
- Puuttuvan datan käsittelyä validina ilman näkyvää merkintää.
