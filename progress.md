# progress.md

## Projektin nimi
Magicformula-suomi

## Nykyinen tavoite
Saada v1 bootstrap + ensimmäinen tekninen scaffold valmiiksi (universe, pipeline, ranking, UI shell).

## Status
Perusrunko valmis, v1-demo thin slice toimii datasta UI:hin (riippuen npm-asennuksen onnistumisesta ympäristössä).

## Edistymisloki
1. Luotu repository governance -tiedostot: AGENTS.md, AI.md, progress.md, lessons.md, PLANS.md.
2. Luotu projektikohtaiset repo-skillit `.agents/skills` alle (7 kpl) eksplisiittisillä triggereillä.
3. Määritelty Helsinki Main Market -universestrategia ja v1-disclaimerit metodologiadokumentteihin.
4. Scaffoldattu Next.js-arkkitehtuurin UI shell ranking-taulukolla ja tyyppimalleilla.
5. Scaffoldattu Python data pipeline: normalisointi, validointi, Magic Formula + EBIT/EV -ranking, quality overlay.
6. Lisätty yksikkötestit normalisoinnille, rankingille ja quality scorelle; testit läpi.
7. Lisätty GitHub Actions -workflow datapäivityksen testiajoa varten.
8. Toteutettu v1-demo thin slice: Python-export `src/data/ranking-v1.json`-muotoon, ranking-sivu suodatuksella/lajittelulla, metodologiasivu, yhtiödetailin shell sekä näkyvä datalaatu/disclaimer UI:ssa.

## Seuraavat toimet
- Korjaa CI/ajoympäristön npm-proxy/registry-politiikka niin, että `npm install` onnistuu (nykyinen 403 blokkaa frontendin käynnistyksen).
- Lisää pipelineen automaattinen JSON-export osaksi datapäivitysworkflowta.
- Laajenna yhtiödetaili näyttämään myös poissulku- ja validointiperusteet historiassa.
