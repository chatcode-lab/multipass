# Pass 418 — October visa-policy freshness and stay details

Research date: 20 October 2026. The expiry queue prioritizes Cambodia's completed tourist trial, Montenegro's October/November changes and Bosnia and Herzegovina's completed Gulf seasonal waiver. Research and independent review precede canonical publication.

## Baseline and scope

Before this pass, date-aware normalization supports **40,938 / 44,974** foreign-passport relationships (91.0%), with all **4,036 / 4,036** remaining relationships covered by existing research audits. This is three fewer exact relationships than the September release because the Cambodia trial ended on 15 October; its previously published safeguard already removes expired visa-free scoring. No successor is inferred from that expiry.

Two parallel researchers examine CN/HK/MO → KH and KZ/BY/RU/SA/TR → ME. A separate reviewer must reopen every retained source and approve each exact candidate before promotion. Existing policy archives, raw fallback dates and unrelated source-review dates are preserved.

## Bosnia transition audit

Normal trusted HTTPS with system curl freshly retrieves the English MFA Bahrain and Oman country pages. Both still expressly require a visa for stays after 30 September 2026 and distinguish the expired 60-day seasonal rule from the normal embassy-issued route. Their reciprocal outbound travel-document tables are not inbound evidence. Node fetch and the browsing reader fail for these pages; system curl succeeds without disabling TLS checks.

The recorded Saudi Arabia page returns 404 under English, Bosnian and Serbian paths, with and without `www`, and with a trailing slash. Search results reproduce the former text but are not a fresh source read. The existing three-country October visa baseline is therefore retained without a new group review date. This audit does not establish an extension or modify Saudi treatment from a retrieval failure.

## Verification maintenance

The baseline unit suite exposed three old assertions that implicitly expected the Cambodia/Bosnia seasonal exemptions to remain active on the machine's current date. Historical trial assertions now use their explicit last valid date; the Bosnia check also exercises its already-reviewed 1 October successor. Existing boundary tests still test expiry and UTC rollover. No application behavior is changed to satisfy these historical assertions.

## Independently approved integration

The [Montenegro candidate](pass418-montenegro-autumn-2026.candidate.json), SHA-256 `0615a6bd7879ff9c79c30ed9bb1d452a075ffce8169215a57da37b392820289c`, received [independent source approval](pass418-montenegro-autumn-2026.review-notes.md) after all nine retained URLs and the full consolidated regulation were reopened. Four exact-scope refreshes reconfirm Kazakhstan's 2 October prior-visa baseline and the BY/RU/SA/TR waivers through 31 October, followed by their 1 November prior-visa baseline. The archive remains unchanged and both earlier Kazakhstan refresh generations are suppressed in the public projection.

All five routes gain structured current stays: four 30-day waivers and Kazakhstan's qualified visa-C ceiling. The published visa-C label preserves **90 days in 180 days from first entry, subject to the issued visa**. Independent review corrected an initial rolling-window label; the source's first-entry anchor controls. The general procedure page's stale nationality table is expressly excluded from status evidence. Application-centre filing and online forms do not establish eVisa issuance.

The [Cambodia audit](pass418-cambodia-successor-2026.notes.md), SHA-256 `a639dab37d2cc3d899e6114080f67c04b6231b7c6014be9fe14b76fc570297bd`, received [independent approval as unresolved research only](pass418-cambodia-successor-2026.review-notes.md). Four actual source reads establish the expired trial and distinguish the requested extension from adoption. Government eVisa instructions remain behind redirects/challenges, Paris mission guidance returns maintenance, and London's exemption material is dated 2019. No new status, stay or review deadline is published from this packet. Its source records remain research-only.

The Montenegro research also surfaced the reverse direction. Russia's own 14 October MFA statement expressly says Montenegrin visitors will need visas from **1 November 2026**; its Podgorica mission positively documents original-passport submission and regular consular issuance. The separate [one-pair candidate](pass418-russia-montenegro-successor-2026.candidate.json), SHA-256 `2a1f4267a67d26ab05917f717f0c71a2d3473f3b3f79066aa3d0408681c27d6c`, received [independent approval](pass418-russia-montenegro-successor-2026.review-notes.md). This is destination-side confirmation, not assumed reciprocity. The new future override and historical policy split affect only ME → RU; the other eight members of its original waiver cohort retain their previous evidence and source dates. No new Russian visa stay is inferred from the mission's old tourist table or omission from the eVisa list.

The two promoted batches append eleven sources and five policies: canonical totals are **892 batches, 3,736 sources, 2,073 archived policies and eleven conditional records**. Current exact coverage stays **40,938 / 44,974**, while current structured-stay coverage rises **4,421 → 4,426**. The seven stay allowances lost at the pre-existing October seasonal endpoints explain the difference from September's 4,428; this pass does not revive them. No current passport score changes, raw fallback restamping, KV migration, extra paid read or new indicator observation year is introduced. Sitemap modification metadata reflects this substantive 20 October update.

## Release checks

Final local `npm run test:all` passes: **164 files with zero typecheck diagnostics**, lint, **481 unit tests across 21 files**, complete **4,036/4,036** pending-audit coverage and production build. All **114 desktop/mobile browser tests** pass, including 320/390-pixel relationship layouts, API/HTML/native-Markdown/negotiated-Markdown agreement, expired seasonal redirects, historical timeline retention and current stay limits. Strict frozen-cohort profile coverage remains complete for 72 passports and 144 topics; its 138 populated indicator outcomes and six explicit unavailable outcomes are unchanged.

New regression checks cover the four Montenegro UTC transitions, Kazakhstan's exact boundary, qualified first-entry-anchored visa ceiling, transitive refresh suppression, the ME-only Russian archival split, future stale-category normalization, idempotent scores, and the correct current canonical URL in regional sitemaps. The first new tests incorrectly assumed the evidence timeline omits expired policies; they were corrected to count active matching policies while retaining legitimate history. The source-host integrity test required adding only the two newly read exact official hosts, `mid.ru` and `montenegro.mid.ru`.

Semantic comparison with the preceding commit confirms identical prefixes for all 890 old batch IDs, 3,725 sources, 2,068 policies and eleven conditional records. The raw fallback and dated combination-insights artifact are unchanged. Recomputing the complete insights on their original raw snapshot and again with just the new ME → RU November loss produces byte-equivalent structured results, including all pair/triple ties, the minimum-cover representative/order and marginal gains. No regeneration or new observation date is needed for that scoped change.

Normal local preview requests confirm **eight sitemap shards and 42,705 unique URLs**. The three fewer entries than September reflect the existing Cambodia expiry safeguard; the refreshed stay information adds no duplicate routes. The current Russian ME visa-free URL remains canonical until November, and boundary tests confirm the visa URL replaces it on 1 November. Status totals are 40,938 exact, 4,036 not exact, 1,142 characterized, 4,426 stay-covered, 244 fresh, 40,694 old and zero stale.

The [independent final integration review](pass418-integration-review.md) approves the exact runtime/evidence hashes with no blockers. It separately passed 119 focused tests, verified append-only preservation and approved-candidate equality, and checked all five Montenegro routes plus the Russian reverse route in JSON, Markdown and narrow-screen HTML. Publication results follow below. User analytics CSV exports remain excluded from the release.

## Next bounded priorities

Reopen Cambodia's destination instructions when the eVisa/mission service recovers; do not substitute a requested extension or an issuer advisory for an adopted successor. Replay all five November changes at the boundary, including the newly confirmed ME → RU direction. The five reconfirmed correction-only review windows from Pass 416 reach their separate 29 October research target; those deadlines are not visa-rule expiry dates and must not be mechanically extended. Bosnia's Saudi source retrieval and the previously documented citizenship-law gaps remain useful follow-ups. No new external-score family or stale statistical year was published in this expiry-focused pass.
