---
name: helsinki-universe
description: Muodosta ja ylläpidä Nasdaq Helsinki Main Market -yhtiöuniversumi tälle projektille. Käytä kun tehtävä koskee universen rajauskriteerejä, sisään/ulos-sääntöjä, listamuutoksia tai universedatan dokumentointia.
---

# helsinki-universe

## Tee
- Rajaa universe vain Nasdaq Helsinki Main Market -yhtiöihin.
- Dokumentoi sisäänottokriteerit (listaussegmentti, kaupankäynnin aktiivisuus, datan saatavuus).
- Dokumentoi poissulkusäännöt (puuttuva kriittinen data, ilmeinen datavirhe).
- Tuota deterministinen ticker-lista ja päivitysprosessi.
- Päivitä metodologia (`docs/methodology/universe.md`) ja progress-loki.

## Vältä
- First North- tai muiden markkinapaikkojen sisällyttämistä v1:een.
- Ad hoc -poikkeuksia ilman kirjattua sääntöä.
- Universen yhdistämistä ranking-logiikkaan samaan moduuliin.
