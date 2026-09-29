# Pass 416: Dominican Republic to Moldova recheck

Researcher: `/root/pass416_europe`. Actual source reads: 29 September 2026. Candidate only; no self-approval, canonical modification, commit or publication. Generated the registered `pass416-moldova-recheck` packet; sole raw hypothesis DO→MD is `evisa`.

## Substantive change

The English page's two Dominican Republic entries are not reproduced by the linked Romanian page. The Romanian required row is the Dominican Republic, with footnote 2. The Romanian exempt row is Dominica. Their position between Denmark and Greece matches the English exempt entry. This is affirmative country-name comparison, not a rule inferred from omission or reciprocity. It strongly indicates a translation/naming error, although the authority has not corrected the English page.

The outcome is one medium-confidence `document_dependent` conditional record (`evisa`, `visa_free`) plus the exact unresolved pair, not a passport-wide policy. The third-country-document exemption is explicit. The separate electronic-service FAQ proves type-C tourism/private-visit eligibility and PDF issuance before border presentation. The candidate therefore improves on the old undifferentiated source conflict without misrepresenting all Dominican passport holders as following one route.

## Reproducible official source reads

- [Central MFA Romanian schedule](https://mfa.gov.md/ro/content/regimul-de-vize): actual web and local Playwright reads. Required section: Dominican Republic with footnote 2; exempt section: Dominica. Read the full footnote after the required list. No inference is made from absence in the invitation list.
- [Central MFA English schedule](https://mfa.gov.md/en/content/visa-regime-foreigners): actual web read. The duplicated English country name persists and is preserved as an interpretation limitation.
- [Official eVisa FAQ](https://www.evisa.gov.md/Info/ThingsYouShouldKnow?c=ro-RO): web extraction returned 502, but a clean local Playwright Chromium page directly returned HTTP 200 and the complete substantive text. The FAQ states type C, tourism/private visits, online application without consular attendance, approval as PDF, and printed-visa presentation. The central MFA directly links the government portal. A fresh browser replay is sufficient; no user account, proxy, weakened TLS or access-control bypass was used.
- [Central MFA tourist requirements](https://mfa.gov.md/en/content/types-visas-requirements): actual web read; C/T and C/V sections establish purpose and passport scope separately from official missions and long-stay routes. Document validity and processing time are not allowed-stay durations. No structured stay is added.

Additional corroboration, deliberately not duplicated into the source list: [Moldova Embassy in India general information](https://india.mfa.gov.md/en/content/general-information) returned 403 to web extraction but HTTP 200 and substantive text in local Playwright. It independently describes approval by email, a printed visa and no passport insertion. Its geographically specific consular-submission instructions are not imposed on Dominican applicants.

[The eVisa application page](https://www.evisa.gov.md/VisaFile/Inregistrare/1000?c=en-US) was directly opened with Playwright, HTTP 200. No applicant data was entered and no application submitted. The broad nationality selector includes visa-exempt countries, so selector presence is not used as proof. Application URL and workflow are retained in the conditional conditions and these notes because the conditional schema has no `application` field.

## Legal-currentness limits

[Law 257/2013 record](https://www.legis.md/cautare/getResults?doc_id=112701&lang=ro) did not provide substantive content via web, curl or a clean browser. Direct official PDF routes `/cautare/downloadpdf/21753` and `/cautare/downloadpdf/100137` also failed web extraction. Search text from older law versions was not used as proof. Draft-law attachments found on government consultation pages were not promoted as operative law.

Independent review should focus on whether the live Romanian central-authority schedule and eVisa FAQ suffice for this conditional characterization despite the English naming error. Current consolidated legislation or an authority correction would further strengthen that reconciliation. The candidate does not request a mere expiry-date extension or assert that the English source has been fixed.

## Validation and handoff

Exact validation passed: four sources, zero policies, one conditional record, one conflict and one unresolved cell.

Candidate SHA-256: `a27325b3504a37f851446a08db5019c9c5624c4b78dbf244d26acc4ecbd2fb37`.
