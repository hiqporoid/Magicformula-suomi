# Helsinki + Stockholm -korjausten varmennus 30.10.2026

Tämä toimitus on kehityshaara ja katselmoitava draft-PR. Alusta ei ole julkaisuvalmis. Mainiin ei yhdistetä eikä tuotantoa julkaista.

## Todistetut virheet ja vaikutus

- Yahoo-exchange sisälsi First Northia: listausuniversumi korvattiin Nasdaqin category=MAIN_MARKET-, markkina- ja segmenttisuodatetulla lähteellä. Kaikki sivut ja instrumentit tarkistetaan, eikä minimirivimäärä enää osoita kattavuutta.
- SW/SE ja kotimaan päättely poistivat Ruotsin virheellisesti: maa normalisoidaan metadataksi, eikä kotimaa ole automaattinen poissulku. Nasdaqin sektorit korvaavat vanhat Unknown-arvot; tuntematon sektori estää laskennan.
- Ticker yksin törmäsi pörssien välillä: exchange:ticker yksilöi listauksen, ISIN arvopaperin ja GLEIFin LEI yhtiön. Osakesarjat ja rinnakkaislistaukset saavat yhden deterministisen yhtiöedustajan.
- Markkina-arvoraja ilman valuuttaa korjattiin yhteiseksi 50 M€ rajaksi EKP-kurssilla. Sekoitettuja EV-valuuttoja ei arvata.
- Lähdeperiodien sekoittaminen ja puuttuvan kassan nollaus poistettiin. Laskenta vaatii yhteisen vuositilinpäätöksen, eksplisiittisen kassan/lyhyen velan ja äärelliset luvut.
- KONEen Yahoo EBIT poikkesi raportoidusta liiketuloksesta: generaattori käyttää raportoituja operatiivisia lähdekenttiä ja tallentaa käytetyn kentän.
- ROC oikaisee operatiivisen käyttöpääoman kassalla ja lyhyellä korollisella velalla. Osarankit, rankkisumma ja lopullinen järjestysluku ovat erillisiä. Quality ei vaikuta Magic Formulaan eikä puuttuvia laatutekijöitä täytetä keksityillä pisteillä.
- UI näyttää tarkat lähdeluvut, valuutat ja päivät. Markkinasuodatin rajaa 230 yhtiön yhteisjoukkoa; se ei rankkaa uudelleen. Data Refresh ei pushaa suoraan mainiin.

## Kattavuus

Nasdaq-listauslähde on haettu 30.10.2026; talous- ja markkinadata 29.10.2026. Taulukon perusjoukko on listauksia, ei yksilöllisiä yhtiöitä.

| Markkina | Main Market -listauksia | LEI ratkaistu | Rankattuja yhtiöedustajia | Metodologisia poissulkuja | Datan estämä laskenta |
|---|---:|---:|---:|---:|---:|
| Helsinki | 148 | 136 | 62 | 69 | 17 |
| Stockholm | 409 | 401 | 168 | 189 | 52 |
| Yhteensä | 557 | 537 | 230 | 258 | 69 |

Metodologiset poissulut sisältävät sektorit, euromääräisen kokorajan, ei-positiiviset laskentakomponentit ja kelpoisten rinnakkaissarjojen duplikaatit. Yhdellä rivillä voi olla useita syitä, joten syykoodeja ei saa summata yhtiömääräksi. Talousrivi saatiin 427 listaukselle; 70 finanssi-/utility-hakua ohitettiin erikseen ja 60 hakua jäi puutteelliseksi. Raaka listausjoukko säilyy näkyvissä riippumatta laskentakelpoisuudesta.

## Tarkistukset

- Python: 149 testiä läpi, mukaan lukien maakoodit, sektorit, valuutat, puuttuvat/negatiiviset/NaN/äärettömät arvot, tunnistekonfliktit, osarankit, tasatilanteet, GLEIFin täsmällinen nimitäsmäytys ja LF/CRLF-manifesti.
- Frontend-lint: ei virheitä tai varoituksia. Tuotantobuild: 1 123 staattista reittiä.
- Data-audit: disjoint-joukot, tunnisteet, kaavat, osarankit ja kattavuus kunnossa. Tarkka yhteenveto: data-audit-2026-10-30.json.
- Live-päivitys Nasdaq → GLEIF → CSV + lähdeotos + manifesti suoritettiin onnistuneesti. Financials-haku suoritettiin kaikille 557 listaukselle metodologiset ohitukset huomioiden.
- Playwright: 17 onnistunutta tarkistusta. Yhteinen 230, Suomi 62, Ruotsi 168; haku ja EUR-kokoraja; datalaatusuodattimen tyhjä tila; EBIT/EV-lajittelu; KONEen datapoissulku; KONE/UPM/Atlas/Volvo-lähdeluvut, valuutat, päivät ja raporttivaroitukset; Nokian sijoitus sekä metodologia. Ei selainkonsolin virheitä tai varoituksia.
- Neljän yhtiön lähdeotos: ../methodology/source-audit-2026-10-29.md. KONE/UPM/Volvo-lähdeluokitteluerot estävät niiden rankingin. Atlas Copcon osittainen tarkistus näkyy varoituksena. Tämä ei ole kaikkien 230 yhtiön raporttitäsmäytys.
- Tiukka --require-complete-portti palauttaa odotetusti virheen: release_ready=false. Eheyden läpäisy ei tarkoita julkaisuvalmiutta.

## Avoimet epävarmuudet ja seuraava milestone

EV:n yhtiötason osakesarja-, vähemmistö-, leasing- ja kassaoikaisujen ajankohtaa ei ole täysin varmennettu. Raportointi-/noteerausvaluutan ero estää 34 listauksen haun, ja muita komponentti-/arvostustietoja puuttuu. LEI puuttuu 20 listaukselta, joista neljä muuten kelpoista jää tämän vuoksi rankingista pois. Osa puuttuvista LEI-riveistä sulkeutuu jo muilla säännöillä.

KONEen, UPM:n ja Volvon erot voivat olla toimittajan rajaus-/luokittelueroja, eivät automaattisesti virheellisiä raportteja. Atlas Copcon kassaan sisältyvän lyhytsijoituksen liitetietotäsmäytys on avoin. Vuosiluvut ja nykyinen markkina-arvo voivat lisäksi erota yritysjärjestelyjen jälkeen. UPM:n julkistettu 31.10.2026 jakautuminen / 2.11.2026 ex-päivä vaatii erityisen uuden periodi- ja ISIN-tarkistuksen.

Seuraava tärkein milestone on virallisten ESEF-lähdekomponenttien ja EV:n laskentaperustan täsmäytys sekä datapuutejonon sulkeminen. Vaihtoehto on lisensoitu pohjoismainen fundamenttidata julkisen uudelleenjaon oikeuksin; mitään maksullista ei ole hankittu. Automaation julkaisuportti pysyy kiinni, kunnes nämä ehdot täyttyvät. CI-workflow on toteutettu, mutta GitHubin todellinen ajotulos tulee PR:n checks-näkymään erikseen.
