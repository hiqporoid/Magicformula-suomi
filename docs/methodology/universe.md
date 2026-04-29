# Helsinki Main Market -universestrategia (v1)

## Tavoite
Muodostaa vakioitu joukko yhtiöitä, joille ranking-laskenta tehdään johdonmukaisesti ja joiden poissulut voidaan selittää suoraan UI:ssa.

## Nykyinen rakenne
- Universe ladataan tiedostoista `python_pipeline/data/main_market_universe.csv` (HEL) ja `python_pipeline/data/stockholm_main_market_universe.csv` (STO).
- Universe-skeema sisältää vähintään sarakkeet `ticker`, `company`, `sector`, `exchange`.
- Talousluvut generoidaan erikseen tiedostoon `python_pipeline/data/financials.csv` skriptillä `python_pipeline/scripts/generate_financials_csv.py`.
- Export tuottaa samasta ajosta kolme näkymää: `raw_universe`, `rows` ja `excluded`.

## Sisäänottokriteerit
1. Yhtiö kuuluu Nasdaq Helsinki Main Market -v1-universeen.
2. First North jätetään kokonaan ulos tästä tiedostosta.
3. Yhtiö säilytetään raw-universessa, vaikka se ei läpäisisi ranking-kelpoisuutta.

## Financials-vaiheen periaate
- Financials-generator hakee Yahoo Financesta vuosittaiset statementit ja enterprise valuen.
- Skripti käyttää ensisijaisesti `.HE`-symbolia, mutta tuntee myös osan tickerimuutoksista alias-karttana.
- `financials.csv`:hen kirjoitetaan vain rivit, joilta vaaditut minimikentät löytyvät luotettavasti.

## Ranking-kelpoisuuden poissulkukriteerit
- Finanssisektori rajataan pois Magic Formula -rankkauksesta metodologisena v1-valintana.
- Utility-sektori rajataan pois Greenblatt-rajauksen mukaisesti.
- Ulkomaiset yhtiöt suhteessa listauspörssiin rajataan pois Greenblatt-rajauksen mukaisesti.
- Markkina-arvo alle 50 M€ rajataan pois ticker-haun suodattimena (vähimmäiskoko).
- Rankingiin tarvittavat statementit puuttuvat.
- EBIT <= 0.
- Enterprise Value <= 0.
- Sijoitetun pääoman nimittäjä <= 0.
- Sektoritieto puuttuu, jolloin metodologista rajausta ei voida varmistaa.

## Päivitysprosessi
1. Päivitä universe tiedostoon `python_pipeline/data/main_market_universe.csv`.
2. Aja `python python_pipeline/scripts/generate_financials_csv.py`.
3. Aja `python python_pipeline/scripts/export_ranking_json.py`.
4. Tarkista poissulut syyteksteineen JSON:ssa ja UI:ssa.
5. Aja `pytest`, `npm run lint` ja `npm run build` ennen mergeä.

## V1-rajaukset
- Ei First North -yhtiöitä.
- Ei erillistä finanssisektorin mallia.
- Poissulut näytetään käyttäjälle selkeinä syinä, ei sisäisinä virhekoodeina.

## Ruotsi-laajennus (toteutettu)
1. Stockholm Main Market on lisätty omaksi universe-lähteeksi (`exchange=STO`).
2. Financials-generator tukee nyt `.HE` ja `.ST` -symbolit exchange-kentän perusteella.
3. Ranking-laskenta pysyy samana ja UI:n pörssisuodatin mahdollistaa HEL/STO rajauksen samalla datasetillä.
