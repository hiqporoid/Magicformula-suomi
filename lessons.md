# lessons.md

## Tiedoston tarkoitus
Koota projektin aikana opitut asiat yhteen, jotta virheet eivÃ¤t toistu ja hyvÃ¤t kÃ¤ytÃ¤nnÃ¶t monistuvat.

## Numeroitu formaatti
Kirjaa opit juoksevasti numeroituna listana muodossa:
1. Tilanne / virhe
2. Korjaus
3. UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶

## Kirjauskonventiot
- Ole konkreettinen: viittaa pÃ¤Ã¤tÃ¶kseen, ei yleiseen tuntemukseen.
- Kuvaa vaikutus: mitÃ¤ parani (laatu, nopeus, luotettavuus).
- Kirjaa vain aidosti toistettavat mallit.

## Opit
1. Tilanne / virhe: Rankinglogiikassa tasatilanteet jÃ¤isivÃ¤t helposti epÃ¤deterministisiksi, jos lajittelu tehdÃ¤Ã¤n vain pistemÃ¤Ã¤rÃ¤llÃ¤.
   Korjaus: LisÃ¤ttiin vakioitu tie-breaker tickerin aakkosjÃ¤rjestyksellÃ¤ ja testattiin tapaus.
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: Kaikissa ranking-funktioissa mÃ¤Ã¤ritÃ¤ eksplisiittinen toissijainen sort-kenttÃ¤.
2. Tilanne / virhe: Frontend jÃ¤i sampledatan varaan, jolloin pipeline ja UI eivÃ¤t muodostaneet testattavaa kokonaisuutta.
   Korjaus: LisÃ¤ttiin kevyt JSON-export pipelineen ja luettiin sama tiedosto suoraan Next.js:ssa tyyppimÃ¤ppÃ¤yksen kautta.
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: v1-vaiheessa suosi staattista vÃ¤liformaattia (JSON) ennen tietokantaa, kun tavoite on nopeasti todennettava end-to-end thin slice.
3. Tilanne / virhe: Frontendin `npm install` epÃ¤onnistui virheellÃ¤ 403, vaikka `registry` oli oikein (`https://registry.npmjs.org/`) eikÃ¤ repossa ollut virheellistÃ¤ `.npmrc`-ylikirjoitusta.
   Korjaus: Juurisyyn varmistus tehtiin verkko-/proxytasolla (`curl -v`), joka nÃ¤ytti envoy-proxyn estÃ¤vÃ¤n jo `CONNECT registry.npmjs.org:443` -vaiheen. Repoon ei tehty turhia package manager -vaihtoja, vaan dokumentoitiin ympÃ¤ristÃ¶vaatimus (proxy allowlist tai corporate npm mirror).
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: Kun npm antaa 403 kaikille paketeille heti metadatan haussa, varmista ensin proxy-tason CONNECT-estot ennen kuin muutat riippuvuuksia tai lockfilea.
4. Tilanne / virhe: Next.js production build kaatui, vaikka runko vaikutti toimivalta, koska vanha `src/lib/sampleData.ts` ei enÃ¤Ã¤ vastannut `RankingRow`-tyyppiÃ¤.
   Korjaus: PÃ¤ivitettiin sample-rivit vastaamaan nykyistÃ¤ skeemaa lisÃ¤Ã¤mÃ¤llÃ¤ kentÃ¤t `roc` ja `validationWarnings`, ja varmennettiin build + runtime-URLit savutestilla.
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: Aja aina production build osana v1-demo-verifiointia; se paljastaa staattisen datan ja tyyppimallien ajautumat, joita dev-tila ei vÃ¤lttÃ¤mÃ¤ttÃ¤ nÃ¤ytÃ¤.
5. Tilanne / virhe: Testien ajo repojuuresta vaati manuaalisen `PYTHONPATH=.`-muuttujan, muuten `python_pipeline`-importit epÃ¤onnistuivat joissain paikallisympÃ¤ristÃ¶issÃ¤.
   Korjaus: Siirrettiin import-pathin oletus pytest-konfiguraatioon (`pytest.ini`: `pythonpath = .`) ja lukittiin testihakemisto `testpaths`-asetuksella.
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: Kun testit nojaavat repojuuren importteihin, tallenna path-oletus testikonfigiin eikÃ¤ shell-komentoon, jotta kehitys- ja CI-ajot pysyvÃ¤t toistettavina.
6. Tilanne / virhe: PowerShellin oletustallennus saattoi kirjoittaa muokatut Next.js-tiedostot UTF-16- tai BOM-muotoon, jolloin route-tiedostot ja `package.json` rikkoivat buildin vaikeasti tulkittavilla virheillÃ¤.
   Korjaus: Muokatut tekstitiedostot kirjoitettiin eksplisiittisesti UTF-8 no BOM -muotoon ennen build-verifiointia.
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: Kun kirjoitat Node/Next-repon lÃ¤hdetiedostoja PowerShellista, lukitse encoding aina UTF-8 no BOM -muotoon etenkin `package.json`- ja route-tiedostoille.
7. Tilanne / virhe: Runtime-generoitu `next/og`-share image lisÃ¤si tarpeetonta deploy-riskiÃ¤ suhteessa v1-demoon, vaikka tavoite oli vain perustason share preview.
   Korjaus: Dynaaminen OG-kuvagenerointi korvattiin staattisella `public/social-card.svg`-kuvalla ja metadata viittasi siihen suoraan.
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: Kun v1 tarvitsee vain perus-SEO:n ja share previewn, suosi staattista preview-kuvaa ennen runtime-kuvagenerointia; tuotantopolku pysyy yksinkertaisempana ja build ennustettavampana.
8. Tilanne / virhe: UI voi nÃ¤yttÃ¤Ã¤ keskenerÃ¤iseltÃ¤, vaikka data, build ja reitit olisivat teknisesti kunnossa, jos copy on ASCII-fallbackissa ja visuaalinen hierarkia muistuttaa geneeristÃ¤ templatea.
   Korjaus: KÃ¤yttÃ¶liittymÃ¤ rakennettiin uudelleen finance/dashboard-logiikalla, nÃ¤kyvÃ¤t suomenkieliset tekstit palautettiin oikeille merkeille ja taulukon luettavuus nostettiin omaksi ensisijaiseksi suunnittelutavoitteeksi.
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: V1-tuotedemossa copy, typografia ja taulukon hierarkia ovat osa tuotteen uskottavuutta, eivÃ¤t viimeistelyÃ¤ joka tehdÃ¤Ã¤n vasta lopuksi.
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
14. Tilanne / virhe: Kun screener-UI näyttää vain rankit ja prosenttimittarit, käyttäjän on vaikea arvioida tuloksia nopeasti eikä yrityssivu kerro, mihin taustadataan ranking nojaa.
   Korjaus: Exportiin lisättiin pieni mutta eksplisiittinen `financial_snapshot`-rakenne ja datalähde-metadata, jolloin sama staattinen datasetti riittää sekä etusivun markkina-arvo-/lähdenäyttöön että yrityssivun talouslukujen esittämiseen.
   Uudelleenkäytettävä malli tai sääntö: Kun staattinen research-sovellus tarvitsee lisää läpinäkyvyyttä, laajenna ensisijaisesti exporttia pienellä metadata- ja snapshot-kerroksella sen sijaan, että rakennat erillisen fetch-polun tai uuden feature-arkkitehtuurin.