# Pass 415: Singapore–Vietnam demand-led bilateral stay enrichment

Researcher: `/root/pass415_vietnam`. Source reads: 28 September 2026. Candidate only: no self-approval, canonical edit or publication.

## Scope and useful change

Fresh Search Console demand selected the Singapore-to-Vietnam visa-free relationship (1,283 impressions, two clicks in the supplied page export). The existing record groups it with nine other named bilateral ordinary-passport routes. This candidate rechecks that **exact existing ten-passport cohort**, not the entire Vietnam column:

`KH, ID, KZ, KG, LA, MY, MN, MM, SG, TH → VN`.

All ten remain `visa_free`; there is no score, rank, canonical URL or classification correction. The useful enrichment is ten new structured 30-day stay relationships, a Kazakhstan-only 90/180 ceiling, and fuller Singapore document/purpose conditions. The former record mentioned six-month validity and paid-work exclusion but omitted Singapore's expressly stated return/onward ticket, funds and onward-entry-document requirements.

## Actual official sources and locators

- [Vietnam MFA bilateral register](https://web.mofa.gov.vn/web/guest/tin-chi-tiet/chi-tiet/danh-muc-mien-thi-thuc-cua-viet-nam-voi-cac-nuoc-57162-172.html): actual HTML opened with web browsing and separately retrieved via ordinary Node HTTPS, HTTP 200. Read the ordinary-passport portions of rows 20 Kazakhstan, 22 Cambodia, 38 Indonesia, 43 Kyrgyzstan, 44 Laos, 48 Malaysia, 53 Myanmar, 56 Mongolia, 77 Thailand and 90 Singapore. The source distinguishes ordinary passports from diplomatic, service, crew and official-purpose documents. Its Singapore row supplies the Vietnam-side December 2003 start, while the November date concerns the reverse direction; neither is an inferred reciprocal date. The mixed group has no single common commencement, so the candidate intentionally has no group `effectiveFrom` or `effectiveTo`. The register's own historical update header is 14 March 2025; the September 2026 review date records this actual source read, not a newly enacted law or a claimed 2026 editorial revision.
- [Vietnam MFA passport-class table](https://mofa.gov.vn/vi/tin-chi-tiet/chi-tiet/viet-nam-39-s-visa-exemption-list-57163-596.html): actual page opened, not a search excerpt. Relevant ordinary-passport rows are Cambodia 15, Indonesia 37, Kazakhstan 44, Kyrgyzstan 48, Laos 49, Malaysia 52, Mongolia 56, Myanmar 60, Singapore 76 and Thailand 86. Each shows 30 days; Kazakhstan additionally has 90 days in 180. Ordinary-purpose and ordinary-passport columns must not be conflated. The page includes unrelated expired 2025 tourism-program notes and is therefore not treated as an exhaustive current destination-wide table.
- [Singapore's official Ho Chi Minh City consular guidance](https://hochiminhcity.mfa.gov.sg/consular-services/): actual page opened. The paragraph immediately after emergency contact details corroborates the 30-day ordinary-passport route and six-month validity, and expressly excludes temporary travel documents. It is supplementary issuer-government corroboration; destination-MFA evidence establishes the waiver. The page's site-wide current-date footer is not taken as an editorial update date.

Only short source excerpts appear in the candidate; these notes add no literal source quotations. No source was obtained using a credential, proxy, insecure TLS option or access-control bypass. No source document is committed.

## Dates, purpose and stay interpretation

The register directly prints the individual arrangement dates retained in the candidate. Cambodia and Myanmar distinguish the original commencement from the later amendment that raised ordinary-passport stays to 30 days. Kyrgyzstan cites succession to an earlier Soviet arrangement without establishing a successor effective date; none is fabricated.

The two independent destination tables agree on all ten ordinary-passport 30-day limits. The structured first stay applies to the whole explicit cohort, while the second explicitly applies only to Kazakhstan. Passport validity remains a condition, not a stay duration. Malaysia's list of permissible short-visit purposes is preserved without implying a right to work. Myanmar's commercial-activity exclusion and Mongolia's paid-activity exclusion remain scoped to those nationalities. No visa application URL is added to a visa-free baseline.

## Currentness and excluded follow-ups

Bounded currentness discovery checked destination-MFA and the Vietnam embassy in Singapore for amendments or changes to Singapore's exemption. No current change to this bilateral route was established. This is not a guarantee that no later instrument exists, and the register should be periodically rechecked.

The old canonical unilateral Resolution 44 and Resolution 229 policies contain a 30-day interval-after-departure condition. It must not leak into this bilateral cohort. The freshly opened English table does not print that condition. A separate official provincial-government search result describes its removal under the 2019 amendment effective in 2020, but that result has not been independently verified against the operative legislation here. Correction of those unrelated 24 nationalities needs a separate source-backed review; this candidate neither refreshes nor rewrites those records. The candidate's limited statement is that the cited bilateral provisions do not impose such an interval, not a universal guarantee of unrestricted repeated entry.

The central Singapore MFA Vietnam travel page was discoverable but failed browser extraction because its response exceeded the tool limit; it is not included as a candidate source. Port-specific arrival declarations, longer visas, possible visa-stay interactions, eVisa processing and extension procedures are not promoted from snippets or generic portal branding.

## Integration handoff

After independent approval, use the existing exact-scope `REVIEWED_POLICY_REFRESHES` mechanism:

`vietnam-bilateral-ordinary-passport-short-stay-waivers → pass415-vn-bilateral-ordinary-thirty-day-waivers`

The status, ten passport codes, sole destination, absent date bounds and absent exclusions match exactly. Keep the historical candidate/artifact unchanged and do not renew any unrelated Vietnam source dates. There should be one displayed bilateral-group timeline entry, not both old and replacement copies. The parent owns queue registration, promotion, regression tests and publication.

Expected regression checks: SG→VN remains visa-free with one 30-day stay; KZ→VN receives both 30-day and 90/180 stays; the 90/180 cap does not leak to SG or the other eight; Brunei, Philippines, Belarus and unilateral 45-day cohorts are unchanged; the retired timeline ID is hidden only after promotion and explicit refresh registration.

Exact candidate validation passed on 28 September 2026 after root registered the bounded queue batch: three sources, one policy, zero conditional records, zero conflicts and zero unresolved cells. Excerpts contain 12, 5 and 11 whitespace-delimited words respectively; `git diff --check` passes.

Candidate SHA-256: `7fae69a4d88d0060dc9ee1d9910d59da78f4b7c0d88e5234be21acb113d17106`.
