# PLANS.md

## v1 Toteutussuunnitelma (milestones)

1. [x] Repository bootstrap
   - AGENTS.md, AI.md, progress.md, lessons.md, PLANS.md
   - Repo-skillien runko

2. [x] Market universe data source
   - Helsingin paalistan universe-strategia
   - Sisaan/ulos-kriteerit dokumentoituna

3. [x] Financial normalization pipeline
   - Syotedatan skeema
   - Normalisointisaannot ja validoinnit

4. [x] Magic Formula ranking engine
   - ROC + Earnings Yield
   - Deterministinen ranking ja testit

5. [x] EBIT/EV ranking engine
   - EBIT/EV laskenta ja testit

6. [x] Quality overlay
   - Kevyt laatupisteytys
   - Yhdistelmapisteet ja painotus

7. [x] Frontend UI
   - Ranking-taulukko, lajittelu, suodatus
   - Metodologia- ja disclaimer-linkit

8. [x] Methodology and disclaimers
   - Kaavat, oletukset, datarajat
   - Riskit ja ei-sijoitussuositus -teksti

9. [x] GitHub automation
   - Ajastettu datapaivitysworkflow
   - Perusvalidointi CI:ssa

10. [x] Validation and launch readiness
   - End-to-end tarkistuslistat
   - Julkaisupaatoksen kriteerit

11. [x] Full Main Market universe before deploy
   - Eroteltu raw universe, ranking-kelpoiset ja poissuljetut syineen
   - Finanssipoissulut tehty nakyviksi datassa, UI:ssa ja metodologiassa

12. [x] Financials coverage expansion before deploy
   - Yahoo-pohjainen financials-generator koko universelle
   - Valtaosa yhtiosta siirtynyt missing-statements-tilasta oikeaan rankingiin tai perusteltuun poissulkuun
13. [x] Static deploy and data refresh readiness
   - Vercel-deployohjeet ja metadata lukittu v1-julkaisuun
   - Data-refresh generoi financials.csv:n ja ranking-v1.json:n seka commitoi muuttuneen datasetin hallitusti
14. [x] AI/tech visual identity pass
   - Dark-first research-tool design system, yhtenäiset pinnat, kontrollit ja status-tilat
   - Hillitty motion, taulukoiden luettavuuden nosto ja state-sivujen visuaalinen yhtenäistäminen
