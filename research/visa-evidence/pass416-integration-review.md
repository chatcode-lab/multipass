# Pass 416 — independent integration review

Reviewer: `pass416_europe`, 29 September 2026. Implementation author: root. Result: **approved; no integration blocker found**.

This review covers the dated correction overlay, approved-packet promotion, historical queries, scoring/coverage boundaries, public representations and tests. The reviewer authored the Ukraine, Moldova and Kosovo research packets, not the implementation; `pass416_pacific` independently reviewed and hash-approved those source packets. This integration approval does not replace any packet's independent source review or resolve its remaining legal-evidence gaps.

## Independent code and archive checks

- Compared the working canonical artifact with `HEAD`: all 881 previous batch IDs, 3,702 source rows, 2,066 exact policies and ten conditional rows remain identical ordered prefixes. The result has 889 batches, 3,720 sources, 2,066 exact policies and eleven conditional rows. No old source review date was refreshed.
- Compared the original `REVIEWED_UNKNOWN_OVERRIDES` array with `HEAD`: it is byte-identical. All ten follow-ups are separate dated annotations.
- Recomputed all eight candidate SHA-256 hashes and matched each to its independent review notes. Every one of the 18 appended sources and the single appended conditional record exactly matches the approved candidate after removal of candidate-only provenance/confidence fields. There is no additional promoted policy.
- Inspected the getters and every changed consumer. `getReviewedUnknownOverride(s)` resolves the date at call time and projects only annotations whose `checkedAt` is no later than `asOf`. Relationship evidence, characterization and sitemap expansion use the same projection. Only an explicit new `recheckBy` renews `reviewedAt` and the window; an inconclusive attempt updates the reason, citations and last-attempt metadata without renewal.
- The existing rejected-status equality guard remains in access normalization. An upstream different category or stronger verified override is not masked. The new source dates and explanations do not become exact policies or score inputs.
- The added conditional-source date gates in relationship evidence and characterization are appropriate. They align with the existing indexing source-date check and prevent the new undated Moldova conditional from appearing in 28 September results. No legal effective date is invented to achieve historical isolation.

## Dates, indexing and unchanged coverage

The focused boundary tests passed for the ten affected relationships:

| Scope | 29 September outcome | Window behavior |
| --- | --- | --- |
| US–BF, NR–BZ, BH/MC/RW–VU | Correction-only eligibility renewed | Included through 29 October, excluded on 30 October |
| NZ–NU, AD–GT, LU–UA, FJ–XK | Explanation/citations updated, no renewal | Original 26 September target remains overdue; excluded |
| DO–MD | New document-dependent conditional explanation | Eligible through conditional evidence, not through renewal of the expired correction |

Before the annotations activate, 26 September remains the old inclusive deadline and 27–28 September remain the excluded gap. No fresh 29 September source leaks into those ten historical relationship results. All ten current exact statuses remain `unknown`, with `supportsCurrentStatus: false` and no exact policy. The Moldova record does not add a permitted-stay number or legal effective date.

Independently reran an exhaustive sitemap-versus-page eligibility comparison over all 44,974 foreign relationships on each of 28 September, 29 September and 30 October: **134,922 comparisons, zero mismatches**. On 29 September, exactly the five renewed corrections plus DO–MD are newly eligible; no previously eligible relationship is removed. The six-URL delta is not exact verification.

Current totals independently calculated:

| Measure | 28 September | 29 September |
| --- | ---: | ---: |
| Exact foreign relationships | 40,941 | 40,941 |
| Not exact | 4,033 | 4,033 |
| Characterized but not exact | 1,142 | 1,142 |
| Structured-stay coverage | 4,404 | 4,404 |
| Indexable foreign relationship URLs | 42,073 | 42,079 |

The normalization regression test compares every passport detail before/after activation and passes, including scores and statuses. The later exhaustive comparison also respects existing scheduled policy transitions; it does not assert that unrelated exact policies remain active indefinitely.

## HTML, Markdown and API contract

- Reviewed HTML and Markdown changes use “withheld pending clarification” rather than incorrectly declaring an imported category false. This matters especially for Niue, where a travel-visa waiver can coexist with an arrival stay permit.
- The shared deadline helper distinguishes a future research target from an overdue previous target and explicitly says research targets are not legal expiry dates.
- JSON v1 adds `supportsCurrentStatus`, the source-based latest `reviewedAt`, and `reviewedCorrection`; existing keys and the legacy `rejected` value remain compatible. The agent guides now explain that legacy value as a withheld imported classification, not proof that all possible routes are false. The source-based latest review date is distinguishable from the correction's original/renewed window and `lastRecheckedAt`.
- `pass416_pacific` independently opened all ten affected HTML pages at a 390×844 mobile viewport and fetched their JSON APIs, `.md` files and negotiated Markdown. Reported checks passed: exact unknown/policy-zero semantics, shared projected reasons, five renewed windows, four overdue exclusions, Moldova conditional-only eligibility, Markdown negotiation byte equality, robots parity and zero horizontal overflow (390/390 for all ten).
- That reviewer also fetched all seven relationship sitemap groups and confirmed only the five renewed relationships plus Moldova were present among the ten. Full-page visual review of US–BF, NZ–NU and DO–MD found no misleading legal dates or missing caveats. Moldova's conditional HTML does not repeat its expired historical correction target, but presents the conditional caveat and revised reason; Markdown and JSON retain that metadata. This is not a blocker.

## Verification and limitations

Executed by this integration reviewer:

- `npm run test -- src/lib/reviewed-unknown-rechecks.test.ts src/lib/visa-indexing.test.ts src/lib/evidence-status.test.ts src/lib/sitemap.test.ts`: **41 tests across four files passed**.
- Independent archive/promotion/hash comparison and exhaustive eligibility script described above: passed.
- `git diff --check`: passed.

Separately reported by the other independent reviewer: **341 tests across six focused suites passed**, plus the all-ten rendered checks above. Root reported the full release gates passed: zero typecheck diagnostics across 162 files, lint, **463 tests across 19 files**, complete **4,033/4,033** pending-audit coverage, production build, strict profile coverage, and **108 desktop/mobile browser tests**. These broader runs were not duplicated by this reviewer.

The remaining current-force/implementation gaps for Niue, Guatemala, Ukraine and Kosovo remain explicitly unresolved; no fresh indexing windows were granted for them. Moldova's interpretation and inaccessible consolidated-law caveats remain in the approved conditional record. Source approval is hash-bound in the eight per-batch review files. No production deployment, external write, credential access or user CSV modification was performed by this reviewer.
