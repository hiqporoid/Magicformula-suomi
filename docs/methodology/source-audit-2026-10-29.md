# Lähdeotos 29.10.2026: Helsinki ja Stockholm

Päivitys 30.10.2026: otoksen jälkeen koko virallinen listausjoukko ja taloushaku on ajettu. Nasdaq-listausotos kattaa HEL 148 / STO 409 listausta; talousrivi saatiin 427 listaukselle. Nykyinen yhteisranking sisältää 62 HEL- ja 168 STO-yhtiötä. Tämä otos on edelleen vain neljän yhtiön komponenttitarkistus, ja sen avoimet lähde-erot säilyvät laskennan estävinä merkintöinä tai näkyvinä varoituksina.

Tämä on neljän yhtiön rajattu jäljitettävyystarkistus, ei koko aineiston oikeellisuuslausunto. Yahoo Finance -haku onnistui 29.10.2026 klo 18.07–18.11 UTC. Tulos on välitaulussa `python_pipeline/data/financials.csv` ja JSON:ssa; pörssi:ticker erottaa listaukset. Samana päivänä haettiin kaikki kymmenen silloin varmennettua listausta: kahdeksan talousriviä, kaksi Nordean finanssipoissulkua jäi ilman teollisuusyrityksen tasekenttiä.

## Talouslukujen ketju

Kaikissa riveissä vuosijakso päättyy 31.12.2025, `amount_unit=units`; alla luvut miljoonina. EBIT poimitaan kentästä `Total Operating Income As Reported`, ei Yahoo-kentästä `EBIT`. Laskennan lähdekentät säilyvät CSV:n `source_fields`-sarakkeessa. Esimerkiksi KONEen Yahoo-EBIT 1 367,2 ei vastaa raportin liiketulosta 1 336,2: korjattu kenttä vastaa raporttia.

| Listaus | Valuutta | EBIT | Lyhytaikaiset varat | Lyhytaikaiset velat | Netto-PPE | Kassa + lyhytsijoitukset | Lyhyt korollinen velka |
|---|---|---:|---:|---:|---:|---:|---:|
| HEL:KNEBV | EUR | 1 336,2 | 5 681,4 | 5 273,1 | 942,5 | 1 698,9 | 343,3 |
| HEL:UPM | EUR | 749 | 4 194 | 2 234 | 7 237 | 716 | 152 |
| STO:ATCO-B | SEK | 34 114 | 87 018 | 56 006 | 33 505 | 15 923 | 6 471 |
| STO:VOLV-B | SEK | 48 506 | 305 570 | 265 914 | 124 311 | 64 903 | 110 584 |

Nämä ovat haetut providerluvut, eivät manuaalisesti korjattuja raporttilukuja. Käyttöliittymän `financial_snapshot` käyttää samoja lukuja. Nimittäjä on `(varat − kassa) − (velat − lyhyt korollinen velka) + netto-PPE`. Kassakenttä sisältää providerin lyhytsijoitukset. Leasing-varat ja -velat sisältyvät providerin PPE/velkakenttiin. Negatiivista käyttöpääomaa ei nosteta nollaan; kokonaisnimittäjän on oltava positiivinen.

## Vertailu yhtiöiden raportteihin

- [KONE Annual Review 2025](https://www.kone.com/en/Images/KONE_Annual%20Review_2025_tcm17-141619.pdf), s. 89–90 (PDF 89–90): EBIT, varat, velat ja PPE täsmäävät. Raportin kassa 440,5 + talletukset ja muut lyhytaikaiset varat 1 268,4 = 1 708,9; Yahoo suppeampi kassaluokka 1 698,9. Raportin lyhyet korolliset velat 355,1, Yahoo 343,3. Ero voi liittyä rahoitusinstrumenttien luokitteluun; tarkkaa mäppäystä ei vahvistettu. Yahoo-luvuilla nimittäjä −4,8 M€, joten ROC ei ole kelpoinen. Lisäksi lähdetäsmäytys on avoin.
- [UPM Annual Report 2025](https://www.upm.com/siteassets/investors/reports-and-presentations/2025/upm-annual-report-2025.pdf), s. 260–261 (PDF 131, aukeama; sama virallinen julkaisu saatavilla [tiedotteen liitteenä](https://mb.cision.com/Main/23100/4315173/3963782.pdf)): EBIT 749, varat 4 194 sekä PPE 6 459 + leasing-varat 778 = 7 237 täsmäävät. Raportin velat 2 237, lyhyt velka 156 ja kassa 715 eroavat Yahoo-luvuista 2 234 / 152 / 716. Providerin luokitteluerot vaativat selvityksen ennen rankingkäyttöä.
- [Atlas Copco Q4/full year 2025](https://www.atlascopco.com/content/dam/atlas-copco/group/documents/investors/financial-publications/english/20260127-en-q4-2025-et.pdf.coredownload.inline.pdf), s. 1 ja 12: EBIT, varat, velat ja lyhyt korollinen velka täsmäävät. PPE 7 811 + 18 349 + käyttöoikeusvarat 7 345 = 33 505 täsmää. Raportin kassa 15 523 on 400 pienempi kuin Yahoo kassa+lyhytsijoitukset. Lyhytsijoitusosan liitetietotäsmäytystä ei tehty. Tarkistus on `partial`, ei `verified`.
- [Volvo Group Annual Report 2025](https://www.volvogroup.com/content/dam/volvo-group/markets/master/news/2026/feb/Volvo-Group-Annual-Report-2025.pdf), s. 35, 38–39 ja 106 (PDF 37, 40–41, 108): EBIT ja varat täsmäävät. Raportin kassa 73 361 + arvopaperit 142 = 73 503, Yahoo 64 903. Erotus 8 600 vastaa raportin rajoitettua kassaa 1,1 + 7,5 mrd SEK, mutta providerin luokittelua ei vahvistettu. PPE 83 829 + vuokralle annetut hyödykkeet 40 485 = 124 314, Yahoo 124 311. Raportin velat + erikseen esitetyt lyhyet varaukset 250 874 + 15 039 = 265 913, Yahoo 265 914. Finanssirahoitustytäryhtiö heikentää lisäksi konsernin teollisuusyritysvertailua.

Tarkistukset on tallennettu tiedostoon `python_pipeline/data/financial_source_checks.csv` tilikausikohtaisina. KONE, UPM ja molemmat Volvon osakesarjat saavat `mismatch`-tilan ja poissulun `source_reconciliation_required`. Sama konsernin havainto koskee sen kaikkia mukana olevia osakesarjoja. Numeerinen poikkeama osoittaa erilaisen luokittelun tai lähdeluvun; se ei yksin todista yhtiön tilinpäätöksen tai providerin virhettä. Atlas Copcon rajattu tarkistus ei kelpaa koko aineiston kattavuus- tai oikeellisuustodisteeksi.

## Arvostusluvut ja valuutta

| Listaus | Markkina-arvo (M laskentavaluuttaa) | Provider-EV (M) | Yahoo-pohjainen nimittäjä (M) | Laskennallinen ROC | EBIT/EV |
|---|---:|---:|---:|---:|---:|
| HEL:KNEBV | 28 236,093440 | 27 531,077632 | −4,8 | Ei kelpoinen | 4,853 % |
| HEL:UPM | 12 086,266880 | 15 676,066816 | 8 633 | 8,676 % | 4,778 % |
| STO:ATCO-B | 801 069,531136 | 813 359,104000 | 55 065 | 61,952 % | 4,194 % |
| STO:VOLV-B | 630 573,498368 | 848 945,020928 | 209 648 | 23,137 % | 5,714 % |

Taulukon ROC on laskentaketjun havainnollistus; `mismatch`-rivit eivät osallistu julkaistavaan rankingiin. Provider-EV:n täsmällistä vähemmistöosuuksien, eri osakesarjojen, leasingin ja rajoitetun kassan käsittelyä ei pystytty vahvistamaan ensisijaisesta providerin kenttädokumentaatiosta. EV:tä ja markkina-arvoa ei siten merkitä täysin varmennetuiksi.

Markkina- ja valuuttakurssipäivä on 29.10.2026. [EKP:n päiväkurssi](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml) oli 10,9995 SEK/EUR, jolloin SEK→EUR on 0,09091322332833311. Markkina-arvoraja on 50 miljoonaa euroa. 50 miljoonaa SEK on tällä kurssilla noin 4,546 M€, joten se ei täytä rajaa. Otoksen laskentavaluutta ja noteerausvaluutta ovat samat. Generator ei hyväksy ristiinvaluutta-EV:tä ilman providerin EV-valuutan varmennusta.

## Metodologialähde ja jäljelle jäävät rajat

[Joel Greenblattin oma kirja, Appendix A, Wiley/O'Reilly-esikatselu](https://www.oreilly.com/library/view/the-little-book/9780470624159/apa.html) määrittelee ROC:n EBITin ja nettokäyttöpääoman sekä aineellisen käyttöomaisuuden suhteeksi. [Magic Formula Investing FAQ](https://www.magicformulainvesting.com/Home/Faqs) vahvistaa finanssi- ja utility-poissulut. Yksityiskohtainen CA−kassa / CL−velka -kenttämäärittely on projektin dokumentoitu operationalisointi; julkinen kirjaesikatselu ei vahvista kaikkia providerin tilinpäätöseriä. Projektin vuosijakso, negatiivisen pääoman poissulku, 50 M€ raja ja tasatilanteiden ratkaisu ovat eksplisiittisiä sovellusvalintoja.

Seuraava luotettavuuden edellytys on tilinpäätöserien kenttäkohtainen täsmäytys viralliseen ESEF-aineistoon sekä kaikkien osakesarjojen markkina-arvon ja EV:n yritystason laskentaperustan varmennus. Ilmainen Yahoo/yfinance on käyttökelpoinen tutkimuksen apulähde, mutta tämä otos osoittaa ettei sitä pidä käsitellä virheettömänä laskentatotuutena. Koko pörssien kattavuutta tai sijoituskelpoisuutta ei ole todistettu tällä otoksella.
