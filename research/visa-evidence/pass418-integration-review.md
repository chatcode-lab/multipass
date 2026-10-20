# Pass 418 independent integration review

Reviewer: `/root/pass418_review`. Review date: 20 October 2026.

Decision: **approved; no publication blockers found** in the reviewed data/code diff. This is independent integration approval, not a deployment claim. Root owns final complete browser-suite outcome and publication verification.

## Source gates and exact artifact preservation

The three separate source reviews bind their decisions to these unchanged candidates:

- Montenegro autumn refresh: `0615a6bd7879ff9c79c30ed9bb1d452a075ffce8169215a57da37b392820289c` — four same-scope policies approved.
- Russia's Montenegro successor: `2a1f4267a67d26ab05917f717f0c71a2d3473f3b3f79066aa3d0408681c27d6c` — one future policy approved.
- Cambodia successor audit: `a639dab37d2cc3d899e6114080f67c04b6231b7c6014be9fe14b76fc570297bd` — unresolved research only; no canonical promotion.

I compared the canonical artifact against Git HEAD with structural equality. Every prior batch, source, policy and conditional record remains an identical array prefix. The only additions are the two approved batch IDs, eleven approved sources with research-only metadata stripped, and five approved policies with confidence stripped. No Cambodia source or inferred successor was promoted. Totals are 892 batches, 3,736 sources, 2,073 policies and eleven conditional records.

Reviewed integration hashes:

| File | SHA-256 |
| --- | --- |
| `src/data/reviewed-visa-evidence.json` | `108aecb22629f38263d74bcd5af7069226130e3a199c631e6ce6fe66feeca6d0` |
| `src/data/access-overrides.ts` | `213f4c568c4e78051bc02570e66d37637b5d6b20ef5c81b5a6df24fa28f7f4a2` |
| `src/data/visa-evidence.ts` | `c703f7ce76450be6269477d66175850ccef19c7dfa3fb4d4406ef910adcb36e5` |
| `src/lib/montenegro-autumn-review.test.ts` | `dff2fdc76cc42d0e5783e71b40fe1126d267501d6d36c8238f7af175d4c085b1` |

## Scope and date checks

Four guarded refresh mappings preserve the complete old scope, status and dates, including the original → Pass 414 → Pass 418 Kazakhstan refresh chain. Public projections suppress both obsolete generations while keeping the historical artifacts. The four current waivers gain thirty-day stays with their 31 October endpoint; Kazakhstan gains the qualified ninety-in-one-hundred-eighty visa-C ceiling anchored to first entry. Neither a sliding window nor automatic ninety-day admission is implied.

The reverse override ends the old ME → RU visa-free override only on 31 October and adds its separately verified prior-visa successor from 1 November. The dated policy projection removes only ME from the old nine-passport cohort, retains the other eight with unchanged sources, and exposes a historical ME slice through the last valid day. No Russian visitor stay is invented. Supporting foreign documents, diplomatic/official documents and prior admissions are not flattened into this baseline.

I inspected the historical test corrections, exact official-host additions `mid.ru` and `montenegro.mid.ru`, sitemap modification-date update, and narrow regression assertions. The archive-date assertion now follows transitive refreshes and checks chronology rather than assuming every old source was read in August. Existing historical trial assertions use explicit valid dates. No runtime requirement was altered to satisfy an expired-season test.

## Independent execution and rendering

I independently ran six focused Vitest suites: Montenegro autumn, visa drift, evidence status, sitemap, Vietnam unilateral and passport normalization. **119 of 119 tests passed**, including UTC transition, repeated normalization, no stale waiver stay after transition, same-scope archive preservation and future sitemap canonical selection. `git diff --check` passed.

On the built local preview, I independently checked all five current Montenegro relationships:

- APIs return exact current categories and the 20 October source review date; KZ is prior visa and BY/RU/SA/TR remain visa-free on the review date.
- The five structured stay labels agree across JSON, rendered HTML and native Markdown. Explicit `.md` and `Accept: text/markdown` responses are byte-identical.
- Chromium at 320px and 390px shows every current stay without horizontal document overflow. I visually inspected a full-page 320px Kazakhstan capture; the first-entry ceiling and issued-visa qualification remain readable.
- Montenegro's destination timeline contains each of the four new policy headings once and retains the earlier Kazakhstan seasonal history.
- Cambodia CN/HK/MO APIs remain unknown, without exact support or current allowed stays.

After the final reverse-policy build, I independently reopened ME → RU. It remains visa-free before November, exposes the exact historical-policy endpoint `2026-10-31` in JSON, and redirects the premature `-visa` spelling to the current `-visa-free` canonical with 308. Its explicit and negotiated Markdown responses agree. Both 320px and 390px render with zero horizontal overflow; I visually inspected the full-page 390px capture. Russia's destination timeline includes the new Montenegrin successor heading once and the historical ME slice. The focused unit tests separately exercise the future server date and canonical sitemap switch; I did not alter the production or local server clock.

Root reports the final complete gate passed: typecheck for 164 files without diagnostics, lint, all 481 unit tests in 21 files, pending audit coverage 4,036/4,036 and production build. The complete browser suite was still running when this review was written; its outcome and production checks belong in the release record.

On the bundled local snapshot, current exact coverage remains 40,938/44,974 (91.0%); five structured-stay additions raise bundled current stay coverage from 4,421 to 4,426. These are local bundled-snapshot counts, not production daily-feed totals. The reverse visa change is future-dated. No unrelated source dates, raw upstream snapshot, paid data operation or country-indicator observation was changed. User analytics exports remain outside this reviewed release scope.

## Independent production-count qualification

After deployment, I independently fetched all seven normal regional evidence-status URLs and compared their live cells against the built bundled preview. Production reports **40,898 exact relationships, 4,394 with structured stays and 4,076 pending** on 20 October. Normal sitemap requests return eight shards with **42,665 unique URLs**, compared with 42,705 in the bundled preview.

The live feed has 185 category differences from the bundled snapshot: TD 144, TH 33, MA 1, TZ 1, AI 1, IL 1 and SB 4. Exactly forty formerly exact bundled relationships no longer match the live category: Thailand 33; Chad/PS, Morocco/AL, Tanzania/NG, Anguilla/TW and Israel/CO one each; Solomon Islands/CO and /PS two. Thirty-two Thai differences also lose their matching structured-stay annotation. These results independently reproduce root's production comparison; they do not establish which changed visa category is legally correct.

**None of the forty exact-support losses involves a Pass 418 scope pair**: KZ/BY/RU/SA/TR → ME, ME → RU or CN/HK/MO → KH. The discrepancy is separate daily-feed drift, not a category change introduced by this release. New official-source research and any corrections remain a next bounded task; this follow-up makes no runtime changes and does not approve those differing feed values as verified evidence.
