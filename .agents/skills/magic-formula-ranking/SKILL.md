---
name: magic-formula-ranking
description: Toteuta Magic Formula -ranking (ROC + Earnings Yield) projektiin. Käytä kun tehtävä koskee kaavojen implementointia, rankkien yhdistämistä, tasatilanteita tai siihen liittyviä testejä.
---

# magic-formula-ranking

## Tee
- Laske ROC ja Earnings Yield dokumentoiduilla kaavoilla.
- Rankkaa molemmat mittarit erikseen ja yhdistä summapisteiksi.
- Ratkaise tasatilanteet deterministisesti (ticker aakkosjärjestys).
- Erota laskenta, ranking ja serialisointi omiin funktioihin.
- Lisää yksikkötestit sekä normaali- että reunatapauksille.

## Vältä
- Epävakaita satunnaisia tie-breakereita.
- Mittarien sekoittamista UI-logiikkaan.
- “Mustia laatikoita” ilman kaavadokumentaatiota.
