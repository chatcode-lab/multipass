# Argentina, Chile and Brazil research notes

Researcher: `/root/top20_italy_spain`. Retrieved and assessed on 17 September 2026. This is a research candidate, not independent approval or legal advice.

Candidate: [top20-argentina-chile-brazil-2026-09-17.candidate.json](top20-argentina-chile-brazil-2026-09-17.candidate.json). Six topics, 31 facts, 18 registered primary sources. Validated against the actual `countryProfileCandidateSchema` using the existing local `tsx` dependency.

Exact SHA-256: `7524246d60af6e2b2621e4a0697840db9eaadabbbdceb5b60716cd1af6e66efe`.

Independent-review corrections: the Brazil manual's version label is 1.0, not the page-boundary extraction artifact 1.03. The Brazil departure fact now explicitly names the definitive-departure tax return and outstanding earlier returns; it does not describe travel back to Brazil. No substantive tax rule or question locator changed.

## Actual reading and source locators

All 18 registered sources were actually opened and their relevant operative text read. Search results were discovery aids only. URLs are recorded in the candidate's source registry.

| Source ID suffix | Text actually read and use |
| --- | --- |
| ar-citizenship-law | Complete current Law 346 page, especially Articles 2, 2 bis, 6 and the 2025 amendment/repeal annotations. The ordinary rule is two immediately preceding legal years with no foreign departure. |
| ar-naturalisation-service | Complete current service: eligible temporary/permanent residents, requirements, RaDEX steps and partly-in-person classification. No inference that uploading documents confers citizenship. |
| ar-consular-nationality | Complete Sydney page dated 10 March 2026. Broad multiple-nationality statement and foreign-law caveat read, but its judicial-process statement conflicts with the newer legislation and DNM procedure. |
| ar-citizenship-regulation | Complete published consolidated Decree 3213/1984, especially Articles 3–7 and 16. Used to expose unresolved transition/assessment questions, not to restore old residence waivers or judicial filing as the ordinary current route. |
| ar-tax-residence-guide | Complete ARCA residence page. The more-than-six-month personal-deduction rule is expressly kept separate from general residence. |
| ar-income-tax-law | Current consolidated library sections: Article 1, current Article 116 under Law 27802/2026 rather than the adjacent historical version, Articles 117–123, 124 and 164–166. Article 1 was also fetched directly; HTML entities remained readable. The 2026 investment-naturalisation exception is narrow and does not eliminate the foreign-national tests or pre-existing permanent-resident treatment. |
| ar-tax-treaty-procedure | Full substantive General Resolution 5855/2026, Articles 1–14, including June 2026 commencement, valid certificate, supporting declaration, withholding and transition. The separately linked declaration annex was not needed or represented as read. |
| cl-nationality-service | Current SERMIG page, updated 22 December 2025: ordinary and family cohorts, stamp clock, identity/background documents, activity/tax documents, application location and grant instrument. |
| cl-nationality-loss | Full Amsterdam consular page: constitutional loss grounds and voluntary-renunciation procedure. Used for loss of Chilean nationality, not to prove retention of an applicant's previous nationality. |
| cl-tax-residence-circular | Entire five-page Circular 63/2021: 184-day acquisition, rolling count, transit, residence loss, domicile, foreigner concession and treaty-residence treatment. This is still explicitly linked by the April 2026 SII FAQ. |
| cl-foreign-taxpayer-faq | Current FAQ, updated 8 April 2026, confirming initial foreigner treatment and subsequent domestic/foreign income scope. |
| cl-tax-scope-ruling | Actual one-page scanned Ordinary Ruling 214, dated 23 December 2025, on a foreign individual establishing residence in 2026. Browser text and PDFKit returned no text, so the actual PDF page was read through local Vision OCR. Its quotations of Articles 3 and 10 establish scope, three years and discretionary extension; the gold-specific facts and taxpayer identifiers are not used in the candidate. |
| br-migration-law | Operative Articles 65–73, including capacity, residence, Portuguese communication considering individual circumstances, conviction/rehabilitation and publication effect. Browser character decoding was imperfect but these provisions were readable. No reliance on its older nationality-loss text contrary to the Constitution. |
| br-naturalisation-residence | Complete substantive ministry page, updated 6 July 2026, directly fetched and read: indefinite residence, recognised-refugee clock, every listed reduction, proportional aggregate absence limits and annual residence evidence. |
| br-naturalisation-language | Complete substantive ministry page: each accepted evidence route, distance-course/in-person assessment conditions, mere-attendance insufficiency and Portuguese-country-origin documentary exemption. No CEFR conversion. |
| br-nationality-loss | Complete substantive ministry page, updated 3 July 2026, directly fetched and read: judicial grounds, express loss request, statelessness protection and no automatic loss on acquiring another nationality. |
| br-nationality-amendment | Full Constitutional Amendment 131, Articles 1–2 and publication date. The new rule took effect on publication, 4 October 2023, not the signing date. |
| br-income-tax-questions | The actual PDF identifies version 1.0 on printed page 2. Independent review caught an extraction error: the web reader joins the next page number 3 to that version at its page boundary, displaying `1.03`; local PDF text confirms `1.0`. Read front matter and relevant Questions 113–117, 125, 129–130, 132, 136–137 and 140. Printed-page locators are one greater than zero-based PDF page indexes. Special rates and controlled-entity calculations are not generalised into baseline personal tax rules. |

## Argentina transition limitations

The amended Law 346 and DNM service take priority for the described current administrative route. Also actually read the [DNM launch announcement of 3 October 2025](https://www.argentina.gob.ar/noticias/ahora-el-tramite-de-ciudadania-argentina-se-podra-hacer-de-forma-digital-en-migraciones), which announced digital initiation through Migraciones from 6 October 2025 and described the transfer away from courts. It does not settle litigation or existing court files.

The Sydney page was updated in March 2026 but still calls naturalisation a federal-court process. The published older decree likewise retains court wording, old residence waivers and a judicial oath. These conflicts are preserved, not silently harmonised. No claim is made that every constitutional challenge has been resolved, that the DNM application system has completed grants, or that a legacy case must transfer. No specified language/civic standard or new-process exemption was established. The age wording is not converted into an unsupported precise birthday ruling.

## Chile unresolved nationality issues

The live BCN statute and constitution links from SERMIG returned only the client application shell, including alternative `navegar`, `Navegar` and `N` URL variants. The legacy export URL also returned a shell. Therefore no claim of reading the current consolidated statute through that portal is made.

The [Interior Ministry's archived Decree 5142 PDF](https://www.interior.gob.cl/transparenciaactiva/doc/MarcoNormativoAplicable/200/8088835.pdf) was actually downloaded and all four pages read through the installed macOS PDFKit framework after browser fetches timed out. It is a 2016-version text generated on 2 August 2021, not a verified September 2026 consolidation. It says more than five years, leaves incidental-trip continuity to assessment, and prints a prior-nationality-renunciation clause. Current SERMIG says five or more years and uses the relevant temporary-residence stamp clock. Candidate residence is explicitly attributed to current SERMIG guidance; exact anniversary and absence treatment remain unresolved.

The [official administrative directory's naturalisation row](https://www.interior.gob.cl/transparenciaactiva/sgi/65/otrostramites.html) was directly fetched and decoded as Windows-1252 after the browser could not decode it. It expressly describes acquisition without renouncing origin nationality, but is an older directory with stale procedural details. The candidate does not choose that directory or the archived decree as definitive current inbound-renunciation authority. The current consular loss rule concerns renouncing *Chilean* nationality and is not a substitute for the inbound question.

No standardised current Spanish/civic examination or exemption was established from the current SERMIG service. No proposed longer residence period or proposed civic test is presented as enacted. Current comprehensive disqualifications and exact nationality-retention treatment remain targeted follow-up items.

## Tax source limits

SII's old `chilenos_extranjero.pdf` URL returned 404. The generic `dl824.pdf` opened but its cover identifies only a 2017 update, so it is not registered as current authority. The December 2025 regional ruling and April 2026 FAQ supply the relevant current Article 3/10 statements. Circular 11/2025 was also opened and its introductory scope and affected provisions read; it changes Articles 10, 41 G and 41 H, not Circular 63's residence definition. Neither the outdated law PDF nor that unrelated circular is used to infer additional exemptions.

The Brazilian manual is an exercise-2026/calendar-2025 publication, stating a December 2025 legislation cutoff and identifying some January 2026 changes. The candidate uses its residence/scope explanations and does not treat its historical annual amounts as September 2026 rates. The complete applicable treaty, foreign-tax-credit category and any 2026 income-specific change must be checked for actual advice.

No application data, reviewer approval, deployment, commit or shared plan was modified. Independent review is still required.
