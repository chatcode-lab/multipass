# Pass 419 independent integration review

Review date: 2026-11-02. Reviewer is separate from both researchers and the integrating agent. Decision: **APPROVED for publication of the reviewed scope**, subject to the coordinator's normal commit/deploy and production checks. This note does not claim deployment has already happened.

## Approved inputs and unchanged archive

The exact approved candidate hashes remain unchanged:

- Thailand current entry scope: `319b9f9627c430515ca95d312cef567892094701050c623d4729fc3d8aa69869`.
- Taiwan → Anguilla: `dd17be1f5ce5ac810ec3539ac161c153f71d11156168a93ed7c85ebb0952869e`.

Independently compared the complete previous canonical artifact from Git HEAD with the current artifact. Every previous array prefix is unchanged: batch IDs 892 → 894, sources 3,736 → 3,750, policies 2,073 → 2,081, conditional records unchanged at eleven. The eight appended policies match the approved candidates exactly after the existing promotion script's intentional removal of research-only `confidence`; source projection likewise excludes research-only excerpts and officiality notes. No original evidence record or date was rewritten. The two unresolved-only candidates were not promoted as operative policies.

## Code and behavior inspection

Reviewed the actual changes in the evidence projection, reviewed status overrides, candidate validator, sitemap timestamp and regression assertions.

The strict full-scope refresh guard still checks category, exact passport membership/exclusions, destinations and legal dates. The new partial refinement guard requires explicit cohorts, equal category/destination/date/exclusion scope, a nonempty intersection and disjoint replacement slices for each old record. It removes only overlapping nationalities from the old public projection; archived evidence remains intact. Both dated-succession branches now use the already-refined cohort, avoiding resurrection of a removed slice if these mechanisms compose later. Current mappings affect only Taiwan's Anguilla slice and the reviewed Thai bilateral slices.

Thailand's original duplicate sixty-day and old VOA records are coalesced with their last-read counterparts through the existing strict refresh mechanism. Those counterparts and the old residual eVisa preferred-route record end inclusively on 14 September 2026. The seven new foreign preferred-route policies cover 198 passports: 78 visa-free, three VOA, 117 advance eVisa. The old Thai citizenship policy is retained without a false new review date. Bilateral policy records have no invented September treaty commencement. The overrides date the revised preferred-route partition rather than claiming every treaty started on that date.

Independently evaluated all 198 foreign passports through evidence lookup and normalization, including raw `unknown` input. Every normalized category matches its approved policy. Every current relation exposes exactly one approved permitted-stay rule, with the correct 30/15/14/30/90/15/60-day cohort duration. Only the seven approved foreign policies plus retained citizenship remain current for Thailand. Other Anguilla cohort members keep their old sources and dates; Taiwan has one new current policy and ninety-day per-visit stay.

The validator now genuinely enforces the requested `--exact` queue assignment check. It rejects unknown flags, retains prior automatic exhaustive-scope checks and does not weaken schema/source/conflict validation. The new CLI regression proves an omitted queued pair fails while a complete candidate passes and intentional unflagged discovery validation remains available.

## Independent runtime and mobile inspection

Used the coordinator's actual built preview at `http://127.0.0.1:4321`, not source templates alone. Independently checked each of these cases in API JSON, canonical HTML, explicit `.md` and negotiated `Accept: text/markdown`:

- Netherlands → Thailand: visa-free, thirty days.
- Seychelles → Thailand: visa-free, fifteen days.
- Azerbaijan → Thailand: VOA, fifteen days.
- Mexico → Thailand: advance eVisa, sixty days.
- Chile → Thailand: bilateral visa-free, ninety days.
- Taiwan → Anguilla: advance eVisa, ninety consecutive days per visit.

For every case, the Markdown negotiation body equals the explicit Markdown representation, the API supports the current category with one correct stay and the visible HTML stay matches. Browser rendering at **320px and 390px** has no horizontal document overflow. Full-page Netherlands/Thailand at 320px and Taiwan/Anguilla at 390px screenshots were also visually inspected: no material alignment, clipping or mobile readability regression found. The Anguilla page visibly separates visitor stay from visa first-use/validity windows and includes its application guide.

Independently checked HTTP **308** redirects from the old Mexico visa-free, Azerbaijan eVisa, Ethiopia VOA and Taiwan/Anguilla visa-free URLs to their correct current canonical paths. Thailand's destination HTML renders current partition totals. The sitemap index responds normally; the code's substantive update floor advances to 2 November without replacing a later snapshot date.

## Tests and reviewed file hashes

Independently ran the two new focused unit/CLI files: **16/16 passed**. Earlier independent exact candidate validations and the full-cohort probe also passed. `git diff --check` passed. The coordinator separately reports the complete typecheck/lint/unit/audit/build workflow passing: 166 checked files, zero diagnostics, 497 unit tests in 23 files, 4,036/4,036 audit links and a successful production build. Those full-suite results are the coordinator's run, not presented as an independent rerun here.

Runtime/code SHA-256 values at this review:

| File | SHA-256 |
| --- | --- |
| `src/data/visa-evidence.ts` | `f0635f1edccebf360daf7ba33d03e5d5979630033d19a5c5f092cf72131469df` |
| `src/data/access-overrides.ts` | `2f6109c4b75c2191de1b63beecff98a95bb471fe7d41eb5b61456f1d938347e6` |
| `src/data/reviewed-visa-evidence.json` | `e2fe649ecac10db4c2118fe56224b9c83bab471f12b75ed6293656af237a94ac` |
| `scripts/validate-evidence-candidate.ts` | `b857343ab848a931d4cb94e3ea6515848b3a88d93160788f9229cede174bcf26` |
| `src/lib/sitemap.ts` | `4a12137d91b77151e5593942e71398ae5661996c4cf57796a2144e6713ffe3ec` |

No blocking issue found in this reviewed scope. Remaining boundaries are explicit: AL → MA and NG → TZ remain unresolved, Thai citizen-entry law was not reverified, other Anguilla nationalities were not restamped, and no claim of complete current global coverage follows from this bounded pass. User CSV exports remain outside the publication changes. The coordinator owns derived-ranking consistency checks, full browser-suite completion and live post-deployment verification. If those checks require substantive new runtime changes, their changed files need follow-up review rather than treating these hashes as blanket approval.
