---
name: github-actions-data-refresh
description: Ylläpidä ajastettua data refresh + testiautomaatio -workflown runkoa. Käytä kun tehtävä koskee workflow-aikatauluja, pipeline-vaiheita, testiajoja, artifacteja tai fail-fast validointia.
---

# github-actions-data-refresh

## Triggerit
- Muutokset `.github/workflows/data-refresh.yml`.

## Tee
- Pidä workflow yksinkertaisena: setup -> testit -> raportointi.
- Failaa ajo selkeästi datan validointivirheissä.
- Julkaise artifactit, joista laatuongelmat voi auditoida.

## Vältä
- Yhteen jobiin kasattua vaikeasti ylläpidettävää putkea.
- Salaisuuksien tai ympäristöasetusten kovakoodausta.
