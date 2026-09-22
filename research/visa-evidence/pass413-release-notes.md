# Pass 413: dependency security and live visa-data drift

Started 22 September 2026 in response to the next-priorities request. Scope: the open `devalue` advisory, NI/SB→HK and BR→GF, and a bounded replay of imminent visa-expiry watchpoints. The wider citizenship-law gaps remain separate follow-ups; this pass does not claim to resolve them.

## Dependency patch

The [maintainer advisory](https://github.com/sveltejs/devalue/security/advisories/GHSA-9rgm-9g3h-6x36) identifies malformed-index parsing as a denial-of-service risk, conditional on parsing untrusted input, and names 5.9.2 as fixed. `npm update devalue --ignore-scripts` moved the shared Astro/React dependency from 5.9.0 to 5.9.4, within the existing `^5.8.1` ranges. Only that lockfile entry changed; no major upgrade, dependency override or new direct dependency was introduced.

Both full `npm audit` and production-only `npm audit --omit=dev` returned zero currently reported vulnerabilities. The initial security-only application check passed type/lint, 421 unit tests, evidence-audit coverage and production build. Full final checks must run again after the visa integration. See the separate independent security/integration review for registry-integrity and parser checks. No claim of demonstrated application exploitability is made.

## Visa-source review and publication

Two researchers own separate candidates; a third reviewer independently opens the actual official sources and binds approval to exact candidate bytes. The live snapshot is a hypothesis, not evidence. Candidate conflicts are recorded against the bundled fallback because that is the validator's baseline; notes separately record the live classifications.

Before publication, reconcile dated successor policies with the old evidence cohorts, protect the French Guiana waiver's end date, and verify ranking, canonical redirects, Markdown/JSON, sitemap and status-matrix consistency. Preserve old candidate files and review dates. No wholesale upstream re-import or per-field KV request is needed.

Both candidates received independent source approval at their final hashes, recorded in the adjacent review notes. The promoted projection adds six sources and two policies without changing any previous artifact record:

- NI/SB → HK: current official visitor schedule and the express inbound provision of the 27 July announcement support up to 30 days visa-free from 26 August 2026. No expiry is invented.
- BR → GF: the autonomous 31 July order and prefecture's bilingual operational guidance support up to 30 days in 180 during the trial through 31 January 2027. Insurance is a minimum EUR 30,000 for the whole stay. No automatic renewal or uniform post-trial prior-visa outcome is asserted.

The two previous broad prior-visa policies are split only at exported aggregation: unaffected cohorts retain original sources, and the affected subsets are dated historical records ending 25 August / 30 July. Historical candidate/artifact bytes remain untouched. Timeline HTML and Markdown now explicitly show end dates and label end-only records “Through …”, avoiding a misleading current-route label.

The date-aware access layer applies the approved waivers before scoring. BR→GF has a narrow `unknown` guard from 1 February 2027, including when a stale feed says either visa-free or prior visa. A reviewed successor must explicitly replace that guard. It is not an exact-verification policy. Candidate validation excludes such unknown guards when checking already-applied verified corrections.

The raw fallback changes exactly three access cells, plus derived scores/ranks: NI 128→129, SB 136→137 and BR 170→171. The old global `checkedAt`, publication timestamp and version are deliberately unchanged; this pass is the correction provenance, not a fresh whole-dataset import. The live feed already had all three visa-free labels, so no live score change is intended. Generated combination insights are byte-identical after the three corrections; a separate counterfactual with only the French Guiana cell switched to unknown also leaves the recorded best pair/triple/minimum-cover results unchanged. Those article results retain their explicitly dated snapshot basis; no expensive per-request recomputation or additional KV reads were added.

Expected bundled coverage stays 40,941 / 44,974: the three previously verified stale labels are replaced, not double-counted. Production should recover its three unmatched live labels from 40,938 to 40,941 exact relationships. Structured allowed-stay coverage increases from 4,264 to 4,267. Country-profile artifacts and their frozen top-40 scope remain unchanged.

## Imminent expiry replay

The offline 30-day expiry queue was rerun for 22 September. Its old Russia/China entry already has the approved Pass 412 successor through 2027; it is not a new lapse.

- Bosnia and Herzegovina: reopened the actual [Gazette 37/26 decision](https://sluzbenilist.ba/page/akt/Wi2t0dd7Lq4%3D). It still grants the named Gulf ordinary passports the 1 June–30 September 2026 seasonal waiver, for up to 60 days total within that window. No extension was established in this bounded replay. The existing evidence stops verifying visa-free access on 1 October; no unreviewed successor or prior-visa classification is inferred.
- Montenegro: the browser reader timed out, but ordinary Node HTTPS fetched the complete [MFA Kazakhstan page](https://www.gov.me/diplomatske-misije/ambasade-i-konzulati-crne-gore-u-svijetu/kazahstan) with HTTP 200. Its visa section still states the prior-visa baseline and the 1 May–1 October 2026, 30-day seasonal waiver. The existing model verifies the waiver through 1 October and the separately recorded prior-visa baseline from 2 October. No extension was established.
- Cambodia: the recorded [eVisa announcement](https://www.evisa.gov.kh/?vcode=-14) still failed retrieval with a redirect loop. A search-discovered national-radio page returned no operative article text and is not proof. Do not change source-review dates or claim an extension. Existing evidence stops supporting this temporary visa-free route after 15 October. Reopening the controlling authority remains a priority before that deadline.

These are bounded research diagnostics and boundary checks, not freshly approved destination-wide schedules or proof that no later instrument exists. Unrelated source review dates and country-profile data are unchanged.

## Release gates

Independent visa-source approvals are complete. Local final gates pass: 158 Astro files with zero diagnostics, lint, 429 unit tests across 17 files, complete pending audit (4,033/4,033), production build, strict frozen top-40 profile coverage, and all 94 desktop/mobile browser tests. The new browser test covers all three legacy redirects (308), canonical HTML, exact JSON evidence and stay, Markdown, negotiated Markdown, historical timeline endpoints and narrow-screen overflow. Both dependency audits report zero vulnerabilities; `git diff --check` passes.

The first check run exposed expected stale rank/stay-count assertions and the new official prefecture host missing from the explicit source allowlist; only the derived expectations and independently reviewed exact hostname were updated. A new test initially expected 301 instead of the application's existing 308 redirect; the test was corrected without changing redirect behavior. Independent review also identified and resolved the end-only timeline label issue described above.

Normal-URL production API reads before release confirm all three routes already say visa-free but have pending evidence and no structured stay, using the live snapshot checked 18 September 2026. Deployment and post-release normal-URL checks remain pending.
