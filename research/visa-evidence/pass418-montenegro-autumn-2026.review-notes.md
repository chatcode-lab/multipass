# Pass 418 Montenegro independent source review

Reviewer: `/root/pass418_review`. Actual review date: 20 October 2026.

Decision: **approved for the four bounded same-scope refresh policies**, subject to integration and consumer regression checks. No new nationality category, score change or legal transition date is approved.

Approved candidate: `pass418-montenegro-autumn-2026.candidate.json`.

SHA-256: `0615a6bd7879ff9c79c30ed9bb1d452a075ffce8169215a57da37b392820289c`.

I read CONTRIBUTING, the full model handoff and candidate schema, the research playbook's source hierarchy and algorithm and relevant expiry notes, the canonical Montenegro policies and sources, and this candidate and researcher notes. I did not research/write the candidate or edit canonical evidence.

## Independent source reads

All nine retained URLs were independently opened and actual operative content read. Some web-reader opens timed out; ordinary Node HTTPS fetch then returned 200 without disabling certificate checks. Search previews were not used as source reads.

1. [Consolidated regulation landing](https://www.gov.me/en/documents/7a121553-7780-477b-9117-d57985bfe57b): independently downloaded its linked [DOCX](https://wapi.gov.me/download/7a121553-7780-477b-9117-d57985bfe57b?version=1.0) through trusted HTTPS and read all fourteen Articles with `textutil`. The header lists amendments through 108/26. Articles 1a and 3a expressly preserve SA/TR and BY/RU, respectively, for thirty days through 31 October. Article 4 supplies an express visa baseline, Article 7 supplies supporting-document exceptions, and Article 12c does not establish a successor seasonal exemption. The landing publication date is distinct from adoption and legal effect.
2. [Kazakhstan](https://www.gov.me/diplomatske-misije/ambasade-i-konzulati-crne-gore-u-svijetu/kazahstan): its actual visa-regime paragraphs expressly require a visa, identify consular issuance and the Bulgarian-embassy alternative, and state the historical 1 May–1 October seasonal waiver. The existing 2 October successor is preserved; no extension is inferred.
3. [Belarus](https://www.gov.me/diplomatske-misije/ambasade-i-konzulati-crne-gore-u-svijetu/bjelorusija): actual operative paragraph confirms thirty days, competent Belarusian travel documents and the 31 October endpoint under the reciprocal agreements. Its November successor is supported by the separate express notice.
4. [Russia](https://www.gov.me/diplomatske-misije/ambasade-i-konzulati-crne-gore-u-svijetu/ruska-federacija): actual visa-regime section expressly gives the thirty-day waiver through 31 October, a visa requirement from 1 November, and VFS filing locations. Filing support does not establish electronic issuance.
5. [Saudi Arabia](https://www.gov.me/diplomatske-misije/ambasade-i-konzulati-crne-gore-u-svijetu/saudijska-arabija): actual paragraph confirms the Saudi nationality, thirty days, entry/transit/stay and 31 October endpoint. The general travel-document scope in Article 1a supports ordinary documents without generalizing a diplomatic-only rule.
6. [Türkiye](https://www.gov.me/diplomatske-misije/ambasade-i-konzulati-crne-gore-u-svijetu/turska): actual visa-regime section confirms thirty days through 31 October, the explicit 1 November visa requirement and Ankara/Istanbul filing offices. Reverse-direction guidance was not transferred.
7. [27 July MFA notice](https://www.gov.me/amp/clanak/crna-gora-u-potpunosti-uskladila-viznu-politiku-sa-evropskom-unijom-gradanima-brojnih-zemalja-dostupnije-podnosenje-zahtjeva-za-crnogorsku-vizu): actual complete AMP article independently fetched. It explicitly names BY/CN/RU/SA/TR and 1 November. The electronic-visa system is described as a future objective. CN remains outside this bounded packet.
8. [24 September Government session release](https://www.gov.me/clanak/saopstenje-sa-139-sjednice-vlade-crne-gore): independently opened the complete release, particularly the paragraphs immediately preceding strategic projects. Adoption of the treaty-termination information reiterates the November rule for RU/BY/TR. Initiating a Turkish diplomatic/service/special-passport agreement is not an adopted ordinary-passport replacement or proof that treaty termination itself has completed.
9. [MFA visa procedure](https://www.gov.me/en/article/visas): independently read actual HTML. The visa-C section explicitly states a ninety-day maximum in one hundred eighty days counted from first entry. This differs from multiple-entry visa validity and the processing deadline. The source's stale nationality table still lists old ninety-day SA/TR and AZ/KW waivers; that section is rejected. Only issuance, document validity, short-stay ceiling and their conditions are retained.

All nine literal excerpts exist in the opened sources and are at most twenty-five words. Supplementary researcher-only PDF reads are not required for approval because the retained adopted-session release supplies the stated follow-up; I do not claim an independent visual reading of that scanned information PDF.

## Correction during review

The initial candidate used `rolling_period` for a source expressly anchored to first entry. I requested a narrower representation. The approved candidate uses `calendar_period` for that fixed anchored period and expressly includes “from first entry” in both visa-C labels and notes. `maxDays: 90` and `withinDays: 180` represent the published ceiling, qualified by the visa actually issued. They do not promise an automatic ninety-day admission, imply a sliding-window rule, convert months to days, or confuse visa validity with stay.

The current waiver allowances use thirty days per visit with explicit endpoint cautions. The sources do not establish permission to continue visa-free beyond that endpoint. No automatic extension, residence or employment right is inferred.

## Exact scope and integration gate

The packet passes exact validation: nine sources, four policies, no conditional records, five explained snapshot/prospective conflicts and no unresolved assigned pair. KZ's historical upstream value differs from its already-corrected current category. BY/RU/SA/TR remain visa-free at the research date; their conflicts are explicitly prospective and must not be applied before 1 November.

Approved guarded mappings preserve statuses, passport/destination sets and all existing effective endpoints:

- Pass 414 KZ prior visa from 2 October → Pass 418 KZ prior visa from 2 October.
- Existing BY/RU waiver through 31 October → refreshed BY/RU waiver.
- Existing SA/TR waiver through 31 October → refreshed SA/TR waiver.
- Existing four-passport visa successor from 1 November → refreshed successor.

Archive earlier evidence and sources unchanged. Confirm refresh chaining suppresses the older original KZ successor as well as the Pass 414 version. At the research date, five current relationships should gain structured stay details while current categories remain unchanged. Future successors must retain four structured stays after the November transition. Article 7 supporting documents and prospective special-document agreements must not leak into nationality-only ranking.

Final canonical diff, date boundaries, HTML/Markdown/API parity and mobile rendering remain a separate integration review before release.
