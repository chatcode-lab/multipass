# Pass 417 — Vietnam unilateral-waiver entry conditions

Researcher: `/root/pass416_europe`. Actual source reads: 29 September 2026. Candidate only; no self-approval, canonical edits or publication.

## Scope and finding

The generated `pass417-vietnam-unilateral-2026` packet assigns exactly the two existing twelve-country cohorts under Resolutions 44 and 229: 24 ordinary-passport relationships to Vietnam. All snapshot hypotheses are `visa_free`; the candidate retains that status and the exact existing nationality/date boundaries. Bilateral waivers, Belarus, citizenship, special documents and the eVisa residual are outside this batch.

The canonical 30-day interval after departure is stale. Removal is positively established by the Ministry of Public Security's explanation, corroborated by the amended Article 20 and its legislative footnote in the current 2026 consolidation. This is not an inference from silence in a table. Six-month remaining passport validity and the statutory admission grounds remain applicable on each entry. Removing a waiting interval does not establish a right to unlimited border runs, extensions or admission.

The signed Resolution 229 also expressly says tourism purpose, a material limitation absent from the abbreviated English Government report. The candidate preserves that condition. Resolution 44 instead expressly operates regardless of entry purpose, without itself authorizing employment. The 45-day stay is separately structured for each cohort. No stay had previously been structured on either canonical policy: this enriches 24 already-exact relationships, not 24 new exact relationships or changed scores.

## Actual primary-source reads

1. [Resolution 44 Government record](https://vanban.chinhphu.vn/?classid=2&docid=213057&pageid=27160) and its [signed two-page PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/3/44-npcp.signed.pdf): actual metadata opened, official attachment downloaded and both pages rendered and visually read. Article 1 names all twelve passports, covers ordinary passports through its all-passport wording, and gives 45 days from entry regardless of purpose, subject to legal conditions. Article 2 gives 15 March 2025–14 March 2028 inclusive. Article 3 terminates Resolutions 32/2022 and 128/2023 from 15 March 2025. Issue date 7 March is not the 12 March portal receipt/signature timestamp or the 15 March commencement.
2. [Resolution 229 Government record](https://vanban.chinhphu.vn/?classid=2&docid=214878&pageid=27160) and its [signed two-page PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/8/229-cp.signed.pdf): same direct/visual procedure. Article 1 positively identifies the second twelve-country cohort, tourism, all passport types and 45 days from entry. Article 2 supplies 15 August 2025–14 August 2028 inclusive. Article 3 terminates the earlier Resolution 11 pilot from 15 August 2025. The new full text does not carry over that pilot's organized-tour confirmation condition. The issue date is 8 August; the portal receipt/signature timestamp is 12 August.
3. [2026 consolidated-law Government record](https://vanban.chinhphu.vn/?docid=217302&pageid=27160), [Gazette record](https://congbao.chinhphu.vn/van-ban/van-ban-hop-nhat-so-62-vbhn-vpqh-469192.htm), and the retained [text-bearing Gazette PDF](https://congbaocdn.chinhphu.vn/180507251028987904/2026/4/10/469192-1775620625_v1_1775783105_signed.pdf): retrieved the actual 36-page document using ordinary HTTPS and read its PDF text. Page 1 identifies the original 2014 law and 2019, 2023, 118/2025 and 103/2025 amendments, the latter effective 1 July 2026. PDF page 18 (printed Gazette page 19) contains Article 20 and footnote 43 identifying the 2019 replacement effective 1 July 2020; page 19 completes Article 21's admission grounds. PDF pages 22–23 contain Article 31, whose 45-day unilateral temporary stay traces to the 2023 amendment. Page 36 authenticates consolidation 62/VBHN-VPQH on 23 March 2026. Relevant pages were also rendered and visually checked. Consolidation/publication dates are not new entry-rule effective dates.
4. [MPS re-entry answer](https://bocongan.gov.vn/hoi-dap/chi-tiet-cau-hoi/c94b4c6f-7d75-4808-8119-38e24a4aaf85?page=%2F): opened the complete actual question and Ministry answer, dated 1 February 2024. It explicitly attributes abolition of the former interval to Law 51/2019/QH14, rather than relying on generic entry guidance. Its old thirteen-country Resolution 128 cohort is historical and does not supply either current twelve-country scope.
5. [MFA passport-class table](https://mofa.gov.vn/vi/tin-chi-tiet/chi-tiet/viet-nam-39-s-visa-exemption-list-57163-596.html): actual HTML opened and UK ordinary-passport row plus note 1 checked. The fresh source is retained solely to preserve the positive BNO document exception and corroborate ordinary UK scope. Its visible update date is 30 June 2025 and its Resolution 11 tourism-pilot material is superseded. The current retrieved footnote does not print the old 30-day interval; that omission is not the legal proof of removal.

The two English Government reports linked by the former candidate were actually reopened as supplementary context. Their summaries agree with the nationality/stay information, but the August report omits the tourism qualifier and ambiguously repeats the second cohort's date after mentioning Resolution 44. The signed resolutions control; the English reports are not retained as candidate sources. Source excerpts are literal fragments of at most 25 words, not translations presented as quotations.

## Retrieval limits and currentness

The Government portal's 16 MB consolidation attachment exceeded the web extractor's size limit and has an empty PDF text layer; a direct download succeeded, but the text-bearing Gazette edition was used for substantive reading. The Gazette direct PDF also failed the web fetcher but succeeded with ordinary `curl` and native PDFKit. Resolution PDFs have no extractable text; both pages of each were visually inspected from native PDF renders, not inferred from search snippets. No downloaded document or rendered page is committed.

Unused discovery attempts: the national legal database's Law 118/2025 page returned HTTP 403; the Can Tho Law 51 attachment returned a tool error; the Algeria mission's July 2026 Resolution 229 page timed out. None is cited as a retrieved source or used to infer legal treatment. Bounded currentness searches checked Government, MFA and MPS material; the retained 2026 consolidation supplies the operative entry provision and the signed waivers explicitly run through 2028. This is not a guarantee against future amendments, nor a reason to treat a research date as legal commencement.

## Exact integration handoff

After a different reviewer opens all retained sources and approves the final candidate hash, use the existing exact-scope `REVIEWED_POLICY_REFRESHES` mechanism:

- `vietnam-resolution44-12-nationals-visa-exempt` → `pass417-vn-resolution44-current-entry-conditions`
- `vietnam-resolution229-12-nationals-visa-exempt` → `pass417-vn-resolution229-current-tourist-entry-conditions`

Keep the prior candidate, canonical source rows and archived policies unchanged. Do not refresh dates on the bilateral, other waiver, citizenship or eVisa policies. Each current cohort should have one displayed policy, not old/new duplicates. The status, passport codes, destination, absent exclusions and both existing effective boundaries match exactly. The removal occurred in 2020, before both 2025 policies began; this is a corrected explanation of the same policies, not a new 2026 legal transition.

Expected checks: all 24 cells remain visa-free with unchanged scores/ranks/exact coverage and URLs; each receives the correct 45-day structured stay; six-month validity stays a condition, not an allowed stay; Resolution 229 retains tourism scope; the old waiting requirement is no longer asserted as current; both inclusive 2028 policy deadlines survive; unrelated Vietnam policies and historical source rows remain unchanged. Parent owns promotion, regression tests and publication.

## Validation and review handoff

Generated the registered packet and checked its 24 hypotheses. `evidence:validate --exact` passes: five sources, two policies, zero conditional records, zero conflicts and zero unresolved cells. Independently compared each refresh's status, exact passport sequence, destination, exclusions and effective boundaries with the existing canonical policy; both match. `git diff --check` passes. The candidate was sent to `/root/pass416_pacific` for independent source review, not self-approved.

Candidate SHA-256: `ec83e6e88395eecd99da9f3d7b2802f0d110e00ba61badb1fc0c65a600137faf`.
