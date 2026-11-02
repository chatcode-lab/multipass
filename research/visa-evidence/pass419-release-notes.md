# Pass 419 — Thailand reform, live-data discrepancies and November checks

Research date: 2 November 2026. Starting commit: `343b9fa`. Publication follows actual official-source research, independent source review, integration checks and live verification.

## Baseline and research scope

The normal production status API uses live version `2026-10-28T03-05-34-556Z`, checked `2026-11-02T02:45:33.799Z`. It reports **40,898 / 44,974 exact (90.9%)**, 4,076 not exact, 1,142 characterized and 4,394 with supported stays. The dated bundled snapshot has 40,938 exact; this known live/bundled difference is not conflated with new coverage.

The queued 33-passport Thailand discrepancy review recovered a reform that also changes stays for many other nationalities. The scope therefore expands to the full 199-passport Thai catalog. The government PRD notice and Consular Affairs summary explicitly identify Gazette publication on 31 August and commencement on **15 September 2026**. The old sixty-day regime cannot remain current merely because an earlier page said publication was pending. Researchers and the independent reviewer are reading the operative Gazette pages and current ordinary-passport table, including bilateral exemptions and actual electronic issuance.

A second researcher checks three additional known live discrepancies: AL → MA, NG → TZ and TW → AI. Unsupported routes remain unresolved rather than being chosen from a live upstream value, a stale HTML comment or passport-issuer guidance. Any permitted stay must remain distinct from visa validity, application windows and processing time.

## November boundary checks

Normal production relationship APIs confirm that BY/RU/SA/TR → ME and ME → RU have changed to their previously reviewed **visa-required** successors after the inclusive 31 October endpoints. All five remain exact. Montenegro's four routes expose the qualified visa-C ceiling; Russia's route has no invented uniform stay. Those automatic date transitions were published in Pass 418 and are not new rule changes or new coverage in this pass.

The Russian MFA's actual 14 October statement was reopened through ordinary trusted HTTPS and still expressly describes both directions of the November change. Montenegro nationality-page opens failed in the web reader, ordinary Node HTTPS and separate normal system-curl attempts (timeouts). No existing source record receives a new review date from these consistency checks.

The baseline unit suite passes **481/481** tests across 21 files before integration. Seven user analytics CSV exports remain untracked and excluded from publication. No dependency, third-party ranking import, KV migration or paid keyword query is part of this bounded evidence pass.

## Approved official-source findings

The independently approved Thailand candidate covers all **198 foreign ordinary passports**, with Thai citizenship explicitly outside this refresh. Four operative Gazette notices, the central MFA table/English nationality graphic, government commencement notice and current embassy electronic-issuance guidance establish this preferred-route partition:

| Current route | Passports | Supported visitor stay |
| --- | ---: | --- |
| Unilateral tourism exemption | 60 | 30 days |
| Seychelles/Mauritius tourism exemption | 2 | 15 days |
| Cambodia/Myanmar bilateral exemption | 2 | 14 days; Myanmar international-airport limitation retained |
| Bilateral exemption, nine nationalities | 9 | 30 days |
| Argentina/Brazil/Chile/South Korea/Peru bilateral exemption | 5 | 90 days |
| Azerbaijan/Belarus/Serbia VOA | 3 | 15 days |
| Remaining foreign ordinary passports, advance eVisa | 117 | 60 days, subject to actual visa/admission and mission jurisdiction |

Thus Thailand has 78 visa-free, three VOA, 117 eVisa and one retained citizenship result. Thirty-five categories differ from the raw bundled snapshot; this is not a claim of 198 newly covered relationships. The former sixty-day scheme and older preferred VOA/eVisa cohorts end inclusively on **14 September 2026**; the adopted partition starts **15 September**, not an inferred 16 September. Gazette publication was 31 August. Previously admitted travelers retain their stamped permission, and a new tourism-only exemption is not generalized to business. Existing bilateral treaty commencement dates are not invented. Timor-Leste's thirty-day and Chile's ninety-day corrections concern current representation, not newly invented treaties. Land-border entry caps and nationality exceptions remain scoped to the unilateral scheme.

Taiwan → Anguilla remains advance **eVisa** under the destination government's actual nationality selector and electronic-PDF issuance guidance. It gains a directly supported **up to ninety consecutive days per visit** rule and application steps. This stay is explicitly distinct from the ninety-day first-use window and visa validity. No commencement date is invented; other Anguilla nationalities retain their earlier sources and dates.

Two research packets remain unresolved and were **not promoted**:

- **Albania → Morocco:** Albania's MFA reports a waiver notification, but a substantive current Moroccan destination confirmation could not be retrieved. No new operative waiver or stay is asserted.
- **Nigeria → Tanzania:** absence from the visible referral list does not prove VOA eligibility. An old referral paragraph exists only in an HTML comment, and generic online applications do not prove Nigeria's easiest current route. No category or stay is invented.

Candidate-specific notes and independent source reviews are adjacent to each of the four `pass419-*.candidate.json` files. Final integration approval is recorded in [the independent integration review](pass419-integration-review.md), bound to exact candidate/runtime hashes.

## Integration and safeguards

Only the two approved candidates are promoted: **fourteen sources and eight policies** appended. All previous canonical array prefixes remain byte-semantic identical: 892 → 894 batches, 3,736 → 3,750 sources and 2,073 → 2,081 policies. Eleven conditional records remain unchanged. Archived dates are not rewritten.

The existing strict complete-scope refresh mechanism coalesces duplicate historical Thai rows. A separately guarded, explicit partial-cohort refinement replaces only the reviewed Taiwan/Anguilla slice and Thai bilateral slices. It preserves category, destination, exclusions and legal-date scope, requires disjoint nonempty overlaps, and composes with dated succession without resurrecting removed passports. Full-198 normalizations, date boundaries, score idempotence, public histories, current stays and unchanged out-of-scope metadata are regression-tested. Reviewed overrides correct stale live upstream categories without modifying or refetching the upstream dataset.

Candidate validation now actually enforces the requested **`--exact`** flag for arbitrary queue batches; previously that flag was ignored outside specially named exhaustive cohorts. New CLI tests reject an omitted assignment while retaining intentional unflagged discovery validation. All four research packets pass exact assignment validation, including explicitly unresolved entries.

The sitemap's substantive-content floor advances to 2 November while retaining a later snapshot timestamp. An unrelated dated browser assertion now respects its existing correction-review deadline rather than assuming a 29 October window stays open indefinitely. This changes no production indexing rule and extends no review date.

No fallback snapshot, combination-insights artifact, country-profile fact, dependency, storage schema or source-fetch behavior is changed. A researcher independently reproduced the stored combination analysis from its original raw input; applying only this pass's Thai/Taiwan corrections leaves the **entire result artifact identical**, including all ties, gains and the minimum-cover sequence. A current-normalized versus pre-pass counterfactual also matches. The pre-existing raw-versus-normalized representative-set difference remains documented, not disguised by restamping the old artifact.

## Local verification

- `npm run test:all`: typecheck **166 files, zero diagnostics**, lint, **497 unit tests / 23 files**, audit **4,036 / 4,036** links and production build pass.
- `npm run test:e2e`: **118 / 118** desktop/mobile browser tests pass. The first run exposed only the old expired-deadline assertion noted above; the complete rerun passes after its test-only correction.
- Independent reviewer: actual official-source reading, approved hashes, archive-prefix comparison, all-198 normalization probe, sixteen focused tests, representative HTML/API/explicit and negotiated Markdown, 320/390px rendering/screenshots and four stale-route redirects pass.
- Strict existing profile coverage passes: 72 frozen-target passports, 144 approved topics, all required indicator outcomes present; their legal gaps remain explicit. No profile data receives an unjustified freshness change.
- Built preview on 2 November: **40,938 / 44,974 exact (91.0%)**, 4,036 pending, 1,142 characterized, **4,518 with stays**, 205 fresh, 40,733 old and zero stale. This is bundled preview, not production coverage.
- Preview sitemap: eight child sitemaps, **42,700 unique URLs**. Expired correction research windows are not incorrectly renewed to inflate this count.
- `git diff --check` and exact candidate validation pass. Seven user CSV exports remain excluded.

## Publication

Commit/deployment identifiers and actual production results will be recorded after the hosted checks and normal production probes complete. No cache purge, KV migration, extra upstream sync or synthetic live-data substitution is required.
