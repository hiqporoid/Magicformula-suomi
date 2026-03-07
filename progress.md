# progress.md

## Projektin nimi
Magicformula-suomi

## Nykyinen tavoite
Pitää v1-tuote turvallisesti julkaistavana, helposti päivitettävänä ja demossa uskottavana ilman scope creepiä.

## Status
v1 thin-slice on julkaisuvalmis: tuotantobuild, metadata, deploy-polku, ajastettu JSON-datapäivitys ja uudistettu finance-UI on varmistettu ilman tietokantaa tai live-backendia.

## Edistymisloki
1. Luotu repository governance -tiedostot: AGENTS.md, AI.md, progress.md, lessons.md, PLANS.md.
2. Luotu projektikohtaiset repo-skillit `.agents/skills` alle (7 kpl) eksplisiittisilla triggereilla.
3. Määritelty Helsinki Main Market -universestrategia ja v1-disclaimerit metodologiadokumentteihin.
4. Scaffoldattu Next.js-arkkitehtuurin UI shell ranking-taulukolla ja tyyppimalleilla.
5. Scaffoldattu Python data pipeline: normalisointi, validointi, Magic Formula + EBIT/EV -ranking, quality overlay.
6. Lisätty yksikkötestit normalisoinnille, rankingille ja quality scorelle; testit läpi.
7. Lisätty GitHub Actions -workflow datapäivityksen testiajoa varten.
8. Toteutettu v1-demo thin slice: Python-export `src/data/ranking-v1.json`-muotoon, ranking-sivu suodatuksella/lajittelulla, metodologiasivu, yhtiödetailin shell sekä näkyvä datalaatu/disclaimer UI:ssa.
9. Auditoitu frontendin install-blokkeri: `npm config`, ympäristömuuttujat ja proxy/registry-ketju; 403 tulee verkon envoy-proxyn CONNECT-estosta (ei package.json-riippuvuusvirhe). Tehtiin minimikorjaus dokumentointiin ja käyttöohjeeseen: frontendin asennus vaatii ympäristöltä sallitun npm-registryn (esim. corporate mirror) tai proxy-allowlistin npm-registry-domaiineille. Seuraava askel: aseta CI/ajoympäristöön toimiva `NPM_CONFIG_REGISTRY`/mirror tai avaa proxyyn ulosmenevä npm-liikenne.
10. Auditoitu v1-thin-slice paikallisesti: pipeline JSON-export ajettiin, dataset-rakenne validoitiin, Next.js build meni läpi, ja runtime-savussa sivut `/`, `/metodologia` ja `/yhtio/KNEBV` palauttivat HTTP 200. Samalla korjattiin buildia estänyt tyyppivirhe tiedostossa `src/lib/sampleData.ts` (puuttuneet kentät `roc` ja `validationWarnings`). Seuraava askel: lisää Python-ympäristöön `pytest`, jotta pipeline-testit voidaan ajaa myös tässä koneessa.
11. Korjattu Python-testien package discovery paikalliseen kehitykseen ilman manuaalista `PYTHONPATH`-asettamista: lisättiin repojuureen `pytest.ini` (`testpaths=python_pipeline/tests`, `pythonpath=.`), päivitettiin `python_pipeline/README.md` setup-ohjeilla ja varmistettiin ajamalla `.venv\Scripts\pytest.exe -q` tyhjällä `PYTHONPATH`:lla (8/8 testiä läpi). Seuraava askel: peilaa sama testikomento CI:hin (`pytest -q`) yhtenäisen paikallinen=CI-käyttäytymisen varmistamiseksi.
12. Viimeistelty v1-demo julkaisuvalmiiksi ilman scope creepiä: ranking-, metodologia- ja yhtiösivut siistittiin, datalaatu ja poissulut tehtiin näkyviksi, root/error/loading/not-found -tilat lisättiin, README kirjoitettiin Windows-flowlle, lint-konfiguraatio lukittiin ei-interaktiiviseksi ja sampledatan fallback poistettiin. Varmennus: `.venv\Scripts\pytest.exe -q`, `npm run lint`, `npm run build` sekä reittisavu (`/`, `/metodologia`, `/yhtio/KNEBV`) onnistuivat. Seuraava askel: viimeistele mahdollinen CI/npm-audit -kovennus ja GitHub Actions -datapäivityksen tuotantovalmius.
13. Valmisteltu turvallisin ja yksinkertaisin julkaisuputki v1:lle: valittiin Vercel ensisijaiseksi deploy-alustaksi, lisättiin metadata/canonical/robots/sitemap/share-preview-peruspaketti, prerenderoitiin yhtiöreitit staattisiksi, poistettiin `x-powered-by`-header ja viimeisteltiin `data-refresh.yml` ajamaan testit, export, lint, build ja ehdollinen JSON-commit `main`:iin. Varmennus: `pytest`, `npm run lint`, `npm run build` sekä runtime-savu reiteille `/`, `/metodologia`, `/yhtio/KNEBV`, `/robots.txt` ja `/sitemap.xml`. Seuraava askel: kytke repo Verceliin, aseta `NEXT_PUBLIC_SITE_URL` ja tee ensimmäinen tuotantodeploy.
14. Tehty yhtenäinen UI/UX-uudistus v1-demoa varten: luotiin repo-local `finance-research-ui` -skill, päivitettiin AGENTS.md:n UI-triggerit, rakennettiin etusivu, ranking-työalue, metodologiasivu ja yhtiösivu uudelleen finance/dashboard-tyylisellä hierarkialla, korjattiin näkyvät ääkköset ja rikkinäinen suomenkielinen copy sekä varmennettiin uusi ulkoasu komennolla `npm run lint`, `npm run build`, `pytest` ja runtime-savulla reiteille `/`, `/metodologia` ja `/yhtio/KNEBV`. Seuraava askel: ota tuotantoscreenshotit selaintyökalulla tai Playwrightilla ympäristössä, jossa headless-selain on saatavilla, ja tee lopullinen visuaalinen hyväksyntä ennen julkista demoa.