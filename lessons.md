# lessons.md

## Tiedoston tarkoitus
Koota projektin aikana opitut asiat yhteen, jotta virheet eivät toistu ja hyvät käytännöt monistuvat.

## Numeroitu formaatti
Kirjaa opit juoksevasti numeroituna listana muodossa:
1. Tilanne / virhe
2. Korjaus
3. Uudelleenkäytettävä malli tai sääntö

## Kirjauskonventiot
- Ole konkreettinen: viittaa päätökseen, ei yleiseen tuntemukseen.
- Kuvaa vaikutus: mitä parani (laatu, nopeus, luotettavuus).
- Kirjaa vain aidosti toistettavat mallit.

## Opit
1. Tilanne / virhe: Rankinglogiikassa tasatilanteet jäisivät helposti epädeterministisiksi, jos lajittelu tehdään vain pistemäärällä.
   Korjaus: Lisättiin vakioitu tie-breaker tickerin aakkosjärjestyksellä ja testattiin tapaus.
   Uudelleenkäytettävä malli tai sääntö: Kaikissa ranking-funktioissa määritä eksplisiittinen toissijainen sort-kenttä.
2. Tilanne / virhe: Frontend jäi sampledatan varaan, jolloin pipeline ja UI eivät muodostaneet testattavaa kokonaisuutta.
   Korjaus: Lisättiin kevyt JSON-export pipelineen ja luettiin sama tiedosto suoraan Next.js:ssä tyyppimäppäyksen kautta.
   Uudelleenkäytettävä malli tai sääntö: v1-vaiheessa suosi staattista väliformaattia (JSON) ennen tietokantaa, kun tavoite on nopeasti todennettava end-to-end thin slice.
3. Tilanne / virhe: Frontendin `npm install` epäonnistui virheellä 403, vaikka `registry` oli oikein (`https://registry.npmjs.org/`) eikä repossa ollut virheellistä `.npmrc`-ylikirjoitusta.
   Korjaus: Juurisyyn varmistus tehtiin verkko-/proxytasolla (`curl -v`), joka näytti envoy-proxyn estävän jo `CONNECT registry.npmjs.org:443` -vaiheen. Repoon ei tehty turhia package manager -vaihtoja, vaan dokumentoitiin ympäristövaatimus (proxy allowlist tai corporate npm mirror).
   Uudelleenkäytettävä malli tai sääntö: Kun npm antaa 403 kaikille paketeille heti metadatan haussa, varmista ensin proxy-tason CONNECT-estot ennen kuin muutat riippuvuuksia tai lockfilea.
