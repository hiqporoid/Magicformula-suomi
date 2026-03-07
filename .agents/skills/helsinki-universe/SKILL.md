---
name: helsinki-universe
description: Hallitse Nasdaq Helsinki Main Market -universen rajaus tätä projektia varten. Käytä kun tehtävä koskee universelähdettä, sisään/ulos-sääntöjä, finanssiyhtiöiden poissulkua Magic Formula -ajossa tai universedatan versiopäivitystä.
---

# helsinki-universe

## Triggerit
- Muutokset `docs/methodology/universe.md` tai `python_pipeline/data/*`.
- Tarve päivittää universelista ja poissulkusyyt.

## Tee
- Rajaa universe v1:ssä vain Nasdaq Helsinki Main Marketiin.
- Kirjaa sisäänottokriteerit, poissulkukriteerit ja poissulkujen syykoodit.
- Erottele “universessa mukana” vs. “Magic Formulaan hyväksytty” (finanssiyhtiöt oletuksena pois).

## Vältä
- First Northin tai muiden markkinapaikkojen lisäämistä v1:een.
- Manuaalisia poikkeuksia ilman dokumentoitua sääntöä.
