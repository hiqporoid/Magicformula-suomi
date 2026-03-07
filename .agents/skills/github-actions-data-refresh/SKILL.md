---
name: github-actions-data-refresh
description: Toteuta GitHub Actions -automaatiot datan päivitykseen ja validointiin. Käytä kun tehtävä koskee ajastettuja päivitysajoja, pipeline-ajojen orkestrointia, artefakteja tai CI-laatutarkistuksia.
---

# github-actions-data-refresh

## Tee
- Luo ajastettu workflow datan päivitykseen (`schedule` + manuaalinen `workflow_dispatch`).
- Aja normalisointi, ranking ja validointivaiheet putkena.
- Tallenna raportit/artifactsit tarkastusta varten.
- Failaa workflow selkeästi validointivirheissä.

## Vältä
- Salaisuuksien kovakoodausta workflowihin.
- Yhtä massiivista jobia ilman vaiheistusta.
- Päivitysautomaatiota ilman lokitettua tulosyhteenvetoa.
