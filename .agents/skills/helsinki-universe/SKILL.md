---
name: helsinki-universe
description: Muodosta ja ylläpidä Nasdaq Helsinki ja Nasdaq Stockholm Main Market -yhtiöuniversumi tälle projektille. Käytä kun tehtävä koskee universen rajauskriteerejä, sisään/ulos-sääntöjä, listamuutoksia tai universedatan dokumentointia.
---

# helsinki-universe

## Tee
- Rajaa universe Nasdaq Helsingin ja Nasdaq Stockholmin Main Market -yhtiöihin. Varmenna listaus Nasdaqin segmenttisuodatetusta lähteestä ja säilytä ISIN, lähdepäivä sekä manifesti; rivimäärä tai Yahoo-exchange ei osoita kattavuutta.
- Dokumentoi sisäänottokriteerit (listaussegmentti, kaupankäynnin aktiivisuus, datan saatavuus).
- Dokumentoi poissulkusäännöt (puuttuva kriittinen data, ilmeinen datavirhe).
- Tuota deterministinen ticker-lista ja päivitysprosessi.
- Päivitä metodologia (`docs/methodology/universe.md`) ja progress-loki.

## Vältä
- First North- tai muiden markkinapaikkojen sisällyttämistä v1:een.
- Ad hoc -poikkeuksia ilman kirjattua sääntöä.
- Universen yhdistämistä ranking-logiikkaan samaan moduuliin.
