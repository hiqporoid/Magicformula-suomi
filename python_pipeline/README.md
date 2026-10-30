# Python-pipeline: Helsinki + Stockholm

Kerrokset: virallinen listauslähde → yhtiötunnisteet → talousdatan hankinta → kelpoisuus/normalisointi → ranking → JSON → UI.

- fetch_nordic_universe.py tarkistaa Nasdaqin Main Market -listan markkinoittain ja segmenteittäin. Se päivittää ISIN–LEI-linkit refresh_issuer_mapping.py:llä ja validoi CSV-tuonnin import_nordic_universe.py:llä.
- universe_manifest.json sitoo CSV:t lähdeotoksen listausjoukkoon ja SHA-256-tiivisteisiin. Listausjäsenyys ei riipu LEI- tai talousdatan saatavuudesta.
- generate_financials_csv.py hakee uusimman yhteisen vuositilinpäätöksen, raportoituun liiketulokseen perustuvan EBITin ja markkinatiedot. --skip-methodological jättää finanssi-/utility-haut pois erikseen auditoituina.
- eligibility.py erottaa poissulut datapuute- ja metodologialuokkiin. normalization.py ei imputoi pakollisia lähdelukuja.
- ranking.py laskee yhteisen HEL+STO Magic Formulan. quality.py on erillinen, puuttuvilla laatutekijöillä null.
- export_ranking_json.py käyttää exchange:ticker-listausavaimia, issuer_id-yhtiöryhmittelyä ja financial_source_checks.csv:n ristiriitaporttia.
- audit_universe.py tarkistaa joukkojen ja tunnisteiden eheyden, kaavat, osarankit, järjestyksen sekä kattavuusluvut. --require-complete on tiukempi julkaisuportti.

## Ajot repojuuresta

```powershell
python -m pip install -r requirements.txt
python python_pipeline/scripts/fetch_nordic_universe.py
python python_pipeline/scripts/generate_financials_csv.py --skip-methodological
python python_pipeline/scripts/export_ranking_json.py
python python_pipeline/scripts/audit_universe.py
python -m pytest -q
```

pytest.ini asettaa import-polun. Python 3.11 on CI:n versio. Windowsissa paikallinen venv voi käyttää uudempaa Pythonia; aja samat reunatapaustestit kummassakin ympäristössä.

Financials-haku kirjoittaa audit-JSON:n CSV:n viereen. Puuttuva EV-valuuttamääritys, puuttuva yhteinen periodi tai lähdekomponentti säilyy eksplisiittisenä puutteena. Kaikkien hakujen epäonnistuminen ei ylikirjoita vanhaa taloustaulua tyhjällä.

GitHub Actions käyttää samoja komentoja. Se arkistoi aineiston ja muodostaa vain julkaisuportin läpäisevistä muutoksista draft-PR:n, ei suoraa main-committia.

Menetelmä ja rajat: ../docs/methodology/calculation.md, universe.md ja source-audit-2026-10-29.md.
