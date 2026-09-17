# Belgium and Luxembourg research notes

Researcher: `/root/top20_korea_finland`. Retrieved 2026-09-17. Candidate only; independent review is required before publication.

## Scope and evidence checks

- Belgium selects the ordinary Article 12bis(1)(2) nationality declaration. The schema has no declaration route type, so `routeType` is deliberately omitted instead of mislabelling it naturalisation. The topic distinguishes exceptional parliamentary naturalisation and flags other declaration categories.
- The actual Belgian Justel consolidated Nationality Code displayed an update date of 10 March 2026. Articles 1(2)(5) and (10), 7bis, and 12bis were read in the official text. This establishes CEFR A2 and the certified statutory-illiteracy oral-only exception introduced in 2024, continuous principal/legal residence, the unlimited-status-at-filing distinction, absence allowances, and education/training credit against economic-participation duration. The official Justice declaration pages were also read to verify the alternative social and economic evidence.
- Belgium's July 2026 City of Brussels FAQ was read as an additional currency check. Its broad wording about taking an A2 test is not substituted for the federal guidance that recognised social-integration evidence also establishes language knowledge. The official 2022 guardianship manual was inspected but is not relied on in the candidate because current consolidated legislation provides stronger evidence.
- Luxembourg's naturalisation and prerequisites pages were opened and their operative sections read. The Ministry of Justice nationality hub, updated 10 September 2026, still directs applicants to those pages. The two CEFR skills are separate facts; the pass-score compensation rule is preserved. A 24-hour language course for the separate long-residence option route is not presented as an ordinary-naturalisation alternative.
- Luxembourg's government publication explicitly states multiple nationality is possible subject to the original country's law; the relevant paragraph is on PDF page 23 (zero-based page 22). The current Municipality of Mamer guidance independently confirms the no-renunciation principle.
- Both tax profiles preserve resident/non-resident/source distinctions and treaty qualifications. Belgium's foreign-income page explicitly requires reporting even where a treaty exempts income, with possible progression and local-tax effects. Luxembourg's ACD guidance explicitly distinguishes permits from tax residence and describes both treaty and non-treaty foreign-income relief.

## Retrieval details

All 15 candidate sources were actually opened/read, not used from search snippets. Several Belgian official URLs returned browser errors or challenge pages. Direct unauthenticated HTTP reads through Node `fetch` returned the official page body for the Justel code, Belgium's foreign-income guidance, and the Canadian Belgian consular multiple-nationality guidance. The Justel response was decoded as Windows-1252 to read accents correctly. No fetched source bodies or credentials were persisted.

Additional read-only currency checks included:

- https://www.brussels.be/acquisition-belgian-nationality-over-18-years-old
- https://www.mybxl.be/en-US/article/?articlepublicnumber=KA-01593 (displayed last modification 22 July 2026)
- https://mj.gouvernement.lu/en/dossiers/2020/nationalite-luxembourgeoise.html
- https://mamer.lu/en/procedures-2/procedures/ (Luxembourg nationality section)

## Review focus and limitations

Check ordinary versus special citizenship categories, Belgian qualifying residence and allowed absences, social/economic evidence alternatives and training credit, the A2 illiteracy exception, Luxembourg language scoring and medical exemptions, and both countries' treaty qualifications. Tax day-count shortcuts, rates, fees, special inbound regimes, processing promises and personalised legal/tax conclusions are intentionally omitted. Luxembourg criminal-conviction restrictions are flagged rather than reduced to an incomplete numerical threshold.

No published artifacts, visa data, application code, approvals or commits are included in this batch.
