# Pass 413: independent security and integration review

Reviewer: `/root/review_pass412`. Date: 22 September 2026.

## Lockfile decision: APPROVE

Reviewed exact `package-lock.json` SHA-256: `8aedf4a3d18a9fa5700a3a29fe178fdc9226bd54be7d69eddcaa824f62c97ee3`.

The only changed package entry is `node_modules/devalue`, from 5.9.0 to 5.9.4, including its version-specific registry tarball and integrity checksum. `package.json` is unchanged, and both Astro and its React integration already allow `^5.8.1`. No dependency range relaxation, major-version upgrade, application behavior change or evidence edit is part of this lockfile correction.

Independently opened the [maintainer's GHSA-9rgm-9g3h-6x36 advisory](https://github.com/sveltejs/devalue/security/advisories/GHSA-9rgm-9g3h-6x36), which identifies malformed-index parsing as a denial-of-service risk and 5.9.2 as the fixed release. Its impact statement is conditional on parsing untrusted input; this review does not claim a demonstrated remotely exploitable path in this application. The [upstream changelog](https://github.com/sveltejs/devalue/blob/main/CHANGELOG.md) records the index-bounds correction in 5.9.2 and further patch changes through 5.9.4.

Independently retrieved the [npm registry's 5.9.4 metadata](https://registry.npmjs.org/devalue/5.9.4) through ordinary HTTPS after the web reader failed. Its tarball URL and integrity value exactly match the lockfile. `npm ls devalue --all` reports 5.9.4 for both Astro consumers, deduplicated. The installed parser contains the bounds rejection.

Independent checks:

- `npm audit --json`: zero currently reported vulnerabilities. This is a current registry-audit result, not a guarantee that no vulnerability exists.
- A minimal one-element, out-of-bounds parsing input throws `Invalid input`; no load-generating or live-service exploit test was performed.
- Date, Map, BigInt and cyclic-reference serialization/parsing round trips pass.
- Semantic comparison against the preceding committed lockfile confirms no other package entry changed.

## Integration and visa-source review boundary

This approval covers the scoped lockfile correction. Root owns the complete application test/build/browser gates and any release. Separate Hong Kong and French Guiana candidates must receive actual-source review bound to their exact bytes before publication; this dependency review does not approve those not-yet-reviewed facts. This reviewer has not modified application code, canonical evidence or deployment state.

## Final integration decision: APPROVE

Reviewed the completed integration on 22 September 2026 after both separate source approvals. Hong Kong candidate SHA-256 is `4f2dde658e44f3c7071987b54dbf3d3dfe47e38a7de42aed8120d4a8023ce8ce`; French Guiana candidate SHA-256 is `1271f3c5bc152fe96ce17676ad642f0eddb51dbba43af8d9da892c70e5087dd0`. Their separate review notes record every actual authority read and the French Guiana insurance-minimum correction.

Independent integration checks establish:

- The published artifact adds exactly six sources and two policies. Every new record exactly matches the approved candidate after the documented research-only fields are removed. All preceding 3,673 source records, 2,055 policies and ten conditional records remain semantically unchanged.
- The export-only succession split changes only NI/SB in the Hong Kong prior-visa cohort and BR in the French Guiana prior-visa cohort. Historical slices retain the original source references, conditions and review dates, ending immediately before their new waivers. Unaffected cohort members retain the earlier policy; the Brazil-specific condition is removed only from the now Brazil-free current cohort. An explicit-cohort guard prevents silent misuse if a named source policy changes shape.
- Independent checks at 25/26 August for Hong Kong and 30/31 July, 31 January/1 February for French Guiana show no overlapping exact support. The French Guiana stay and exact verification cease after the inclusive endpoint. The narrow dated unknown override also removes stale visa-free and prior-visa inputs from scoring after expiry; a reviewed successor must explicitly replace that safeguard.
- The raw fallback changes exactly BR:GF, NI:HK and SB:HK from prior visa to visa-free. Only those passports gain one point; remaining summary changes are the mathematically resulting dense ranks/order. Destination metadata, identities and the original snapshot version/check/publication timestamps remain unchanged. This is a three-cell reviewed correction, not an upstream refresh.
- Independently recomputed combination insights from the corrected fallback: the result exactly equals the stored artifact. Repeated the computation with only BR:GF changed to unknown and its score/ranks reconciled: that result also exactly equals the artifact. Therefore these scoped deltas do not require runtime recomputation or additional KV access, and leaving the historical insights artifact byte-identical is justified. This is not a guarantee about unrelated future policy changes.
- The validator excludes unknown expiry safeguards from its map of verified replacement categories; this prevents a future unknown guard from masking the separately approved historical waiver. It does not convert unknown into verified access or broaden a source cohort.

One presentation issue found during this review was corrected: end-only historical policies previously inherited the label “Current official route.” Both HTML and Markdown now display their inclusive end dates, and the temporary waiver displays its full date range. The new public-format regression checks historical endpoints, the trial end, API evidence/stays, permanent redirects, robots, negotiated Markdown parity and mobile overflow. The existing redirect is correctly asserted as 308, with no application redirect behavior change.

The first independent cross-consumer run passed 366 of 368 checks and identified only the missing newly verified prefecture hostname plus old derived-rank expectations. Those test expectations were corrected without altering underlying evidence. The subsequent independent rerun passed **320/320** evidence, fallback, status and date-drift checks. The other seven test files in the earlier run, including data caching, passport normalization, indexing and sitemap behavior, passed. `git diff --check` passes. The exact new prefecture hostname is allowed; the official-host check was not weakened to a general suffix rule.

Reviewed implementation anchors (SHA-256):

- Access overrides: `79ad17bbecf3363eabd72f59231ba929a03bb2c12c19e1ba723e49576a2c566f`.
- Evidence aggregation: `6e98e021663f377fd8ccfa8b13818be4c0c3e81ac08a4f5fcecc46383e6fa041`.
- Corrected fallback: `adb0621e4dfcdcc4db69b3e998ec6d63dc64db4666edc4e390b1d211435a4685`.
- Unchanged combination insights: `9201789073c388a2eb5a4319449db072053dafc7dcf3fcdf3f6a8be13f9ed005`.
- New drift regressions: `091efe511d39165233f18eb840590f3dce99a53ff091619504d9c7d231540194`.

After the independent checks, root reported its final local gates green: 158 Astro files with no diagnostics, lint, 429 unit tests across 17 files, evidence/audit coverage, production build, and all 94 desktop/mobile browser checks including the new public-format cases. Root also reports unchanged complete country-profile coverage and zero reported dependency vulnerabilities. These full-suite results are coordinator-run results, distinct from this reviewer's independently executed checks above.

No remaining blocking issue found in this scoped integration. Root owns release execution and normal-URL production verification; this review does not authorize a wider release. Expiry reminders and a substantive recheck before 31 January remain necessary. The root's separately documented Bosnia, Montenegro and Cambodia watchpoint replay is not a new source approval by this reviewer. No country-profile claims, unrelated immigration cohorts, application data-fetch architecture or deployment state were changed by this reviewer.
