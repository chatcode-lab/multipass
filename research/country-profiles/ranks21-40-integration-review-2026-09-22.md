# Ranks 21–40: independent integration review

Reviewer: `/root/review_pass412`. Review date: 2026-09-22.

## Decision

**Final integration decision: APPROVE**, after the two corrections below and the final complete-catalog recheck recorded at the end of this note. All 72 target profiles now satisfy the strict collection-completeness gate. This is not production-deployment verification or a replacement for root's whole-repository/browser release gates. Earlier pending-completeness snapshots below are retained as historical review results, not current counts.

This review covers current tracked collector, publication, schema/catalog, representation, coverage and CI changes. It does not approve this reviewer's own Brunei/Macao/Taiwan research. Source reviews and their immutable hash-bound artifacts remain separate from this code review.

## Findings and corrections verified

1. **Immutable-pilot bypass — fixed.** The original refresh path compared only the pilot candidate hash and could overwrite the historical review metadata using a differently dated approval of the same candidate. A read-only reproduction demonstrated that the resulting catalog accepted the changed pilot dates. The [publisher](../../scripts/publish-country-profiles.ts:11) now rejects every legal no-batch publication before reading or writing the artifact. Legal changes must use an independently reviewed, explicitly superseding expansion. The added CLI regression checks rejection and byte-for-byte preservation of the pilot.
2. **Linked acquisition route could disappear on supersession — fixed.** An otherwise valid replacement could drop or change a predecessor's `routeId`, causing the legacy acquisition view to fall back to its old record while the new profile showed revised facts. A read-only catalog reproduction demonstrated that the route mapping disappeared. The [catalog](../../src/lib/country-profile-catalog.ts:24) now requires preserving an existing route ID. Drop, change and successful preservation cases are tested. A future intentional route migration needs a separately designed and reviewed mechanism.

Neither correction required this reviewer to edit application code or approved data.

## Checks performed

- Read the enrichment plan, contributor requirements, country-profile research README and ranks 21–40 plan, then the relevant tracked diffs and complete collector, publisher, schemas, catalog and representation helpers.
- Collector: hashes original downloaded bytes before decoding; UNDP explicitly uses Windows-1252 and JSON uses fatal UTF-8 decoding. CSV parsing preserves quoted delimiters/newlines and validates header/row shape. The bounded World Bank fetch and geography registry reject incomplete/multiple-page payloads rather than silently ingesting a partial page. This is fail-closed pagination handling, not a general automatic paginator.
- Geography: explicit ISO mappings, non-aggregate registry checks, duplicate/contradictory provider records and observation periods are checked. Missing registry coverage is narrowly allowed for Taiwan/Vatican; neither inherits a parent or neighbouring geography. Missing outcomes are distinct from absent collection outcomes and numeric zero.
- Current statistical artifact: 146 outcomes across 73 mapped geographies, including retained India; 140 values and six `not_reported` outcomes. Monaco/Macao HDI and both metrics for Taiwan/Vatican retain explicit null periods/values and useful caveats. These values and raw payload hashes were independently source-reviewed in the separate `ranks21-40-indicators-raw-2026-09-22` review, not inferred from passing tests.
- Publication: safe matching audit basenames, independent reviewer identity, exact candidate hash, review chronology, append-only unique legal batch IDs and retention of historical artifacts. Indicator replacement refuses a retrieval rollback or silently discarded prior country/metric identity.
- Supersession: exact active-predecessor approval binding; no stale, orphan, repeated or predating replacement; unrelated topics retain their previous approvals. The source registry rejects conflicting reuse of an ID. Active topics, rather than the historical concatenation, feed the catalog and coverage checks.
- HTML, Markdown and API use the same active topic/fact/source model, including effective dates, locators, scope, limitations and per-topic review attribution. Mixed-date profiles do not invent one common review. Indicator attribution, licence, observation year, raw provenance and geography registry remain available; missing values are rendered as unavailable rather than zero or `year null`.
- Nested topic canonical URLs, explicit Markdown alternates, format negotiation, API links and sitemap entries remain aligned. Missing topics return the appropriate 404/noindex outcome; aliases do not create unsupported topics. Existing acquisition views consume the linked reviewed topic where applicable.
- Coverage compares the two frozen cohorts, keeps the India pilot separately, distinguishes completed collection outcomes from populated values, and reports unresolved legal facts without calling them verified answers. Audit parity includes every retained batch and the current indicator audit ID. CI and deployment workflows run the strict completeness checker before release.

## Verification results and limits

- After the fixes: `npx vitest run src/lib/country-profiles.test.ts` — **16 passed, 1 expected pending-completeness failure**. The sole failure was the ranks 21–40 completeness assertion at Brunei, whose independently reviewed publication was still pending. The new immutable-pilot CLI and route-preservation regressions passed.
- Earlier in this review, `npx tsx scripts/report-country-profile-coverage.ts --require-complete` correctly exited 1: 72 target passports, 144 required legal topics, 114 approved cohort topics, 57 profiles with all required outcomes, 138 populated cohort indicators, six unavailable indicator outcomes, zero absent indicator outcomes, and retained India. These are a time-of-review snapshot, not the final release totals.
- This reviewer did not run the final whole-repository build, full browser suite or production smoke checks; root owns those gates after all remaining source reviews/publications. No deployment was performed.
- Candidate-review matching assumes the repository's valid UTF-8 authored JSON; collector payload hashes independently bind actual provider bytes and encoding. A general-purpose automated source-currentness guarantee is not claimed: each new or changed legal/statistical batch still needs actual-source review.

## Required final follow-through

Append only independently approved remaining batches, rerun strict coverage to completion, rerun the full type/lint/unit/build/browser checks, and recheck integration against the final diff before release. Do not weaken or skip the currently failing completeness assertion to make a partial cohort appear finished.

## Follow-up code and documentation recheck

Rechecked the current tracked integration diff on 22 September after the Brunei/Macao/Taiwan batch was appended by root. The immutable-pilot rejection still runs before any artifact write; the active-predecessor route-preservation guard and its drop/change/preserve tests are intact. No new integration blocker was found. This does not constitute this reviewer's independent source approval of their own Brunei/Macao/Taiwan candidate.

The research README and existing-data triage now accurately distinguish independently approved bundled Singapore/statistics updates from live rollout, preserve old unrelated review dates, document the raw-byte checksum correction, and keep unresolved or unrefreshed legal questions explicit. The CI and deployment completeness gates remain enabled.

The focused publication, supersession, exact-byte approval, representation-parity and registry-provenance checks passed: **5 passed, 12 deliberately unselected**. The strict coverage command still correctly failed because other legal batches were pending: 120 of 144 cohort topics, 60 of 72 profiles with all required outcomes, 138 populated cohort indicators, six unavailable outcomes, zero absent indicator outcomes, and India retained. These are another intermediate snapshot, not completed release totals. Root must run the whole final suite and strict completeness gate after the remaining independently reviewed batches are appended.

## Final complete-catalog recheck — 22 September 2026

**APPROVE the final integration. No unresolved integration blocker found.** This supersedes the pending-completeness condition in the earlier snapshots, not the separate requirement for full release tests and production verification.

- Independently validated all **32 legal batch approval chains**: parsed schema, SHA-256 calculated from actual candidate `Buffer` bytes, author/reviewer separation, review chronology, source retrieval chronology, and exact candidate/review-to-bundled-artifact parity. This validates the audit chains; it does not claim this reviewer reopened every authority for all other researchers' batches. Their separate source reviews remain authoritative, including root's reviews of this reviewer's own authored batches.
- Compared the original pilot bytes with `HEAD`: **unchanged byte for byte**. Compared all **21 historical expansion batches** with their preceding release: unchanged. Comparing old versus new active topics found exactly one changed historical topic, **Singapore citizenship**. It binds the original pilot's approval hash, preserves `singapore-naturalisation-2026`, carries its 22 September review, and leaves Singapore tax facts at their 17 September approval. The mixed-profile common review remains null.
- All nine new-cohort batches contain their independently approved final bytes. The active catalog now has **145 topics across 73 profiles**, **814 fact records**, and **454 distinct active official-source URLs**. These figures independently match the final plan. There are **28 unresolved cohort facts plus one retained India gap**; none is relabelled as a verified answer merely because collection is complete.
- Current statistics match the exact `ranks21-40-indicators-raw-2026-09-22` candidate and review: **146 outcomes across 73 geographies, 140 numeric values and six explicit unavailable outcomes**. The source gaps remain Monaco/Macao HDI and both measures for Taiwan/Vatican. Geography, raw-byte/encoding provenance, source years and reuse attribution remain intact; no parent-country substitute or new metric family was added.
- Strict completeness passed independently in **all three modes**: combined ranks 1–40 (72 passports/144 legal topics), top 20 (47/94), and ranks 21–40 (25/50), with India retained in every check. Combined cohort indicators are 138 values plus six unavailable outcomes, with **zero absent collection outcomes**; India supplies the additional two values in the full artifact.
- Re-read the final runtime helpers, topic HTML/Markdown/API routes, parent links, source rendering, linked acquisition-route consumer and sitemap generation. All use the active bundled catalog. No new per-field upstream fetch, browser source request or KV lookup was introduced. Alias/canonical/404 behavior, per-topic approvals and limitations remain preserved. Collector, publisher, schema/catalog and CI safeguards reviewed earlier remain unchanged and effective.
- Re-read the final enrichment-plan introduction, research README, expansion plan and existing-data triage. They distinguish bundle approval from deployment, ordinary from exceptional/unresolved legal scope, indicator outcomes from populated values, profile collection from visa verification, and this two-indicator expansion from unimplemented PISA/Big Mac proposals.

Independent commands at this final recheck: **17/17 country-profile unit tests passed**; all three strict coverage modes returned zero; `git diff --check` passed. Root separately runs and records the full type/lint/unit/evidence/build/browser suite. This reviewer did not deploy, publish further application data, or perform a production smoke test.

Bundled artifact fingerprints at final review:

| Artifact | SHA-256 |
| --- | --- |
| `src/data/country-profiles.json` | `ec9e0e77c41bc5adc4408a9183878cca646865bc2f950f02ce590c1d69338ded` |
| `src/data/country-profile-expansions.json` | `9517c0f8a817823e5aecf50d0adf48e8b25759cb2eb5d9085a1a6c5dd4f04ead` |
| `src/data/country-indicators.json` | `6716a558fc26b3af2bc9c1090c80a59c61f7c802211762081932efef658a7a2a` |

Remaining release gates are operational: finish the full browser suite, release through the authorized workflow, and verify the deployed representations. Any subsequent candidate, approval, artifact or behavior change needs the corresponding audit/test recheck; this decision does not authorize bypassing those gates.

## Browser freshness-test follow-up

**APPROVE** the subsequent narrow correction in `tests/e2e/site.spec.ts`. Root reported that the full browser run's two failures were the desktop/mobile instances of the evidence-matrix test asserting that the unchanged 20 August 2026 Japan-to-Germany evidence was still within the freshest tier on 22 September.

Independently read the test diff, matrix component and API implementation. The response listener is installed before navigation and captures the actual Europe matrix response used by the page, instead of making a separate request that could have a different cached `asOf`. The test retains the specific evidence date, status, link, visible date, API headers and coverage assertions. It derives the expected CSS tier from that response's `asOf`, rejects non-finite ages, and checks the unchanged component thresholds: through 30 days fresh, 31–90 recent, 91–180 aging, then stale. It does not import the implementation's classification function or accept any arbitrary freshness class.

Independent date-arithmetic and regex checks passed at ages 0, 30, 31, 90, 91, 180 and 181. On 22 September, the reviewed evidence is **33 days old**, so `recent` is the correct existing behavior. No evidence dates, policy data, application freshness thresholds, matrix/API code or profile artifact fingerprints changed; `git diff --check` passes. Root owns the targeted/full Playwright rerun; this reviewer did not run a concurrent browser suite that could overwrite shared test-result output.
