# Country-profile publication and expansion batches

The 17 September 2026 pilot adds ten citizenship topics, three tax topics and eleven statistical-geography mappings (22 observations). This is separate from visa verification; it does not improve the visa coverage percentage or alter mobility rankings.

Pilot release checks: independent review of both source candidates and the integration; type checking, lint, 412 unit tests, evidence-audit coverage and production build passed. All 90 desktop/mobile browser tests passed. Expansion checks additionally enumerate every approved topic and the combined 72-passport cohort; consult [current progress](ranks21-40-plan.md) rather than treating the original pilot counts as the whole catalog.

## Publication contract

- Legal candidate: `pilot-2026-09-17.candidate.json`; schema in `src/lib/country-profile-schema.ts`.
- Statistics schema: `src/lib/country-indicator-schema.ts`. The bundled artifact's `id` selects its exact candidate/review audit pair; an older artifact without an ID uses `top20-indicators-2026-09-17`. Historical pilot candidates must not replace wider coverage.
- A different reviewer opens every authority, checks scope/current force or stated edition, and writes a matching `.review.json`. Approval binds the exact candidate bytes by SHA-256.
- Candidates and reviews are audit files, not browser data. The publisher validates schema, independence, dates and hash before writing the approved application artifact. Changing candidate bytes invalidates approval.

```bash
npx tsx scripts/publish-country-profiles.ts research/country-profiles/top20-indicators-2026-09-17.candidate.json research/country-profiles/top20-indicators-2026-09-17.review.json indicators
npm run profiles:coverage
npm run test:all
npm run test:e2e
```

Statistics publication replaces its target and requires review of the complete candidate. Do not republish the historical statistics pilot and discard expanded coverage. The legal pilot is immutable; corrections use the explicit supersession contract below. Legal expansions instead use independently approved, disjoint batches:

```bash
npx tsx scripts/publish-country-profiles.ts research/country-profiles/BATCH.candidate.json research/country-profiles/BATCH.review.json topics BATCH
```

Use a lowercase, hyphenated batch ID matching both audit filenames. The publisher appends to `src/data/country-profile-expansions.json`, rejects accidental duplicate topics or conflicting source IDs, and preserves previous batches. Every rendered topic and JSON topic carries its own approval. The profile API's common `review` is null when topics have different approvals or nothing is collected; use `topics[].review` and `reviews` in that case. Do not overwrite a batch or advance unrelated review dates.

For a correction or refresh, the new independently reviewed candidate may include `supersedes: [{ code, topic, candidateSha256 }]`. The hash must identify the **currently active** approving candidate for that exact topic. A missing/stale predecessor, duplicate or orphan replacement, reused approval, or review/retrieval predating the predecessor is rejected. An existing acquisition `routeId` must be preserved so its legacy guide and API cannot silently fall back to stale facts. The compiler replaces only that topic's active view; prior candidate, review and published batches remain untouched. Re-read the whole replacement topic, not only its changed sentence. Use fresh source IDs for newly retrieved source records rather than mutating historical source dates. Direct legal-pilot publication is disabled, including an unchanged candidate with a newer review.

Completed expansion: [all passports at ranks 1–20, including ties](top20-plan.md). Current goal: [ranks 21–40 and a risk-based refresh](ranks21-40-plan.md).

## Collecting another statistics candidate

`npx tsx scripts/collect-country-indicators.ts --top40` fetches the versioned UNDP CSV, complete World Bank country registry and bounded life-expectancy window for both frozen cohorts plus India (73 geographies). `--top20` selects the preceding 47-country cohort plus India; no cohort flag retains the original eleven-profile pilot mode. The collector validates columns, complete pagination, unique periods and exact non-aggregate geography mappings. Missing TW/VA registry entries are explicit source gaps, not China/Italy substitutions.

Collection writes only a new dated candidate and refuses to overwrite an existing file; use `--output=unique-candidate-id` for a deliberate revision. Independent review must bind the exact resulting bytes and check all observations, mappings, missing states, source/registry hashes and reuse terms. Neither collection nor review updates production, KV or published review dates. Publication requires matching audit filenames and rejects older collections or missing prior collection outcomes. A retrieval failure retains published data. No new scheduled workflow is enabled.

Retain source hashes, native values, periods, statistical-geography names, licence and attribution. HDI uses the 2025 report's 2023 observations. The controlled life-expectancy import returned 2024 observations; do not reuse a prior research note's incorrect 2025 assumption. Display rounding is not source rounding. Do not apply an aggregate such as euro-area Big Mac pricing to individual countries.

Hash the downloaded **raw bytes before decoding**. The reviewed UNDP CSV is Windows-1252, not UTF-8; hashing a lossy UTF-8-decoded string is not a source-file checksum. Preserve the explicit `dataEncoding` and, for World Bank entity validation, both `geographyUrl` and `geographySha256`. A correction to provenance needs a new candidate ID and fresh independent approval; do not silently repair an already approved audit file.

## Next bounded legal pass

Assign three to five countries and one specific adult route per country. Read the enrichment plan and actual schema. Keep legal residence, permanent residence and physical presence separate; preserve route/cohort alternatives, absences, language skills and exemptions. A missing requirement is `not_established`, never zero. Use current national authorities, not a commercial index. Proposed, historical and unreviewed implementing rules cannot become unqualified current claims.

Useful priority follow-ups: Portugal's implementing rules and accepted language evidence; UAE operational application availability and newer implementing measures; India document-level renunciation procedure. Singapore's completion/renunciation formalities were re-read and extended in the independently reviewed 22 September refresh. The UAE pilot states only the reviewed ICP-hosted consolidation, not a readily obtainable second-passport route.

Next indicator passes: PISA subject tables with sampling/uncertainty notes; country-specific Big Mac observations after licence/provenance review; homicide with prominent year caveats. Keep Rumavi link-only without republication permission.

## SEO, API and cost checks

Publish only substantial reviewed topics. New citizenship/tax children self-canonicalize; Markdown canonicalizes to HTML. Unsupported topics return 404 and are absent from sitemaps. Verify alias redirects, exact claim/caveat parity and all links. Keep existing travel rankings/URLs intact. API `not_collected` means no collection outcome yet, not ineligibility, and carries no approval. A reviewed unavailable statistic has a null value and explicit reason, not zero. Test 320–390px, keyboard access and no horizontal overflow. No external browser data fetches or per-metric KV reads.

`npm run profiles:coverage` validates the exact candidate/review/artifact chain and reports collection outcomes separately from unresolved legal facts and unavailable observations. Its default is the combined 72-passport cohort; `--top20` or `--ranks21-40` selects one frozen cohort. `--require-complete` fails until every selected profile has both legal topics and both indicator outcomes, with India's pilot retained. Passing that gate is not proof that every legal question is established or that deployment has happened.
