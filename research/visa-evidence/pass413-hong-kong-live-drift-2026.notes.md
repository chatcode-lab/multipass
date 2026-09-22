# Pass 413 — Hong Kong live-versus-bundled drift

Author: `/root/top20_italy_spain`

Researched: 22 September 2026.

Exact candidate SHA-256: `4f2dde658e44f3c7071987b54dbf3d3dfe47e38a7de42aed8120d4a8023ce8ce`

Scope is exactly `NI → HK` and `SB → HK`, ordinary visitor passports. No outbound Hong Kong relationship, other nationality, canonical artifact, access override or queue entry was edited by the author. The coordinator added the scoped queue entry after receiving the proposed entry. Independent review and any promotion remain separate steps.

## Result

Both relationships are supported as `visa_free` for a visit of up to 30 days from **26 August 2026**, announced on **27 July 2026**. One group policy covers both exact cells. No expiry is stated in the cited provisions, so none is invented.

This is not inferred reciprocity. The government announcement's headline and first substantive paragraph concern HKSAR passport holders travelling outward, but its second substantive paragraph expressly states the inbound nationality rule and effective date. The current Immigration Department visitor schedule separately supplies named Nicaragua and Solomon Islands rows with 30-day visa-free periods.

## Actual source reads and locators

1. [Immigration Department visitor requirements](https://www.immd.gov.hk/eng/services/visas/visit-transit/visit-visa-entry-permit.html): ordinary public Node HTTPS retrieval returned HTTP 200 after the web tool timed out. Read the actual General and Part I/II text, the table header, complete relevant table rows and remarks/footer. **Part II row 141 is Nicaragua; row 175 is Solomon Islands.** Both show a 30-day visa-free visit and a dash in the prior-visa column. Neither scoped row has a diplomatic-only, biometric, residence, transit or other footnote limitation. Footer date: **26-08-2026**; the text says the information was updated in August 2026 and may subsequently change.
2. [Government Information Services announcement](https://www.info.gov.hk/gia/general/202607/27/P2026072700708.htm): ordinary public Node HTTPS retrieval returned HTTP 200 after the web tool timed out. Read the complete announcement. The **second substantive paragraph**, immediately after the outbound Nicaragua/Solomon Islands paragraph, explicitly grants the inbound visitor concession from **26 August 2026**. The closing publication line is **27 July 2026**, issued at **17:35 HKT**.

Source hierarchy is destination immigration guidance plus its explicit national-government announcement. Search results were discovery only; both registered URLs were actually fetched and their operative HTML read. No credentials, alternate authentication, proxy, access-control bypass or portal-branding inference was used. There is no stale-table access limitation: the current HTML schedule was actually retrieved. An older open-data CSV was not substituted for it and is not registered as evidence.

The General and Part II paragraphs provide the policy's remaining conditions: funds without working; onward/return tickets with the express Mainland China/Macao transit exception; advance permission for a stay longer than the visa-free period; restrictions on employment, business establishment/joining and study; and no guarantee of permission to land. Part I's separate resident/document entitlements are not folded into the ordinary-passport baseline. The 30-day value is expressly permitted visitor stay, not document validity or processing time.

The candidate has only two supporting excerpts: **7 words** from the schedule and **19 words** from the announcement. No additional verbatim passage from either authority is reproduced in these notes.

## Live discrepancy versus validator baseline

The author independently inspected both public relationship API responses on 22 September 2026:

- [NI → HK live API](https://multipassrank.com/api/v1/visa/NI/HK): HTTP 200, `source: live`, `checkedAt: 2026-09-18T03:06:00.204Z`, `status: visa_free`, `evidenceLevel: pending`; empty policies, sources and allowed-stay arrays.
- [SB → HK live API](https://multipassrank.com/api/v1/visa/SB/HK): the same live timestamp, `visa_free` status and pending/empty evidence fields.

By contrast, the actual local fallback `fallback-2026-08-26T05-08-41-773Z`, checked at `2026-08-26T05:08:41.773Z`, contains **`visa_required` for both cells**. The existing `HONG_KONG_VISA_REQUIRED_CODES` cohort likewise contains NI and SB; its source record was reviewed on 20 August 2026, before the newly established effective date. Historical prior-visa evidence is not proof of a current rule after the change.

The repository validator compares conflicts against the bundled fallback, not the public live API. Therefore the candidate correctly contains two **bundled `visa_required` → official `visa_free` conflicts**. It does not falsify the snapshot field to describe the live result. The live classifications themselves agree with the current official rule but have not yet acquired matching published evidence. These API responses are diagnostic observations only, not official immigration sources.

Any integration must preserve the historical record while giving effect to the dated successor rule. The author did not alter, expire or remove an existing policy and did not promote the candidate.

## Workflow checks

Read CONTRIBUTING, the evidence-model handoff, the playbook's main research rules and relevant Hong Kong research history, the complete candidate schema, actual validator/packet code, queue structure and existing HK source/policy records. Ran the expiry report; it identifies no scoped HK expiry and is treated as a review aid, not substantive law.

`npm run evidence:validate -- research/visa-evidence/pass413-hong-kong-live-drift-2026.candidate.json --exact` passed: **2 sources, 1 policy, 0 conditional records, 2 conflicts, 0 unresolved**. An additional direct exact-scope check confirms only `NI:HK` and `SB:HK`, each assigned once. Excerpt counts, candidate hash and whitespace were checked. The candidate remains unapproved until a different reviewer independently opens both authorities and verifies the exact bytes.
