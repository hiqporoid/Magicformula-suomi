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
