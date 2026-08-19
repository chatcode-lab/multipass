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
