# Helsinki Main Market -universestrategia (v1)

## Tavoite
Muodostaa vakioitu joukko yhtioita, joille ranking-laskenta tehdaan johdonmukaisesti ja joiden poissulut voidaan selittaa suoraan UI:ssa.

## Sisaanottokriteerit
1. Yhtio on listattu Nasdaq Helsinki Main Market -segmentissa.
2. Yhtiolla on saatavilla vaaditut talousrivit: EBIT, Enterprise Value, Current Assets, Current Liabilities ja Net PPE.
3. Yhtio ei ole pysyvassa kaupankaynnin keskeytyksessa.

## Poissulkukriteerit
- Datarivi puuttuu useammalta kuin yhdelta kriittiselta kentata.
- Enterprise Value <= 0, jolloin Earnings Yield / EBIT/EV ei ole mielekas.
- Sijoitetun paoman nimittaja <= 0, jolloin ROC ei ole mielekas.
- Rivi on muuten niin puutteellinen, ettei tunnuslukua voi julkaista rehellisesti.

## Paivitysprosessi
1. Paivita universe `python_pipeline/data/universe.csv` -tiedostoon.
2. Aja normalisointi ja JSON-export.
3. Tarkista poissulut syykoodeineen.
4. Julkaise paivitetty ranking ja dokumentoi exportin paivamaara.

## V1-rajaukset
- Ei First North -yhtioita.
- Ei erillista finanssisektorin mallia.
- Poissulut pyritaan nayttamaan yksinkertaisina syina, ei pitkina validointilokeina.

