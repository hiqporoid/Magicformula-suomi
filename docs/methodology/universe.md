# Helsinki + Stockholm Main Market -listausuniversumi

Julkaisun tavoite on Nasdaq Helsinki (HEL) ja Nasdaq Stockholm (STO) Main Market. First North, Spotlight ja muut markkinapaikat eivät kuulu siihen. Yhtiön kotimaa voi poiketa listausmaasta: kotimaa on metadataa, ei automaattinen poissulku. SW ja Sweden normalisoidaan SE:ksi; puuttuvaa kotimaata ei päätellä pörssistä.

## Kolme eri käsitettä

- Listausuniversumi: Main Market -jäsenyys on varmennettu Nasdaq-lähdeviitteellä, tarkistuspäivällä ja ISINillä. Yhtiötunnisteen saatavuus arvioidaan erikseen.
- Metodologinen kelpoisuus: finanssit, utilities, markkina-arvo alle 50 M€ sekä EBIT/EV/pääomavalidoinnit rajaavat laskentaa.
- Datan vuoksi puuttuvat: listausvarmennus, sektoriluokitus, lähdeluvut tai niiden valuutta-/päivämetadata eivät riitä. Näitä ei esitetä taloudellisesti huonoina yhtiöinä.

Kandidaattijono ei ole listausuniversumi. Aiempi Yahoo-exchange-lista sisälsi myös First Northia (esimerkiksi Admicom). Se on korvattu virallisella Nasdaq-listalla. Vähimmäisrivimäärä tai exchange-kenttä ei osoita Main Market -jäsenyyttä tai täydellistä kattavuutta.

## Osakesarjat ja rinnakkaislistaukset

Listing ID on exchange:ticker. Sama ticker eri pörsseissä ei saa yhdistää talousrivejä. ISIN yksilöi arvopaperin; sama yhtiö voi käyttää eri ISINiä eri sarjoille. issuer_id (ensisijaisesti LEI) yhdistää sarjat ja rinnakkaislistaukset. Esimerkiksi Nordea on suomalainen yhtiö, jolla on listaus molemmissa pörsseissä.

Rankingissa on yksi edustaja yhtiötä kohden koko yhteisjoukossa. Edustaja on listaustunnisteen mukaan ensimmäinen varmennettu listaus, jolla on kaikki kelpoiset tiedot. Tämä deterministinen sääntö ei väitä sarjaa likvideimmäksi. Muut kelpoiset sarjat merkitään päällekkäiseksi yhtiölistaukseksi. Epäkelpoisen sarjan oma datapuute tai metodologinen syy säilyy.

## Lähteet ja päivitys

Nasdaqin [Main Market -kuvaus](https://www.nasdaq.com/products/european-markets/main-market) ja [markkinamalli](https://www.nasdaq.com/docs/2026/03/13/Nasdaq-Nordic-Market-Model-2026-02.pdf) erottavat Large/Mid/Small Cap -päälistat First Northista. Nämä eivät yksin ole ajantasainen täydellinen listausdump.

fetch_nordic_universe.py käyttää Nasdaqin julkista shares-screener-rajapintaa: https://api.nasdaq.com/api/nordic/screener/shares?category=MAIN_MARKET&market=HEL&segment=LARGE_CAP&tableonly=false&size=1000&page=1 . Markkinat HEL/STO sekä segmentit LARGE_CAP, MID_CAP, SMALL_CAP ja SPAC tarkistetaan erikseen. Lähteen pagination.total vastaa saatujen rivien määrää ja kaikki sivut on saatava. Uusi segmentti tai vajaaksi jäänyt sivutus keskeyttää ajon.

30.10.2026 uusittu haku varmisti HEL 148 ja STO 409 listausta. Tämä on pörssikohtainen listausmäärä, ei erillisten yhtiöiden määrä. Source-snapshot docs/audit/nasdaq-listings-2026-10-30.json ja data/universe_manifest.json tallentavat markkinat, segmentit, listausjoukon, sivutuksen ja lähdevastausten tiivisteet. Tiedostojen SHA-256 lasketaan UTF-8-tekstistä LF-rivinvaihdoilla, jotta Windows/Linux-checkout ei riko varmennusta; HTTP-vastausten tiivisteet kuvaavat alkuperäisiä tavuja.

Sama päivitys hakee GLEIFin virallisen ISIN–LEI-tiedoston ja kohdistaa vain tarvittavat ISINit. Suomessa täsmällinen ja yksiselitteinen aktiivisen FI-juridisen nimen osuma on varavaihtoehto, ei sumea nimihaku. Ratkaisemattomat yhtiötunnisteet säilyvät puuttuvina. Listing ID ei korvaa issuer_id:tä, eikä ISINistä keksitä yhtiötunnistetta.

CSV-tuonnin pakollisia kenttiä ovat ticker, company, exchange, market_segment=Main Market, source_url, source_date ja kelvollinen ISIN. Koko syöte validoidaan ennen tiedostojen kirjoittamista. Lähdevarmennus vanhenee 31 päivässä. Puuttuva sektori tai issuer_id ei poista virallista listausta, mutta voi estää rankingin.

Jos julkinen rajapinta myöhemmin lakkaa toimimasta, konkreettinen listauslähteen vaihtoehto on [Nasdaq Nordic Reference Data Files](https://www.nasdaq.com/products/data/nordic-baltic/nordic-reference-data-files), jonka listing details sisältää ISINin ja tickerin. Se vaatii erillisen käyttöoikeuden eikä sitä ole hankittu. Talousdatan kattavuus tarvitsee lisäksi erillisen ratkaisun: virallisten ESEF-raporttien komponenttitäsmäytys tai lisensoitu pohjoismainen fundamenttidata. Maksullisen palvelun hankinta ja julkinen uudelleenjakeluoikeus vaativat erillisen päätöksen.

Pörssikohtaiset lukumäärät ovat JSON:n coverage-kentässä ja UI:ssa. complete_main_market_verified=false tarkoittaa, ettei kattavuusprosenttia tai koko pörssin listausmäärää voida luvata.
