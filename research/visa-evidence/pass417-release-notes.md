# Pass 417 — Vietnam unilateral-waiver review and dependency security patches

Research date: 29 September 2026. Scope: the 24 ordinary-passport relationships in Vietnam's Resolution 44 and Resolution 229 cohorts, plus the two dependency alerts recorded during pass 416. Evidence research, independent source review, integration and deployment are separate gates.

## Dependency correction

The two GitHub alerts concern [GHSA-3wwx-pv8p-q78v](https://github.com/nodejs/undici/security/advisories/GHSA-3wwx-pv8p-q78v): an Undici WebSocket decompression error can terminate the client process when communicating with a malicious or compromised peer. The advisory does not establish an exploitable production route in this application.

- Astro → unifont: lockfile changes Undici 8.10.0 to **8.10.2**, within unifont's existing `^8.0.0` range.
- Wrangler → Miniflare: lockfile changes Undici 7.29.0 to **7.29.1**. Miniflare `5.20260915.0-alpha` pins the vulnerable version exactly, so a version-scoped npm override explicitly permits the patch. The latest inspected Miniflare also retained that vulnerable pin; upgrading unrelated tooling was not needed for this correction.
- Remove the scoped override when upgrading to an upstream Miniflare release with a corrected pin. Do not replace it with a blanket cross-major Undici override.

Only those two package entries change in the lockfile; their registry tarball integrity values and installed versions were checked. `npm ci`, `npm ls undici --all`, zero-vulnerability `npm audit --json`, and a local Miniflare dispatch smoke test pass. The smoke test uses Miniflare 5's exported configuration converter; initial attempts using the older README constructor shape failed validation before starting a worker. No exploit payload was sent to any service. This npm patch does not update the machine's Node.js bundled WebSocket implementation.

Upstream fixed releases: [Undici 7.29.1](https://github.com/nodejs/undici/releases/tag/v7.29.1) and [Undici 8.10.2](https://github.com/nodejs/undici/releases/tag/v8.10.2).

The [independent security review](pass417-security-review.md) approves the exact manifest/lockfile hashes and separately reproduces the dependency resolution, registry integrity, audit and local dispatch checks.

## Vietnam evidence correction and enrichment

The [research packet](pass417-vietnam-unilateral-2026.candidate.json) and [research notes](pass417-vietnam-unilateral-2026.notes.md) cover only the two existing twelve-country unilateral waiver cohorts. A different reviewer opened all five retained sources, visually read both signed resolutions and approved candidate SHA-256 `ec83e6e88395eecd99da9f3d7b2802f0d110e00ba61badb1fc0c65a600137faf`; see the [source review](pass417-vietnam-unilateral-2026.review-notes.md).

- The former general 30-day interval after leaving Vietnam was removed by the Article 20 amendment effective 1 July 2020. The Ministry of Public Security explicitly explains the removal, and the 2026 consolidated law retains the amended provision. This is positive legal evidence, not inference from omission in a table.
- Six-month remaining passport validity and individual admission conditions continue to apply. The correction does not promise admission, automatic extensions, employment permission or unrestricted repeated entries.
- Resolution 44 keeps its twelve-country scope, purpose wording, and 15 March 2025–14 March 2028 window. Resolution 229 keeps its different twelve-country scope and 15 August 2025–14 August 2028 window, but the published explanation now expressly includes its **tourism-purpose limitation**. The signed text controls over the abbreviated English news summary.
- Both cohorts gain structured **45-day stays from entry**, adding 24 stay-covered relationships. These numbers are not passport validity or the resolutions' expiry dates. Bilateral Singapore/Kazakhstan and other Vietnam routes remain unchanged.

Integration appends five sources and two policies, then uses the existing exact-scope refresh map to suppress only the two superseded current explanations. All prior source/policy/conditional rows remain identical archival prefixes; source dates on unrelated records are not renewed. Totals become 890 batches, 3,725 source records, 2,068 archived policies and 11 conditional records. Passport classifications, scores, ranks, fallback snapshot and canonical URL membership do not change. Exact coverage remains **40,941 / 44,974 (91.0%)**; structured-stay coverage increases **4,404 → 4,428**. No KV migration, extra paid read, cache-TTL change or paid keyword query is introduced.

## Release gates

The security-only baseline passed zero-diagnostic typecheck, lint, 463 unit tests, pending audit coverage 4,033/4,033, production build, all 108 desktop/mobile browser tests and strict profile coverage. The integrated Vietnam release adds eight unit checks and one browser scenario per viewport project.

Final local gates pass: **163 files with zero typecheck diagnostics**, lint, **471 tests across 20 files**, **4,033/4,033** pending-audit coverage (1,051 candidates), production build and **110 desktop/mobile browser tests**. New tests cover exact cohort/date preservation, archived evidence retention, tourism scope, removal of the obsolete interval, six-month validity, inclusive waiver endpoints, no leakage to bilateral/eVisa cohorts, structured-stay totals, HTML/Markdown/API parity and 320/390-pixel layouts. Strict profile coverage remains complete: 72 target passports and 144 topics, with explicit outcomes for every required indicator. Current dependency audit reports zero known vulnerabilities.

Normal local preview requests confirm eight sitemap shards with **42,708 unique URLs**, unchanged from pass 416. Status totals are 40,941 exact, 4,033 not exact, 1,142 characterized and 4,428 stay-covered relationships; the 24 genuinely rechecked cells move into the fresh bucket (380 fresh, 40,561 old, zero stale). All seven user analytics CSV exports remain untracked and excluded from publication.

The [independent integration review](pass417-integration-review.md) approves the exact evidence, code and dependency hashes with no blockers. The reviewer separately passed 319 focused tests and checked rendered HTML, explicit/negotiated Markdown, JSON APIs, destination timeline deduplication and 320/390-pixel layouts. Publication remains subject to the hosted checks and live verification recorded below.

## Published release and live verification

Runtime commit: [`f8711f6e0ceba3d721f97ac2f4dcdd54d58ef72a`](https://github.com/chatcode-lab/multipass/commit/f8711f6e0ceba3d721f97ac2f4dcdd54d58ef72a). Both [CI](https://github.com/chatcode-lab/multipass/actions/runs/36570450151) and [Cloudflare deployment](https://github.com/chatcode-lab/multipass/actions/runs/36570449833) completed successfully on 29 September 2026. GitHub automatically marked dependency alerts #12 and #13 **fixed** at 12:47:10 UTC; neither was manually dismissed.

Normal production URLs, without cache-busting or a forced data refresh, confirm:

- All 24 relationship APIs retain exact `visa_free` evidence, report the 29 September review, and expose one 45-day stay with the correct cohort-specific 2028 endpoint.
- UK and Belgium HTML, explicit `.md` and negotiated `Accept: text/markdown` responses contain the approved conditions; both Markdown forms are byte-identical. The pages remain indexable and fit 320/390-pixel viewports without horizontal overflow.
- The Vietnam destination timeline shows each corrected resolution once and no longer asserts the former 30-day interval. Singapore and Kazakhstan retain their separate bilateral routes.
- The status API reports 40,941/44,974 exact relationships (91.0%), 4,428 stay-covered, 1,142 characterized, 4,033 not exact, 380 fresh, 40,561 old and zero stale. An initial ad-hoc assertion treated numeric `covered` as a bucket; correcting the check to the documented numeric field passed without any application change.
- All eight sitemap shards respond successfully and contain exactly 42,708 unique URLs, unchanged from the preceding release.

Remaining limits: this focused review does not close any of the 4,033 unresolved exact-coverage gaps or revalidate unrelated Vietnam routes. Future legal expiry checks and eventual removal of the version-specific dependency override remain required.
