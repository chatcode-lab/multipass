# Pass 416: Luxembourg to Ukraine recheck

Researcher: `/root/pass416_europe`. Actual source reads: 29 September 2026. Candidate only; no self-approval, canonical modification, commit or publication. The registered `pass416-ukraine-recheck` packet was generated with `evidence:packet`; its sole raw hypothesis is LU→UA `visa_free`.

## Result

Unresolved, with no normalized policy or stay. The earlier premise that Luxembourg's page explicitly addresses its own nationals survives inspection: Ukraine appears directly under its e-Tourist Visa sentence. It is not just a generic portal directory. Nevertheless, issuer guidance is not sufficient to prove Ukraine's actual eVisa eligibility, and the page gives no Ukrainian legal basis.

A useful additional official source was opened: Ukraine's EU-accession questionnaire response directly documents the historical EU waiver and a Luxembourg ordinary-passport waiver. This prevents the old unsupported implication that the historical destination-side scope was inherently unclear. It does not establish September 2026 force: the nationality table expressly identifies its update as 17 April 2022.

## Sources and locators

- [Luxembourg MFA eVisa guidance](https://mae.gouvernement.lu/en/directions-du-ministere/affaires-consulaires/services-to-citizens/voyages/e-visas.html): actual web open successful; the page's own update is 7 January 2026. Read the complete short body and Ukraine link. Only the candidate contains the literal excerpt.
- [Ukraine Government accession response, Volume 5](https://eu-ua.kmu.gov.ua/wp-content/uploads/vol_5._ch.xxii-xxv.pdf): actual PDF open successful. PDF pages 84–86 (printed 83–85) identify the EU-citizen waiver, valid travel-passport requirement, exclusion of residence/work/study, and Decree 1131/2005. PDF page 161 (printed 160) supplies the nationality table's 17 April 2022 date; PDF page 165 (printed 164) supplies the ordinary-passport header and Luxembourg row. The document is retained as historical context, not refreshed legislation. No allowed stay is promoted from that historical table.

## Failed direct retrievals and excluded discovery

- [Ukraine MFA English entry table](https://mfa.gov.ua/en/consular-affairs/entry-and-stay-foreigners-ukraine/entry-regime-ukraine-foreign-citizens): web, curl and a clean Playwright browser returned 403/Cloudflare block. Search indexing displayed a June 2023 table, but that result is not source proof and is not in the candidate.
- [Ukraine MFA Ukrainian entry table](https://mfa.gov.ua/consul/foreigners/entry-and-stay/rezhim-vyizdu-inozemciv-do-ukrayini-za-derzhavami): web returned 403.
- [Decree 1131/2005](https://zakon.rada.gov.ua/laws/show/1131/2005), its `/print`, `?lang=en` and `/go/1131/2005` variants: web access failed; curl of the print route returned the Rada 403 access-denied page. No legal status is inferred from inaccessible metadata.
- [Linked visa service](https://visa.mfa.gov.ua/): web did not return substantive content. An assumed modern eVisa rule was not extracted from portal branding.
- [Ukraine embassy visa route in Belgium](https://be.mfa.gov.ua/en/consular-affairs/visa-information) and the attempted President-site decree route yielded no substantive page. Official-domain discovery did not produce a directly accessible current Luxembourg visitor rule.

The unresolved gap is present force and implementation of the exact ordinary-passport visitor rule, plus destination-side eVisa eligibility if a visa is claimed. A government historical statement, an inaccessible decree, and an issuer warning cannot be combined into a fictional current rule. There is no finding of legal repeal, suspension or entry prohibition. No deadline extension is requested by this candidate.

## Validation and handoff

`npm run evidence:validate -- research/visa-evidence/pass416-ukraine-recheck.candidate.json --exact` passed: two sources, zero policies, zero conditional records, one conflict, one unresolved cell.

Candidate SHA-256: `51eeb4464eafe384dd69cca1818059e104061d7e6a9ebd38833419088faa2f67`.

The independent reviewer must reopen both retained sources, preserve the 2022 limitation and not self-convert the issuer warning into an eVisa policy.
