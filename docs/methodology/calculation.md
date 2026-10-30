# Laskenta ja lähdeperusteet — v2

## Ensisijainen menetelmä

Joel Greenblattin [kirjan Appendix A](https://www.oreilly.com/library/view/the-little-book/9780470624159/apa.html) kuvaa kahden tekijän rankingin ja ROC:n kaavana EBIT / (net working capital + net fixed assets). [Menetelmän oma FAQ](https://www.magicformulainvesting.com/Home/Faqs) perustelee finanssi- ja utility-poissulut niiden laskentatoimen eroilla. US-listausraja ei tarkoita ulkomaisen kotimaan automaattista poissulkua Suomen ja Ruotsin sovelluksessa.

Tämä on projektin pohjoismainen, vuositilinpäätökseen perustuva tulkinta. Se ei jäljennä menetelmän kaupallisen seulonnan kaikkia kirjanpito-oikaisuja.

## Täsmälliset kaavat

EBIT = raportoitu vuotuinen liiketulos ennen korkoja ja veroja. Yahoo-kenttä valitaan järjestyksessä Total Operating Income As Reported, Operating Income; käytetty kenttä tallennetaan. Yahoo EBITiä ei käytetä automaattisesti, sillä esimerkiksi KONEen otoksessa se sisältää eron raportoituun liiketulokseen.

Operatiivinen käyttöpääoma = (current_assets − cash) − (current_liabilities − short_term_debt).
Sijoitettu aineellinen pääoma = operatiivinen käyttöpääoma + net_ppe.
ROC = EBIT / sijoitettu aineellinen pääoma.
Earnings yield = EBIT / EV.

Rahavarat sisältävät toimittajan cash + lyhytaikaiset sijoitukset, jos yhteiskenttä löytyy, muutoin cash and cash equivalents. Lyhyt korollinen velka sisältää toimittajan vuokrasopimusvelat, jos yhteiskenttä löytyy. Nämä toimittajan standardoinnit eivät välttämättä vastaa suoraan raportin nimikkeitä. Kaikki komponentit ovat samalta uusimmalta yhteiseltä vuosiperiodilta. Puuttuvaa uusinta erää ei haeta vanhemmalta vuodelta. NWC:tä ei leikata nollaan. Kokonaispääoman on oltava positiivinen; negatiivisen käyttöpääoman yhtiöitä voi siten pudota pois. Liikearvo ja muut aineettomat erät eivät ole Net PPE:tä. Laskenta ei käytä keskimääräistä vuoden pääomaa.

EV = Yahoo Financesta raportoitu enterpriseValue. Sen velka-, kassa-, vähemmistö- ja etuosakeoikaisujen päivä ja kattavuus eivät ole täysin todennettavissa. Sovellus ei korvaa puuttuvaa EV:tä keksityllä nettovelkakaavalla. Jos raportointi- ja noteerausvaluutta eroavat, generaattori jättää rivin pois, kunnes EV:n valuuttaperusta on varmennettu. Tämä rajoittaa kattavuutta tarkoituksella.

## Valuutat, yksiköt ja aika

- Kaikki laskentakomponentit ovat saman valuutan perusyksiköissä, eivät miljoonina tai tuhansina. UI muotoilee ne miljooniksi ja näyttää valuutan.
- Markkina-arvon vähimmäisraja on 50 000 000 EUR molemmille pörsseille. 50 MSEK ei ole 50 M€.
- Markkina-arvo euroina = lähdearvo noteerausvaluutassa × fx_rate_to_eur. Kurssi ja päivä tallennetaan [EKP:n viitekurssista](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html).
- Vuositilinpäätös, markkinadatan päivä, FX-päivä ja noutoaika ovat erillisiä tietoja. JSON:n generated_at on vain viennin luontiaika.
- Yli 550 päivää vanha tilinpäätös ja yli 10 päivää vanha markkina-/FX-data estävät uuden rankingin. Tulevat tai epäjohdonmukaiset päivät hylätään. Staattinen julkaisu ei itsestään vanhenna jo rakennettua aineistoa; päivät näkyvät käyttäjälle.
- Raportoitu vuositulos ja nykyinen markkina-arvo eivät ole samalta päivältä. Yritysjärjestelyt voivat tehdä tämän yhdistelmän kelvottomaksi. Ne vaativat erillisen lähdetarkistuksen.

## Ranking ja tasatilanteet

Molemmat osarankingit lasketaan laskevasti koko varmennetusta, kelpoisesta HEL+STO-yhtiöjoukosta. Sama mittari ratkaistaan listaustunnisteen (exchange:ticker) aakkosjärjestyksellä. Osarankit summataan; pienempi summa on parempi. Summatasatilanne ratkeaa samalla listaustunnisteella. Lopullinen sijoitus on järjestysluku, ei rankkisumma.

Markkina-, haku-, koko- ja datalaatusuodattimet rajaavat näkymää. Ne eivät laske sijoituksia uudelleen. Osittaisen otoksen sijoitus koskee vain nykyistä laskettavaa joukkoa, ei koko pörssiä.

## Virhe- ja poissulkusäännöt

Puuttuva luku, NaN, ±Infinity, virheellinen valuutta/yksikkö/päivä, tuntematon sektori tai varmentamaton listaus estää laskennan. Pakollinen kassa ja lyhyt velka saavat olla nolla vain lähteessä todettuna. EBIT, EV ja sijoitettu pääoma vaativat arvon >0. Negatiiviset tasekomponentit ja alierän kokonaiserän ylitys hylätään.

Finanssit ja utilities rajataan pois lähteen sektoriluokituksen perusteella. Erillistä Real Estate -sektoria ei niputeta automaattisesti finansseihin; sen tasevaltainen liiketoiminta voi silti heikentää ROC-vertailua. Tuntematon sektori on datapuute. Kotimaa ei ole metodologinen poissulku.

## Erillinen quality overlay

Laatupiste ei vaikuta Magic Formulaan. Se tarvitsee aidon ROIC:n ja debt/EBITDA-luvun. Puuttuvat tiedot tuottavat null, eivät keskimääräistä laatua tai keksittyä vakauspistettä.

ROIC-komponentti = clamp(ROIC × 200, 0, 50).
Velkakomponentti = clamp((4 − debt/EBITDA) × 8,33, 0, 25).
Laatupiste = (komponenttien summa / 75) × 100, kahteen desimaaliin. Painot ovat 2/3 ja 1/3.
