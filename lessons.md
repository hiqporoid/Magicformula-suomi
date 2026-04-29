# lessons.md

## Tiedoston tarkoitus
Koota projektin aikana opitut asiat yhteen, jotta virheet eivÃƒÆ’Ã‚Â¤t toistu ja hyvÃƒÆ’Ã‚Â¤t kÃƒÆ’Ã‚Â¤ytÃƒÆ’Ã‚Â¤nnÃƒÆ’Ã‚Â¶t monistuvat.

## Numeroitu formaatti
Kirjaa opit juoksevasti numeroituna listana muodossa:
1. Tilanne / virhe
2. Korjaus
3. UudelleenkÃƒÆ’Ã‚Â¤ytettÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤ malli tai sÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ntÃƒÆ’Ã‚Â¶

## Kirjauskonventiot
- Ole konkreettinen: viittaa pÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤tÃƒÆ’Ã‚Â¶kseen, ei yleiseen tuntemukseen.
- Kuvaa vaikutus: mitÃƒÆ’Ã‚Â¤ parani (laatu, nopeus, luotettavuus).
- Kirjaa vain aidosti toistettavat mallit.

## Opit
1. Tilanne / virhe: Rankinglogiikassa tasatilanteet jÃƒÆ’Ã‚Â¤isivÃƒÆ’Ã‚Â¤t helposti epÃƒÆ’Ã‚Â¤deterministisiksi, jos lajittelu tehdÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤n vain pistemÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤rÃƒÆ’Ã‚Â¤llÃƒÆ’Ã‚Â¤.
   Korjaus: LisÃƒÆ’Ã‚Â¤ttiin vakioitu tie-breaker tickerin aakkosjÃƒÆ’Ã‚Â¤rjestyksellÃƒÆ’Ã‚Â¤ ja testattiin tapaus.
   UudelleenkÃƒÆ’Ã‚Â¤ytettÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤ malli tai sÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ntÃƒÆ’Ã‚Â¶: Kaikissa ranking-funktioissa mÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ritÃƒÆ’Ã‚Â¤ eksplisiittinen toissijainen sort-kenttÃƒÆ’Ã‚Â¤.
2. Tilanne / virhe: Frontend jÃƒÆ’Ã‚Â¤i sampledatan varaan, jolloin pipeline ja UI eivÃƒÆ’Ã‚Â¤t muodostaneet testattavaa kokonaisuutta.
   Korjaus: LisÃƒÆ’Ã‚Â¤ttiin kevyt JSON-export pipelineen ja luettiin sama tiedosto suoraan Next.js:ssa tyyppimÃƒÆ’Ã‚Â¤ppÃƒÆ’Ã‚Â¤yksen kautta.
   UudelleenkÃƒÆ’Ã‚Â¤ytettÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤ malli tai sÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ntÃƒÆ’Ã‚Â¶: v1-vaiheessa suosi staattista vÃƒÆ’Ã‚Â¤liformaattia (JSON) ennen tietokantaa, kun tavoite on nopeasti todennettava end-to-end thin slice.
3. Tilanne / virhe: Frontendin `npm install` epÃƒÆ’Ã‚Â¤onnistui virheellÃƒÆ’Ã‚Â¤ 403, vaikka `registry` oli oikein (`https://registry.npmjs.org/`) eikÃƒÆ’Ã‚Â¤ repossa ollut virheellistÃƒÆ’Ã‚Â¤ `.npmrc`-ylikirjoitusta.
   Korjaus: Juurisyyn varmistus tehtiin verkko-/proxytasolla (`curl -v`), joka nÃƒÆ’Ã‚Â¤ytti envoy-proxyn estÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤n jo `CONNECT registry.npmjs.org:443` -vaiheen. Repoon ei tehty turhia package manager -vaihtoja, vaan dokumentoitiin ympÃƒÆ’Ã‚Â¤ristÃƒÆ’Ã‚Â¶vaatimus (proxy allowlist tai corporate npm mirror).
   UudelleenkÃƒÆ’Ã‚Â¤ytettÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤ malli tai sÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ntÃƒÆ’Ã‚Â¶: Kun npm antaa 403 kaikille paketeille heti metadatan haussa, varmista ensin proxy-tason CONNECT-estot ennen kuin muutat riippuvuuksia tai lockfilea.
4. Tilanne / virhe: Next.js production build kaatui, vaikka runko vaikutti toimivalta, koska vanha `src/lib/sampleData.ts` ei enÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ vastannut `RankingRow`-tyyppiÃƒÆ’Ã‚Â¤.
   Korjaus: PÃƒÆ’Ã‚Â¤ivitettiin sample-rivit vastaamaan nykyistÃƒÆ’Ã‚Â¤ skeemaa lisÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤mÃƒÆ’Ã‚Â¤llÃƒÆ’Ã‚Â¤ kentÃƒÆ’Ã‚Â¤t `roc` ja `validationWarnings`, ja varmennettiin build + runtime-URLit savutestilla.
   UudelleenkÃƒÆ’Ã‚Â¤ytettÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤ malli tai sÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ntÃƒÆ’Ã‚Â¶: Aja aina production build osana v1-demo-verifiointia; se paljastaa staattisen datan ja tyyppimallien ajautumat, joita dev-tila ei vÃƒÆ’Ã‚Â¤lttÃƒÆ’Ã‚Â¤mÃƒÆ’Ã‚Â¤ttÃƒÆ’Ã‚Â¤ nÃƒÆ’Ã‚Â¤ytÃƒÆ’Ã‚Â¤.
5. Tilanne / virhe: Testien ajo repojuuresta vaati manuaalisen `PYTHONPATH=.`-muuttujan, muuten `python_pipeline`-importit epÃƒÆ’Ã‚Â¤onnistuivat joissain paikallisympÃƒÆ’Ã‚Â¤ristÃƒÆ’Ã‚Â¶issÃƒÆ’Ã‚Â¤.
   Korjaus: Siirrettiin import-pathin oletus pytest-konfiguraatioon (`pytest.ini`: `pythonpath = .`) ja lukittiin testihakemisto `testpaths`-asetuksella.
   UudelleenkÃƒÆ’Ã‚Â¤ytettÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤ malli tai sÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ntÃƒÆ’Ã‚Â¶: Kun testit nojaavat repojuuren importteihin, tallenna path-oletus testikonfigiin eikÃƒÆ’Ã‚Â¤ shell-komentoon, jotta kehitys- ja CI-ajot pysyvÃƒÆ’Ã‚Â¤t toistettavina.
6. Tilanne / virhe: PowerShellin oletustallennus saattoi kirjoittaa muokatut Next.js-tiedostot UTF-16- tai BOM-muotoon, jolloin route-tiedostot ja `package.json` rikkoivat buildin vaikeasti tulkittavilla virheillÃƒÆ’Ã‚Â¤.
   Korjaus: Muokatut tekstitiedostot kirjoitettiin eksplisiittisesti UTF-8 no BOM -muotoon ennen build-verifiointia.
   UudelleenkÃƒÆ’Ã‚Â¤ytettÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤ malli tai sÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ntÃƒÆ’Ã‚Â¶: Kun kirjoitat Node/Next-repon lÃƒÆ’Ã‚Â¤hdetiedostoja PowerShellista, lukitse encoding aina UTF-8 no BOM -muotoon etenkin `package.json`- ja route-tiedostoille.
7. Tilanne / virhe: Runtime-generoitu `next/og`-share image lisÃƒÆ’Ã‚Â¤si tarpeetonta deploy-riskiÃƒÆ’Ã‚Â¤ suhteessa v1-demoon, vaikka tavoite oli vain perustason share preview.
   Korjaus: Dynaaminen OG-kuvagenerointi korvattiin staattisella `public/social-card.svg`-kuvalla ja metadata viittasi siihen suoraan.
   UudelleenkÃƒÆ’Ã‚Â¤ytettÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤ malli tai sÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ntÃƒÆ’Ã‚Â¶: Kun v1 tarvitsee vain perus-SEO:n ja share previewn, suosi staattista preview-kuvaa ennen runtime-kuvagenerointia; tuotantopolku pysyy yksinkertaisempana ja build ennustettavampana.
8. Tilanne / virhe: UI voi nÃƒÆ’Ã‚Â¤yttÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ keskenerÃƒÆ’Ã‚Â¤iseltÃƒÆ’Ã‚Â¤, vaikka data, build ja reitit olisivat teknisesti kunnossa, jos copy on ASCII-fallbackissa ja visuaalinen hierarkia muistuttaa geneeristÃƒÆ’Ã‚Â¤ templatea.
   Korjaus: KÃƒÆ’Ã‚Â¤yttÃƒÆ’Ã‚Â¶liittymÃƒÆ’Ã‚Â¤ rakennettiin uudelleen finance/dashboard-logiikalla, nÃƒÆ’Ã‚Â¤kyvÃƒÆ’Ã‚Â¤t suomenkieliset tekstit palautettiin oikeille merkeille ja taulukon luettavuus nostettiin omaksi ensisijaiseksi suunnittelutavoitteeksi.
   UudelleenkÃƒÆ’Ã‚Â¤ytettÃƒÆ’Ã‚Â¤vÃƒÆ’Ã‚Â¤ malli tai sÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ntÃƒÆ’Ã‚Â¶: V1-tuotedemossa copy, typografia ja taulukon hierarkia ovat osa tuotteen uskottavuutta, eivÃƒÆ’Ã‚Â¤t viimeistelyÃƒÆ’Ã‚Â¤ joka tehdÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤n vasta lopuksi.
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
14. Tilanne / virhe: Kun screener-UI nÃƒÂ¤yttÃƒÂ¤ÃƒÂ¤ vain rankit ja prosenttimittarit, kÃƒÂ¤yttÃƒÂ¤jÃƒÂ¤n on vaikea arvioida tuloksia nopeasti eikÃƒÂ¤ yrityssivu kerro, mihin taustadataan ranking nojaa.
   Korjaus: Exportiin lisÃƒÂ¤ttiin pieni mutta eksplisiittinen `financial_snapshot`-rakenne ja datalÃƒÂ¤hde-metadata, jolloin sama staattinen datasetti riittÃƒÂ¤ÃƒÂ¤ sekÃƒÂ¤ etusivun markkina-arvo-/lÃƒÂ¤hdenÃƒÂ¤yttÃƒÂ¶ÃƒÂ¶n ettÃƒÂ¤ yrityssivun talouslukujen esittÃƒÂ¤miseen.
   UudelleenkÃƒÂ¤ytettÃƒÂ¤vÃƒÂ¤ malli tai sÃƒÂ¤ÃƒÂ¤ntÃƒÂ¶: Kun staattinen research-sovellus tarvitsee lisÃƒÂ¤ÃƒÂ¤ lÃƒÂ¤pinÃƒÂ¤kyvyyttÃƒÂ¤, laajenna ensisijaisesti exporttia pienellÃƒÂ¤ metadata- ja snapshot-kerroksella sen sijaan, ettÃƒÂ¤ rakennat erillisen fetch-polun tai uuden feature-arkkitehtuurin.
15. Tilanne / virhe: Research-tyÃ¶kalun UI voi jÃ¤Ã¤dÃ¤ yhÃ¤ liian raskaaksi, vaikka vÃ¤rit ja komponentit olisivat jo uskottavia, jos otsikot, rivivÃ¤lit ja osioiden vÃ¤lit jÃ¤Ã¤vÃ¤t landing page -tasolle.
   Korjaus: Tiivistettiin koko nÃ¤kymÃ¤n typografinen skaala ja pystysuuntainen rytmi yhtÃ¤ aikaa sekÃ¤ kirjoitettiin metodologiasivu uudelleen laskentaa palvelevaksi selosteeksi yleisen esittelytekstin sijaan.
   UudelleenkÃ¤ytettÃ¤vÃ¤ malli tai sÃ¤Ã¤ntÃ¶: Kun sijoitustyÃ¶kalun kÃ¤yttÃ¶liittymÃ¤ tuntuu liian "isolta", Ã¤lÃ¤ korjaa vain yksittÃ¤istÃ¤ hero-otsikkoa vaan sÃ¤Ã¤dÃ¤ samaan passiin otsikkohierarkia, line-height, korttipaddingit, section-gapit ja copyn pituus.
16. Tilanne / virhe: Yksittäinenkin väärässä merkistössä tallennettu UI-tiedosto voi päästää tuotantoon mojibake-tekstiä, vaikka lint ja build menisivät läpi normaalisti.
   Korjaus: Tarkistus tehtiin suoraan renderöidystä HTML:stä eikä vain lähdekoodista, minkä jälkeen näkyvät käyttöliittymätekstit kirjoitettiin uudelleen oikeilla merkeillä ja rikkinäisiin metadata-detail-kenttiin nojaava copy poistettiin näkyvästä UI:sta.
   Uudelleenkäytettävä malli tai sääntö: Kun epäilet ääkkösongelmaa, varmista aina sekä lähdetiedosto että renderöity HTML; buildin onnistuminen ei riitä todistamaan, että merkistö on käyttäjälle asti oikein.
17. Tilanne / virhe: Skillit jäävät helposti "asennettu mutta passiivinen" -tilaan, jos niiden käyttöä ei sidota konkreettisiin trigger-hetkiin (esim. ennen UI-refactoria, ennen data refresh -workflowmuutoksia, ennen laajaa refaktorointia).
   Korjaus: Määriteltiin projektitasolle käytännön aktivointimalli: domain-skillit nykyisiin rahoitus- ja UI-töihin, plus 1–2 geneeristä tukiskilliä (suunnittelu + codebase-analyysi) milestone-kohtaisesti.
   Uudelleenkäytettävä malli tai sääntö: Arvo syntyy yhdistelmästä "skilli + trigger + työvaihe"; pelkkä skill-kokoelma ei paranna laatua ilman ennakkoon sovittua käyttöpolkua.
18. Tilanne / virhe: Monipörssitukea on vaikea lisätä jälkikäteen, jos exchange-tieto puuttuu universen perusskeemasta ja UI-suodatus nojaa vain yhteen implisiittiseen markkinaan.
   Korjaus: Lisättiin `exchange` skeeman ydinkentäksi pipelineen, exportiin ja UI-taulukon suodatukseen jo ennen varsinaista Ruotsi-dataa.
   Uudelleenkäytettävä malli tai sääntö: Kun tiedossa on lähiajan markkinalaajennus, tee ensin pieni skeemamuutos + näkyvä UI-koukku; varsinainen datalaajennus voidaan tehdä seuraavassa vaiheessa ilman arkkitehtuuriremonttia.
19. Tilanne / virhe: Pelkkä testien läpimeno ei yksin kerro, onko universen kattavuus, poissulkujen rakenne ja rank-sekvenssi liiketoimintalogiikan näkökulmasta järkevä jokaisessa export-ajossa.
   Korjaus: Lisättiin erillinen audit-skripti, joka tuottaa helposti luettavan laatuyhteenvedon (`raw/ranked/excluded`, exchange-jakauma, poissulkusyyt, rank-eheys) ennen deployta.
   Uudelleenkäytettävä malli tai sääntö: Pidä data-pipelineen aina mukana yksi ihmisen luettava audit-askel testien rinnalla; se paljastaa nopeasti regressiot, joita yksikkötestit eivät yksin tee näkyväksi.
