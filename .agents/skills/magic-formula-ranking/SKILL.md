---
name: magic-formula-ranking
description: Toteuta ja ylläpidä Magic Formula- sekä EBIT/EV-rankinglogiikkaa projektin metodologian mukaan. Käytä kun tehtävä koskee ROC/Earnings Yield -kaavoja, tie-breaker-sääntöjä, finanssiyhtiöiden poissulkua tai rankingin selitettävyyttä.
---

# magic-formula-ranking

## Triggerit
- Muutokset `python_pipeline/magicformula/ranking.py`, `python_pipeline/tests/test_ranking.py`, `docs/methodology/*`.
- Tarve muuttaa rankingin kaavaa tai järjestyssääntöjä.

## Tee
- Pidä ROC ja Earnings Yield kaavat erillisinä ja dokumentoituina.
- Käytä determinististä tie-breakeria (ticker aakkosjärjestys), ellei toisin dokumentoitu.
- Sulje finanssiyhtiöt pois v1-ajosta, jos erillistä finanssimallia ei ole.
- Tuota rankingin selitettävä ulostulo (osakomponentit + lopullinen sijoitus).

## Vältä
- Epävakaita lajittelusääntöjä.
- Kaavojen muuttamista ilman dokumenttipäivitystä ja testiä.
