# SEO research notes

Research was run on 19 August 2026 against DataForSEO's Google Ads US/English dataset and the site's Google Search Console exports. Search volumes are directional monthly averages, not traffic forecasts.

## Query themes

| Query | Approximate monthly volume |
| --- | ---: |
| dual passport | 40,500 |
| passport index | 9,900 |
| most powerful passport | 9,900 |
| passport ranking / rankings | 5,400 |
| strongest passport | 1,900 |
| best passport | 1,300 |
| passport strength | 880 |
| passport power | 720 |
| compare passports / passport comparison | 590 |
| dual citizenship benefits | 110 |
| US vs UK passport | 110 |
| US vs Canadian passport | 50 |
| passport mobility score | 50 |

## ETA and eVisa guide query check

A supplemental US/English check on 19 August 2026 informed the terminology guide:

| Query | Approximate monthly volume |
| --- | ---: |
| what is an evisa | 1,000 |
| is eta a visa | 140 |
| eta vs visa | 110 |
| eta vs evisa | 40 |
| evisa vs eta | 20 |
| electronic travel authorization vs visa | 10 |

The page keeps the direct “eVisa vs ETA” topic in its title while using “What is an eVisa?” and “Is an ETA a visa?” as natural explanatory headings. It does not collapse the two terms into synonyms.

## Passport combination research

A US/English DataForSEO Labs check on 20 August 2026 found a small but unusually relevant informational cluster:

| Query | Approximate monthly volume | Reported difficulty |
| --- | ---: | ---: |
| best passport combination | 70 | 0 |
| best dual citizenship combination | 20 | 42 |
| strongest passport combination | 10 | not available |
| passport combinations | 10 | not available |
| passport combination calculator | 10 | not available |

The broad related-keyword graph also surfaced “why dual citizenship is bad” (3,600), “worst passports in the world” (480), “best dual citizenship for US citizens” (50), and country-specific US dual-citizenship questions. These are adjacent interests, not synonyms for a visitor-access calculation.

The first research pages therefore answer two reproducible questions rather than making a general lifestyle recommendation:

- `/best-passport-combination` exhaustively evaluates every two- and three-passport set.
- `/how-many-passports-to-cover-the-world` solves the exact minimum set-cover problem for the tracked destination universe.

Both pages define easy access, disclose the snapshot date, distinguish mobility from citizenship quality, link to reproducible rank/comparison URLs, and provide Markdown alternatives.

## Multiple-passport curiosity research

A US/English DataForSEO Labs check on 20 August 2026 found a larger question-led cluster:

| Query | Approximate monthly volume | Reported difficulty |
| --- | ---: | ---: |
| triple citizenship | 40,500 | 33 |
| how many citizenships can you have | 3,600 | 7 |
| how many passports can you have | 1,300 | 7 |
| can you have 3 citizenships | 480 | 6 |
| can you have multiple passports | 170 | 20 |
| most citizenships held by one person | 70 | 0 |

`/how-many-passports-can-you-have` answers the broad question without inventing a record. It distinguishes citizenship from physical passport booklets, labels Reddit examples as community documentation, uses official nationality guidance for the legal framework, and provides a Markdown alternative.

### Follow-up research backlog

Prioritize experiments that produce new information from the dataset:

1. **Best second passport for US, UK, Canadian, and EU-passport holders** — distinguish the mathematical marginal-access result from documented acquisition routes, compatibility, and non-tourism rights; never turn access gain into an attainability claim.
2. **Where the strongest passports still need visas** — map the remaining gaps for the leading passports and explain why headline ranks hide different exceptions.
3. **Most complementary versus most redundant passport pairs** — rank overlap, unique gains, and regional distribution rather than raw combined score alone.
4. **Regional set-cover experiments** — smallest passport set covering Africa, Asia, Europe, the Americas, the Caribbean, the Middle East, or Oceania.
5. **The value of passport number two, three, four, and five** — quantify the best attainable marginal gain and diminishing returns at each set size.
6. **Easy access versus eVisa-inclusive rankings** — show how results change under a clearly labeled alternative threshold without changing the primary index.
7. **Mixed-nationality group travel** — calculate the intersection of destinations that every traveller can enter, which is the inverse of the current combined-passport union.
8. **Mobility changes over time** — once enough complete snapshots exist, publish winners, losers, and policy changes with destination-level evidence.

Avoid a generic “best citizenship” or acquisition guide until it can use official citizenship, tax, and residence sources; passport-access data alone cannot support those claims.

## Implementation decisions

- Keep the global index focused on “passport index,” “passport ranking,” and “passport strength” without repeating synonyms unnaturally.
- Preserve the homepage canonical URL and its strongest Search Console concepts: “passport combination calculator” (average position 1.87), “combined passport power” (2.31), “passport strength calculator” (3.86), and close spelling variants.
- Give regional and language collections stable, indexable URLs.
- Index a deliberately small set of descriptive one-to-one comparison pages, including Portugal–US, US–UK, US–Canada, Portugal–UK, Portugal–Spain, Ireland–UK, and Brazil–Portugal. Redirect older `/compare/us-vs-*` paths and matching query URLs to their friendly canonical URL; arbitrary generated comparisons remain `noindex`.
- Add a dual-passport travel-benefits guide, but do not imply that a mobility score covers legal, tax, residency, or consular consequences of dual citizenship.
- Keep Markdown alternatives canonicalized to their HTML counterparts and out of the XML sitemap to avoid duplicate indexable documents.
- Treat mobile as the primary layout: it produced 254 of 353 Search Console clicks (72%), with an average position of 5.99 versus 9.76 on desktop.
- Do not publish thin machine-translated pages yet. The country export is geographically broad, but the query export is still predominantly English; add explicit English/x-default language metadata and revisit localization when query-level evidence supports specific languages.

## Search Console snapshot

The supplied export covers 18 May–17 August 2026. Its strongest query families are the calculator and combined-passport concepts, so the rework keeps those phrases visible in the title, calculator label, explanatory copy, and Markdown homepage while leaving `/` canonical.

Top traffic countries were the United States (79 clicks), United Kingdom (37), Canada (36), Germany (19), Australia (14), and France (13). These signals inform internal comparison links but are not sufficient evidence for automatically generated localization.

## Search Console and citizenship update — 28 August 2026

The new supplied export is an early seven-day view covering 20–26 August. It records 41 clicks and 13,529 impressions across countries. Query rows account for only 15 clicks and 3,050 impressions because Search Console withholds low-volume queries; query totals must not be treated as the site's complete demand.

The clearest near-term opportunities remain close to the product rather than generic travel content:

- “passport combo calculator” has 6 clicks from 7 impressions at average position 2.14;
- “combined passport power” has 2 clicks from 3 impressions at 3.33;
- “passport strength calculator” has 1 click from 5 impressions at 5.8;
- “best passport combination” has 1 click from 15 impressions at 10.4;
- “Tunisia passport rank” has 1 click from 40 impressions at 10.5.

Country and destination pages create most impressions but still rank weakly. The highest-impression examples include the New Zealand destination page and passport pages for Hong Kong, Japan, Singapore, Pakistan, Morocco and Bangladesh. Country-page titles, descriptions and headings should state the exact passport rank and visa-free-country intent, while evidence depth and official-source citations remain the long-term differentiator. Mass-producing generic destination prose would increase crawl inventory without addressing that weakness.

## Incremental-gain and acquisition-intent update — 31 August 2026

A US Google Ads keyword check through DataForSEO cost USD 0.09. “Best second passport for US citizens” reports about 40 monthly searches, rising to 70 in July 2026, while “improve passport” reports about 10; “passport combo” reports about 20. Most synthetic calculator variants return no measurable volume. The product therefore keeps `/improve` concise and utility-led while the existing US article remains the primary search-intent page.

The US article now separates three questions that must not be collapsed into one ranking:

- mathematical marginal short-visit access;
- a documented route through which a person might acquire the nationality; and
- non-tourism rights, especially EU citizenship rights to live, work and study across the Union.

The UAE remains the travel-only maximum in the current snapshot, but the official UAE source limits citizenship to exceptional government nomination. It is labeled as a benchmark rather than a practical recommendation. Reviewed EU routes are presented as starting points for ancestry or residence research, never as assumptions about personal eligibility.

## Bing title-length audit — 1 September 2026

Bing Webmaster Tools reported 48 titles longer than 70 characters in its first 1,000 processed pages. The sample was a symptom of the shared templates rather than a 48-page exception: replaying the old generators across the bundled matrix produced 4,503 potential over-limit passport, destination and relationship titles.

The title system now enforces a tested 70-character ceiling across every generated passport, destination and passport–destination combination. Passport pages prioritize the country, “Passport Rank” and “Visa-Free”; destination pages prioritize the destination and “Visa Requirements”; relationship pages keep both place names and the access category, dropping the brand suffix or using curated geographic abbreviations only when necessary. Headings, descriptions and structured data retain the longer explanatory language, so shortening the document title does not remove page context.

A four-market DataForSEO Labs review (United States, United Kingdom, India and the Philippines) cost approximately USD 0.20. Directional opportunities include:

| Topic | Representative market volume | Difficulty signal |
| --- | ---: | ---: |
| dual citizenship | 40,500 US | 33 |
| multiple citizenship | 40,500 US | 17 |
| how many passports can you have | 1,300 US and 1,300 UK | 7 |
| countries that allow dual citizenship | 1,600 US | 14 |
| citizenship by descent | 2,900 US | 7 |
| visa-free countries for Indian passport holders | 90,500 India | 15 |
| Philippines passport visa-free countries | 4,400 Philippines | 0 |
| best passport combination | 90 US | 0 |

Grouped keyword tools can assign the same volume to close variants, so the 40,500 rows are topic signals rather than additive demand. The implementation response is one reviewed `/dual-citizenship-countries` dataset and compatibility layer, not hundreds of thin legal pages. The next useful enrichment is structured acquisition routes—birth, descent, naturalisation, marriage and restoration—with effective dates and official sources. Country-specific pages should be added only when that source record is substantial enough to answer the actual eligibility question.

## Acquisition and US-complement implementation — 30 August 2026

The next pass converts the low-difficulty “citizenship by descent” opportunity into a source-backed dataset rather than a generic affiliate-style guide. `/citizenship-by-descent` starts with 11 structured routes across eight countries and records route type, requirements, residence or language fields, transition notes, review date, and official sources. It also exposes a Markdown version and `/api/v1/citizenship-acquisition` JSON resource.

Current-law conflicts are explicit. Portugal's Ministry of Justice overview still displays a five-year residence headline and labels the page as being updated, while its later 19 May 2026 reform notice sets seven years for EU or Portuguese-speaking-country nationals and ten years for other nationals. The route record follows the later effective law and preserves the transition note. Italy's descent record likewise avoids pre-2025 generational shorthand after the current Foreign Ministry guidance incorporated the 2025 Article 3-bis restrictions.

`/best-second-passport-for-us-citizens` implements the first marginal-gain experiment from the research backlog. It evaluates every other passport against the United States, publishes the top ten by newly added easy-access destinations, links every result to reproducible rank and comparison URLs, and labels citizenship compatibility separately. The page never equates mobility gain with eligibility, acquisition ease, tax value, or legal compatibility.

The multiple-citizenship register expands from 11 to 19 reviewed countries with Canada, Australia, France, Ireland, Italy, Brazil, Spain, and Israel. Calculator cautions remain non-blocking and appear only where an official policy has been reviewed; missing countries remain unknown.
