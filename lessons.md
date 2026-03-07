# lessons.md

## Tiedoston tarkoitus
Koota projektin aikana opitut asiat yhteen, jotta virheet eivÃƒÂ¤t toistu ja hyvÃƒÂ¤t kÃƒÂ¤ytÃƒÂ¤nnÃƒÂ¶t monistuvat.

## Numeroitu formaatti
Kirjaa opit juoksevasti numeroituna listana muodossa:
1. Tilanne / virhe
2. Korjaus
3. UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶

## Kirjauskonventiot
- Ole konkreettinen: viittaa pÃƒÂ¤ÃƒÂ¤tÃƒÂ¶kseen, ei yleiseen tuntemukseen.
- Kuvaa vaikutus: mitÃƒÂ¤ parani (laatu, nopeus, luotettavuus).
- Kirjaa vain aidosti toistettavat mallit.

## Opit
1. Tilanne / virhe: Rankinglogiikassa tasatilanteet jÃƒÂ¤isivÃƒÂ¤t helposti epÃƒÂ¤deterministisiksi, jos lajittelu tehdÃƒÂ¤ÃƒÂ¤n vain pistemÃƒÂ¤ÃƒÂ¤rÃƒÂ¤llÃƒÂ¤.
   Korjaus: LisÃƒÂ¤ttiin vakioitu tie-breaker tickerin aakkosjÃƒÂ¤rjestyksellÃƒÂ¤ ja testattiin tapaus.
   UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶: Kaikissa ranking-funktioissa mÃƒÂ¤ÃƒÂ¤ritÃƒÂ¤ eksplisiittinen toissijainen sort-kenttÃƒÂ¤.
2. Tilanne / virhe: Frontend jÃƒÂ¤i sampledatan varaan, jolloin pipeline ja UI eivÃƒÂ¤t muodostaneet testattavaa kokonaisuutta.
   Korjaus: LisÃƒÂ¤ttiin kevyt JSON-export pipelineen ja luettiin sama tiedosto suoraan Next.js:ssa tyyppimÃƒÂ¤ppÃƒÂ¤yksen kautta.
   UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶: v1-vaiheessa suosi staattista vÃƒÂ¤liformaattia (JSON) ennen tietokantaa, kun tavoite on nopeasti todennettava end-to-end thin slice.
3. Tilanne / virhe: Frontendin `npm install` epÃƒÂ¤onnistui virheellÃƒÂ¤ 403, vaikka `registry` oli oikein (`https://registry.npmjs.org/`) eikÃƒÂ¤ repossa ollut virheellistÃƒÂ¤ `.npmrc`-ylikirjoitusta.
   Korjaus: Juurisyyn varmistus tehtiin verkko-/proxytasolla (`curl -v`), joka nÃƒÂ¤ytti envoy-proxyn estÃƒÂ¤vÃƒÂ¤n jo `CONNECT registry.npmjs.org:443` -vaiheen. Repoon ei tehty turhia package manager -vaihtoja, vaan dokumentoitiin ympÃƒÂ¤ristÃƒÂ¶vaatimus (proxy allowlist tai corporate npm mirror).
   UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶: Kun npm antaa 403 kaikille paketeille heti metadatan haussa, varmista ensin proxy-tason CONNECT-estot ennen kuin muutat riippuvuuksia tai lockfilea.
4. Tilanne / virhe: Next.js production build kaatui, vaikka runko vaikutti toimivalta, koska vanha `src/lib/sampleData.ts` ei enÃƒÂ¤ÃƒÂ¤ vastannut `RankingRow`-tyyppiÃƒÂ¤.
   Korjaus: PÃƒÂ¤ivitettiin sample-rivit vastaamaan nykyistÃƒÂ¤ skeemaa lisÃƒÂ¤ÃƒÂ¤mÃƒÂ¤llÃƒÂ¤ kentÃƒÂ¤t `roc` ja `validationWarnings`, ja varmennettiin build + runtime-URLit savutestilla.
   UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶: Aja aina production build osana v1-demo-verifiointia; se paljastaa staattisen datan ja tyyppimallien ajautumat, joita dev-tila ei vÃƒÂ¤lttÃƒÂ¤mÃƒÂ¤ttÃƒÂ¤ nÃƒÂ¤ytÃƒÂ¤.
5. Tilanne / virhe: Testien ajo repojuuresta vaati manuaalisen `PYTHONPATH=.`-muuttujan, muuten `python_pipeline`-importit epÃƒÂ¤onnistuivat joissain paikallisympÃƒÂ¤ristÃƒÂ¶issÃƒÂ¤.
   Korjaus: Siirrettiin import-pathin oletus pytest-konfiguraatioon (`pytest.ini`: `pythonpath = .`) ja lukittiin testihakemisto `testpaths`-asetuksella.
   UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶: Kun testit nojaavat repojuuren importteihin, tallenna path-oletus testikonfigiin eikÃƒÂ¤ shell-komentoon, jotta kehitys- ja CI-ajot pysyvÃƒÂ¤t toistettavina.
6. Tilanne / virhe: PowerShellin oletustallennus saattoi kirjoittaa muokatut Next.js-tiedostot UTF-16- tai BOM-muotoon, jolloin route-tiedostot ja `package.json` rikkoivat buildin vaikeasti tulkittavilla virheillÃƒÂ¤.
   Korjaus: Muokatut tekstitiedostot kirjoitettiin eksplisiittisesti UTF-8 no BOM -muotoon ennen build-verifiointia.
   UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶: Kun kirjoitat Node/Next-repon lÃƒÂ¤hdetiedostoja PowerShellista, lukitse encoding aina UTF-8 no BOM -muotoon etenkin `package.json`- ja route-tiedostoille.
7. Tilanne / virhe: Runtime-generoitu `next/og`-share image lisÃƒÂ¤si tarpeetonta deploy-riskiÃƒÂ¤ suhteessa v1-demoon, vaikka tavoite oli vain perustason share preview.
   Korjaus: Dynaaminen OG-kuvagenerointi korvattiin staattisella `public/social-card.svg`-kuvalla ja metadata viittasi siihen suoraan.
   UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶: Kun v1 tarvitsee vain perus-SEO:n ja share previewn, suosi staattista preview-kuvaa ennen runtime-kuvagenerointia; tuotantopolku pysyy yksinkertaisempana ja build ennustettavampana.
8. Tilanne / virhe: UI voi nÃƒÂ¤yttÃƒÂ¤ÃƒÂ¤ keskenerÃƒÂ¤iseltÃƒÂ¤, vaikka data, build ja reitit olisivat teknisesti kunnossa, jos copy on ASCII-fallbackissa ja visuaalinen hierarkia muistuttaa geneeristÃƒÂ¤ templatea.
   Korjaus: KÃƒÂ¤yttÃƒÂ¶liittymÃƒÂ¤ rakennettiin uudelleen finance/dashboard-logiikalla, nÃƒÂ¤kyvÃƒÂ¤t suomenkieliset tekstit palautettiin oikeille merkeille ja taulukon luettavuus nostettiin omaksi ensisijaiseksi suunnittelutavoitteeksi.
   UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶: V1-tuotedemossa copy, typografia ja taulukon hierarkia ovat osa tuotteen uskottavuutta, eivÃƒÂ¤t viimeistelyÃƒÂ¤ joka tehdÃƒÂ¤ÃƒÂ¤n vasta lopuksi.
9. Tilanne / virhe: Kun universe ja ranking-kelpoisuus pidetaan samassa CSV:ssa, demo-otos naamioituu helposti koko markkinauniversumiksi ja poissulkujen syyt katoavat koodin sivuvaikutuksiksi.
   Korjaus: Universe erotettiin omaksi yhtiometadatalahteekseen ja talousluvut omaksi syotteekseen, jonka jalkeen export tuottaa eksplisiittisesti `raw_universe`, `rows` ja `excluded` samasta ajosta.
   Uudelleenkaytettava malli tai saanto: Markkinauniverse, kelpoisuussaannot ja laskettavat tunnusluvut kannattaa mallintaa erillisina kerroksina jo v1:ssa, jotta data-aukot ja metodologiset poissulut voidaan selittaa suoraan kayttajalle.
10. Tilanne / virhe: Pelkka suora ticker + '.HE' -mapitus ei riita Helsinki-universessa, koska osa yhtiosta on Yahoo Financessa vanhalla tai muuttuneella symbolilla.
   Korjaus: Financials-generatoriin lisattiin pieni alias-kartta tunnetuille tickerimuutoksille ja rajattu Yahoo-hakufallback, mutta kirjoitus financials.csv:hen sallitaan vasta kun kaikki rankingin minimikentat loytyvat.
   Uudelleenkaytettava malli tai saanto: Kun ulkoinen datalahde ei ole taysin deterministinen, pidetaan symboliresoluutio eksplisiittisena ja erotetaan symboliongelmat puuttuvasta statement-datasta sen sijaan, etta peitetaan ne yleiseen scrape-logiikkaan.
11. Tilanne / virhe: Staattisessa Vercel-julkaisussa data-refreshin kannattaa paivittaa koko datasetti, ei vain frontendin JSON-exporttia, koska muuten repo, artifactit ja tuotantodeploy voivat ajautua eri data-tiloihin.
   Korjaus: Workflow muutettiin generoimaan ensin python_pipeline/data/financials.csv, sen jalkeen src/data/ranking-v1.json, validoimaan exportin ja commitoimaan molemmat tiedostot yhdessa vain main-branchissa.
   Uudelleenkaytettava malli tai saanto: Kun staattinen sovellus deployaa suoraan Git-reposta, commitoi ja validoi aina koko julkaistava datasetti samassa CI-ajossa.
12. Tilanne / virhe: Laaja visuaalinen redesign hajoaa helposti irrallisiksi komponenttikorjauksiksi, jolloin lopputulos on epajohdonmukainen vaikka yksittaiset kortit nayttaisivat paremmilta.
   Korjaus: Tyylisuunta lukittiin ensin yhteen dark-first AI/tech -design-systemiin globaalien tokenien, pintojen, kontrollien, statusten ja motion-saantojen tasolla, minka jalkeen sivut ja komponentit paivittyivat saman kieliopin alle.
   Uudelleenkaytettava malli tai saanto: Kun v1:n UI viimeistellaan uskottavaksi tutkimustyokaluksi, aloita aina yhdesta yhtenaisesta tokeni- ja pintajarjestelmasta ennen komponenttikohtaista viilausta.
13. Tilanne / virhe: Dark-first AI/tech-ilme muuttuu helposti lapselliseksi, jos se rakennetaan suurilla pillerinapeilla, raskailla glow-efekteilla, leveilla korteilla ja liian nayttavalla herolla.
   Korjaus: Mittasuhteet kiristettiin finance/research-UI:n ehdoilla: kontrollit madallettiin, radiuset pienennettiin, efektit hillittiin, taulukolle annettiin etusijainen leveys ja sidebar siirrettiin taulukon jalkeiseen informaatiorooliin.
   Uudelleenkaytettava malli tai saanto: Kun rakennat teknista premium-UI:ta datatyokalulle, uskottavuus syntyy tiheydesta, rytmista ja kurinalaisista mittasuhteista eika visuaalisesta nayttavyydesta.
14. Tilanne / virhe: Kun screener-UI nÃ¤yttÃ¤Ã¤ vain rankit ja prosenttimittarit, kÃ¤yttÃ¤jÃ¤n on vaikea arvioida tuloksia nopeasti eikÃ¤ yrityssivu kerro, mihin taustadataan ranking nojaa.
   Korjaus: Exportiin lisÃ¤ttiin pieni mutta eksplisiittinen `financial_snapshot`-rakenne ja datalÃ¤hde-metadata, jolloin sama staattinen datasetti riittÃ¤Ã¤ sekÃ¤ etusivun markkina-arvo-/lÃ¤hdenÃ¤yttÃ¶Ã¶n ettÃ¤ yrityssivun talouslukujen esittÃ¤miseen.
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: Kun staattinen research-sovellus tarvitsee lisÃ¤Ã¤ lÃ¤pinÃ¤kyvyyttÃ¤, laajenna ensisijaisesti exporttia pienellÃ¤ metadata- ja snapshot-kerroksella sen sijaan, ettÃ¤ rakennat erillisen fetch-polun tai uuden feature-arkkitehtuurin.
15. Tilanne / virhe: Research-työkalun UI voi jäädä yhä liian raskaaksi, vaikka värit ja komponentit olisivat jo uskottavia, jos otsikot, rivivälit ja osioiden välit jäävät landing page -tasolle.
   Korjaus: Tiivistettiin koko näkymän typografinen skaala ja pystysuuntainen rytmi yhtä aikaa sekä kirjoitettiin metodologiasivu uudelleen laskentaa palvelevaksi selosteeksi yleisen esittelytekstin sijaan.
   Uudelleenkäytettävä malli tai sääntö: Kun sijoitustyökalun käyttöliittymä tuntuu liian "isolta", älä korjaa vain yksittäistä hero-otsikkoa vaan säädä samaan passiin otsikkohierarkia, line-height, korttipaddingit, section-gapit ja copyn pituus.