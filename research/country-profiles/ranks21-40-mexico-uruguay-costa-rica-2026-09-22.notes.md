# Mexico, Uruguay and Costa Rica — author research notes

Researcher: `/root/top20_italy_spain`

Research date and candidate retrieval date: 2026-09-22

Candidate: `ranks21-40-mexico-uruguay-costa-rica-2026-09-22.candidate.json`

Candidate SHA-256: `81393c104eaafb634456e980cd650ba4790271543a0b2e03a3f4a3cd8385f2dc`

Independent-review correction: SRE exam locator is requirement 9 plus the following exception paragraph; federal and local criminal certificates are requirements 7–8. Only locators changed; schema revalidated.

Further independent-review clarifications: Uruguay's family presumption is rebuttable and excludes a legally separated spouse; the general IRNR statement now expressly excludes permanent-establishment cases, which require IRAE analysis (Title 8 Article 9). Schema revalidated after these scope corrections.

## Scope and validation

Six topics, 35 facts, 21 registered official sources. This is an author candidate, not an independent approval or a publication. All registered sources' relevant operative material was actually opened and read on 22 September 2026; the statement does not mean every unrelated page of the long legal consolidations was read.

Read the enrichment documentation, research README and actual TypeScript schema before research. Validated the completed JSON with `countryProfileCandidateSchema` through the repository's existing `tsx` loader; all six titles are below 52 characters. Changes are confined to this candidate and these notes. No application data, own-review approval, commit or deployment.

## Actual source-reading record

### Mexico

- `ranks2140-mx-residence`: SRE ordinary-residence page, displayed update 6 August 2026; read its description and requirements, particularly resident-card status, exclusion of temporary student residence, six-month card validity, criminal certificates, exams and adult exceptions.
- `ranks2140-mx-nationality-law`: read the actual 11-page SRE-hosted Chamber consolidation, dated last amendment 23 April 2012. Relevant text is Articles 17, 19–21 and 24–27, printed pages 3–6. The similarly formatted Chamber PDF at `https://www.diputados.gob.mx/LeyesBiblio/pdf/53.pdf` was also opened; the guessed `LNac.pdf` path did not work and is not cited.
- `ranks2140-mx-constitution`: read Article 37(A)–(B), printed page 50, in the current Chamber PDF whose header says 2 June 2026. Do not import the non-deprivation rule for citizens by birth into ordinary naturalisation.
- `ranks2140-mx-fiscal-code`: read Article 9 in full, printed pages 5–6, in the consolidation dated 9 April 2026. This establishes the current notice-year-plus-five-year retention rule and its information-exchange AND mutual-assistance exception. Older indexed SAT text referring to a three-year period was not used.
- `ranks2140-mx-income-tax`: read Article 1, Article 4, and Article 5's opening credit rule, individual limits, nationality-based foreign-tax limitation and payment-evidence conditions. Relevant printed pages are 1, 4, 6 and 9–10. The PDF's last-amendment date is 1 April 2024, not a fabricated 2026 edition.

Renunciation under Article 19(II) incorporates Article 17; Article 17's placement under nationality by birth does not remove that explicit cross-reference. The draft preserves the timing after a grant decision. It does not claim the declaration alone extinguishes another country's nationality.

The SRE ordinary-residence page expressly mentions over-60 applicants and recognised refugees for the adult history/culture exception, with Spanish still required. No CEFR conversion is asserted. Other special-route or protection-cohort rules are not exhaustively modelled.

### Uruguay

- `ranks2140-uy-citizenship`: read the actual Electoral Court procedure, displayed update 27 May 2026, including residence/absence evidence, means over the applicable period, witnesses, functional Spanish and the introduction about civic credentials.
- `ranks2140-uy-constitution-75`: read the complete updated Article 75 at IMPO, including the ordinary three/five-year cohorts, economic connection, documentary residence evidence, three-year civic-rights delay and Article 80 suspension cross-reference.
- `ranks2140-uy-constitution-81`: read the complete updated Article 81. Its nationality non-loss rule and subsequent-naturalisation loss rule for legal citizenship are different clauses and must remain distinct.
- `ranks2140-uy-passport`: read the actual DNIC procedure, displayed update 1 July 2026, particularly adult legal-citizen identity regularisation, charter, automatic criminal check, civic credential when the charter is over three years old, and the corresponding mandatory-document note.
- `ranks2140-uy-passport-reversal`: read the Presidency's 29 July 2025 account of the joint Interior/Foreign Affairs announcement: return to the pre-April format from 1 August 2025, continuing consultations and replacement arrangements.
- `ranks2140-uy-tax-residence`: read DGI's complete substantive guide dated 20 October 2025, sections 1–4. The actual guide distinguishes counted sporadic absences from actual presence and states that independent grounds suffice. Its investment-presumption section is acknowledged but thresholds are not turned into investment advice.
- `ranks2140-uy-irpf`: read IMPO's actual current Title 7 operative sections, especially Articles 2, 5–6, 18, 21, 24, 24-bis and 25. The text incorporates Law 20.446 of 16 December 2025, published 8 January 2026. Note the site's redundant wording/numbering typo in the Article 25 amendment annotation; the operative credit text is clear and the candidate cites Article 25 itself.
- `ranks2140-uy-irnr`: read the actual Title 8 text, Articles 1–3 and 6–7. The scope is not simplified to income physically received inside Uruguay.
- `ranks2140-uy-foreign-income-2026`: read DGI's actual 24 July 2026 notice listing four foreign capital-income/gain categories from 1 January 2026. This confirms that the expansion is operative, not merely proposed.
- `ranks2140-uy-tax-treaties`: read the actual DGI table, its tax-effective dates and separate MLI-effect columns. No count of treaties or specific universal relief rule is inferred.

Habitual residence for legal citizenship was deliberately not squeezed into the schema's permanent-permit, legal-residence-status or exact physical-day constraint. The three/five years remain in sourced prose. The discovery route type `naturalisation` must not be rendered as a legal claim that the charter automatically grants an identical nationality status to citizens by birth.

Passport-format developments are especially sensitive. The draft states the official 2025 reversal and the current 2026 passport procedure, not a new enacted nationality law, the precise nationality code printed on every present passport, or destination-by-destination acceptance. No travel-access data should be derived from this topic.

For Article 24, 31 December 2025 is the election cutoff, not an assertion that all existing elected benefits ended that day. Article 24-bis is separate for qualifying 2026-onward arrivals. The actual text provides investment alternatives, or the Article 2(A) presence ground in each fiscal year, plus preceding two-year nonresidence and the restriction on prior Article 24 use; it also provides later-period/legacy transition options. The draft does not calculate the investment amounts, later-period rates or availability for a particular person.

Decree 95/026's IMPO page initially opened but subsequent attempts timed out before a reliable operative extraction; it is NOT registered or treated as a completed read. The candidate's bounded 2026 statements rest on current Title 7 plus DGI's 2026 operative notice, and expressly leave regulatory investment mechanics/attribution calculations to further verification. The July DGI notice's direct long-law link also produced an error; the consolidated Title 7 itself was successfully read.

### Costa Rica

- `ranks2140-cr-constitution`: read TSE's actual constitutional PDF, Articles 13–17, printed pages 5–6.
- `ranks2140-cr-naturalisation-regulation`: read the actual TSE 69-page consolidation, relevant Articles 7–15, 115–116 and 123–124. Some PDF browser extracts were short, so public PDF bytes were independently read with macOS PDFKit. Actual operative pages include 7–12, 54–56 and 59–60.
- `ranks2140-cr-residence-requirements`: read all five actual pages of TSE's current posted Law 1155 requirements PDF with PDFKit, including the current language/exam/equivalent-study and medical/older-adult exemptions on page 3.
- `ranks2140-cr-income-tax`: read actual SINALEVI Law 7092 text, explicitly selected version 83 of 83 dated 13 November 2025, version identifier `148972`. Read Articles 1, 27, 27-bis, 32 and 52–57; no rate calculations are reproduced.
- `ranks2140-cr-tax-regulation`: read actual SINALEVI Decree 43198-H, version 5 of 5 dated 15 November 2023, version identifier `139872`, especially Articles 10 and 52.
- `ranks2140-cr-tax-treaties`: read the actual Hacienda April 2022 version-01 guide, especially sections 5.2.2–5.2.6, printed pages 5–7. Its old glossary reference to former regulation Article 5 was NOT used for the residence rule; the actual current regulation Article 10 is cited instead. This guide supplies general treaty-application principles, not a purported complete 2026 treaty list.

TSE regulation Article 8(j) expressly requires a former-nationality renunciation declaration unless a dual-nationality treaty applies, while Constitution Article 16 makes Costa Rican nationality non-losable/non-renounceable. Those are not interchangeable rules. Foreign-law effect and treaty-specific exceptions remain unresolved rather than being flattened to a universal dual-nationality answer.

Article 124 uses `mayor de 65 años`; the current procedure says older adults. The draft preserves the category without inventing an exact 65th-birthday boundary. Medical exemption requires a permanent impediment preventing the examinations, not simply any diagnosis.

#### Reproducible SINALEVI access and version warning

Old PGR `nrm_texto_completo.aspx` pages redirected to a JavaScript-loaded `sinalevi.go.cr/ResultadosNormativa/Informacion` shell. The shell alone does not establish the law's contents. I inspected its public `/js/views/MenuLateral/MenuNormativa.js` and used the exact unauthenticated read-only form requests that render public legal text:

- POST `https://sinalevi.go.cr/ResultadosNormativa/_CargarTextoCompleto`, form fields `idFichaNorma`, `version`, `busqueda=`. Actual HTML is in the response's `html` property.
- POST `https://sinalevi.go.cr/ResultadosNormativa/_CargarFicha`, form fields `idFichaNorma` and `version`, to read the law/version/date metadata.
- Law: `idFichaNorma=10969&version=148972`. Regulation: `idFichaNorma=95992&version=139872`.
- Caution: requesting law version `-1` unexpectedly redirected to `148984`, whose metadata was version 81 of 83 dated 17 March 2025. It was not accepted as current. The site's public `_BuscarVersionNorma` endpoint with `idFichaNorma=10969&numeroVersion=83` returned version identifier `148972` and the explicit 83-of-83 metadata. I then read the final cited text at that version.
- No authentication, secret, access-control bypass or unpublished endpoint was used; these are the public page's own rendering requests.

## Review handoff

Please independently read the operative authorities, paying particular attention to Uruguay's legal-citizenship/passport distinction, 2026 income/election transition, Costa Rica's explicit renunciation wording and the SINALEVI version issue. This note is not an approval. Keep any independent review tied to the exact candidate bytes and hash above.
