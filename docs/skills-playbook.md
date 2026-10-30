# Projektiskillien käyttö

- helsinki-universe: HEL/STO Main Market -listaus, segmenttitodiste ja ISIN/issuer-tunnisteet. Nimi säilyy yhteensopivuuden vuoksi.
- financial-data-normalization: lähdekomponentit, valuutat, yksiköt, periodit ja puuttuvat arvot.
- magic-formula-ranking: ROC, EBIT/EV, osarankit, rankkisumma ja exchange:ticker-tasatilanteet.
- finance-validation-and-disclaimer: datapuute/metodologia-erottelu, lähdetäsmäytys ja riskitekstit.
- nextjs-finance-table-ui / finance-research-ui: tutkimusnäkymä ja suodattimien ymmärrettävä vaikutus.
- github-actions-data-refresh: lähteistä alkava kokonainen päivitys ja julkaisuportit.

Työn jälkeen: Python-testit, lint, build, data-audit ja muuttuneen toiminnon selainvarmennus. Datan muutoksessa tarkista lisäksi lähde → lähdeluku → laskenta → JSON → UI; onnistunut build ei korvaa lähdetarkistusta.

Ensimmäinen julkaisu rajautuu Helsingin ja Tukholman Main Marketiin. Nasdaqin category=MAIN_MARKET-, markkina- ja segmenttisuodattimet sekä sivutus todentavat listausjoukon. Yahoo-exchange tai minimirivimäärä ei osoita listauskattavuutta. 50 M€ on laskennan euromääräinen kelpoisuusraja, ei universen hankintasuodatin.

Dokumentoi lopuksi progress.md ja lessons.md. Päivitä AI.md, PLANS.md ja metodologia toteutuksen mukaisiksi; älä merkitse alustaa valmiiksi avoimien lähde- tai laskentakysymysten aikana.
