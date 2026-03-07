# lessons.md

## Tiedoston tarkoitus
Koota projektin aikana opitut asiat yhteen, jotta virheet eivat toistu ja hyvat kaytannot monistuvat.

## Numeroitu formaatti
Kirjaa opit juoksevasti numeroituna listana muodossa:
1. Tilanne / virhe
2. Korjaus
3. Uudelleenkaytettava malli tai saanto

## Kirjauskonventiot
- Ole konkreettinen: viittaa paatokseen, ei yleiseen tuntemukseen.
- Kuvaa vaikutus: mita parani (laatu, nopeus, luotettavuus).
- Kirjaa vain aidosti toistettavat mallit.

## Opit
1. Tilanne / virhe: Rankinglogiikassa tasatilanteet jaisivat helposti epadeterministisiksi, jos lajittelu tehdaan vain pistemaaralla.
   Korjaus: Lisattiin vakioitu tie-breaker tickerin aakkosjarjestyksella ja testattiin tapaus.
   Uudelleenkaytettava malli tai saanto: Kaikissa ranking-funktioissa maarita eksplisiittinen toissijainen sort-kentta.
2. Tilanne / virhe: Frontend jai sampledatan varaan, jolloin pipeline ja UI eivat muodostaneet testattavaa kokonaisuutta.
   Korjaus: Lisattiin kevyt JSON-export pipelineen ja luettiin sama tiedosto suoraan Next.js:ssa tyyppimappayksen kautta.
   Uudelleenkaytettava malli tai saanto: v1-vaiheessa suosi staattista valiformaattia (JSON) ennen tietokantaa, kun tavoite on nopeasti todennettava end-to-end thin slice.
3. Tilanne / virhe: Frontendin `npm install` epaonnistui virheella 403, vaikka `registry` oli oikein (`https://registry.npmjs.org/`) eika repossa ollut virheellista `.npmrc`-ylikirjoitusta.
   Korjaus: Juurisyyn varmistus tehtiin verkko-/proxytasolla (`curl -v`), joka naytti envoy-proxyn estavan jo `CONNECT registry.npmjs.org:443` -vaiheen. Repoon ei tehty turhia package manager -vaihtoja, vaan dokumentoitiin ymparistovaatimus (proxy allowlist tai corporate npm mirror).
   Uudelleenkaytettava malli tai saanto: Kun npm antaa 403 kaikille paketeille heti metadatan haussa, varmista ensin proxy-tason CONNECT-estot ennen kuin muutat riippuvuuksia tai lockfilea.
4. Tilanne / virhe: Next.js production build kaatui, vaikka runko vaikutti toimivalta, koska vanha `src/lib/sampleData.ts` ei enaa vastannut `RankingRow`-tyyppia.
   Korjaus: Paivitettiin sample-rivit vastaamaan nykyista skeemaa lisaamalla kentat `roc` ja `validationWarnings`, ja varmennettiin build + runtime-URLit savutestilla.
   Uudelleenkaytettava malli tai saanto: Aja aina production build osana v1-demo-verifiointia; se paljastaa staattisen datan ja tyyppimallien ajautumat, joita dev-tila ei valttamatta nayta.
5. Tilanne / virhe: Testien ajo repojuuresta vaati manuaalisen `PYTHONPATH=.`-muuttujan, muuten `python_pipeline`-importit epaonnistuivat joissain paikallisymparistoissa.
   Korjaus: Siirrettiin import-pathin oletus pytest-konfiguraatioon (`pytest.ini`: `pythonpath = .`) ja lukittiin testihakemisto `testpaths`-asetuksella.
   Uudelleenkaytettava malli tai saanto: Kun testit nojaavat repojuuren importteihin, tallenna path-oletus testikonfigiin eika shell-komentoon, jotta kehitys- ja CI-ajot pysyvat toistettavina.
6. Tilanne / virhe: Community-skillien asennus kaatui installerin git-temp-kansioiden konfliktiin, kun useita asennuksia ajettiin rinnakkain.
   Korjaus: Asennettiin community-skillit URL-pohjaisella install-komennolla yksi kerrallaan.
   Uudelleenkaytettava malli tai saanto: Skill-installerin yhteydessa suosi sarja-ajoa tai URL-asennusta, jos git/fallback antaa temp-kansioihin liittyvia virheita.
