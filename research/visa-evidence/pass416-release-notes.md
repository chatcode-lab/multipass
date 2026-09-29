# Pass 416 — expired correction rechecks

Research and independent source review: 29 September 2026. This completes the first follow-up priority from [Pass 415's search review](../../docs/search-review-2026-09-28.md): ten relationships whose correction-only search windows expired on 26 September. Two parallel researchers and root prepared eight bounded packets. Each candidate was reviewed by a different agent before promotion; per-batch `.review-notes.md` files record the exact approved hashes and actual retrievals.

## Results, without overstating coverage

| Scope | New finding / outcome | Search treatment |
| --- | --- | --- |
| US → Burkina Faso | Fresh signed communiqué and US entry guidance reconfirm suspended visa issuance with limited exceptions. No blanket entry ban or treatment of existing visas established. | Correction explanation renewed to 29 October. |
| Nauru → Belize | Live government table still prints the internally contradictory `YES - NO` entry. | Correction explanation renewed to 29 October. |
| Bahrain, Monaco, Rwanda → Vanuatu | Destination lists still positively name all three in incompatible exempt/non-exempt cohorts; tourist instructions distinguish arrival issuance and advance approval. | Three correction explanations renewed to 29 October. |
| Dominican Republic → Moldova | Romanian MFA separates the Dominican Republic from Dominica; English duplication remains. Qualifying foreign documents waive visas; the official type-C service issues approved visas as PDFs. | New medium-confidence document-dependent explanation is eligible, not a new exact rank rule. |
| New Zealand → Niue | The old explanation overstated what list omission proves. A travel-visa waiver can coexist with an arrival stay permit. Current implementing rule remains incomplete. | Narrower explanation; old window stays expired. |
| Andorra → Guatemala | IGM's currently linked graphic explicitly names Andorra visa-exempt; earlier MINEX duplication could not be reopened or reconciled. | New context, no verified resolution or window renewal. |
| Luxembourg → Ukraine | Issuer e-Tourist wording persists; accessible Ukrainian 2022 official evidence records the historical waiver, but current operative sources were inaccessible. | No inference from retrieval failures; old window stays expired. |
| Fiji → Kosovo | Signed decision depends on Gazette publication; fresh Gazette searches did not retrieve that publication. Live MFA waiver list persists. | Search absence is not nonpublication; old window stays expired. |

All ten exact cells remain **unknown**. No new exact policy, passport score change, rank change, invented permitted-stay number or legal effective date is introduced. Renewed dates are operational research targets, not visa validity periods. The Moldova conditional record retains its interpretation caveat and the failure to retrieve current consolidated law; the authority has not silently been credited with correcting its English page.

## Auditable integration

- Appended **18 source records and one conditional record** in eight batches. Canonical archive totals: 889 batches, 3,720 sources, 2,066 exact policies and 11 conditional records. Every prior archive row remains unchanged.
- Preserved the original correction array and appended ten dated [recheck annotations](../../src/data/reviewed-unknown-rechecks.ts). Historical `asOf` queries still see the old decisions; 27–28 September remain an expired gap. Only five explicitly reconfirmed annotations renew research windows. Inconclusive attempts update explanation/citations and last-attempt metadata, not the deadline.
- Relationship pages, status aggregation and sitemap eligibility resolve the same dated projection. Conditional source records read in the future are excluded from historical relationship/characterization queries. No cache TTL, KV schema, per-cell paid read, source-fetch-at-request or upstream snapshot change is introduced.
- HTML and Markdown use neutral “withheld pending clarification” wording, not a false assertion that every imported route is disproved. Shared copy distinguishes overdue verification from upcoming research targets and legal expiry.
- Relationship JSON v1 adds `supportsCurrentStatus`, `reviewedAt` and `reviewedCorrection` (reason, source IDs, original/renewed deadline, last recheck). The existing `rejected` evidence-level value remains compatible and is explained in the human and machine agent guides as a withheld imported label, not a universally disproved route.

As of 29 September, exact evidence remains **40,941 / 44,974 (91.0%)** with **4,033** not exact. Characterized relationships remain **1,142** (Moldova was already a correction); structured-stay coverage remains **4,404**. Indexability is separate: five renewed corrections plus the Moldova conditional explanation restore **six** useful URLs, bringing the eight-shard canonical inventory from **42,702 to 42,708**. The other four remain excluded. Sitemap modification floor advances to 29 September for this substantive update, not as a substitute for source review.

## Release checks

All eight candidate validators and independent source reviews pass. Typecheck reports 162 files with zero diagnostics; lint, **463 tests across 19 files**, pending-audit coverage **4,033 / 4,033**, production build and strict top-40 profile coverage pass. The added unit tests cover date boundaries, retained history, source provenance, no future-review leakage, six and only six new eligible URLs, unchanged scores and safer Niue wording. All **108 desktop/mobile browser tests** pass, including new HTML/Markdown/negotiation/API parity, noindex, review-date and horizontal-overflow checks. The seven user CSV exports remain untracked and excluded from publication.

The [independent integration review](pass416-integration-review.md) approves publication with no blockers. It independently confirms approved-packet parity, unchanged historical records, and **134,922** date-specific sitemap/page eligibility comparisons with zero mismatches. A separate reviewer checked all ten rendered HTML/Markdown/API routes on mobile and their relationship-sitemap membership.

## Next useful work

1. Review Vietnam's unilateral-policy re-entry wording against operative amended law, separately from the already reviewed bilateral stays. Do not copy the bilateral rules across that scope.
2. Verify the scheduled Bosnia and Herzegovina / Montenegro seasonal transitions (1 and 2 October) remain consistent in API, pages and sitemaps; those successors are already modeled. Seek adopted Cambodia successor evidence before its 15 October trial endpoint.
3. Revisit the four unresolved current-force/implementation gaps only with new accessible authority material. Repeating the same blocked pages or extending dates without proof does not improve coverage.
4. Address the documented citizenship-law gaps on high-demand profiles before adding another broad indicator family.
