# Pass 415 — search-led verification and stay enrichment

Reviewed 28 September 2026. The supplied Search Console exports identified Singapore → Vietnam and Bermuda's new entry order as useful research targets. Two parallel researchers prepared candidates and a separate reviewer independently opened the official authorities before approval. [Search analysis and follow-up priorities](../../docs/search-review-2026-09-28.md) records the measured demand and its limits.

## Evidence and interpretation

- **Vietnam:** [candidate](pass415-vietnam-singapore-2026.candidate.json), [research](pass415-vietnam-singapore-2026.notes.md), [independent review](pass415-vietnam-singapore-2026.review-notes.md). The ten ordinary-passport bilateral routes now have structured 30-day visit limits. Kazakhstan additionally has its own 90-in-180 cap. Singapore retains passport-validity, ticket, funds, onward-document and no-paid-work conditions. The Vietnam-bound Singapore instrument date is 1 December 2003, not the reverse-direction date. Three source records and one same-scope refreshed policy; no status or score change. Approved SHA-256: `7fae69a4d88d0060dc9ee1d9910d59da78f4b7c0d88e5234be21acb113d17106`.
- **Bermuda:** [candidate](pass415-bermuda-2026.candidate.json), [research](pass415-bermuda-2026.notes.md), [independent review](pass415-bermuda-2026.review-notes.md). BR 99/2026 replaces BR 59/2025 from **17 September**, not the 3 September announcement. The complete reviewed catalog partition is 75 controlled passports, 122 unlisted visitor passports and two specific HK/MO document exceptions. Six sources and three new policies. Approved revised SHA-256: `e511fec44269c810f65a9d421e38e8f40ec2c8291231833f65afe75635ff4ca7`.

Exactly seven Bermuda classifications change:

| Passport | Previous | Current | Mobility score change |
| --- | --- | --- | ---: |
| Botswana, Nauru, Nicaragua, Palestinian Territory, Saint Lucia | Visa-free | Prior qualifying authorization required (`visa_required`) | −1 each |
| Indonesia, Taiwan | Visa required | Visa-free visitor framework | +1 each |

The controlled category does not mean a Bermuda-issued visa or an unconditional entry ban. The Order requires qualifying US/UK/Canadian entry and re-entry authorization, with applicable document conditions. A 45-day post-departure validity condition is not a visitor-stay allowance. Republic of Cyprus is not northern Cyprus; duplicate Ivory Coast naming is counted only once. The Hong Kong/Macao exception is an explicit incorporation, not wholesale copying of the UK list.

The free cohort's statutory allowance is recorded literally as **six months or 180 days, whichever is greater, within any 12-month period**. It is deliberately not a fabricated numeric `maxDays`. The minister can shorten the allowance; an operational government advisory describes cumulative 180 days. Both statements remain beside the surfaced duration and in the destination-policy conditions. Admission is not guaranteed and arrival does not reset the cumulative allowance.

## Safe integration

The canonical reviewed archive appends **nine sources and four policies in two batches**, now 3,702 sources / 2,066 policies. All previous 3,693 sources, 2,062 policies and conditional records remain unchanged. The Vietnam same-scope refresh mapping suppresses the older duplicate only in public presentation, with cohort/status/date-bound validation.

Bermuda is a dated succession, not a same-scope refresh: public projections of the old bulk policies and their override cohorts end on 16 September; new policies and overrides begin on 17 September. All 199 new cohort overrides are retained, not just seven deltas, so later upstream imports cannot undo the other previously established corrections. Full-snapshot comparison with pre-pass behavior finds exactly seven changes, all Bermuda. Reapplying normalization is idempotent.

The bundled fallback mechanically updates those seven cells, their scores and derived manifest ranks/order. Its original upstream version, checkedAt and publishedAt are unchanged. No upstream bulk re-import, KV migration, cache TTL change, extra per-request source fetch or paid keyword request was made.

The complete combination-insights calculation remains exactly equal to the stored artifact after the seven-cell patch, including ties, cover representative/order and marginal gains. The same before/after counterfactual on the fully normalized current dataset is also unchanged. The dated raw article artifact was not restamped as a fresh live calculation.

## Coverage and search behavior

As of 28 September on the normalized bundled catalog:

- Exact current evidence: **40,941 / 44,974**, unchanged at 91.0%.
- Not exact: **4,033**, including **1,142** characterized relationships.
- Structured-stay coverage: **4,271 → 4,404**, a gain of **133**: ten Vietnam and 123 Bermuda relationships (GB already had a structured stay).
- Ten correction-only indexing windows expired on 26 September. Their dates remain unchanged; eligibility is not the same as characterization or exact coverage. The bundled canonical sitemap inventory is now **42,702** with eight existing shards and the seven Bermuda URL substitutions.

Shared SEO changes improve passport titles/descriptions, expose the destination-list anchor, correct dense regional ties and link passport Markdown rows to canonical evidence. Exact relationship stay summaries now precede the long timeline in both formats, including rule-specific notes. The enforcement guide explicitly separates law from unmeasured enforcement frequency. No arbitrary query tools or unsupported placeholder pages were newly indexed.

## Release gates

Both exact candidate validators and independent source reviews pass. The separate [independent integration review](pass415-integration-review.md) approves the final candidate and implementation hashes, with 375 independently run tests across ten files plus artifact/delta checks.

Root's final local release gates pass: **160 Astro files with zero diagnostics**, lint, **455 unit tests across 18 files**, the complete **4,033 / 4,033** pending evidence audit, production build and **106 desktop/mobile browser tests**. New browser checks include 320/390-pixel stay summaries, scoped notes, canonical suffix redirects, sitemap replacements, dense regional ties and Markdown parity. The strict frozen top-40 profile check passes all 144 required topics with no missing indicator outcomes; explicit legal gaps and unavailable indicator values remain visible.

The supplied seven CSVs remain untracked and must not be included in the release. Deployment and normal-URL production checks follow after publication.

Follow-up work: independently re-review the ten expired correction cases; investigate Vietnam's separate unilateral re-entry wording against operative amended law; monitor the imminent seasonal endpoints from Pass 414. This pass does not claim to resolve those legal gaps or add a new country-indicator family.
