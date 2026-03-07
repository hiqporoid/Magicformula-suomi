---
name: finance-research-ui
description: Rakenna tai arvioi Magicformula-suomi-tyyppinen sijoitustutkimuksen käyttöliittymä uskottavaksi, selkeäksi ja desktop-first v1-tuotteeksi. Käytä kun tehtävä koskee visuaalista hierarkiaa, finance/dashboard-rakennetta, taulukoiden luettavuutta, datan laadun näkyvää mutta siistiä esitystä, suomenkielistä UI-copya tai nykyisen näkymän kriittistä UI-auditointia.
---

# Finance Research UI

## Ydinlinja

- Rakenna käyttöliittymä tutkimustyökaluksi, ei markkinointisivuksi.
- Tee yksi johdonmukainen visuaalinen kieli koko tuotteeseen: sama rytmi, samat korttityypit, sama terminologia.
- Suosi selkeää työpöytämäistä rakennetta: otsikkotaso, tilannekuva, työalue, taulukko, sivupaneelit.
- Pidä datan selitettävyys näkyvillä jokaisessa näkymässä.

## Visuaalinen hierarkia

- Aloita aina vahvalla sivuotsikolla ja lyhyellä selitteellä, joka kertoo mitä käyttäjä voi tehdä juuri tällä sivulla.
- Nosta tärkeimmät mittarit ensimmäiseksi näkyväksi riviksi tai sivupaneeliksi.
- Erottele toimintataso ja tietotaso: suodattimet ja taulukko työalueeseen, metodologia/disclaimerit omaan rauhalliseen alueeseensa.
- Vältä tasapaksua "kortti kortin sisällä" -rakennetta; anna eri elementeille eri painoarvo.

## Finance-UI-rakenne

- Etusivu: hero/header, tilannekuva viennistä, ranking-työalue, datan laatu / metodologia / vastuuvapaus sivupaneeleina.
- Ranking-näkymä: haku ja lajittelu ylhäällä, taulukko pääsisältönä, tärkeät statusviestit kompakteina tunnisteina.
- Yhtiösivu: yhtiön sijoitus ja tunnusluvut ensin, sen jälkeen tulkinta, datan laatu ja seuraavat tarkistuskohdat.
- Metodologiasivu: kaavat, poissulut, datan laatu ja vastuuvapaus erillisinä selvästi nimettyinä osioina.

## Taulukoiden luettavuus

- Käytä oikealle tasattuja numeerisia sarakkeita ja lyhyitä, yksiselitteisiä otsikoita.
- Pidä ticker, yhtiö ja sijoitus heti silmän alla; älä hautaa ydintietoa pitkään riviin.
- Korosta statusta tunnisteilla tai pill-badgeilla, ei pitkillä varoituslauseilla jokaisessa solussa.
- Käytä sticky-headeria ja hillittyä rivikorostusta hoverissa, jos se tukee luettavuutta.

## Datan laatu ja poissulut

- Näytä datan laatu näkyvästi, mutta sivistyneesti: yhteenveto ensin, yksityiskohdat vasta sen jälkeen.
- Kun poissuljettuja rivejä ei ole, kerro se eksplisiittisesti. Älä jätä aluetta tyhjäksi.
- Vastuuvapauslauseke saa näkyä, mutta sitä ei pidä käyttää visuaalisena pääelementtinä hero-alueella.

## Typografia ja spacing

- Vältä geneeristä SaaS-ulkoasua ja oletusfonttifiilistä.
- Käytä otsikoissa erottuvaa mutta rauhallista typografista rytmiä; taulukossa ja mittareissa painota luettavuutta.
- Luo reilu desktop-spacing: isot lohkot hengittävät, mutta taulukko pysyy tiiviinä.
- Mobiilissa priorisoi luettava pinoutuminen, älä yritä säilyttää desktop-gridiä väkisin.

## Suomenkielinen copy

- Käytä oikeita merkkejä: ä, ö, å.
- Suosi termejä: "yhtiö", "metodologia", "datan laatu", "poissulut", "vastuuvapauslauseke".
- Kirjoita sijoitustutkimuksen kieltä, ei startup-mainospuhetta eikä teknistä placeholder-tekstiä.
- Tee selitteistä lyhyitä ja täsmällisiä; yksi lause per tarkoitus.

## Guardrails

- Älä muuta datamallia ilman pakottavaa syytä.
- Älä lisää uutta UI-kirjastoa tai design systemiä v1:een.
- Älä piilota metodologiaa tai validointitietoa vain ulkonäön takia.
- Älä rakenna geneeristä komponenttikerrosta ilman toista todellista käyttötarvetta.