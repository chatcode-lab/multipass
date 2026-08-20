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

1. **Best second passport for US, UK, Canadian, and EU-passport holders** — maximize marginal easy-access gain from a stated first passport; keep acquisition and legal feasibility explicitly out of scope.
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
