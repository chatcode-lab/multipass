# Top-20-rank country-profile expansion

Started 17 September 2026. Scope is the frozen live cohort in `top20-cohort-2026-09-17.json`: **47 passports with displayed dense rank <= 20**, not the first 20 rows. All ties are included. India remains published from the pilot even though it is outside this cohort.

## Completion requirements

- Every cohort passport has a substantive, independently reviewed citizenship topic and individual-tax topic. Preserve ordinary-route scope, residence versus physical presence, language conditions, exceptions, official sources, unresolved questions and review dates.
- Reuse the nine existing cohort citizenship topics and three tax topics without pretending to re-review them. Add the 82 missing topics. Together with India's retained citizenship topic, the final catalog has at least 95 topics.
- Every cohort profile has an HDI and life-expectancy collection outcome: reviewed observation with period, geography and licence, or an explicit source-backed unavailable outcome. Retain India's observations. No aggregate substitutes, invented values or new composite score.
- Retain independent, exact-candidate-byte review approval per legal batch and per topic. Never erase earlier coverage or advance unrelated review dates by publishing a small batch.
- HTML, Markdown, negotiated Markdown, JSON, parent links and sitemap agree. Existing passport scores, URLs and visa verification counts remain unchanged.
- Coverage tests enumerate all 47 cohort codes and required families. Unknown fields do not count as verified; unavailable statistics are reported separately from populated observations.
- Run the full checks and desktop/mobile suite, publish through the existing deployment workflow, then verify every cohort topic and indicator outcome on production.

## Research boundaries

This continues the pilot's selected ordinary adult naturalisation route and baseline individual-tax framework, not every route, tax rate or personal eligibility decision. Only primary official legal/tax authorities; inspect actual source text and retain locators. Do not infer CEFR equivalence or a missing requirement from silence. Descent/marriage/exceptional alternatives must not replace the ordinary-route baseline without an explicit scope explanation. Separate nationality jurisdiction from statistical geography, especially Hong Kong.

Statistical import is offline and bundled, with no new per-field KV reads or browser requests. PISA, Big Mac and additional metrics remain separate follow-ups; this goal expands the already-published two-indicator scope.

## Progress

- Cohort resolved from the live manifest and recorded, including Brazil and Hong Kong at rank 20.
- Approved, append-only legal expansion batches preserve each topic's original source-review date and hash. The independent integration reviewer approved this approach after corrections to empty-profile review metadata and outcome-count terminology.
- All 47 cohort profiles now have both indicator collection outcomes in the local approved bundle: 93 populated observations and one explicit unavailable Monaco HDI outcome. India retains its two observations, making 96 outcomes across 48 statistical geographies. Observation years are 2023 for HDI and 2024 for life expectancy; retrieval date is not the observation year.
- All 94 cohort topics are approved: 47 citizenship pages and 47 personal-tax pages. India retains its citizenship page, making 95 topic pages across 48 profiles. The combined catalog contains 524 fact records and 289 distinct official-source URLs. Eleven cohort legal questions (plus one in the retained India pilot) remain explicitly unresolved, not verified.
- Korean legal-source version metadata, Greek route exceptions, Malaysian nationality-loss conditions and Lithuanian/Czech source locators were corrected and independently rechecked before approval. Later reviews corrected Hungarian criminal-proceeding jurisdiction, Andorran conviction/renunciation wording and Cyprus's diploma/degree evidence. Cyprus's direct-request access gap was resolved through standard browser access; both author and reviewer read the full current official guidance and checklist. Final reviews corrected Brazilian publication metadata and tax-return wording, and replaced an inaccessible redundant Romanian citation with the independently readable official amending law without changing the supported claims.
- Final local release checks passed: strict 47-profile coverage gate, 416 unit tests, type checking (157 files, no diagnostics), lint, evidence-audit coverage, production build and all 92 desktop/mobile browser tests. Independent integration review found no blockers. Visa evidence stays at 40,941 of 44,974 relationships verified, with all 4,033 pending relationships audited; this expansion does not alter those scores or counts.
- `npm run profiles:coverage` is the authoritative local collection report, not a live deployment dashboard. Release through the existing main-branch Cloudflare workflow, then verify all 95 topic pages, parent links, indicators, JSON, both Markdown forms and sitemap on production before declaring rollout complete. Retain the distinction between collection completeness, unresolved legal details and unavailable statistics.

## Follow-up scope

Prioritise the explicitly unresolved legal questions and scheduled rechecks before treating any topic as exhaustive. Additional passports need the same bounded route/tax scope and independent review. PISA, Big Mac and new statistics require their own primary-data, geography and reuse review; they were not silently added to this expansion. New content remains bundled, with no per-field KV reads or paid research API calls.
