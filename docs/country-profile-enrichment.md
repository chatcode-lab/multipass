# Country profiles: enrichment research and next-goal handoff

Research date: 16 September 2026. Implementation update: 17 September 2026. The first bounded pilot implements ten citizenship topics, three tax topics and 22 HDI/life-expectancy observations for eleven profiles. Publication uses independent, hash-bound review artifacts; the full 199-passport collection below remains a next-goal plan. No paid research API was used.

The top-20 expansion covers every frozen displayed rank through 20, including ties: 47 passports, not 20 rows. All 94 cohort citizenship/tax topics and both indicator outcomes per profile are independently approved; India remains from the pilot. Its [scope and release checks](../research/country-profiles/top20-plan.md) distinguish reviewed collection from deployment and from exhaustive legal certainty. Incremental topics carry their own review; absent facts and unavailable statistics never become zero or a blanket approval.

The [22 September ranks 21–40 expansion](../research/country-profiles/ranks21-40-plan.md) adds 25 tied passports, targeting a combined 72-passport cohort plus the retained India pilot: 145 legal topics and 146 indicator collection outcomes. It also introduces explicit hash-bound legal supersession for reviewed corrections and raw-byte statistical source provenance. Consult that plan for actual approval and deployment status. This pass extends the existing two indicator families; PISA, Big Mac and other proposed families below are not silently included in its completion figures.

This extends [the country-indicators proposal](country-indicators-plan.md) and follows the provenance, canonical-URL and cost constraints in [the SEO/AEO playbook](seo-aeo-playbook.md). The objective is to make existing passport pages more useful to people and agents, not to invent another overall passport score.

## Recommended product scope

Keep five independent data families under each passport profile. The approved SEO structure now uses short hub summaries plus substantive `/passport/{slug}/citizenship` and `/passport/{slug}/taxes` pages. Indicators remain on the hub; do not generate a child page per statistic.

| Section | Useful first fields | Important boundary |
| --- | --- | --- |
| Becoming a citizen | Ordinary residence route; residence/presence requirements; language standard; civic test; dual-citizenship/renunciation conditions; official application link | Eligibility to apply is not citizenship approval or a total processing-time estimate. |
| Rights beyond travel | Residence/work rights under documented regional arrangements; registration and eligibility conditions | Visa-free travel, residence, employment and access to benefits are different rights. |
| Living in the country | HDI, life expectancy, PISA subjects, homicide rate; later air quality and internet use | These describe residents or education systems, not benefits automatically attached to a passport. |
| Tax context | Personal tax-residence criteria; foreign-income treatment; notable citizenship-linked obligations; official tax guide | A nationality does not select a person's tax regime. No personalised tax calculation or "tax-free passport" label. |
| Everyday price context | Big Mac price and observation date; later household-consumption price level | A single product is a curiosity, not a household cost-of-living estimate. |

The first useful release should combine structured citizenship requirements with a few broad, attributable indicators. Tax should start as a short, carefully scoped notice. There should be no new blended quality-of-life or citizenship-obtainability score, and no effect on mobility rankings.

## Baseline before the pilot

Before the 17 September pilot, the project had:

- 199 passport profiles and 227 destinations;
- 12 acquisition-route records covering nine countries: PT, DE, IE, CA, AU, FR, ES, IT and AE, in [citizenship-acquisition.ts](../src/data/citizenship-acquisition.ts);
- 20 multiple-citizenship policy summaries in [citizenship-policies.ts](../src/data/citizenship-policies.ts);
- country-specific links to these guides, plus Markdown and citizenship JSON endpoints;
- an indicator proposal, but no country-indicator UI, dataset import or public country-profile endpoint. The pilot now implements those three pieces for the explicitly listed countries, without claiming catalog-wide coverage.

Extend the existing legal records rather than creating a second conflicting source of truth. Their current free-text residence and language fields are useful display fallbacks; a structured successor must preserve qualifications and transition notes. Re-open sources when migrating: migration is not a fresh legal verification.

## Source feasibility and priority

| Data family | Preferred source | First-pass decision |
| --- | --- | --- |
| Human development | [UNDP HDR downloads](https://hdr.undp.org/data-center/documentation-and-downloads), HDI and optionally inequality-adjusted HDI | High priority. Native 0–1 values, report edition and observation year; publisher rank only with its actual universe. |
| Health context | [World Bank life expectancy](https://data.worldbank.org/indicator/SP.DYN.LE00.IN), preserving original-provider attribution | High priority. Years at birth, not a healthcare-quality score or individual prognosis. |
| Education | [OECD PISA 2025 Volume I](https://www.oecd.org/en/publications/pisa-2025-results-volume-i_73451bc5-en.html) and its aggregate tables | High priority after table/quality review. Three separate subject means; test year 2025, publication 8 September 2026. Preserve sampling flags and uncertainty. |
| Safety context | [UNODC homicide data via World Bank](https://data.worldbank.org/indicator/VC.IHR.PSRC.P5) | Useful with strong age warnings. Rate per 100,000; not a complete safety or conflict-risk measure. |
| Environment and connectivity | [PM2.5 exposure](https://data.worldbank.org/indicator/EN.ATM.PM25.MC.M3), [internet use](https://data.worldbank.org/indicator/IT.NET.USER.ZS) | Second tier. Exposure is not a live air-quality reading; internet penetration is not connection speed or freedom. |
| Comparable price levels | [World Bank International Comparison Program](https://www.worldbank.org/en/programs/icp/data) | Prefer household-consumption price levels to GDP PPP for consumer context. Keep benchmark year, base geography and estimation status. Not a monthly relocation budget. |
| Recognisable price example | [The Economist's Big Mac repository](https://github.com/TheEconomist/big-mac-data) | Feasible optional feature using a pinned data file; display country-specific prices only where actually reported. |
| Life satisfaction | [World Happiness Report data sharing](https://www.worldhappiness.report/data-sharing/) | Optional second tier. Figure 2.1 offers three-year averages and confidence intervals; unrestricted reuse of underlying Gallup microdata must not be assumed. Check redistribution terms before import. |
| Institutional context | [World Justice Project research](https://worldjusticeproject.org/our-work/research-and-data) | Candidate, not a first-release dependency. Confirm edition, geographic coverage and republication terms. Do not call it an objective personal safety rating. |
| Citizenship | National legislation, official nationality/immigration portals and responsible ministries | Highest legal priority. Record ordinary and exceptional routes separately; every published legal claim needs direct official support. |
| Tax | National revenue authorities, legislation and official treaty documents | Stage after the citizenship pilot. Start with scope and obligations, not headline rate comparisons. |

### Practical findings from direct data checks

These are feasibility observations, not approved completeness figures. Code matches still need a reviewed geography crosswalk.

1. Earlier World Bank API discovery found life-expectancy matches for 197 of 199 catalog codes, and internet-use matches for 182. The controlled 17 September pilot fetch found **2024** as the latest non-null life-expectancy year for its eleven geographies. This corrects the earlier research's 2025 assumption; use actual record dates, not a requested year or retrieval year. Discovery matches do not establish quality or approved mapping.
2. A bounded 2015–2025 fetch found homicide observations for 154 catalog codes, with the latest available year varying from 2015 to 2023. PM2.5 observations matched 193 codes, with 2023 observations. A recent retrieval timestamp must not hide those observation years.
3. The initial latest-period request returned no usable homicide values; requesting a date range recovered historical observations. Do not interpret an empty latest period as proof that a country has no data. Follow pagination, inspect metadata, select non-null observations explicitly, and retain their dates. [World Bank API documentation](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures).
4. The Economist's `releases/latest` redirected to the January 2025 release, but the inspected raw-index file contained 54 rows dated 1 July 2026, including a euro-area aggregate. Pin the inspected file at commit `0d9710454755a71d7f0c03e662e580b271be456d`, not a floating branch or an assumed latest tag. [Inspected CSV](https://raw.githubusercontent.com/TheEconomist/big-mac-data/0d9710454755a71d7f0c03e662e580b271be456d/output-data/big-mac-raw-index.csv).
5. That Big Mac slice includes the US at USD 6.22 and Singapore at SGD 7.45; it has no separate Portugal row. The euro-area price must not be presented as a Portuguese national observation. It could be a separately labelled regional reference, never a silent fill.
6. GLOBALCIT v3.0 describes laws in force on 1 January 2024 across 191 states. Its taxonomy and legal citations are valuable research leads, but it is not a current 2026 legal authority. Use it for discovery and cross-checking, then verify the governing national sources. [GLOBALCIT dataset description](https://globalcit.eu/databases/globalcit-citizenship-law-dataset/).

Reproducible World Bank request patterns used in this review:

```text
https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json&mrv=1&gapfill=Y&per_page=20000
https://api.worldbank.org/v2/country/all/indicator/VC.IHR.PSRC.P5?format=json&date=2015:2025&per_page=20000
https://api.worldbank.org/v2/country/all/indicator/EN.ATM.PM25.MC.M3?format=json&date=2015:2025&per_page=20000
```

Do not bake these years, result counts or page size into a claim of permanent coverage. The importer must validate all returned pages and report omissions.

### Reuse gates

- UNDP materials use [CC BY 3.0 IGO](https://hdr.undp.org/terms-use): preserve credit and transformation notes, and keep one revised edition consistent.
- OECD [data terms](https://www.oecd.org/en/about/terms-conditions.html) permit attributed reuse subject to dataset-specific and third-party restrictions. Verify the actual aggregate table, not only the publication licence.
- Check the licence shown for each World Bank series and preserve the original provider as well as World Bank attribution. Do not assume the same terms for every API dataset.
- The Economist repository includes an [MIT licence](https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/LICENCE). Retain its notice; also record the README's upstream data provenance. Confirm that the intended redistribution is covered before a bulk public-data artifact is accepted; no article artwork or brand assets are included in this proposal.
- Keep Rumavi link-only unless written permission is obtained: [Article 14](https://rumavi.com/en/terms-of-service) restricts republication. A publicly visible score is not automatically reusable open data.
- Maintain separate upstream licences. MultiPass Rank's evidence-metadata licence cannot relicense third-party datasets.

## Data contract

Use a country-profile manifest plus source, observation and legal-fact registries. This is a proposed contract to implement and validate in the next goal, not an existing API promise.

```text
CountryProfile
  passportCode                 existing stable catalog code
  profileVersion               approved content version
  jurisdictions[]              nationality / territory / tax / education scopes
  providerMappings[]           provider entity, exact scope, mapping review
  citizenshipRouteIds[]        extend existing acquisition records
  citizenshipPolicyId?         reference existing retention/dual-citizenship policy
  rightsFactIds[]               residence/work rights and conditions
  taxFactIds[]                  narrowly scoped individual-tax facts
  observationIds[]              living conditions and prices
  coverage                     separate state for each family and required field

Source
  id, publisher, title, url, sourceKind, language
  documentId?, tableOrSection?, methodologyUrl?
  edition?, publishedAt?, retrievedAt, reviewedAt?
  versionOrContentHash?, licenceUrl?, attribution
  reuseStatus                  approved / link_only / needs_review
  review                       researcher, independent reviewer, decision, date

MetricDefinition
  id, label, definition, unit, precision
  direction                    higher / lower / no_preference
  validRange?, population, geographicScope
  comparisonRules              same edition, period, unit and population requirements

Observation
  id, passportCode, metricId, sourceId, providerEntityCode
  value                        number only when available; otherwise null
  availability                 available / not_reported / not_applicable /
                               scope_mismatch / reuse_pending / retrieval_failed
  unavailableReason?
  observationPeriod            exact date, year or multi-year interval
  edition, publishedAt?, retrievedAt, reviewedAt?
  qualityFlags[], estimateKind?, confidenceInterval?
  publisherRank?               rank, population/universe, denominator if known
  currency?, referenceCurrency?, exchangeRate?, exchangeRateDate?
  method                       reported / derived
  derivation?                  formula, input IDs and compatible periods

LegalFact<T>
  id, jurisdiction, topic, subjectScope, routeId?
  value: T | null
  state                        documented / conditional / conflicting /
                               not_established / not_applicable
  summary, conditions[], exclusions[], sourceRefs[]
  legalStatus                  in_force / enacted_future / proposed / historical
  effectiveFrom?, effectiveTo?, transitionRule?
  retrievedAt, reviewedAt?, recheckBy?
  review                       candidate / approved / rejected; independent reviewer
```

An accessible source is not automatically a reviewed fact. Keep publication approval, legal effectiveness, observation age, retrieval health and data availability as separate dimensions. A proposed bill must never become a current requirement. `not_established` is not the same as an explicit zero or exemption.

Source references on legal facts should locate the specific article, section or table that supports the claim. Candidate files may retain short supporting excerpts for review, subject to quotation limits; do not ship copied source pages or documents in the public bundle.

### Citizenship route extension

Extend `CitizenshipAcquisitionRoute` additively, preserving stable route IDs and existing API fields while richer fields are introduced. Do not create a parallel naturalisation number that contradicts the existing summary.

| Field group | Structured fields to collect |
| --- | --- |
| Route and cohort | Naturalisation, descent, marriage, restoration or exceptional route; adult/minor; qualifying nationality, parentage, marriage, birth/filing dates; ordinary vs nomination-only; discretionary vs entitlement when explicitly established |
| Residence | Source-faithful label; separately typed legal residence, permanent residence, physical presence and continuous final-period constraints; quantity/unit, lookback window, clock start, absence limits, qualifying statuses and partial credits |
| Language | Languages, accepted alternatives (`any_of` vs `all_of`), named framework and exact level, tested skills, accepted proof, age/disability/education exemptions |
| Civic integration | Required test, interview, course, oath or declaration; exemptions; official preparation/application links |
| Other conditions | Criminal/security checks, self-support, income or tax-compliance requirements, required status at decision, intended residence |
| Multiple nationality | Reference existing policy plus route-specific renunciation/retention conditions; original nationality may impose separate loss rules |
| Cost and time | Official application fee with currency/date/cohort; official processing estimate separately from the eligibility clock; neither is a total acquisition price or guaranteed timeline |
| Evidence | Claim-level official citations, legal effect and transitional rules, reviewed date and next review |

Model requirements as groups of `all_of` and `any_of` constraints where the source establishes alternatives. A flat `residencyYears` cannot safely represent many systems.

For example, Canada's adult route requires 1,095 days within a five-year window, including 730 days as a permanent resident; some earlier lawful presence receives partial credit. Its language standard is CLB/NCLC 4 for specified ages and skills, not an inferred CEFR level. These need separate fields and exceptions. [IRCC eligibility guide](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor/who.html).

German guidance explicitly names B1 and other accepted proof, illustrating where a level can be stored directly. Where official guidance merely says adequate language knowledge, retain that wording until a controlling source establishes a level. [Federal naturalisation guide](https://www.make-it-in-germany.com/en/visa-residence/living-permanently/naturalisation).

Do not rank the UAE as an ordinary obtainable second passport because of its travel score. Preserve the existing exceptional/nomination route distinction, research any other statutory cohorts separately, and never imply that a residence investment automatically grants citizenship. Likewise, descent possibilities are applicant-specific, not universally available shortcuts.

### Tax facts: useful without pretending to calculate a bill

Start with these topics:

- Tax-residence tests and their measurement period, with official determination guidance.
- Treatment of residents' foreign income, separated by income class and relevant exceptions.
- Non-resident source-income obligations and citizenship-linked obligations where established.
- New-resident regimes only with cohort, entry date, expiry and exclusions.
- Official personal-tax guide, treaty directory and filing guidance.

Do not reduce these to `taxType: territorial` or `taxRate: 0`. Never infer non-residence simply from spending fewer than 183 days in a country, or mix personal and corporate rules.

Two useful model tests: the [IRS explains worldwide-income obligations](https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad) for US citizens/resident aliens abroad, alongside possible reliefs; [HMRC describes several residence tests](https://www.gov.uk/tax-foreign-income/residence), not just a day threshold. A third is [Singapore's overseas-income guidance](https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/what-is-taxable-what-is-not/income-received-from-overseas), which includes exceptions to the general treatment. These establish why citizenship, residence, income source, remittance and income class need separate fields.

Any later rate table must specify tax year, residency, income type, bands, currency, national/subnational scope, social contributions and exclusions. Estimated effective burdens require an explicit household scenario and are outside the first goal. Put a clear general-information limitation beside tax summaries and direct users to the authority or a qualified adviser for personal decisions.

### Geography and rights

Passport issuer, nationality jurisdiction, tax jurisdiction and statistical geography are not always interchangeable. Review HK, MO, TW, XK and territories explicitly. Never invent a separate nationality law because a passport issuer has a separate catalog row.

Store regional rights as scoped legal records shared by affected profiles, not an extra visa-free count. EU residence guidance distinguishes workers, students, pensioners and other circumstances; it is a good first source family. [Your Europe residence rights](https://europa.eu/youreurope/citizens/residence/residence-rights/index_en.htm). Treat EEA, Swiss, Common Travel Area and other arrangements as separate research tasks with their own conditions, not automatic copies of EU membership.

## Presentation, SEO and agent use

1. Keep existing `/passport/{slug}` URLs, primary travel ranking and visa table intact. Add concise sections below the overview with local jump links; do not bury the access list under a long essay.
2. Show native numbers, units, observation year and source per metric. Use `not reported` rather than a zero, and label estimates or old observations. Do not colour non-comparable figures as winners.
3. Present citizenship as a short ordinary-route summary with expandable exceptions. Where several nationalities or applicant cohorts differ, show the branches rather than the shortest possible time as the headline.
4. Start tax with one or two material notices and the official guide. Keep it separate from citizenship acquisition and cost of living.
5. Do not aggregate these measures across passport sets. A US+Portugal combination does not have an averaged healthcare system or one joint tax regime. Link to separate profiles, and later allow an explicitly labelled country-context comparison if useful.
6. Render the same facts, dates, missing states and citations in HTML and `.md`/negotiated Markdown. Agents need claim-level source references and qualification text, not just compressed numbers.
7. Prefer a new versioned country-profile JSON resource, e.g. `/api/v1/country-profiles/PT`, to adding large legal/statistical payloads to the existing passport-status endpoint. Advertise it in HTTP/HTML alternative links and the AI guide. Preserve current API contracts.
8. Use the hybrid hub/topic structure from the SEO playbook. Substantive citizenship and tax children self-canonicalize and enter the core sitemap; unsupported topics return 404. Do not generate metric-by-country or every-pair landing pages. Topic pages share the approved artifact with summaries, Markdown and JSON.
9. Include correct publisher, dataset edition, licence and observation dates in any new Dataset metadata; do not attribute upstream measurements to MultiPass Rank as their creator.

## Ingestion, review and cost control

- Import quantitative datasets in bulk offline; validate identities, units, time periods, missing values and licences before approval. No third-party browser calls and no per-metric KV reads.
- Produce a compact approved artifact separate from candidate research. Bundle it with the application or serve a versioned static asset through the existing cache path. Avoid importing a whole legal corpus into a React island or repeating it on the homepage.
- Make failed or anomalously empty refreshes retain the last approved dataset. Never silently reset values to zero, advance review dates or drop coverage after a transient failure.
- Check statistical sources monthly or on known releases; review legal topics every 90 days and sooner at effective/expiry dates or detected changes. Fees and special tax regimes may need a shorter schedule. These are proposed review intervals, not a freshness guarantee.
- Keep retrieved, observed, published, effective and independently reviewed dates distinct. A successful HTTP request is not a legal verification.
- Extend `/status` later with a separate country-profile tab showing coverage by family/field. Leave the visa matrix and its percentage unchanged. Report reviewed facts, unresolved/conflicting facts, source-unavailable cases and true non-applicability separately; every row should link to its passport profile and sources.
- Before legal publication, an independent reviewer must open the actual official documents, check cohort and transition rules, and approve each batch. Automated schema validation alone is insufficient.

## Next goal: bounded pilot, then all-passport coverage

### Phase 1 — schema and pilot

1. Implement validated candidate and published schemas, source registry, metric definitions, geography mappings and coverage manifest. Keep candidate files outside production data.
2. Pilot PT, DE, FR, IE, CA, US, SG, AE, HK and IN. This deliberately includes route transitions, different language standards, exceptional routes, a separately administered territory and missing statistical observations.
3. Import HDI and life expectancy first, followed by PISA aggregate subjects after quality review. Trial a source-pinned Big Mac card where there is a country observation. Add homicide only with clear observation-age treatment; an old number should not be marketed as current safety.
4. Reverify and structure ordinary citizenship routes for the pilot. Preserve current guides while reusing the same approved records for passport-page summaries.
5. Trial tax summaries for US, UK and Singapore before deciding how much tax detail to collect globally. The UK is an additional tax-only pilot, not an implied reviewed citizenship route.
6. Ship one responsive server-rendered profile section after review and tests. At this stage, explicitly show remaining coverage rather than claiming all 199 countries have complete data.

### Phase 2 — catalog-wide collection

- Quantitative track: fetch complete source datasets, then map them against all 199 issuers. Each issuer/metric must have an approved observation or an explicit unavailable state and reason. A missing statistic is a valid outcome, not a reason to invent one.
- Legal track: collect ordinary adult naturalisation and language requirements for every applicable jurisdiction in batches of three to five countries; add route-specific reduced periods separately. Start with existing nine-country acquisition coverage, then countries with actual user demand.
- Rights track: research shared regional arrangements once and attach scoped records to eligible profiles.
- Tax track: expand the minimum scope/obligation/official-guide fields only after the pilot's legal review. Leave detailed rates and special regimes for later batches.
- Additional routes: extend descent, marriage, restoration and exceptional routes after the ordinary-route baseline. Do not label one ordinary-route record as comprehensive citizenship-law coverage.

### Phase 1 implementation and remaining scope

The legal candidate schema and approved artifact are implemented separately from statistics. Sources, source locators, applicant/jurisdiction scope, conditional or unresolved facts, typed residence constraints, exact language frameworks, and independent review dates are available through the versioned API. Five existing naturalisation records reuse the approved topic facts without changing route IDs. Other legacy records retain their old review dates.

The first statistics import deliberately includes only HDI and life expectancy; PISA, Big Mac, homicide and further indicators still need their own table, quality and reuse review. No new `/living` pages, blended score, automatic legal updater or extra KV keys were introduced. The eleven pilot geographies have reviewed mappings; all other profile APIs report `not_collected`, not invented values. The more expressive multi-route `all_of`/`any_of` contract above remains an expansion target rather than a promise that every proposed field is implemented.

Runbook: [country-profile pilot and next batches](../research/country-profiles/README.md). Code: [legal schema](../src/lib/country-profile-schema.ts), [indicator schema](../src/lib/country-indicator-schema.ts), [shared topic renderer](../src/pages/passport/[slug]/[topic].astro).

### Phase 2 definition of done — not a first-pilot completeness claim

- All 199 profile codes have a reviewed mapping or a visible mapping blocker; no silently inherited parent-country observations.
- Each required family/field has a recorded collection outcome. Report substantive verified coverage separately from completion of the collection audit; an unresolved item does not count as verified.
- Every published legal statement has direct official evidence, defined scope, review metadata and independent approval. Missing evidence stays unresolved.
- Every published number has its native unit, period, provider, source, reuse approval and quality flags. No silent extrapolation across years or regions.
- HTML, Markdown, JSON and any dataset metadata agree. Existing passport ranks, access responses, canonical URLs and sitemap membership do not change as a side effect.
- Tests cover conditional residence groups, exemption versus unknown, language frameworks, special jurisdictions, historical/future rules, source failure, numeric precision and missing data. Run `npm run test:all` and mobile/desktop browser tests.
- No added third-party render-blocking requests, client-side profile-data framework, or KV read amplification. Mobile layouts work at 320–390px.
- The completion report lists approved records, unavailable/unresolved records, changes awaiting review and the next review queue. Do not claim legal or statistical completeness merely because every country has a row.

### Prompt for a bounded researcher batch

Use after Phase 1 supplies a real schema and a packet with assigned countries and fields:

```text
Research only the country-profile batch in the supplied packet. Read
docs/country-profile-enrichment.md, the packet, and the candidate schema first.
Return one candidate file; do not edit published records, scores or deployment.

For citizenship, residence rights and tax, cite only current primary official
sources. Open every cited page. Store exact scope, exceptions, effective dates,
transition rules and a location within the source. Do not infer a language level,
an absence rule, a tax exemption, or a route from silence. Distinguish residence,
physical presence, eligibility, discretion and processing time. Nomination-only
or exceptional routes must not become ordinary second-passport recommendations.

For statistics, use only the assigned original publisher/data provider, native
units, exact observation period and approved geography mapping. Record licence,
edition and quality caveats. Never substitute a regional score for a country.
Missing, inaccessible or conflicting evidence is a recorded unresolved outcome.

Keep supporting excerpts short and within source quotation limits. Include
source URLs, locators, retrieval dates, and specific unresolved questions.
Do not claim independent verification of your own work. The coordinator must
obtain an independent review before any new legal facts are published.
```

No new recurring job, paid API task or long-running goal is created by this document.

## Visa-maintenance queue remains separate

The offline expiry scan for 16 September flags the Bosnia and Herzegovina waiver for BH/OM/SA through 30 September, Montenegro's KZ seasonal waiver through 1 October, and Cambodia's CN/HK/MO exemption through 15 October. These are next-review targets from existing records, not newly verified policy conclusions. Re-open the recorded authorities and look for extensions before their dates; do not infer a successor category.

The scan also includes the old Russia/China waiver ending 14 September. A successor was already handled in the preceding published pass, so this historical entry must not be counted as a new unresolved gap merely because it appears in the expiry report.
