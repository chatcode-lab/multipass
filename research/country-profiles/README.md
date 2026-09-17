# Country-profile pilot and next batches

The 17 September 2026 pilot adds ten citizenship topics, three tax topics and eleven statistical-geography mappings (22 observations). This is separate from visa verification; it does not improve the visa coverage percentage or alter mobility rankings.

Release checks: independent review of both source candidates and the integration; type checking, lint, 412 unit tests, evidence-audit coverage and production build passed. All 90 desktop/mobile browser tests passed, including topic HTML/Markdown/JSON parity, canonical redirects, real 404s, sitemap entries, source citations, legacy-guide scope, accessibility and 320–390px layouts.

## Publication contract

- Legal candidate: `pilot-2026-09-17.candidate.json`; schema in `src/lib/country-profile-schema.ts`.
- Statistics candidate: `indicators-pilot.candidate.json`; schema in `src/lib/country-indicator-schema.ts`.
- A different reviewer opens every authority, checks scope/current force or stated edition, and writes a matching `.review.json`. Approval binds the exact candidate bytes by SHA-256.
- Candidates and reviews are audit files, not browser data. The publisher validates schema, independence, dates and hash before writing the approved application artifact. Changing candidate bytes invalidates approval.

```bash
npx tsx scripts/publish-country-profiles.ts research/country-profiles/pilot-2026-09-17.candidate.json research/country-profiles/pilot-2026-09-17.review.json
npx tsx scripts/publish-country-profiles.ts research/country-profiles/indicators-pilot.candidate.json research/country-profiles/indicators-pilot.review.json indicators
npm run test:all
npm run test:e2e
```

The publisher replaces the relevant complete artifact. For an expansion, include existing approved records in the candidate and review the change set **and retained scope/dates** before replacement. Do not use a three-country-only candidate to erase the other published profiles. The present batch-level review model requires reviewing the complete artifact; implement per-record review metadata before mixing old and newly reviewed batches without re-reviewing them.

## Collecting another statistics candidate

`npx tsx scripts/collect-country-indicators.ts` fetches the versioned UNDP CSV and a bounded World Bank series window, validates columns/pagination/mappings, and writes only the statistics candidate. It never updates production, KV or review dates in the approved artifact. Review release/window changes before altering the importer. A retrieval failure retains published data. No new scheduled workflow is enabled.

Retain source hashes, native values, periods, statistical-geography names, licence and attribution. HDI uses the 2025 report's 2023 observations. The controlled life-expectancy import returned 2024 observations; do not reuse a prior research note's incorrect 2025 assumption. Display rounding is not source rounding. Do not apply an aggregate such as euro-area Big Mac pricing to individual countries.

## Next bounded legal pass

Assign three to five countries and one specific adult route per country. Read the enrichment plan and actual schema. Keep legal residence, permanent residence and physical presence separate; preserve route/cohort alternatives, absences, language skills and exemptions. A missing requirement is `not_established`, never zero. Use current national authorities, not a commercial index. Proposed, historical and unreviewed implementing rules cannot become unqualified current claims.

Useful priority follow-ups: Portugal's implementing rules and accepted language evidence; Singapore's completion/renunciation formalities; UAE operational application availability and newer implementing measures; India document-level renunciation procedure. The UAE pilot states only the reviewed ICP-hosted consolidation, not a readily obtainable second-passport route.

Next indicator passes: PISA subject tables with sampling/uncertainty notes; country-specific Big Mac observations after licence/provenance review; homicide with prominent year caveats. Keep Rumavi link-only without republication permission.

## SEO, API and cost checks

Publish only substantial reviewed topics. New citizenship/tax children self-canonicalize; Markdown canonicalizes to HTML. Unsupported topics return 404 and are absent from sitemaps. Verify alias redirects, exact claim/caveat parity and all links. Keep existing travel rankings/URLs intact. API `not_collected` means no collection outcome yet, not ineligibility. Test 320–390px, keyboard access and no horizontal overflow. No external browser data fetches or per-metric KV reads.
