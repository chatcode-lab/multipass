# Panama, Paraguay and Peru — independent evidence review

Reviewer: `/root/top20_korea_finland`. Actual review and source-reading date: 22 September 2026. Researcher: `/root/top20_italy_spain`; identities are distinct. Approval applies only to the exact candidate hash recorded in the matching review JSON.

## Decision and method

The six topics and 34 facts are substantively supported within their stated limits. Every one of the 21 registered authorities was independently opened and its relevant operative text read. Ordinary public HTTPS/HTTP retrieval, unmodified Chromium for HTML rendering, PDFKit text extraction and Spanish Vision OCR for scanned pages were used. Search previews were discovery only. No authentication, challenge manipulation or TLS-verification bypass was used.

The sole requested candidate correction was a source-location improvement for Panama's 2014 law. The author's original Gazette URL returned challenge HTML during independent retrieval. The [Procuraduría's official Law 1/2014 record](https://infojuridica.procuraduria-admon.gob.pa/norma_screen.php?numsec=47685) instead supplied a linked official four-page extract at `http://gacetas.procuraduria-admon.gob.pa/27450-A_47685.pdf`. Ordinary public retrieval returned the actual PDF; all four pages were independently read through Spanish OCR. The candidate now cites that HTTPS official record and locates Article 3's opening on linked-extract page 1. The failed original retrieval is not counted as a successful read. This did not change the substantive tax statement.

## Independent source-reading ledger

Source suffixes below omit `ranks2140-`. PDF pages are one-based.

| Source | Operative material independently inspected |
| --- | --- |
| pa-constitution | Electoral Tribunal's current text, Articles 10, 12 and 13: ordinary route, language/civics, refusal grounds and the birth-versus-naturalised loss distinction. |
| pa-naturalisation | All three pages of the actual requirements PDF: permanent status evidence, notarised declaration, criminal-history and financial records, interview and tax clearance. |
| pa-tax-source | Official Law 1/2014 metadata plus all four pages of its linked extract, including restored Article 694, both sourcing paragraphs and commencement. Alternative official access is documented above. |
| pa-tax-source-amendment | Official Law 27/2015 record and linked extract pages 1–2, especially Article 1's replacement of 694(1)(e), including the additional public-body/non-taxpayer/loss-making-payer clause. The public HTTP attachment worked; its HTTPS endpoint did not. |
| pa-tax-residence | Actual 16-page TAT-RF-013/2024 PDF, relevant pages 6–10 and 15–16: quoted statute, decree and resolution, evidence assessment and the case-specific refusal. |
| pa-tax-return | Actual DGI Version 8 instructions, pages 2–5, particularly the income opening and lines 19–21 separating disclosure from taxable-income calculation. |
| pa-tax-certificate | Actual DGI FAQ questions 3 and 5, including the application purpose, year, movement, identity and housing evidence. |
| py-naturalisation | Actual Supreme Court procedure, all relevant listed requirements, permanent-admission starting point and continued invocation of Acordada 464. |
| py-acordada | Actual scanned PDF, pages 9–12 read with Spanish OCR: Articles 37, 42, 46, 48 and neighbouring provisions. Actual home, annual absence wording, elementary official-language/civic assessment and oath are kept distinct. |
| py-constitution | Actual parliamentary PDF, relevant pages 26–28; Articles 148–152 on acquisition, multiple nationality, loss and later citizenship rights. |
| py-tax-law | Actual DNIT HTML law text, Articles 47–53 and 71–73, including the complete INR source list. Individual IRP/INR rules are not replaced by corporate IRE rules. |
| py-tax-residence | Actual DNIT FAQ answer to “¿A quiénes se considera residentes?”, including its permanent-residence wording and legal references. Read the answer text itself, not merely the collapsed question title. |
| py-tax-certificate | Actual Resolution 65/2020 PDF, pages 2–5, especially Articles 1–3 and 7–9: identity, movements, taxpayer-specific RUC/compliance and foreign treaty certificates. |
| pe-naturalisation | Actual gob.pe procedure, updated 27 January 2026, full operative conditions/requirements/completion text. Ordinary public Node retrieval and Chromium text rendering succeeded. Judicial reinstatement of requirements was read after the earlier removal notices. |
| pe-new-law | All five actual PDF pages of Law 32421: Article 17(b), third final provision, sole transitional provision and conditional repeal were expressly read. |
| pe-regulation-tracker | Actual congressional table, row 31 for Law 32421. A deadline with an empty regulation entry is not proof of non-commencement. |
| pe-constitution | Actual parliamentary printed-page-38 HTML, Article 53. The older edition remains identified rather than called a new consolidation. |
| pe-tax-law | Actual SUNAT Chapter II PDF, operative Articles 6–9 on pages 1–3, distinguishing historical text boxes from current text. |
| pe-tax-regulation | Actual SUNAT Chapter II PDF, Article 4(a), page 2: foreign-residence evidence and presence/absence counting. |
| pe-tax-credit | Actual SUNAT Chapter XI PDF, Article 88(e), page 8; both caps and the unused-credit restriction. |
| pe-tax-treaties | Actual SUNAT international-instruments explanation before its treaty directory: exclusive/shared taxing rights without an unexamined country-specific conclusion. |

## Currentness and scope findings

- Panama's ordinary constitutional residence and required permanent-resident documents do not settle the precise residence-clock start or all absence tolerances. The candidate does not encode an unsupported permanent-residence duration. Its tax baseline is supported by the restored law, actual later amendment and posted DGI return instructions, not presented as a full consolidated 2026 Fiscal Code.
- Paraguay's current court page still invokes the inspected Acordada. Its tax FAQ still refers to old migration legislation; the candidate attributes the published tax criterion and explicitly disclaims a wholesale currentness conclusion about that legislation. It introduces neither an invented residence day count nor universal prior-nationality retention.
- Peru's enacted new law expressly depends on publication of its regulation. The current posted January procedure and parliamentary tracker do not establish whether that trigger occurred by the review date, so the candidate's `not_established` commencement fact and absence of a five-year numeric constraint are appropriate. A further currentness search found the Ministry of Culture's [2026 audiovisual-prize rules](https://transparencia.cultura.gob.pe/sites/default/files/transparencia/2026/06/resoluciones-directorales/2026pdt-f-f.pdf); the actual page 3 footnote expressly describes Law 32421 as not yet in force at that document's date. This corroborates a later-2026 transition concern but does not prove September non-commencement and is not substituted for Migraciones' operative rules.
- Peru's tax source documents support nationality-specific domicile, the foreign individual's rolling presence test, annual timing, evidenced-departure exception and credit limits. Nationality and tax domicile remain separate.
- No unsupported CEFR level, general language exemption, grant guarantee, processing promise, worldwide-tax-free statement or treaty-specific exemption was found.

## Validation and monitoring

Candidate and review schema validation, exact SHA-256 comparison, distinct researcher/reviewer identities, source references, six unique topic pairs and the 34-fact count were checked before handoff. Recheck by 21 December 2026; Peru's naturalisation commencement deserves earlier verification before reliance. This reviewer did not publish, change application code, commit or deploy anything.
