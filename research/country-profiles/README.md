# Country-profile publication and expansion batches

The 17 September 2026 pilot adds ten citizenship topics, three tax topics and eleven statistical-geography mappings (22 observations). This is separate from visa verification; it does not improve the visa coverage percentage or alter mobility rankings.

Pilot release checks: independent review of both source candidates and the integration; type checking, lint, 412 unit tests, evidence-audit coverage and production build passed. All 90 desktop/mobile browser tests passed. Expansion checks additionally enumerate every approved topic and all 47 tied top-20 profiles; consult [current progress](top20-plan.md) rather than treating the original pilot counts as the whole catalog.

## Publication contract

- Legal candidate: `pilot-2026-09-17.candidate.json`; schema in `src/lib/country-profile-schema.ts`.
- Current statistics candidate: `top20-indicators-2026-09-17.candidate.json`; schema in `src/lib/country-indicator-schema.ts`. The original `indicators-pilot.candidate.json` is historical, not the current publication target.
- A different reviewer opens every authority, checks scope/current force or stated edition, and writes a matching `.review.json`. Approval binds the exact candidate bytes by SHA-256.
- Candidates and reviews are audit files, not browser data. The publisher validates schema, independence, dates and hash before writing the approved application artifact. Changing candidate bytes invalidates approval.

```bash
npx tsx scripts/publish-country-profiles.ts research/country-profiles/top20-indicators-2026-09-17.candidate.json research/country-profiles/top20-indicators-2026-09-17.review.json indicators
npm run profiles:coverage
npm run test:all
npm run test:e2e
```

Whole-artifact publication replaces its target and requires review of the complete candidate. Do not republish the historical statistics pilot and discard expanded coverage. Legal expansions instead use independently approved, disjoint batches:

```bash
npx tsx scripts/publish-country-profiles.ts research/country-profiles/BATCH.candidate.json research/country-profiles/BATCH.review.json topics BATCH
```

Use a lowercase, hyphenated batch ID matching both audit filenames. The publisher appends to `src/data/country-profile-expansions.json`, rejects duplicate topics or conflicting source IDs, and preserves previous batches. Every rendered topic and JSON topic carries its own approval. The profile API's common `review` is null when topics have different approvals or nothing is collected; use `topics[].review` and `reviews` in that case. Do not overwrite a batch or advance unrelated review dates. A future correction mechanism must explicitly supersede the old topic with independently reviewed replacement evidence; do not bypass the duplicate guard.

Current expansion: [all passports at ranks 1–20, including ties](top20-plan.md).

## Collecting another statistics candidate

`npx tsx scripts/collect-country-indicators.ts --top20` fetches the versioned UNDP CSV and a bounded World Bank series window for the frozen 47-country cohort plus the retained India pilot, validates columns/pagination/mappings, and writes only the statistics candidate. Without `--top20`, the collector retains the original eleven-profile pilot mode. Neither mode updates production, KV or review dates in the approved artifact. Re-running a collector changes candidate bytes and requires a fresh independent approval before publication. Review release/window changes before altering the importer. A retrieval failure retains published data. No new scheduled workflow is enabled.

Retain source hashes, native values, periods, statistical-geography names, licence and attribution. HDI uses the 2025 report's 2023 observations. The controlled life-expectancy import returned 2024 observations; do not reuse a prior research note's incorrect 2025 assumption. Display rounding is not source rounding. Do not apply an aggregate such as euro-area Big Mac pricing to individual countries.

## Next bounded legal pass

Assign three to five countries and one specific adult route per country. Read the enrichment plan and actual schema. Keep legal residence, permanent residence and physical presence separate; preserve route/cohort alternatives, absences, language skills and exemptions. A missing requirement is `not_established`, never zero. Use current national authorities, not a commercial index. Proposed, historical and unreviewed implementing rules cannot become unqualified current claims.

Useful priority follow-ups: Portugal's implementing rules and accepted language evidence; Singapore's completion/renunciation formalities; UAE operational application availability and newer implementing measures; India document-level renunciation procedure. The UAE pilot states only the reviewed ICP-hosted consolidation, not a readily obtainable second-passport route.

Next indicator passes: PISA subject tables with sampling/uncertainty notes; country-specific Big Mac observations after licence/provenance review; homicide with prominent year caveats. Keep Rumavi link-only without republication permission.

## SEO, API and cost checks

Publish only substantial reviewed topics. New citizenship/tax children self-canonicalize; Markdown canonicalizes to HTML. Unsupported topics return 404 and are absent from sitemaps. Verify alias redirects, exact claim/caveat parity and all links. Keep existing travel rankings/URLs intact. API `not_collected` means no collection outcome yet, not ineligibility, and carries no approval. A reviewed unavailable statistic has a null value and explicit reason, not zero. Test 320–390px, keyboard access and no horizontal overflow. No external browser data fetches or per-metric KV reads.

`npm run profiles:coverage` validates the exact candidate/review/artifact chain and reports collection outcomes separately from unresolved legal facts and unavailable observations. `npm run profiles:coverage -- --require-complete` fails until all 47 profiles have both required legal topics and both indicator outcomes, with India retained. Passing that gate is not proof that every legal question is established or that deployment has happened.
