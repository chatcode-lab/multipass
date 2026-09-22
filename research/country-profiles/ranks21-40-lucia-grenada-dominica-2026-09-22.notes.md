# Saint Lucia, Grenada and Dominica — author research notes

Researcher: `/root/top20_italy_spain`

Actual retrieval date: 22 September 2026.

Candidate SHA-256: `3e8a35e49006bedf9d727b9cce26e7e97febf10a0458e880ab33a8e7b3e270a0`

Independent review requested four locator-only corrections, applied 22 September 2026: Grenadian management/technical services are section 10(1)(g); Dominican full age is section 2(2), printed page 6/PDF page 8; Saint Lucian deportation/conviction questions are Form 7 items 19–20; the Dominican 2027 announcement is located by its final foreign-income paragraphs rather than nonexistent headings. No substantive wording changed. The schema passed again after these corrections.

This is an author candidate, not an approval or publication. Scope: the six assigned ordinary-adult citizenship and baseline individual-tax topics. Repository research instructions, enrichment documentation and the actual schema were read before authoring. No application artifact, review approval, deployment or commit was created by this author.

## Material scope choices

- LC citizenship is deliberately a limited procedural profile: four substantive official application/evidence facts and an explicit eligibility gap. Neither an eight-year address-history question nor a blank government service-page requirements field establishes eligibility, a residence clock or an exemption.
- LC tax follows the national Law Revision Commissioner's actual 31 December 2023 compilation, hosted in the official OAS MESICIC repository. This is the national primary statute in an intergovernmental mirror, not a commercial summary. The two actual published 2026 income-tax amendments were read separately.
- GD citizenship requires reading the old posted base Act together with Act 20 of 2012: the latter adds the residence-permit requirement to section 7(1)(b). The permit is not silently relabelled permanent residence. Five aggregate years in the seven-year window before the final twelve months are distinct from the final residence period. Government service can be abroad, so no simple physical-presence constraint is attached to the whole route.
- GD tax section 8 says Grenadian sources for both residents and nonresidents. Overseas activity incidental to a Grenadian business remains included under section 30(5). No commercial worldwide-tax summary or unconditional territorial-exemption label replaces the actual statute.
- DM citizenship section 8(1)(c) says seven years immediately before application; the final twelve months lie inside those seven years. Section 8(2)(b) still says five years in its discretionary cross-reference and subsidiary regulation 11 says at least five years. Those actual textual inconsistencies are disclosed, not resolved by assuming the shorter route.
- DM tax is a 2026 baseline. The Prime Minister's Office's 4 August 2026 announcement targets 1 January 2027. No enacted implementing instrument was established. The future claim is therefore `not_established`, without an asserted effective-date field. It is not substituted for current worldwide/foreign-receipt provisions.

## Registered authorities: actual-reading record

All IDs below have the prefix `ranks2140-`. Sources are registered only when their substantive material was actually retrieved, not merely previewed in search results.

| Source suffix | Actual read and operative locator |
| --- | --- |
| `lc-cit-form` | Official Toronto consulate Form 7 PDF, headed application under section 8(1). Read opening checklist and the application, identity/nationality and residence-history questions, plus the declaration. Relevant PDF pages 1, 3–5. Questions about property, investments or employment history are not recast as legal eligibility requirements. |
| `lc-cit-unit` | Actual consulate citizenship webpage; read its instructions that applications go directly to the Citizenship Unit and that the Unit supplies requirements and forms. No assumption that the consulate itself grants citizenship. |
| `lc-cit-agenda` | Actual national parliamentary notice of 23 June 2026, including the concluding list of bills: item 11 is Citizenship of Saint Lucia (Amendment). This proves a bill was scheduled, not enactment, operative content or commencement. |
| `lc-tax-act` | Actual 190-page PDF of the national 2023 revised Chapter 15.02 in the official OAS repository. Read cover/revision metadata and relevant full text through public HTTPS fetching and local Swift PDFKit extraction. Section 2: PDF pages 8–11; sections 7–8: page 13; sections 10/10A: pages 14–15; section 60: page 50; sections 82–83: pages 61–62. Read sections 84–85 too, but did not introduce a new filing/departure claim. |
| `lc-tax-amendments` | Actual NPC 2026 Acts index and both linked public PDF downloads. Read all 9 PDF pages of Act 2 of 2026 (assent/effect 19 February 2026) and all 5 pages of Act 10 of 2026 (assent 16 July, bracketed date 21 July 2026). Act 2 changes deductions and pension-withdrawal treatment; Act 10 changes a first-time-landowner deduction, a company filing extension and late-payment penalty. Neither changes the cited residence definition or section 8. Web extraction rejected the download content type, but ordinary public Node HTTPS retrieval returned PDFs and local PDFKit exposed the text. |
| `gd-cit-act` | Actual Parliament-hosted 38-page base Act, not the login-gated laws-site download. Read full principal sections 1–15 and Schedule. Operative sections 2, 5, 7–10 and 12 are on PDF pages 2–6. The header lists amendments through 2002, not a 2026 consolidation. |
| `gd-cit-permit` | All 4 pages of actual Act 20 of 2012: section 3, PDF page 4, replaces section 7(1)(b) with residence-permit holding plus the final twelve months. Assent 25 July and operative bracketed date 3 August 2012. |
| `gd-tax-act` | Actual Parliament-hosted 82-page compilation, header listing amendments through 2010. Read section 2's individual residence definition (PDF pages 7–8), sections 7–11 (pages 10–12), section 30(4)–(5) (pages 22–23), section 31(3)'s limited visiting-employee rule (page 23), section 43 (pages 32–33), and the base section 50 opening (page 37). Only the explicitly selected baseline provisions are asserted; the old section 7(5) is superseded by the separately read 2015 amendment. |
| `gd-tax-amendment` | Actual Act 27 of 2015. Read commencement and definitions, section 3 replacing section 7(5), and surrounding amendment text. The candidate's narrow withholding-mechanism claim relies on section 3 at PDF page 6 and commencement pages 3–4, not on unamended base wording. It does not claim every payment is taxable or state a rate. |
| `dm-cit-act` | Actual 60-page national government scan, not a search transcription. Public Node HTTPS PDF bytes were read using local PDFKit rendering and Apple's Vision English OCR. Principal provisions read through sections 2–17; operative section 8 at printed page 8/PDF page 10, section 9 at printed page 9/PDF page 11, section 6(2) at printed pages 7–8/PDF pages 9–10, section 11 at printed pages 10–11/PDF pages 12–13. Also read subsidiary regulations 8–16, especially regulation 11 at printed page 20/PDF page 22. The seven-year ordinary requirement and five-year older cross-references were both actually visible. |
| `dm-tax-act` | Actual 138-page national scan, retrieved normally and read with local Vision OCR. Read the arrangement and operative pages through section 10. Ordinary-residence definition: PDF page 12; individual residence definition: page 13; sections 7 and 8: page 17. OCR was used on original page images, not to reconstruct inaccessible law from snippets. |
| `dm-tax-faq` | Actual current IRD FAQ body. Read its resident worldwide-income statement and statutory/treaty qualifications, overseas-resident domestic-income answer, distinction between business income and withholding categories, filing-duty answers and extension guidance. The candidate uses only the cited scope/treaty statements, not the page's allowance figures or every filing assertion. |
| `dm-tax-future` | Actual Office of the Prime Minister article dated 4 August 2026. Read its complete announcement and express January 1, 2027 timing. It reports future source-only taxation; no implementing Act was supplied by this article or established elsewhere in this bounded research. |

## Saint Lucia download locators and access limitations

The NPC source's public links were obtained from the actual 2026 Acts index. The downloads can be followed in a normal client; their encoded path is a public document identifier, not an authentication credential.

- Act 2: <https://npc.govt.lc/laws/download/UjVlcXRvZTd3RG93ODVaQ0tsbWNwV3hnRmd5R0lYY1crUTlXU0pTZ1Rrd0dWZTlvdmdwK3lVYk1zYUlwcVNnT3NqYk9Pc09icmd0Vks5RDVLeVFXdG9JMFc1alI4NTNLRjRiWDJuV29sQVk9>
- Act 10: <https://npc.govt.lc/laws/download/UjVlcXRvZTd3RG93ODVaQ0tsbWNwY3BZUU5uNEVJM3lpam1HV0lqRS9SRUNzTmp6YisvZFBmQTR2RUw1MFprRHJYRytQRkJMOUo0c0tWQ0YwY2ZoUzJNRUNWSVhnWjEvSll1MW9DSnBIUndsMTNkTDFVOWN0UHpZRk9XZmxhdWg%3D>

The former Attorney General URLs for the Citizenship and Income Tax Acts returned actual WordPress 404 bodies, including ordinary `www` and HTTP-to-HTTPS redirect checks. The current AG resource page offers lists of revised laws, not the missing operative chapters. The former IRD 2008 tax PDF and tax-residency PDF returned 404 or failed ordinary retrieval; the live `irdstlucia.gov.lc` homepage returned a maintenance notice. These failed resources are not registered as read authorities.

The actual NPC 2026 Acts index listed Acts 1–10 and no citizenship amendment. The actual 2026 Gazette index supplied no issue entries in its accessible body. A July 2026 secondary report suggesting removal of naturalisation renunciation was discovery only and is not proof or a candidate source. The actual national 2024 Citizenship Amendment Act 7 was also read in full: its birth/descent changes do not establish current section 8 requirements. The current Constitution's separate Commonwealth-registration provisions were read but not used as an ordinary alien-naturalisation clock.

## Additional amendment and conflict checks

These actual-read national documents informed scope/currentness checks without expanding the candidate into special products or a full tax computation:

- Grenada Citizenship Amendment Act 4/2016: all 5 pages; adds section 5A descendant registration, not a replacement of ordinary section 7. <https://grenadaparliament.gd/wp-content/uploads/2021/08/Act-No.-4-of-2016-Citizenship-Amendment.pdf>
- Grenada Income Tax Amendment Act 15/2012: all 4 pages; time-limited severance exemption. <https://grenadaparliament.gd/wp-content/uploads/2021/08/Act-No.-15-of-2012-Income-Tax-Amendment.pdf>
- Grenada Income Tax Amendment Act 41/2013: all 5 pages; severance and section 50 withholding wording, including nonresident bank-deposit interest exception. <https://grenadaparliament.gd/wp-content/uploads/2021/08/Act-No.-41-of-2013-Income-Tax-Amendment.pdf>
- Grenada Income Tax Amendment Act 22/2014: all 4 pages; winnings definition and withholding. <https://grenadaparliament.gd/wp-content/uploads/2021/08/Act-No.-22-of-2014-Income-Tax-Amendment-Act.pdf>
- Grenada Income Tax Amendment Act 12/2015: all 4 pages; National Insurance benefit exemptions. <https://grenadaparliament.gd/wp-content/uploads/2021/08/Act-No.-12-of-2015-Income-Tax-Amendment.pdf>
- Grenada Income Tax Amendment Act 43/2015: all 4 pages; section 68 information/confidentiality wording. <https://grenadaparliament.gd/wp-content/uploads/2021/08/Act-No.-43-of-2015-Income-Tax-Amendment-No.-3-Act.pdf>
- Grenada Income Tax Amendment Act 8/2016: all 6 pages; investment deductions and conditional withholding relief, with commencement by order. This is not presented as proof of commencement of a special investment benefit. <https://grenadaparliament.gd/wp-content/uploads/2021/08/Act-No.-8-of-2016-Income-Tax-Amendment.pdf>
- Grenada Income Tax Amendment Act 1/2017: all 4 pages; pension definitions and exemptions. <https://grenadaparliament.gd/wp-content/uploads/2021/08/Act-1-of-2017-Income-Tax-Amendment.pdf>
- Dominica Income Tax Amendment Acts 3/2020, 13/2021 and 18/2023: actual government PDFs read in full. The 2021 file is misleadingly named a Bill but its content carries assent and enactment; it introduces the resident residential-rental exemption, with an express income-year application clause. The 2023 Act adds a State-employment-only filing exemption. These checks are why the candidate does not copy every broad filing or rental statement from older IRD pages. <https://dominica.gov.dm/laws/2020/Income%20Tax%20(Amd)%20Act%20(No.%203%20of%202020).pdf>, <https://dominica.gov.dm/laws/2021/Income%20Tax%20(Amendment)%20Bill,%202021%20(Act%20No.%2013%20of%202021).pdf>, <https://dominica.gov.dm/laws/2023/income_tax_amendment_act_2023_act_18_of_2023.pdf>

Grenada's separate laws-site download flow led to login. Current IRD links redirected to Facebook or a login-oriented tax portal. No account, authentication bypass or alternate credentials were used. Accessible Parliament-hosted texts were the independent official alternative.

Dominica's actual IRD personal-income-tax page says more than 183 days continuously, whereas section 2 of the actual Act says not less than 183 days and supplies other nexus rules. The candidate does not flatten the statutory alternatives into that simplified guide wording. No complete administrative reconciliation of Dominica's older citizenship regulations was found.

## Validation and handoff

`countryProfileCandidateSchema.parse` passed using the repository's installed `tsx` loader: six unique country/topic pairs, 33 facts, 13 registered authorities, all source references resolved and all topic titles within 52 characters. Each topic has at least four substantive documented or conditional facts, with unresolved facts additional rather than a substitute for that baseline. The exact candidate hash is recorded above and must be recomputed after any review correction. A separate reviewer must read and approve the exact bytes before publication.
