# Pass 414: autumn waiver deadlines and structured stays

Started 22 September 2026. Scope: BH/OM/SA → BA, KZ → ME, and CN/HK/MO → KH. Two parallel researchers collected the official sources; a separate reviewer reopened them and approved each exact candidate hash. See the adjacent author and independent-review notes for source locators, failed retrievals, scope and interpretation limits.

## Published-data changes

- **Bosnia and Herzegovina:** the Gazette and the current MFA nationality pages confirm the seasonal waiver through 30 September, with **60 days in aggregate within the June–September window**. The MFA pages expressly require visas afterward. A new, source-backed `visa_required` policy and matching override begin on **1 October 2026**, instead of continuing to score the expired waiver. Third-country-document and special-passport exceptions are not flattened into the passport-only baseline.
- **Montenegro:** an actually read adopted decision corroborates the current Kazakhstan guidance, adding a structured **30-day** seasonal stay. The existing inclusive **1 October** endpoint and **2 October** prior-visa switch remain unchanged. The general regulation's Article 12c wording and its distinction from the specific decision are disclosed in the policy and review; this is not an unqualified ruling on that interpretive question.
- **Cambodia:** recovered destination-government publications and issuer corroboration confirm the **14-day-per-entry** Chinese/Hong Kong/Macao tourist trial through **15 October**. An August report describes a private-sector extension request, not adoption. No successor category is proven. A narrow **16 October `unknown` safeguard** removes stale visa-free scoring until a successor is independently reviewed. This is not a verified visa category or a departure deadline for an already admitted traveller. The original inaccessible eVisa source and its old review date remain intact.

The reviewed artifact appends exactly **14 sources and five policies in three batches**. A semantic comparison against the preceding commit confirms that all 3,679 existing sources, 2,057 existing policies and ten conditional records remain unchanged and in order. Four explicit same-scope refresh mappings suppress equivalent old records only in the public projection, keeping one timeline event per rule. The mapping checks status, exact passport/destination cohorts, exclusions and both effective-date bounds before accepting a replacement. Historical research artifacts and allowed-stay annotations remain auditable.

Today's exact access coverage is unchanged at **40,941 / 44,974**. Structured-stay coverage grows **4,267 → 4,271** (three Bosnia routes plus Kazakhstan → Montenegro). Cambodia already had its 14-day structured allowance. No raw fallback category, snapshot version, upstream checkedAt, rank or whole-catalog verification date is changed today. The seven routes receive only the separately approved scoped source refreshes.

## Expiry and cache safeguards

Regression tests cover the final valid date, first successor date, scoring changes, neighbouring cohorts, reduced catalogs and UTC midnight. Expired stay allowances do not remain current evidence. Bosnia receives an explicit supported successor; Cambodia remains unverified after expiry rather than receiving a guessed visa route.

The five-minute live-memory snapshot cache previously held already-normalized statuses across midnight. It now keeps the original raw promise and recomputes date-bound normalization on a UTC date change, without another KV or edge-cache read and without extending the upstream cache TTL. Bundled fallback already normalizes by UTC date. Tests cover both live and fallback, unchanged source metadata, manifest/detail score parity and exactly one KV read across the boundary. Public HTTP-cache lifetimes remain unchanged: this is correct request-time normalization, not instant eviction of previously cached responses.

No additional per-request government fetches, runtime combination searches, KV keys or paid data-service calls were introduced.

## Combination-insights counterfactual

The independent reviewer recomputed the complete combination artifact on its raw bundled snapshot basis for four cumulative stages: unchanged baseline; the three Bosnia losses on 1 October; plus Kazakhstan → Montenegro on 2 October; plus the three Cambodia unknowns on 16 October. Every stage is exactly equal to the stored artifact, including ties, minimum-cover representative, order, marginal gains and metadata. These scoped changes therefore do not require regenerating the dated article artifact.

Root also replayed the seven changes against today's already-normalized snapshot. Its four stages are identical to each other: best pair Japan + Burkina Faso covers 210 destinations; best triple Japan + UAE + Mali covers 217; minimum cover remains ten passports. The normalized minimum-cover representative already differs from the dated raw artifact because of earlier date-aware corrections; this is not introduced by Pass 414. Do not misdescribe the raw artifact as a freshly recomputed live snapshot.

## Citizenship follow-up and remaining work

The bounded Saint Lucia / Peru follow-up is recorded in [the country-profile research log](../country-profiles/pass414-citizenship-followup-2026-09-22.md). It did not recover enough operative current law for a complete replacement topic. Those explicit legal gaps, review dates, country profiles and indicator observation years remain unchanged. No new quality-of-life indicator family was added in this deadline-focused pass.

Next useful work: recheck Cambodia for an actually adopted successor before 15 October, and obtain the missing operative citizenship instruments rather than republishing cached legal snippets. Montenegro's specific endpoint merits monitoring for official clarification. French Guiana's Brazilian trial still requires successor review before 31 January 2027.

## Release gates

All three exact candidate validators and independent source reviews pass. The initial integrated full check passed type/lint, 439 unit tests, the complete 4,033/4,033 pending evidence audit and production build. The strict frozen top-40 country-profile coverage check passes with all 144 required topics and no missing indicator outcomes; the retained India pilot is unchanged. A final archive-projection regression was added afterward and must also pass before release.

The first narrow post-Cambodia test run correctly required registering the three newly reviewed official hostnames and updating the allowed-stay reference check to recognize a same-scope archived policy replacement. Neither fix broadens source trust to a wildcard or deletes old evidence.

Final local gates pass: 158 Astro files with zero diagnostics, lint, **440 unit tests across 17 files**, complete pending audit, production build and all **96 desktop/mobile browser tests**. The new browser test verifies all seven relationship APIs and Markdown variants, bounded stay values, deduplicated timeline entries, future Bosnia policy visibility and narrow-screen overflow. The separate [independent integration review](pass414-integration-review.md) approves the final implementation hashes, immutable-artifact preservation and exact scoped combination counterfactual.

Deployment and normal-URL production verification follow below when complete. User CSV/image attachments remain untouched and must not be committed.
