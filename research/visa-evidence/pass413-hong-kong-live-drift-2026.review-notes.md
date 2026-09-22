# Pass 413 Hong Kong: independent source review

Reviewer: `/root/review_pass412`. Reviewed: 22 September 2026.

## Decision: APPROVE

Exact candidate SHA-256: `4f2dde658e44f3c7071987b54dbf3d3dfe47e38a7de42aed8120d4a8023ce8ce`.

Approval covers exactly Nicaragua and Solomon Islands ordinary visitor passports entering Hong Kong: visa-free visits of up to 30 days, effective 26 August 2026. No expiry is supplied by the authorities, and none is invented. This is source approval, not approval of an unseen integration or deployment.

## Independent source reads

- [Immigration Department visitor requirements](https://www.immd.gov.hk/eng/services/visas/visit-transit/visit-visa-entry-permit.html): independently fetched the actual HTML over ordinary HTTPS, status 200, after the web reader timed out. Read General, Parts I and II, table headings, complete scoped rows and remarks/footer. Rows 141 and 175 explicitly give Nicaragua and Solomon Islands 30-day visa-free visitor periods, with no applicable special-document footnote. Footer date is 26 August 2026. Conditions concerning funds, tickets and the Mainland/Macao transit exception, advance permission for longer stays, prohibited visitor activities, separate Part I entitlements and discretionary admission match the candidate.
- [Immigration Department announcement through Government Information Services](https://www.info.gov.hk/gia/general/202607/27/P2026072700708.htm): independently read the complete actual release through the web reader and ordinary HTTPS. Its second substantive paragraph expressly establishes inbound nationality access and the 26 August effective date. The outbound headline and first paragraph were not used to infer reciprocity. Publication is 27 July 2026, 17:35 HKT.

The two stored excerpts are literal after HTML whitespace normalization and contain 7 and 19 words respectively. The 30-day figure is a visitor-stay allowance, not visa validity or passport validity. No unregistered source, snippet, inaccessible page or commercial summary supplies the conclusion.

## Scope and checks

Independently rehashed the actual candidate and ran `npm run evidence:validate -- research/visa-evidence/pass413-hong-kong-live-drift-2026.candidate.json --exact`: pass, with two sources, one policy, two conflicts and no unresolved cells. The two conflicts accurately refer to the bundled fallback, not the already visa-free live feed. The existing `HONG_KONG_VISA_REQUIRED_CODES` and `hong-kong-current-prior-visa-list` still include the affected nationalities before integration; those historical records must not remain simultaneously active after the successor date.

Only NI → HK and SB → HK are approved. Work, study, settlement, special passports, mainland documents, onward destinations and other nationalities are not newly verified. Root must preserve the old reviewed source dates and unaffected policy cohort while implementing dated succession, then check application/API/Markdown, ranking and fallback consumers. This reviewer changed no candidate, canonical evidence, access override or deployment state.
