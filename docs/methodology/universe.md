# Helsinki Main Market -universestrategia (v1)

## Tavoite
Muodostaa vakioitu joukko yhtiöitä, joille ranking-laskenta tehdään johdonmukaisesti.

## Sisäänottokriteerit
1. Yhtiö on listattu Nasdaq Helsinki Main Market -segmentissä.
2. Yhtiöllä on saatavilla vähintään vaaditut talousrivit: EBIT, Enterprise Value, Current Assets, Current Liabilities, Net PPE.
3. Yhtiö ei ole pysyvässä kaupankäynnin keskeytyksessä.

## Poissulkukriteerit
- Datarivi puuttuu useammalta kuin yhdeltä kriittiseltä kentältä.
- Enterprise Value <= 0 (Earnings Yield ei mielekäs).
- Sijoitetun pääoman nimittäjä <= 0 (ROC ei mielekäs).

## Päivitysprosessi
1. Päivitä raakadata universelistasta.
2. Aja normalisointiputki.
3. Kirjaa hylätyt tickerit syykoodeineen.
4. Julkaise universelista ja versioi päivämäärä.

## V1-rajaukset
- Ei First North -yhtiöitä.
- Ei finanssisektorin erillismallia (tehdään myöhemmin, jos tarpeen).
