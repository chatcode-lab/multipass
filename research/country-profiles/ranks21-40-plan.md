# Ranks 21–40 expansion and existing-data refresh

Started 22 September 2026. The live manifest selects **25 passports**, including every tie at dense ranks 21 through 40. The frozen cohort is `ranks21-40-cohort-2026-09-22.json`; rank changes later in this pass must not silently remove a selected passport. Preserve the preceding 47-country top-20 cohort and India's pilot.

## Required outcomes

1. Add both substantive independently reviewed citizenship and baseline personal-tax topics for all 25 selected passports: 50 new topic pages, at least 145 total including retained content. Record the correct jurisdiction and exceptional/non-ordinary cases, rather than inventing an ordinary route for Vatican City or conflating citizenship and nationality in Uruguay or special administrative regions.
2. Extend both existing indicators (HDI and life expectancy) to the new cohort, with a reviewed native observation or an explicit source-backed unavailable outcome. Re-fetch and independently review current source editions and observations for the retained profiles as the statistical refresh. Preserve geography, licences and observation years; no fallback from a territory to its parent country or an aggregate. Expected union: 73 geographies and 146 collection outcomes, not necessarily 146 populated values.
3. Run a useful risk-based existing-data pass: triage the existing unresolved legal fields, investigate selected actionable gaps/current transitions, and re-open official authorities for upcoming visa-policy expiries. Record unchanged, corrected, unresolved and inaccessible outcomes separately. Do not call a source HTTP success a fact re-verification, or advance unrelated review dates. Visa and profile coverage remain separate metrics.
4. If correcting a published profile, add an explicit independently reviewed superseding record with exact predecessor identity/hash. Keep old audit records; do not bypass the duplicate guard or overwrite an earlier approval. Do not implement automatic legal updates.
5. Retain claim/caveat/review parity across parent summaries, topic HTML, Markdown, negotiated Markdown, JSON and sitemap. Substantive new topics are indexable; unsupported topics remain real 404s. Existing mobility scores change only through separately approved visa evidence, never through profile indicators or tax facts.
6. Extend completeness and non-regression gates across both frozen cohorts and retained India. Check 320–390px layouts, source links, cache headers and no new per-field KV reads or browser data requests. Run the full tests, independent integration review, commit/push/deploy through the existing workflow, and verify every added or refreshed public representation in production before completion.

## Parallel research batches

Each researcher owns a distinct candidate and notes, never canonical publication. A different reviewer actually opens every retained source before exact-byte approval.

- Barbados, Bahamas, Trinidad and Tobago — independently approved and bundled.
- Mexico, Uruguay, Costa Rica — independently approved and bundled.
- San Marino, Vatican City, Israel — independently approved and bundled.
- Brunei, Macao, Taiwan — independently approved and bundled.
- Seychelles, Mauritius, Solomon Islands — independently approved and bundled.
- Panama, Paraguay, Peru — independently approved and bundled.
- St. Vincent and the Grenadines, St. Kitts and Nevis, Antigua and Barbuda — independently approved and bundled.
- St. Lucia, Grenada, Dominica — independently approved and bundled.
- Ukraine — independently approved and bundled, with current nationality legislation and wartime/temporary exceptions kept distinct.

## Scope and progress

Initial authoritative inspection: no tracked uncommitted changes; previous expansion is deployed. New cohort retrieved from manifest version `2026-09-14T02-05-17-042Z`, checked `2026-09-18T03:06:00.204Z`. The preceding release has 95 legal topics. The user-provided CSVs and screenshots are unrelated untracked inputs and will not be staged.

All 25 new passports have both independently approved topics: 50 new pages, bringing the active bundled catalog to 145 topics across 73 profiles, including India's retained citizenship pilot. The active catalog contains 814 fact records and 454 distinct official-source URLs. Twenty-eight cohort legal details plus India's retained procedural gap remain explicitly unresolved; completed collection is not exhaustive legal certainty. The complete Singapore citizenship replacement is independently approved with its predecessor retained. All 146 indicator outcomes across 73 geographies are approved (140 numeric, six source gaps); observation years remain 2023 for HDI and 2024 for life expectancy. The strict combined 72-passport completeness gate passes, with the India pilot retained separately. These are approved-bundle figures, not by themselves production-deployment evidence.

The [independent integration review](ranks21-40-integration-review-2026-09-22.md) identified and rechecked fixes for direct pilot-review overwrites and lost acquisition-route links. Full final checks and production verification are separate release gates; interim checks are not used as a substitute for complete-catalog tests.

The [existing-data triage](existing-data-triage-2026-09-22.md) records the Singapore refresh, unresolved Portugal/Malaysia transitions, unchanged seasonal visa-policy evidence and the inaccessible Cambodia announcement. No visa classification or mobility score is changed by this pass.

## Pre-release verification — 22 September 2026

The final complete-catalog `npm run test:all` passed: 157 Astro files with no diagnostics, lint, 421 unit tests, the full visa-evidence audit and production build. Strict profile completeness passed for the combined cohort. The full Playwright suite passed all 92 desktop/mobile tests, including every approved topic's HTML/Markdown/negotiated representation, API and sitemap checks, narrow 320/390px layouts, source links and missing-data presentation.

The first browser run found two instances of an old date-sensitive matrix assertion: unchanged 20 August evidence was expected to remain fresh on 22 September. The independently reviewed test-only correction derives the expected tier from the exact API response's `asOf`; no evidence date or application threshold was changed. The subsequent full browser run passed. Independent final integration approval covers all 32 legal approval chains, retained pilot/history, exact artifacts and these test changes. Visa coverage remains 40,941 of 44,974, with all 4,033 pending relationships accounted for in the audit; this pass does not claim new visa verification.

Commit/push/deployment and live checks remain separate operational gates at the time of this pre-release record.

## Production verification — 22 September 2026

Released commit `4d770a67ec187504614c44d7a0a852f495396dd2`. Both [deployment](https://github.com/chatcode-lab/multipass/actions/runs/35755631551) and [CI, including browser tests](https://github.com/chatcode-lab/multipass/actions/runs/35755631772) completed successfully.

A read-only production audit made 662 requests with three concurrent workers, without cache-busting the checked content. All 73 profile APIs exactly matched the approved local JSON; all 145 topic pages matched fact text, scope, limitations, source locators, links and review dates. Explicit and negotiated Markdown exactly matched the approved renderer. Parent indicator Markdown, parent topic links, all topic sitemap entries, canonical/robots/format/cache/security headers, aliases and unsupported-topic 404s passed. Production layouts and visible source links passed at 320px and 390px, including long country names and the explicit Taiwan/Vatican missing indicators. Separate browser-context accessibility checks passed on Vatican taxes, St. Vincent citizenship and the refreshed Singapore citizenship page.

The production visa matrix reports **40,938 of 44,974** exact matches, not the bundled test snapshot's 40,941. A region-by-region read-only comparison isolated three differences: BR→GF, SB→HK and NI→HK. The live snapshot labels these visa-free while the bundled snapshot labels them visa-required; all three live cells remain **unverified**. The same live count was returned with normal caching and the explicit refresh endpoint. This is not new visa evidence or a classification correction in this release. Reconcile the three current upstream/evidence disagreements in a separately source-reviewed visa pass; do not publish either label as newly verified from this diagnostic.

GitHub also reported an open, separate moderate transitive dependency advisory for `devalue` 5.9.0 ([alert 11](https://github.com/chatcode-lab/multipass/security/dependabot/11), GHSA-9rgm-9g3h-6x36). The installed dependency is used by Astro and its React integration. This data release did not change dependencies or establish exploitability; a focused security update and regression pass remains a follow-up. Unrelated user CSVs/screenshots were left untracked and untouched.

## Follow-up priorities

- Resolve Saint Lucia's current ordinary citizenship eligibility/retention text, Dominica's conflicting historical residence wording, Peru's nationality-law commencement and Solomon Islands' 2026 bill status before presenting firmer conclusions. Keep proposals and future announcements distinct from operative rules.
- Recheck the enacted text and commencement for Dominica's announced January 2027 tax change before applying it. Posted older compilations and inaccessible updated authorities remain visible limitations, not a guarantee of complete amendment-chain coverage.
- Retain the scheduled visa-expiry follow-ups in the triage note. Profile coverage does not change the visa matrix's verified percentage.
- Investigate BR→GF, SB→HK and NI→HK against current official sources, preserving the live pending state until independent evidence supports a correction. Keep the live and bundled coverage counts distinct.
- Address the separately reported `devalue` advisory with an appropriate patched dependency and the usual regression checks.
- Legal-topic reviews are due by 21 December 2026, sooner for identified changes; this is a review target, not an automatic refresh guarantee.

This goal retains the established two-indicator scope. PISA, Big Mac and other new metric families remain separate follow-ups needing their own quality/reuse review; expanding country coverage and refreshing existing families must not be replaced by a smaller experimental metric feature.
