# progress.md

## Projektin nimi
Magicformula-suomi

## Nykyinen tavoite
Viimeistellä repo-natiivinen skill- ja sub-agent-malli, joka tukee ylläpidettävää Helsinki-ranking v1 -kehitystä ilman ylisuunnittelua.

## Status
Skill-arkkitehtuuri täsmennetty ja käyttöohjeistus yhdenmukaistettu.

## Edistymisloki
1. Luotu repository governance -tiedostot: AGENTS.md, AI.md, progress.md, lessons.md, PLANS.md.
2. Luotu projektikohtaiset repo-skillit `.agents/skills` alle (7 kpl) eksplisiittisillä triggereillä.
3. Määritelty Helsinki Main Market -universestrategia ja v1-disclaimerit metodologiadokumentteihin.
4. Scaffoldattu Next.js-arkkitehtuurin UI shell ranking-taulukolla ja tyyppimalleilla.
5. Scaffoldattu Python data pipeline: normalisointi, validointi, Magic Formula + EBIT/EV -ranking, quality overlay.
6. Lisätty yksikkötestit normalisoinnille, rankingille ja quality scorelle; testit läpi.
7. Lisätty GitHub Actions -workflow datapäivityksen testiajoa varten.
8. Päivitetty AGENTS.md kurinalaisen finanssitutkimustuotteen periaatteilla (selitettävyys, datalaatu, v1-rajaus, closeout-checklist).
9. Refaktoroitu repo-skilliarkkitehtuuri workstream-kohtaiseksi (data, metodologia, UI, validointi, CI) ja täsmennetty triggerit/tiedostokohdistus.

## Seuraavat toimet
- Kytke oikea markkinadatalähde universe- ja talouslukuputkeen.
- Lisää finanssiyhtiöiden poissulku käytännön datavirtaan Magic Formula -ajossa.
- Toteuta UI:hin datalaatu- ja poissulkumerkinnät näkyvästi.
- Karsi mahdolliset päällekkäiset skillit jatkossa, jos ylläpitokustannus kasvaa.
