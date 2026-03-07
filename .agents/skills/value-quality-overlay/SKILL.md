---
name: value-quality-overlay
description: Määritä ja ylläpidä v1 quality overlay -pisteytystä arvorankingin rinnalla. Käytä kun tehtävä koskee laatumittareita, painotuksia, fallbackeja tai yhdistelmärankingin selitettävyyttä.
---

# value-quality-overlay

## Triggerit
- Muutokset `python_pipeline/magicformula/quality.py` tai `python_pipeline/tests/test_quality.py`.

## Tee
- Tuota erikseen value-score, quality-score ja combined-score.
- Dokumentoi jokainen paino ja fallback-sääntö.
- Merkitse puuttuvat laatumittarit näkyvästi, älä oleta neutraaliksi ilman sääntöä.

## Vältä
- ML-pohjaisia tai vaikeasti selitettäviä malleja v1:ssä.
- Piilotettuja normalisointeja, joita ei voi jäljittää.
