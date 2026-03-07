---
name: financial-data-normalization
description: Yhtenäistä talousdata ranking-laskentaa varten. Käytä kun tehtävä koskee skeemamäppäystä, puuttuvien arvojen käsittelyä, tilikausien harmonisointia tai data-validointeja.
---

# financial-data-normalization

## Tee
- Määritä syöteskeema ja kanoninen välitaulu (`python_pipeline/data`).
- Harmonoi yksiköt (esim. tuhannet/miljoonat), valuutat ja periodit.
- Lisää eksplisiittiset säännöt puuttuville arvoille ja nollajakajille.
- Tuota validointiraportti hylätyistä riveistä syykoodeilla.
- Lisää testit reunatapauksille.

## Vältä
- Hiljaisia oletuksia ilman dokumentaatiota.
- Datan “siivoamista” niin, että alkuperäinen arvo katoaa jäljitettävyydestä.
- Ranking-kaavojen kovakoodausta normalisointivaiheeseen.
