# v1 scaffold -konsolidointi

Tämä dokumentti yhdistää neljän alialueen tuotokset:
1. Rahoitusmetodologia
2. Pipeline-arkkitehtuuri
3. Frontend IA
4. Validointi/disclaimer

Konsolidoinnin perusteella toteutettiin:
- Python-moduulit normalisointiin, rankingiin ja quality scoreen.
- Next.js UI shell ranking-taulukolla.
- Metodologia- ja universedokumentit.

## v1 demo thin slice (tämän session tulos)
- Lisätty Python-export (`python_pipeline/scripts/export_ranking_json.py`), joka muuntaa pipeline-syötteen suoraan UI:n käyttämään staattiseen JSONiin.
- Kytketty Next.js etusivu käyttämään `src/data/ranking-v1.json` tiedostoa sampledatan sijaan.
- Lisätty taulukkoon suodatus, lajittelu, datan laatu -sarake sekä linkit metodologiasivulle ja yhtiösivulle.
- Lisätty erilliset sivut: `/metodologia` ja `/yhtio/[ticker]`.

## NPM-asennuksen nykyinen blokkeri
- Tässä ympäristössä `npm install` saa 403-vastauksen proxyn kautta (`CONNECT tunnel failed, response 403`), joten frontend-riippuvuuksia ei voitu asentaa tässä ajossa.
- Repoon ei lisätty uutta package manageria; käytössä pysyy npm (`packageManager: npm@11.4.2`).
- Juurisyy varmistettiin: `curl -v https://registry.npmjs.org/@types/node` kaatuu ennen TLS:ää kohtaan `CONNECT tunnel failed, response 403`, eli esto tapahtuu verkon/proxyn egress-säännöissä eikä projektin riippuvuusmäärittelyissä.
- Minimikorjaus: säilytä npm, mutta aja ympäristössä jossa npm-registry on sallittu (proxy allowlist) tai määritä organisaation mirror (esim. `NPM_CONFIG_REGISTRY=https://<corporate-registry>/`).
