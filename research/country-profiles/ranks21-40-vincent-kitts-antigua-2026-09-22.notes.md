# VC / KN / AG bounded legal research

Researcher: `/root/top20_italy_spain`

Actual retrieval date: 2026-09-22

Candidate: `ranks21-40-vincent-kitts-antigua-2026-09-22.candidate.json`

Candidate SHA-256: `8dffa268ae7205851ad3e0954dbc85f22c3ce34234e6a34852ba631eda7e4b26`

Independent review requested two locator-only corrections, applied 22 September 2026: the VC checklist uses items iv–v and additional-documents item vi; the AG 2021 Act replaces section 2(8)(a) through its section 2. No substantive claim changed. Schema validation passed again.

Author research only, not independent approval. Six citizenship/personal-tax topics; no application artifacts, publication, deployment or commits changed. The current README, enrichment documentation and actual schema were read. Existing unrelated worktree changes were preserved.

## Principal review cautions

- VC: the complete Citizenship Act was not found on an accessible national primary source. Do not substitute the seven-year Commonwealth constitutional registration rule, or the Prime Minister's broader FAQ wording, for every adult's ordinary naturalisation period. The topic records useful application evidence and expressly unresolved clock/status/absence, language and retention questions. The Constitution PDF says last updated 11 November 2005. A draft amendment and an enacted-acts index are not substitutes for unread operative legislation.
- KN: the 2020 revision's Second Schedule 1(b) refers to residence during the fourteen years before the final residence year but gives no aggregate duration in that limb. Preserve that wording; do not silently replace it with a flat fourteen- or fifteen-year eligibility promise. Commonwealth and British-protected-person routes differ. The constitutional protection against compulsory foreign-nationality renunciation is expressly tied to registration eligibility under section 92, not every naturalisation applicant.
- AG: apply the actual 2021 amendment to the base Act's unlawful-residence exclusion. The base PDF alone is not current on this point. The naturalisation residence window is not the separate Commonwealth registration route. Section 115 constitutional dual-nationality wording concerns the specified independence-era cohort; the collected material does not settle all ordinary naturalisation retention conditions.
- KN taxes: section 3(3) excludes individuals from the general charge, but section 36 expressly includes individuals for covered nonresident withholding. Unincorporated business tax is separate. Neither corporate residence rules nor an old section 3 remittance clause is presented as a general current personal tax regime. No generic individual 183-day test was established.
- AG taxes: the foreign-source exemption is conditional, including liability to tax in the source jurisdiction. The incorporated residence definition and separate temporary-visitor exception are not interchangeable. The 2016 PDF has two printed pages per PDF sheet in booklet order; use statutory sections and printed page numbers.
- Tax statutes are the official posted editions, not represented as freshly consolidated 2026 laws. Current revenue guidance was checked alongside them. Rates, fees, monetary thresholds, special investments and treaty-country lists were deliberately omitted, avoiding old or temporarily changed amounts.

## Actual source-reading ledger

Every source registered in the candidate was actually opened and its cited operative material read, not inferred from a search preview. Web text was used where available; ordinary unauthenticated public fetching and local PDF extraction/OCR supplied the unreadable text where necessary.

| Candidate source suffix | Actual reading and locator checks |
| --- | --- |
| `vc-constitution` | Government PDF, 92 pages. Read citizenship sections 93–95; Commonwealth scope, refusal proviso and Parliament's separate legislative power retained. The update date is an edition limitation, not a new verification date. |
| `vc-cit-faq` | Read the complete short Prime Minister's Office FAQ. Questions 1, 3 and 4 support the limited registration, investigation and remote-filing statements. Remote filing is not a residence waiver. |
| `vc-cit-guidance` | Read the full citizenship page, including documents and the separate renunciation section. Investment wording is not used to assert an operational investment route. |
| `vc-cit-documents` | The three-page official PDF had no web-extracted text. Fetched its actual public bytes and read all three pages using Swift PDFKit plus Vision OCR. Only page 3 citizenship requirements are used; residence/work-permit requirements on pages 1–2 are not imported into citizenship. Fees conflict with the web page and are omitted. |
| `vc-tax-act` | Read actual section 2 definitions, sections 8 and 10 and section 60 in the IRD-hosted 159-page compilation. Residence continuity, whole-year absence qualifications, ordinary-residence definition and foreign-receipt exceptions are preserved. Old subsidiary treaty listings are not asserted as the current treaty inventory. |
| `vc-tax-guide` | Read the IRD Taxes page's personal income-tax, PAYE and withholding sections, including the return/payment date. No rate is imported. |
| `kn-cit-act` | Read the Law Commission's 52-page 2020 revision at sections 2, 3, 6–7, Second Schedule and Citizenship Regulations 4–6. Ordinary aliens, Commonwealth registration and British-protected persons remain distinct. Language evidence remains unresolved, not exempt. |
| `kn-constitution` | Read sections 92–94 in the government-hosted 101-page Constitution. Section 93's cohort boundary is material to the retention caveat. |
| `kn-tax-act` | Obtained the official 183-page 2017 revision through ordinary public Node HTTPS fetching; read cited pages with local Swift PDFKit extraction. In particular, section 3(3), section 36 and section 90 were read. An older IRD PDF marked draft for discussion was rejected, not registered. |
| `kn-tax-history` | Web access was unreliable; an ordinary public Node HTTPS fetch returned the actual IRD page. Read its opening account of income tax and abolition for individuals. The subsequent corporate rules are not used for individual residence or foreign income. |
| `kn-business-tax` | Read all seven pages of the Law Commission's 2017 revision, including sections 2–7, exclusions, calculation election and quarterly filing. Rates omitted because later temporary changes are possible and are outside the baseline. |
| `ag-cit-act` | Read sections 2, 6–7 and Second Schedule in the government's 17-page base Act. Read together with the actual 2021 amendment, not as an up-to-date standalone consolidation. |
| `ag-cit-amendment` | Read all five pages of Act 5 of 2021, assented 29 April and published 13 May 2021, replacing section 2(8)(a). No inference that every shorter unlawful period automatically counts. |
| `ag-constitution` | Read sections 114–115 in the official 128-page Constitution. The date/cohort limit in section 115 is retained rather than generalized. |
| `ag-business-tax` | Read the operative text of sections 1–4, 9–13 and 16–17 in the actual 14-sheet booklet PDF. Printed page numbering is used for cross-checking. Foreign source, source-country tax liability, incidental local connections and nonresident collection are distinct. |
| `ag-tax-faq` | Read all four pages of the IRD FAQ, including questions 1–4, 7 and 9–10. No nonresident withholding rate is generalized across different income categories. |
| `ag-tax-definition` | Read the resident definition in section 2, printed pages 6–7, of the government-hosted Income Tax Act. Used only because the 2016 business-tax statute expressly incorporates it; obsolete individual rates/charge provisions are not revived. |

## Supplemental currentness and access checks

- Actually read the complete [September 2026 KN descendant-registration bill](https://www.sknis.gov.kn/wp-content/uploads/2026/09/Citizenship-Amendment-Bill-2026-Cabinet-Approved.pdf), linked from the government's 15 September notice. It is explicitly a bill with a future ministerial commencement mechanism. It concerns descendant registration and oath wording; it is not adopted as an enacted ordinary-naturalisation change. It is not a candidate authority for an operative claim.
- Actually read the [AG 2019 business-tax registration amendment](https://laws.gov.ag/wp-content/uploads/2020/06/No.-33-of-2019-UNINCORPORATED-BUSINESS-TAX-AMENDMENT-ACT-2019-no-33-of-2019.pdf), five pages, published 16 January 2020. Its mandatory/deemed registration amendment does not change the cited residence or income-scope provisions.
- The AG immigration citizenship FAQ could not be retrieved as operative text: web access failed, and ordinary HTTPS fetching reported certificate verification failure, including with system CAs. Verification was not disabled. Its search-preview interview/document claims are not in the candidate. The scanned citizenship regulations were opened but not OCR-read; they are not cited.
- Bounded currentness searches did not establish a newly consolidated 2026 edition of the tax statutes. They do not prove that no amendments exist. The candidate retains stated source editions and limits instead of claiming complete amendment-chain verification or reproducing rates.

## Validation and handoff

The candidate passes the actual `countryProfileCandidateSchema`: 6 topics, 35 facts and 17 registered authorities. Topic titles satisfy the 52-character limit; referenced sources and topic/fact identities pass schema checks. Whitespace checks passed. The SHA-256 above binds the final candidate bytes.

Independent review must read the operative authorities, check the unresolved boundaries and bind exact candidate bytes before any publication. No review artifact is authored by this researcher.
