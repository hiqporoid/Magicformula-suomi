# AI.md

Magicformula-suomi on suomenkielinen yksityissijoittajan tutkimustyökalu Nasdaq Helsingin ja Nasdaq Stockholmin Main Market -yhtiöille. Ensimmäinen julkaisu kattaa nämä kaksi markkinaa; muut pörssit ovat jatkokehitystä. Ei käyttäjätunnuksia, salkkuja, kaupankäyntiä tai backtestausta.

## Luotettavuustilanne 30.10.2026

Alusta ei ole julkaisuvalmis. Aiempi Yahoo-exchange-lista sisälsi myös First Northia. Se on korvattu Nasdaqin virallisella Main Market -rajapinnalla, jonka markkinat, kaikki segmentit ja sivutus on tarkistettu. Listauskattavuus ja talousdatan kattavuus ovat eri asioita: yhtiötunnisteita, talouslukuja sekä EV:n ja tilinpäätöserien kenttäkohtaisia täsmäytyksiä on vielä avoinna.

## Kerrokset ja tunnisteet

1. Universe-CSV:t säilyttävät listauskandidaatit, segmentin, varmennustilan, ISINin, yhtiötunnisteen ja lähdeviitteen.
2. Listing ID = exchange:ticker; issuer_id yhdistää yhtiön eri osakesarjat ja rinnakkaislistaukset. Kotimaa on metadataa, ei listausmaan korvike eikä automaattinen poissulku.
3. Financials-taulu sisältää lähdeluvut perusvaluuttayksiköissä, yhden yhteisen vuositilinpäätöksen, valuutat, markkina-/FX-päivän ja hakuajan. Puuttuvaa dataa ei imputoida.
4. Kelpoisuus ja laskenta ovat omissa Python-moduuleissa. 50 miljoonan markkina-arvoraja on EUR-määräinen.
5. JSON-export erottaa kandidaatit, varmennetut listaukset, metodologiset poissulut ja datan estämän laskennan.
6. Next.js lukee saman staattisen exportin kaikille sivuille. HEL/STO-suodatus ei laske yhteisrankingia uudelleen. Quality overlay ei vaikuta Magic Formulaan.

Täsmälliset kaavat, yksinkertaistukset ja lähderajoitteet: docs/methodology/calculation.md ja universe.md.

## Työjärjestys

- Lue AGENTS.md, PLANS.md, progress.md, lessons.md ja relevantit skillit.
- Tarkista Git-tila ja origin/main. Säilytä olemassa oleva työ ja aloita codex/-haara. Älä palauta vanhaa generoitu dataa uuden päälle.
- Käytä PLANS.md:tä aktiivisesti, yksi milestone työn alla.
- fetch_nordic_universe.py päivittää virallisen HEL/STO Main Market -snapshotin, GLEIFin ISIN–LEI-linkit, CSV:t ja manifestin. import_nordic_universe.py --input <varmennettu.csv> hyväksyy vain lähteillä varmennetut Main Market -listaukset; rivimäärä ei ole kattavuustodiste.
- generate_financials_csv.py hakee oletuksena vain varmennetut listaukset. --tickers HEL:UPM,STO:ATCO-B --output output/sample.csv on rajattu lähdeotos, joka ei päivitä julkaistavaa taulua.
- Aja export_ranking_json.py ja audit_universe.py. --require-complete estää toimituksen, kun molempien pörssien kattavuus ei ole varmennettu. Nykyinen osittainen aineisto hylätään tarkoituksella tällä portilla.
- Aja Python-testit, npm run lint ja npm run build sekä muuttuneen toiminnon selainvarmennus. Näytä myös lähdeotos → normalisointi → laskenta → JSON → UI.
- Päivitä lokit ja dokumentaatio. Tarkista diff, commitoi ja pushaa vain tehtävän sallimissa rajoissa.
- Data Refresh päivittää virallisen listaus- ja issuer-aineiston, talousdatan ja exportin sekä auditoi. Se ei kirjoita suoraan mainiin. Vain tekniset tarkistukset ja lähdetäsmäytyksen julkaisuportin läpäissyt muutos voi muodostaa draft-PR:n; puutteellisen ajon aineisto säilyy artefaktina.
- Tässä tehtävässä ei yhdistetä mainiin eikä julkaista tuotantoon. Maksullisia lähteitä ei hankita ilman käyttäjän lupaa.

AGENTS.md määrää työskentelyn. AI.md kuvaa projektia ja nykyistä toteutusta.
