# Country indicators alongside passport access

Research date: 15 September 2026. Updated 17 September: the first reviewed pilot implements HDI and life expectancy on eleven passport profiles, with HTML/Markdown/JSON parity and bundled data. PISA and other proposed metrics remain uncollected; this is not catalog-wide coverage.

Follow-up: [Country-profile enrichment and next-goal handoff](country-profile-enrichment.md), researched 16 September, extends this proposal with citizenship requirements, tax context, regional rights, everyday price data, a shared schema and a catalog-wide collection plan. Its later API checks also demonstrate why the observation years below must be rechecked at import time rather than treated as fixed latest editions.

## Recommendation

Add a compact **Living in this country** section to passport profiles. Show a small list of independent measurements, not a new proprietary quality-of-life score. Keep country conditions, visitor access, citizenship acquisition and rights to live/work/study distinct. An excellent country score does not make its citizenship obtainable or a passport combination legally compatible.

Start with UNDP HDI and OECD PISA, then add health and safety indicators. Air quality and internet use are useful second-stage additions. Preserve each publisher's scale and observation year. Missing data must stay missing.

## Source shortlist

| Indicator | Source and data found | Display and limitations | Initial decision |
| --- | --- | --- | --- |
| Human Development Index | [UNDP downloads](https://hdr.undp.org/data-center/documentation-and-downloads): HDR 2025, observations through 2023, versioned tables and CSV | Native 0–1 value and publisher rank when available. Broad development context, not a personalised relocation recommendation. | First release |
| PISA science, mathematics and reading | [OECD PISA 2025, Volume I](https://www.oecd.org/en/publications/pisa-2025-results-volume-i_73451bc5-en.html), published 8 September 2026 | Three separate mean scores; test year 2025, publication year 2026. Participating education systems, not every passport issuer. Do not invent a combined PISA score or label points as percentages. | First release after aggregate-table import and quality-flag review |
| Life expectancy at birth | [World Bank SP.DYN.LE00.IN](https://data.worldbank.org/indicator/SP.DYN.LE00.IN), with UN/national/Eurostat provenance; series currently extends to 2024 | Years, with the actual country observation year. Not an individual prediction or a direct measure of healthcare access. | First expansion |
| Intentional homicide rate | [UNODC via World Bank VC.IHR.PSRC.P5](https://data.worldbank.org/indicator/VC.IHR.PSRC.P5); displayed series through 2023 | Per 100,000 people; lower is better. Not an overall safety score: reporting quality, regional variation and other harms remain separate. | First expansion |
| PM2.5 exposure | [World Bank EN.ATM.PM25.MC.M3](https://data.worldbank.org/indicator/EN.ATM.PM25.MC.M3), attributed to IHME/GBD 2023 | Annual exposure in µg/m³; lower is better. Modelled country-level exposure, not live local air quality. | Second expansion |
| Internet use | [ITU via World Bank IT.NET.USER.ZS](https://data.worldbank.org/indicator/IT.NET.USER.ZS); displayed series through 2025 | Percentage of population using the internet. Not speed, reliability, censorship or remote-work suitability. | Second expansion |

Series end years do not mean every country has an observation for that year. The importer must inspect each record and its metadata.

### PISA checks

The latest publication found in this review is PISA 2025, not PISA 2022. OECD's [2025 database](https://www.oecd.org/en/data/datasets/pisa-2025-database.html) and [results tables](https://www.oecd.org/en/publications/pisa-2025-results-volume-i_73451bc5-en/full-report/results-for-countries-and-economies_33854635.html) are the ingestion starting points. Use published aggregate results rather than attempting to recalculate scores from student microdata.

The [Portugal country note](https://www.oecd.org/en/publications/pisa-2025-results-volume-i-country-notes_2d4ff9ea-en/portugal_1b9ed477-en.html) was opened. It links subject tables and explains sampling/quality qualifications. Carry those flags into the UI and Markdown; small score differences do not automatically establish a statistically meaningful winner. Do not silently substitute an older cycle for a non-participant in the newest one.

## Reuse and attribution

- **UNDP:** its [terms](https://hdr.undp.org/terms-use) identify CC BY 3.0 IGO. Retain attribution and the licence link, identify transformations, and use the latest revised series. Historical values from different report editions should not be spliced together as a trend.
- **OECD:** the [data terms](https://www.oecd.org/en/about/terms-conditions.html) permit attributed reuse subject to dataset-specific and third-party restrictions. Check the selected table's notice; do not assume every dataset inherits the licence for recent OECD written publications. Include dataset, edition, URL and access date.
- **World Bank:** each shortlisted indicator page currently labels its data CC BY 4.0. Preserve original-provider credit as well as World Bank attribution, and check indicator exceptions against the [dataset terms](https://data.worldbank.org/summary-terms-of-use) before bulk publication.
- **Rumavi:** its [2026 index](https://rumavi.com/en/global-relocation-index/general) is relevant as an external reference, but the [methodology](https://rumavi.com/en/global-relocation-index/methodology) mixes institutional observations, estimates and editorial assessments. Its [terms, Article 14](https://rumavi.com/en/terms-of-service) require written approval for republication. Treat it as link-only unless explicit permission covers web display, the public repository, caching and machine-readable redistribution. Do not scrape and republish the ranking or present its modelled values as official statistics.

Upstream licences must remain separate from MultiPass Rank's original evidence-metadata licence. Do not imply endorsement by a data publisher. Do not reuse publisher logos or cover artwork as part of this feature without a separate rights check.

## Feasibility sample, not a production import

The versioned [UNDP HDR 2025 CSV](https://hdr.undp.org/sites/default/files/2025_HDR/HDR25_Composite_indices_complete_time_series.csv) was fetched successfully. These three directly inspected rows demonstrate the proposed display:

| Country | HDI, 2023 | UNDP rank, 2023 |
| --- | --- | --- |
| Portugal | 0.890 | 40 |
| Singapore | 0.946 | 13 |
| United States | 0.938 | 17 |

These are development indicators, not passport ranks. No full-catalog identity mapping or completeness claim has been made. A production importer needs proper CSV parsing, exclusion of regional aggregates, and reconciliation against the publisher's tables.

## Proposed data contract

Use a source registry, an explicit geography crosswalk and observations. Keep them outside the visa-policy schema.

An observation should retain:

- `countryCode`, `providerEntityCode`, `providerEntityName`, `geographicScope`, and any mapping caveat;
- `indicatorId`, `sourceId`, native numeric `value`, `unit`, `direction`, and original precision;
- `observationPeriod`, `edition`, optional actual `publishedAt`, and separate `retrievedAt` / `reviewedAt` dates;
- optional publisher rank with its universe/year, never an inferred global denominator;
- quality flags, estimation status and optional confidence interval;
- status `available`, `not_reported`, `scope_mismatch`, `reuse_pending` or `retrieval_failed`, with an explicit reason when unavailable.

The source registry stores publisher, dataset and table URLs, methodology URL, licence/terms URL, attribution text, reuse approval and refresh policy. A numeric observation is publishable only after its source and identity mapping have passed review.

Do not infer a crosswalk from a similar name. Preserve separate Hong Kong, Macao and Taiwan observations when the provider reports them. A subnational Chinese PISA sample is not automatically a China-wide score. Do not apply a metropolitan country's score to every overseas territory or special travel document. Preserve the publisher's geographic labels without changing the passport catalog.

## Product and agent presentation

1. Place the country-indicator list below the passport's access summary/overview; do not change the mobility score or the ranking sort.
2. Use one compact row per measure: label, native value, data year and a visible source link. Education expands into its three subjects. On narrow screens, wrap the source/date beneath the label without horizontal scrolling.
3. For combined passports, show separate country profiles or links. Never add, average or take the maximum of country living-condition scores as though citizenship merges their health or school systems.
4. Render the same observations, caveats and sources in HTML and `.md`/negotiated Markdown. If a JSON endpoint is added, version its schema and include observation dates, units and provenance, not bare numbers.
5. Keep canonical passport URLs and their current sitemap entries. Avoid generating thin new SEO pages for every metric-country combination. Existing pages should contain useful sourced content first.

## Import and review workflow

1. Start with a pilot covering Portugal, Singapore, the United States, a separately reported economy, and a country missing from PISA. Validate identity mappings and missing-data presentation before expansion.
2. Download versioned bulk files or aggregate API results offline. Store provenance and a content hash; review value, schema, coverage and licence changes before accepting a new edition.
3. Publish one compact, validated country-indicator artifact with the app. No third-party fetches from visitors' browsers and no KV read per indicator or country. Keep the last approved artifact on refresh failure; never change its observation/review dates merely because a download ran.
4. Check for new editions monthly, then review releases when available. These annual/multi-year indicators do not justify daily bulk ingestion or a new daily paid workflow. No scheduler is enabled by this proposal.
5. Add regression tests for units, ranges, missing versus zero, duplicate observations, geographic exclusions, edition consistency, attribution, and HTML/Markdown/JSON parity. Compare scores only on compatible years/definitions; preserve uncertainty.
6. Test mobile at 320–390px and confirm this section adds no client-side JavaScript or blocking requests. Keep UI text factual and source-linked.

Useful later questions include family-oriented country comparisons and the difference between mobility, residence rights and living conditions. Answer them with separate evidence, not an undocumented “best citizenship” composite. Cost of living, tax burden and healthcare entitlement need additional household-, city- and residence-specific research before they can be reduced to a useful comparison.
