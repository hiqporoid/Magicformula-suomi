# progress.md

## Projektin nimi
Magicformula-suomi

## Nykyinen tavoite
Saada v1 bootstrap + ensimmäinen tekninen scaffold valmiiksi (universe, pipeline, ranking, UI shell).

## Status
Perusrunko valmis, jatkokehitys käynnissä.

## Edistymisloki
1. Luotu repository governance -tiedostot: AGENTS.md, AI.md, progress.md, lessons.md, PLANS.md.
2. Luotu projektikohtaiset repo-skillit `.agents/skills` alle (7 kpl) eksplisiittisillä triggereillä.
3. Määritelty Helsinki Main Market -universestrategia ja v1-disclaimerit metodologiadokumentteihin.
4. Scaffoldattu Next.js-arkkitehtuurin UI shell ranking-taulukolla ja tyyppimalleilla.
5. Scaffoldattu Python data pipeline: normalisointi, validointi, Magic Formula + EBIT/EV -ranking, quality overlay.
6. Lisätty yksikkötestit normalisoinnille, rankingille ja quality scorelle; testit läpi.
7. Lisätty GitHub Actions -workflow datapäivityksen testiajoa varten.

## Seuraavat toimet
- Kytke oikea markkinadatalähde universe- ja talouslukuputkeen.
- Toteuta UI:n lajittelu/suodatus oikealla datalla (ei sampledata).
- Lisää metodologian yksityiskohtaiset kaavat ja sektorikohtaiset huomiot.
