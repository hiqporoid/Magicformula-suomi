# progress.md

## Projektin nimi
Magicformula-suomi

## Nykyinen tavoite
Saada v1 bootstrap + ensimmainen tekninen scaffold valmiiksi (universe, pipeline, ranking, UI shell).

## Status
Perusrunko valmis, v1-demo thin slice toimii datasta UI:hin (riippuen npm-asennuksen onnistumisesta ymparistossa).

## Edistymisloki
1. Luotu repository governance -tiedostot: AGENTS.md, AI.md, progress.md, lessons.md, PLANS.md.
2. Luotu projektikohtaiset repo-skillit `.agents/skills` alle (7 kpl) eksplisiittisilla triggereilla.
3. Maaritelty Helsinki Main Market -universestrategia ja v1-disclaimerit metodologiadokumentteihin.
4. Scaffoldattu Next.js-arkkitehtuurin UI shell ranking-taulukolla ja tyyppimalleilla.
5. Scaffoldattu Python data pipeline: normalisointi, validointi, Magic Formula + EBIT/EV -ranking, quality overlay.
6. Lisatty yksikkotestit normalisoinnille, rankingille ja quality scorelle; testit lapi.
7. Lisatty GitHub Actions -workflow datapaivityksen testiajoa varten.
8. Toteutettu v1-demo thin slice: Python-export `src/data/ranking-v1.json`-muotoon, ranking-sivu suodatuksella/lajittelulla, metodologiasivu, yhtiodetailin shell seka nakyva datalaatu/disclaimer UI:ssa.
9. Auditoitu frontendin install-blokkeri: `npm config`, ymparistomuuttujat ja proxy/registry-ketju; 403 tulee verkon envoy-proxyn CONNECT-estosta (ei package.json-riippuvuusvirhe). Tehtiin minimikorjaus dokumentointiin ja kayttoohjeeseen: frontendin asennus vaatii ymparistolta sallitun npm-registryn (esim. corporate mirror) tai proxy-allowlistin npm-registry-domaiineille. Seuraava askel: aseta CI/ajoymparistoon toimiva `NPM_CONFIG_REGISTRY`/mirror tai avaa proxyyn ulosmeneva npm-liikenne.
10. Auditoitu v1-thin-slice paikallisesti: pipeline JSON-export ajettiin, dataset-rakenne validoitiin, Next.js build meni lapi, ja runtime-savussa sivut `/`, `/metodologia` ja `/yhtio/KNEBV` palauttivat HTTP 200. Samalla korjattiin buildia estanyt tyyppivirhe tiedostossa `src/lib/sampleData.ts` (puuttuneet kentat `roc` ja `validationWarnings`). Seuraava askel: lisaa Python-ymparistoon `pytest`, jotta pipeline-testit voidaan ajaa myos tassa koneessa.

## Seuraavat toimet
- Korjaa CI/ajoympariston npm-proxy/registry-politiikka niin, etta `npm install` onnistuu (nykyinen 403 blokkaa frontendin kaynnistyksen).
- Lisaa pipelineen automaattinen JSON-export osaksi datapaivitysworkflowta.
- Laajenna yhtiodetaili nayttamaan myos poissulku- ja validointiperusteet historiassa.
