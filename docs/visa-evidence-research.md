# Official visa evidence research

This playbook expands MultiPass Rank’s passport–destination evidence without turning secondary rankings into citations. The current access snapshot is a discovery and consistency-check input; an evidence record is publishable only when an official source supports it.

## Source hierarchy

Prefer sources in this order:

1. Laws, official gazettes, treaties, parliamentary records, and court decisions.
2. The destination’s immigration, border, interior, or foreign ministry and its official application portal.
3. Official embassy or consulate guidance when the central authority does not publish the rule clearly.
4. Intergovernmental treaty repositories, such as EUR-Lex or an official regional-bloc secretariat.
5. Government open-data catalogs and their versioned downloads.

Commercial passport indexes, Timatic summaries, Wikipedia, travel agents, airlines, blogs, and search snippets may help discover a source. They are never evidence citations.

## Evidence record requirements

Every record must identify:

- the destination and affected passport codes;
- the normalized access status;
- an effective date when the source states one, otherwise no invented date;
- expiry or supersession when known;
- material conditions and exceptions;
- at least one direct official URL, its publisher, jurisdiction, language, source type, and review date;
- the official application URL and steps when an ETA or eVisa route exists;
- any conflict with the current MultiPass Rank snapshot.

Store rules at policy level. A regional agreement or nationality list should be one policy with multiple passport codes, not hundreds of duplicated pair records.

## Research pass algorithm

1. Choose one destination, regional agreement, or government dataset. Work in bounded batches.
2. Export the current statuses for affected pairs and use them only as hypotheses.
3. Search the destination’s official domains for visa, exemption, arrival, electronic visa, and travel-authorisation rules in the local language and English.
4. Open the primary document. Confirm scope, status, dates, duration, passport type, and exceptions from the source itself.
5. Follow official links to the current application portal. Do not infer a government relationship from branding alone; verify the domain from an authority page.
6. Add a source record and a policy record. Leave `effectiveFrom` absent if the official source does not state it.
7. Compare the supported status with the current snapshot. Record conflicts for review rather than silently changing either dataset.
8. Run unit, route, sitemap, and structured-data tests. Manually open at least one generated pair per policy.
9. Record the review date. Recheck mutable guidance on a schedule and laws after a reported policy change.
10. Promote only reviewed candidates with `npm run evidence:promote -- <all-approved-candidate-paths>`. This command regenerates the complete reviewed artifact, so always pass every candidate that should remain canonical.

Good first bulk sources include government nationality lists, official open-data CSV files, and multilateral agreements. Reviewed examples in this repository cover Angola’s 98-nationality tourist exemption, Hong Kong's ordinary-passport visitor schedule and Indian pre-arrival registration, Kenya’s ETA, DR Congo’s official eVisa route, and the EU–Brazil short-stay agreement.

## Pass 2 result: Hong Kong inbound access

The second pass reviewed the Hong Kong Immigration Department's August 2026 visitor schedule at policy level. It added evidence for 144 visa-free ordinary-passport relationships, 48 prior-visa relationships, and India's pre-arrival registration route. The official language describes Indian visitors as remaining visa-free after advance registration, so the upstream `evisa` category is corrected to `eta`/PAR before scoring.

Macao, Mainland China, Taiwan, Timor-Leste, and Kosovo were deliberately not inferred from the ordinary foreign-nationality table. Their special or catch-all treatment is the first queued follow-up batch.

## Pass 3 result: reviewed expansion and developed-destination program

The strong-review pass accepted Kenya's May 2025 legal and operational ETA schedules, the PRC-passport visitor rule for Hong Kong, the HKSAR-passport EU/Schengen exemption, and the reciprocal EU agreements with Colombia and Peru. Kenya's source conflict for Guyana and Indonesia produced two narrow access overrides. Saint Kitts and Nevis remains unsupported until Kenya corrects or clarifies the repeated official spelling `St. Kitts and Navis`.

The HKSAR outbound dataset was useful discovery evidence but was not published for its 29 non-European visa-free or visa-on-arrival claims. Its own caveat directs travellers to destination authorities, so those records remain candidate-only until destination-side confirmation is reviewed. Seven proposed access corrections from that dataset were rejected for the same reason.

The first program targets 42 priority destinations: the EU and Schengen cohort, Ireland, the United Kingdom, the United States, Canada, Australia, New Zealand, Japan, South Korea, Singapore, Hong Kong, Israel, and Taiwan. Run `npm run evidence:coverage` to measure that cohort, or `npm run evidence:coverage -- --all --summary` for the complete matrix and regional totals. The 50% and 80% thresholds are progress indicators, not claims that unsupported relationships are false or that travel advice is complete.

## Pass 4 result: priority-destination baseline

The parallel research and strong-review pass reached 8,139 of 8,316 active current-status relationships (97.9%) across all 42 priority destinations. All 42 have at least 50% coverage and 41 have at least 80%. South Korea remains at 55.6% because the reviewed official sources directly establish its visa-free and K-ETA cohorts but do not safely establish a nationality-wide visa-required complement.

Australia, Canada, Ireland, Japan, New Zealand, Singapore, the United Kingdom, and the United States now have complete catalog baselines. Taiwan has 196 of 198 non-citizenship relationships supported; Mainland China and Palestinian-territory passport treatment remain unresolved. Israel retains one unresolved Palestinian-document relationship. EU and Schengen destinations retain narrow agreement or associated-state gaps rather than borrowing unsupported scope from a neighboring regime.

Temporary programmes are represented with inclusive end dates. Current access overrides for South Korea's temporary K-ETA exemption and Taiwan's trial exemption and eVisa routes stop applying after their official expiry. Emergency or temporary-passport landing-visa routes are documented in research candidates but are not promoted into ordinary-passport canonical rankings or sitemap URLs.

## Pass 5 result: destination-authority regional expansion

The next strong-review tranche promoted destination-side ordinary-passport policies for Brazil, Mexico, Fiji, South Africa, The Bahamas, Mauritius, Malaysia, Barbados, Indonesia, Rwanda, Oman, Jamaica, Zambia, Ecuador, Argentina, and Nepal, plus the reviewed Schengen-associated-state completion. Complete-matrix current-status evidence increased from 9,013 of 44,974 relationships (20.0%) to 11,987 (26.7%). Fifty-eight of 227 destination columns now have at least 50% coverage and 57 have at least 80%. The original 42-destination priority program remains 8,207 of 8,316 (98.7%).

The review changed 195 current pair classifications where destination authorities contradicted or refined the upstream snapshot. Material corrections include Mexico's paid electronic visa for Brazilian passports, Rwanda's universal visa-on-arrival rule, Ecuador's emailed electronic visas, Jamaica's current prior-visa and port-of-entry rows, Indonesia's BVK/VOA split, and narrower corrections for The Bahamas, Mauritius, Malaysia, Barbados, Zambia, and Nepal. Rwanda's fee-waived arrival visas remain `visa_on_arrival`; Indonesia and Nepal online pre-arrival forms remain part of their arrival-visa process; Barbados' online application produces an entry-visa letter rather than an eVisa. Conditional Argentina AVE and Oman exemption routes are documented without replacing the nationality-only default when their third-country-document conditions are absent.

The tranche deliberately retained unresolved cells. Indonesia has 100 passports for which its reviewed official lists do not prove the advance route. Oman has 91 unresolved current-status cells, including a Taiwan divergence between Royal Oman Police and the Foreign Ministry. Mexico retains an unrepresentable Kosovo travel-document restriction; Mauritius retains Montenegro and Kosovo ambiguity; The Bahamas, Barbados, Jamaica, Zambia, and Ecuador retain small omitted or legacy-name groups. The South Korea complement candidate remains unpromoted because absence from the live K-ETA list does not prove a prior-visa rule.

## Pass 6 result: island and Caribbean destination expansion

The next strong-review tranche promoted destination-side ordinary-passport policies for Maldives, Seychelles, Samoa, and a conservative documented subset for Trinidad and Tobago. Complete-matrix current-status evidence increased from 11,987 of 44,974 relationships (26.7%) to 12,651 (28.1%). Sixty-one of 227 destination columns now have at least 50% coverage and 60 have at least 80%. The original 42-destination priority program remains 8,207 of 8,316 (98.7%).

The review changed 51 current pair classifications. Maldives' destination-wide tourist visa is issued on arrival, correcting 11 upstream `visa_free` rows to `visa_on_arrival`. Seychelles requires every foreign visitor to obtain pre-departure electronic travel authorisation, correcting five `visa_free` rows and Kosovo's `visa_required` row to `eta`. Samoa's free Visitor's Permit is issued upon arrival, correcting 28 upstream `visa_free` rows to `visa_on_arrival`. Trinidad and Tobago's current Foreign Ministry instructions and Immigration eVisa service correct China, Taiwan, Cuba, North Korea, Vietnam, and Venezuela to `evisa`.

The tranche deliberately preserves material limitations and official-source disagreements. Maldives prohibits entry on Israeli passports from 15 April 2025, but the current access taxonomy has no `entry_prohibited` status; the cell remains conservatively unverified rather than being misrepresented as an ordinary prior-visa route. Maldives Immigration's current tourist page does not state the initial arrival-visa duration. Seychelles' official sources disagree on the standard authorisation fee (€10 versus €10.90) and application window (30 days versus up to 10 days). Samoa Immigration states a 90-day arrival permit while the Tourism Authority still states less than 60 days. Trinidad and Tobago's official services disagree on the eVisa fee (TTD 800 versus TTD 400), and 127 passport relationships remain unresolved because the reviewed sources do not establish an exhaustive current visa-required complement.

## Pass 7 result: African and Pacific destination expansion

The next strong-review tranche promoted destination-side ordinary-passport policies for Madagascar, Palau, Vanuatu, Cabo Verde, and Mozambique. Complete-matrix current-status evidence increased from 12,651 of 44,974 relationships (28.1%) to 13,562 (30.2%). Sixty-six of 227 destination columns now have at least 50% coverage and 64 have at least 80%. The original 42-destination priority program remains 8,207 of 8,316 (98.7%).

The review changed exactly 300 current pair classifications, with no undeclared snapshot changes. Madagascar's nationality-wide short-stay visa can be issued at an international airport or port, correcting the Palestinian-passport row to `visa_on_arrival`. Palau corrects four Schengen-associated passports to `visa_free`, ten flagged nationalities to mandatory pre-clearance (`eta` in the normalized taxonomy), and Israel to the general `visa_on_arrival` route. Cyprus remains correctly `visa_free` under the reciprocal EU–Palau treaty despite its omission from Palau Immigration's separately worded Schengen list. Vanuatu's official wording calls 113 nationalities “exempt” but expressly says the tourist visa is obtained upon arrival, so those rows are corrected from `visa_free` to `visa_on_arrival`; Cameroon and Mozambique are corrected to `visa_required`. Cabo Verde's current government schedule corrects 19 arrival-visa rows to `visa_free`; EASE pre-registration and the Airport Security Tax remain travel/security formalities rather than an ETA. Mozambique's live National Immigration Service portal corrects 146 arrival-visa rows to `evisa`, São Tomé and Príncipe to `visa_free`, and Ethiopia, Nigeria, and Nepal to `visa_required`.

The tranche deliberately leaves 53 relationships unresolved. Vanuatu's live official nationality page places Bahrain, Monaco, Rwanda, and Türkiye in both its exempt and non-exempt lists, while Kyrgyzstan, Macao, North Macedonia, Moldova, Mongolia, and Palestine appear in neither list. Cabo Verde's two current government schedules omit 42 catalog nationalities; Cuba's only exemption wording is mission-limited and does not prove ordinary visitor treatment. Mozambique's live operational portal expands the Foreign Ministry's separately published eight-country all-passport waiver list; the nine additional portal exemptions are retained with medium confidence and should be rechecked if either authority updates its guidance.

## Official bulk sources identified for later passes

- [Hong Kong Immigration Department inbound visa-requirement CSV](https://www.immd.gov.hk/opendata/eng/law-and-security/visas/visit_visa_entry_permit_requirements_HKSAR.csv), published through the [Hong Kong government data catalog](https://data.gov.hk/en-data/dataset/hk-immd-set4-visit-visa-entry-permit-requirements-hksar/resource/7721f67e-80e9-4306-b379-66a47c6a617a). It distinguishes ordinary, biometric, diplomatic, official, and special British documents, so normalization must preserve those exceptions rather than reducing every row mechanically.
- [Hong Kong Immigration Department outbound visa-free dataset specification](https://www.immd.gov.hk/opendata/eng/law-and-security/personal_documentation/data_specification_for_VFA_list.pdf). This can validate access reported for HKSAR passports, subject to the published document-type fields.
- [Council of the European Union visa-agreement overview](https://www.consilium.europa.eu/en/infographics/eu-visa-agreements-with-non-eu-countries/) and individual EUR-Lex agreements. Treat the overview as discovery and cite the underlying agreement for scope and effective dates.

These are candidates, not silently imported truth. Their country naming, passport types, exceptions, and update semantics need a reviewed mapping before they can change the access snapshot.

## Prompt for later research passes

Use this prompt with a research-capable model. A human or stronger review model must still open every cited URL before merge.

> Research official visa-access evidence for the assigned destination or agreement. Treat the supplied MultiPass Rank statuses as unverified hypotheses. Cite only primary government, official gazette, treaty repository, government open-data, immigration, border, foreign-ministry, embassy, or consulate sources. Do not cite commercial indexes, Timatic summaries, Wikipedia, airlines, agents, blogs, or search snippets. For every supported rule return: destination ISO code; affected passport ISO codes or explicit exclusions; normalized status (`visa_free`, `eta`, `visa_on_arrival`, `evisa`, `visa_required`, or `citizenship`); effective and end dates only when stated; summary; material conditions; source title, direct URL, publisher, jurisdiction, language, type, and review date; official application URL and steps if relevant; confidence; and conflicts with the supplied status. Quote no more than 25 words from a source for internal review and do not publish the quotation. Say `not established` instead of guessing.

For a lower-capability model, use the stricter packet, schema, validation, and review workflow in [visa-evidence-model-handoff.md](visa-evidence-model-handoff.md). Candidate output must never be merged into canonical evidence without a stronger reviewer opening every cited source.

## Review checklist

- Every citation opens on an official domain and directly supports the claim.
- Dates distinguish announcement, publication, and legal effect.
- Tourist access is not confused with work, residence, transit, diplomatic-passport, or airport-visa rules.
- The policy’s passport list matches the official document exactly.
- Application instructions do not promise admission or processing outcomes.
- Unsupported pairs remain honest placeholders and are not added to the sitemap.
- The source’s terms are respected; store factual metadata and links rather than republishing documents.
