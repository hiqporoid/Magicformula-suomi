# progress.md

## Projektin nimi
Magicformula-suomi

## Nykyinen tavoite
Pit aa v1-tuote turvallisesti julkaistavana ja helposti paivitettavana ilman scope creepia.

## Status
v1 thin-slice on julkaisuvalmis: tuotantobuild, metadata, deploy-polku ja ajastettu JSON-datapaivitys on varmistettu ilman tietokantaa tai live-backendia.

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
11. Korjattu Python-testien package discovery paikalliseen kehitykseen ilman manuaalista `PYTHONPATH`-asettamista: lisattiin repojuureen `pytest.ini` (`testpaths=python_pipeline/tests`, `pythonpath=.`), paivitettiin `python_pipeline/README.md` setup-ohjeilla ja varmistettiin ajamalla `.venv\Scripts\pytest.exe -q` tyhjalla `PYTHONPATH`:lla (8/8 testia lapi). Seuraava askel: peilaa sama testikomento CI:hin (`pytest -q`) yhtenaisen paikallinen=CI-kayttaytymisen varmistamiseksi.
12. Viimeistelty v1-demo julkaisuvalmiiksi ilman scope creepia: ranking-, metodologia- ja yhtiosivut siistittiin, datalaatu ja poissulut tehtiin nakyviksi, root/error/loading/not-found -tilat lisattiin, README kirjoitettiin Windows-flowlle, lint-konfiguraatio lukittiin ei-interaktiiviseksi ja sampledatan fallback poistettiin. Varmennus: `.venv\Scripts\pytest.exe -q`, `npm run lint`, `npm run build` seka reittisavu (`/`, `/metodologia`, `/yhtio/KNEBV`) onnistuivat. Seuraava askel: viimeistele mahdollinen CI/npm-audit -kovennus ja GitHub Actions -datapaivityksen tuotantovalmius.
13. Valmisteltu turvallisin ja yksinkertaisin julkaisuputki v1:lle: valittiin Vercel ensisijaiseksi deploy-alustaksi, lisattiin metadata/canonical/robots/sitemap/share-preview-peruspaketti, prerenderoitiin yhtioreitit staattisiksi, poistettiin `x-powered-by`-header ja viimeisteltiin `data-refresh.yml` ajamaan testit, export, lint, build ja ehdollinen JSON-commit `main`:iin. Varmennus: `pytest`, `npm run lint`, `npm run build` seka runtime-savu reiteille `/`, `/metodologia`, `/yhtio/KNEBV`, `/robots.txt` ja `/sitemap.xml`. Seuraava askel: kytke repo Verceliin, aseta `NEXT_PUBLIC_SITE_URL` ja tee ensimmainen tuotantodeploy.