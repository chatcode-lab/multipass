# Search Console review — 28 September 2026

Scope: user-supplied Web-search exports for **30 August–26 September 2026**. Source files: Chart, Countries, Devices, Filters, Pages, Queries and Search appearance CSVs. Raw account exports stay outside the public repository. DataForSEO was not called: first-party demand was sufficient to choose this bounded pass.

## Results and limits

Chart totals reconcile with the complete country and device exports: **2,262 clicks / 274,350 impressions**, CTR **0.82%**. Impression-weighted daily average position is approximately **9.61**; exported daily positions are already rounded.

| Seven-day period | Clicks | Impressions | CTR | Approx. position |
| --- | ---: | ---: | ---: | ---: |
| Aug 30–Sep 5 | 159 | 22,559 | 0.70% | 24.03 |
| Sep 6–12 | 670 | 79,716 | 0.84% | 8.99 |
| Sep 13–19 | 591 | 70,774 | 0.84% | 8.78 |
| Sep 20–26 | 842 | 101,301 | 0.83% | 7.46 |

Latest week versus the preceding week: **clicks +42.5%, impressions +43.1%**. CTR is essentially flat; this is growth in visibility, not evidence that a title experiment improved click-through. Average-position changes can reflect a changing query mix. These reports cannot attribute growth causally to a particular deployment.

Mobile contributes **1,636 clicks (72.3%)** and 155,365 impressions (56.6%), with 1.05% CTR and position 7.54. Desktop contributes 603 clicks, 117,126 impressions, 0.51% CTR and position 12.36. Device differences are not controlled for query mix. Preserve full mobile content and direct access to the useful lists; do not infer a desktop rendering defect from CTR alone.

US traffic has 155 clicks / 46,154 impressions, CTR 0.34%, position 10.27; UK has 155 / 19,008, CTR 0.82%, position 9.95. No country–query–page intersection was supplied, so these are not evidence for country-specific landing-page changes. The translated-results appearance has only 14 impressions and no clicks: insufficient evidence for a translation rollout.

**Do not use the Pages or Queries exports as site-wide totals.** Both are capped at 1,000 rows. Pages sum to 1,825 clicks / 99,820 impressions; visible queries sum to only 193 clicks / 27,596 impressions. Query privacy and export truncation also matter. Separate page and query aggregates cannot be joined into measured page–query pairs.

Within the page sample, 912 relationship pages account for 1,480 clicks / 73,819 impressions. Twenty-five passport pages have 27 clicks / 8,722 impressions. This suggests useful relationship answers are working while broader passport-list intent deserves attention; it does not establish either family's full-site share.

## Demand-led decisions

| Observed page or query | Evidence in supplied export | Action |
| --- | --- | --- |
| Singapore → Vietnam | Page: 1,283 impressions, 2 clicks, position 9.05; eight relevant visible queries: 429 impressions, 0 clicks | Independently review the bilateral cohort; expose the 30-day stay, conditions and official links before the long timeline. Query/page correspondence is thematic, not a joined measurement. |
| Bermuda requirements / new order | Destination page: 725 impressions, 1 click, position 11.81; “bermuda visa requirements new order”: 522 impressions, 1 click, position 11.67 | Read the operative September order; correct seven classifications and their canonical URLs. This is a factual correction, not just a snippet change. |
| Barbados passport ranking | Passport page: 992 impressions, 1 click, position 9.41; mobility-index query: 798 impressions, 0 clicks, position 8.53 | Make shared passport titles explicitly describe ranking and visa-free countries; add a direct list anchor and accurate category counts in descriptions. |
| Sri Lanka / Dominica / Lebanon passports | Pages respectively: 1,090 / 924 / 795 impressions and one click each | Apply the shared landing-page improvements; measure before writing separate overlapping articles. |
| Caribbean passport ranking | Regional page: 830 impressions, 22 clicks, position 6.88; query: 447 impressions, 13 clicks, position 5.60 | Preserve the established route; fix dense ranking so tied scores share a regional position in HTML, Markdown and passport summaries. |
| eVisa vs ETA | Page: 1,044 impressions, 4 clicks, position 7.39 | Description now answers the distinction directly; retain the existing sourced explanatory page and URL. |
| Dual-citizenship enforcement | Query: 807 impressions, 0 clicks, position 11.50 | Explain that documented legal rules are not comparable enforcement statistics. No fabricated detection-rate or “safe to ignore” ranking. Match HTML and Markdown. |
| How many passports? | Page: 909 impressions, 2 clicks, position 8.80 | Keep the evidence/anecdote distinction. Consider a clearer answer-first introduction after a focused source recheck, not an unsupported record claim. |

Preserve performing intent: homepage 175 clicks / 2,198 impressions, CTR 7.96%; Tunisia → Ireland 40 / 1,878, position 5.67. Combination-calculator query variants have small but strong visible results. No mass comparison-page generation, canonical renaming, blanket indexing, new analytics tags or paid keyword expansion was warranted.

## Implemented presentation and agent improvements

- Shared passport titles emphasize “Passport Ranking & Visa-Free Countries”, with the existing catalog-wide length guard. Descriptions keep visa-free, arrival and ETA counts distinct from the score.
- A “View visa-free countries” anchor jumps to the full destination access list on mobile without adding a client framework or another request.
- Regional and language-group ranking ties use the same dense-score semantics as the global ranking. Passport regional summaries and Markdown agree.
- Passport Markdown destination rows now link to the same canonical evidence pages as HTML; citizenship/self destinations link to the passport page.
- Exact reviewed stays precede the relationship timeline in both formats. Rule-specific notes remain immediately alongside each stay, including Bermuda's statutory/operational distinction and Kazakhstan's separate cumulative limit.
- Existing conditional/rejected explanations remain neutral. No uncertain category was made exact merely to improve indexing.

Descriptions and titles are suggestions to search engines, not guaranteed displayed snippets. See [Google's title-link guidance](https://developers.google.com/search/docs/appearance/title-link) and [snippet guidance](https://developers.google.com/search/docs/appearance/snippet). Reprocessing requires recrawling; do not promise an immediate ranking gain or repeatedly change titles before a comparable measurement window exists.

## Dataset results and follow-up queue

[Pass 415 release notes](../research/visa-evidence/pass415-release-notes.md) record official-source and independent-review details. Research covers 199 Bermuda and ten Vietnam relationships, with **seven corrected statuses** and **133 newly structured stay relationships**. Exact evidence remains **40,941 / 44,974 (91.0%)**; stay coverage increases **4,271 → 4,404**. This is refresh, accuracy and depth, not 209 newly verified cells.

Ten reviewed-unknown indexing windows expired on 26 September: **RW→VU, US→BF, DO→MD, LU→UA, MC→VU, AD→GT, BH→VU, NZ→NU, NR→BZ and FJ→XK**. Their negative findings and audit records remain; no deadline or unknown classification was silently changed. The current bundled canonical sitemap inventory is **42,702**, including all 145 approved citizenship/tax topics, with the existing eight-shard structure. A smaller count caused by expiry is not a broken sitemap.

Next priorities:

1. Reopen the ten expired correction-only cases, prioritizing actual page/query demand. Either establish a supported rule or refresh a substantive unresolved explanation through independent review; do not just extend dates.
2. Review Vietnam's separate unilateral-policy re-entry wording against the operative amended law. The bilateral work does **not** approve or correct those unrelated records.
3. Retain the scheduled Bosnia/Montenegro/Cambodia boundary checks from Pass 414; obtain a formally adopted Cambodia successor before the 15 October endpoint if available.
4. Address known citizenship-law gaps on high-demand country pages before broadening a new score family. Current frozen top-40 coverage (72 passports including ties) has all 144 required topics and indicator outcomes, but explicitly unresolved legal facts remain. No new HDI observation year, PISA result, tax rate or quality-of-life score was invented or restamped in this pass.
5. In a subsequent comparable 14–28-day window, obtain page-filtered query exports for the priority pages and device splits where available. Compare clicks, impressions, CTR and position together; annotate this release and intervening data corrections. Use DataForSEO only for a bounded question that these exports cannot answer.

## Reproducibility

Sum integer click/impression columns; compute CTR from aggregate clicks divided by aggregate impressions, never the mean of row CTRs. Weight displayed daily positions by impressions. Weekly windows are contiguous and non-overlapping; last-week growth uses Sep13–19 as denominator. Page-family counts classify supplied URLs only. The user exports are not committed.

SHA-256 identifiers: Chart `1cc3ab4242cc68d5762e22e4a82f8d70dd5dea7e2261c250cf89c91e9cb09e0a`; Countries `1acee6bd44b015701bfdb1885dc52de9628b8348e6244c50ae1c1575449c39c7`; Devices `ee2e54ecc827c7df10614ca2c6e86b7b03d51b8fb8f2d94f32a1d93ffbaae38c`; Filters `72ff01f37ed0327a79ace7619f2d5c8e46552e0f30ebf6adfeba45332d7231e3`; Pages `6a60e69372485e291f894bb8f28c81c38be17ea23c7b46774176d32f15d9beaf`; Queries `117aeec1cffd4bd88bb00e24e321e0aa751ebd0d9b7f3d2ce113753b81351602`; Search appearance `e60415cf9691835536ab715b82a90d8dc57d9114bf94f54fa2384f1bceef0b90`.
