# Pass 414: Montenegro / Kazakhstan seasonal endpoint

Researcher: `/root/top20_italy_spain`. Actual source reads: 22 September 2026. Scope: only KZ→ME, ordinary passport-only visitor access. Author candidate only; no self-approval or publication.

## Outcome and exact scope

The adopted decision and the current MFA Kazakhstan page both specify the 1 May–1 October 2026 seasonal exemption, a valid travel document and stays up to 30 days. The country page independently states the normal visa requirement and consular issuance. The 6 August consolidated regulation supplies the express Article 4 visa baseline. Together these support the repository's existing prior-visa rule from 2 October, without treating silence or a list omission as the rule.

There is **no substantive change to the existing access status or date boundary**. New value in this scoped refresh is an independently re-openable adopted decision, current source review and structured 30-day stay. The candidate contains two non-overlapping temporal policies for the same exact cell. The conflict record is prospective, not an assertion that the current visa-free snapshot is wrong.

## Actual reads and operative locators

1. [Adopted Kazakhstan decision DOCX](https://wapi.gov.me/download/1f64b659-0537-4cd9-a370-25397d87b6f7?version=1.0): downloaded with ordinary trusted HTTPS and read in full with `textutil`. Decision 11-011/26-1467, adopted 17 April 2026, has completed adoption fields and is not the separate proposal. Article 1 sets the nationality, travel document, 1 May–1 October travel window and 30-day stay. Article 2 addresses publication-day commencement of the instrument, not the start of the tourist window. The actual [MFA temporary-exemptions page](https://www.gov.me/cyr/clanak/odluke-o-privremenom-oslobadanju-od-pribavljanja-viza), read in both browser and normal Node HTTPS, links this specific document and labels its publication 28 April 2026, version 1.0. Local retained download: `/tmp/multipass-pass414.DRcgSg/me-kz-decision.docx`.
2. [Current MFA Kazakhstan guidance](https://www.gov.me/diplomatske-misije/ambasade-i-konzulati-crne-gore-u-svijetu/kazahstan): entire actual HTML body read via ordinary Node HTTPS, HTTP200, after browser timeout. The three paragraphs under `Vizni režim` state, respectively, the normal visa requirement, diplomatic/consular issuance with the Bulgarian embassy alternative, and the dated seasonal exception. The brief supporting-document introduction is narrower than the newer regulation and is not used to limit Article 7.
3. [Consolidated visa regulation](https://www.gov.me/en/documents/7a121553-7780-477b-9117-d57985bfe57b): actual landing page read via ordinary Node HTTPS, publication 6 August 2026. The linked [17KB DOCX, version 1.0](https://wapi.gov.me/download/7a121553-7780-477b-9117-d57985bfe57b?version=1.0) was downloaded and read in full with `textutil`. Header lists Gazette amendments through 108/26. Article 4 expressly imposes the valid-document-with-visa baseline; Article 7 contains the specified third-country visa, residence and APEC-card routes with the 30-day/document-validity ceiling. Articles 11–12a contain special-document/accreditation routes, not ordinary passport-only waivers. Article 12c is addressed separately below. Local retained download: `/tmp/multipass-pass414.DRcgSg/me-regulation.docx`.
4. [MFA Visas procedure](https://www.gov.me/en/article/visas): actual HTML read via normal Node HTTPS. Operative locators are `Validity of travel documents` and `Conditions and procedure for issuing a Montenegrin visa`, including the personal application and diplomatic/consular issuance paragraphs. The rest of the C/D procedure was read, but no processing time or long-stay rule was promoted. Its older nationality list conflicts with later amendments for some countries and was deliberately not used for Kazakhstan classification.

Every retained source was actually opened and its operative text read. Public HTTPS retrieval needed no credentials, insecure TLS option, custom trust, proxy or WAF bypass. The draft decision with blank adoption fields was not used as enacted law.

## Article 12c and endpoint interpretation

Article 12c says exemptions cannot be regulated through special government acts from 31 October 2026, and seasonal exemptions from 1 October. It does not expressly amend the Kazakhstan decision's named endpoint or say that the existing Kazakhstan exemption is repealed one day earlier. The current country-specific guidance continues to use the adopted decision's 1 October endpoint. The candidate therefore preserves the existing inclusive `effectiveTo: 2026-10-01` and successor `effectiveFrom: 2026-10-02`; it does not silently shift the boundary to 30 September/1 October.

This is a transparent source interpretation, not a claimed judicial ruling. The post-1-October visa baseline is independently express and is supported under either reading of the general provision. A subsequent specific official clarification or amendment should trigger re-review of the endpoint. Parent and independent reviewer were alerted to Article 12c before finalization.

## Currentness checks and limits

Bounded discovery searched `gov.me` and `sluzbenilist.me` for Kazakhstan, 2026, visas and extension/October/September terms. No newer extension or withdrawal was established; absence of a search result is not proof that no later instrument exists.

The [current official Gazette register for the decision](https://www.sluzbenilist.me/propisi/393173) was actually opened. It labels the decision valid in Gazette 53/2026, publication 17 April and commencement 18 April. That metadata differs from the adopted text's publication-day clause. The candidate does not choose between those instrument-effective dates or invent an announcement date: the route's 1 May start and 1 October endpoint are explicit in the adopted text and operational guidance. The register is a supplementary currentness check, not a substitute for operative text.

The actual [20 April release on the 17 April government decisions](https://www.gov.me/clanak/saopstenje-o-odlukama-vlade-crne-gore-donijetim-na-telefonskoj-sjednici-odrzanoj-17-aprila-2026-godine) lists the Kazakhstan exemption among government decisions. The [27 July MFA alignment announcement](https://www.gov.me/amp/clanak/crna-gora-u-potpunosti-uskladila-viznu-politiku-sa-evropskom-unijom-gradanima-brojnih-zemalja-dostupnije-podnosenje-zahtjeva-za-crnogorsku-vizu) was actually opened: its stated 1 November visa requirement names Belarus, China, Russia, Saudi Arabia and Türkiye, not Kazakhstan. That date is not transplanted onto this cell. The conclusions landing page was opened, but its linked PDF was not needed or cited as proof.

## Existing model, snapshots and handoff

Inspected the existing `montenegro-kazakhstan-seasonal-30-days` and `montenegro-kazakhstan-advance-visa-from-october-2026` policies and the exact KZ→ME override in `src/data/access-overrides.ts`. The override is already `visa_required` from 2 October and reviewed 21 August. No author edit was made to that override or either old record.

The generated packet uses bundled version `fallback-2026-08-26T05-08-41-773Z`, checkedAt `2026-08-26T05:08:41.773Z`, visa-free. A normal live API read on 22 September returned visa-free/exact, checkedAt `2026-09-18T03:06:00.204Z`, the existing seasonal policy and no structured stay. Neither snapshot establishes the rule.

Promotion is optional until independent approval: this can remain a research-only recheck. If root promotes the useful current review/structured stay, preserve the old artifact bytes and review dates and deduplicate only the equivalent exact-cohort old seasonal and successor policy IDs in the exported projection. No status, override or boundary change is proposed.

Validation: `evidence:validate -- <candidate> --exact` passes. Independently checked union is exactly KZ→ME, with no overlap between policy windows. Four sources each carry at most 25 literal excerpt words; the notes add no direct quotations.

Final candidate SHA-256: `0945215f504f2406e8ee200e6436758424197b61af95b23e1d6f76f06d4b29bc`.
