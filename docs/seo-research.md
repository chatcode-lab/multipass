# SEO research notes

Research was run on 19 August 2026 against DataForSEO's Google Ads US/English dataset. Search volumes are directional monthly averages, not traffic forecasts.

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
- Give regional and language collections stable, indexable URLs.
- Index dedicated US–UK and US–Canada comparison pages; arbitrary generated comparisons remain `noindex`.
- Add a dual-passport travel-benefits guide, but do not imply that a mobility score covers legal, tax, residency, or consular consequences of dual citizenship.
- Keep Markdown alternatives canonicalized to their HTML counterparts and out of the XML sitemap to avoid duplicate indexable documents.
