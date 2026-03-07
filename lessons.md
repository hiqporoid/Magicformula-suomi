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
