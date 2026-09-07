# SEO and agent-discovery playbook

- Status: canonical operating guide
- Last reviewed: 7 September 2026
- Audience: maintainers, researchers, coding agents, and content agents

This document turns the project's SEO, answer-engine optimization (AEO), indexing, evidence, performance, and analytics work into one set of current rules. It is intentionally both human-readable and agent-executable.

Use this guide for decisions. Use [seo-research.md](seo-research.md) as the dated experiment and measurement log, not as a competing policy document. Use [visa-evidence-research.md](visa-evidence-research.md) for the official-source research history.

Normative words have their usual meaning:

- **MUST** protects correctness, canonical stability, privacy, or an established search position.
- **SHOULD** is the default unless evidence supports an exception.
- **MUST NOT** identifies a known failure mode.

## 1. North star

MultiPass Rank should give a person or an AI agent a fast, reproducible, source-aware answer to a passport-access question.

The project does not optimize for the largest possible page count. It optimizes for:

1. correct and useful answers;
2. stable URLs and machine-readable representations;
3. official-source evidence and visible uncertainty;
4. excellent mobile usability and low response cost; and
5. a deliberately bounded, high-quality search index.

SEO and AEO are distribution layers for the product and dataset. They are not reasons to create pages that would be unhelpful without search traffic.

## 2. Current baseline

Treat the figures below as a dated baseline, not permanent constants. Recompute them before quoting them in new public copy.

| Metric | Baseline | Meaning |
| --- | ---: | --- |
| Ranked passport issuers | 199 | Passport entities in the global ranking |
| Tracked destinations | 227 | Countries and territories used in access calculations |
| Foreign passport–destination relationships | 44,974 | Matrix cells excluding home/citizenship cells |
| Exact current-status evidence | 40,941 (91.0%) | Relationships whose displayed category has active canonical official evidence |
| Pending exact evidence | 4,033 | Visible but not eligible for indexation as verified relationship pages |
| Pending relationships with an audit packet | 4,033 (100%) | Research queue coverage, not verification coverage |
| Destinations at least 80% verified | 202 of 227 | Coverage breadth as of this review |
| URLs in the production sitemap audit | 41,419 | Unique indexable canonical HTML URLs on 7 September 2026 |
| Sitemap shards | 8 | One core shard and seven relationship shards, referenced by one sitemap index |

Current exact-evidence coverage is uneven: Europe 99.1%, Oceania 99.6%, the Americas 98.5%, the Caribbean 95.5%, Asia 86.9%, Africa 82.5%, and the Middle East 72.2%. Coverage work should therefore be prioritized by user demand, risk, and remaining gaps—not merely by the easiest percentage increase.

The source boundary matters:

- the upstream ranking snapshot supplies complete operational access classifications;
- the reviewed evidence layer supplies official-source proof and research metadata;
- narrow reviewed overrides correct clear taxonomy conflicts;
- unsupported or ambiguous claims remain visibly incomplete.

Never describe 91.0% evidence coverage as 91.0% independent replacement of the upstream dataset. Those are different claims.

## 3. What observed demand tells us

### Human search demand

First-party Search Console data is more useful than generic keyword volume for deciding what to improve.

- The original 18 May–17 August export recorded 353 clicks; mobile supplied 254 (72%), with average position 5.99 versus 9.76 on desktop.
- The latest export reviewed on 7 September covered 827 impressions by device: mobile 560 (67.7%), desktop 258, and tablet 9.
- Its Pages export used a slightly different denominator of 841 impressions. Relationship pages supplied 754 (89.7%). Never combine totals from different Search Console dimensions as if they were one complete table.
- The strongest established product concepts include “passport combination calculator,” “combined passport power,” and “passport strength calculator.” Preserve those concepts naturally on the homepage and tools.
- The strongest standalone article in the latest small sample was `/best-passport-combination`, with 18 impressions. The homepage followed with 13.
- Current geographic demand is broad. The latest sample was led by the United States, United Kingdom, United Arab Emirates, Lebanon, Saudi Arabia, South Africa, Australia, Canada, and Egypt. This supports geographically diverse examples; it does not by itself justify machine translation.

DataForSEO research is directional and secondary:

- broad topics include dual/multiple citizenship, passport index/ranking/strength, citizenship by descent, and visa-free destinations for a named passport;
- the smaller but highly relevant cluster includes passport comparison, passport combinations, best passport combination, and passport mobility score;
- question-led opportunities include eVisa versus ETA and how many passports or citizenships a person may have;
- reported volume for grouped close variants is not additive;
- a zero-volume result is not proof of zero demand.

The comparison-page experiment is the model to follow. A broad check of 1,225 top-50 pairs found measurable demand for only a few neutral phrases. A smaller alias check and first-party Search Console evidence identified additional pairs. The result is 22 useful canonical comparison pages—not 1,225 thin permutations.

### Agent demand

Cloudflare's 7 September exports show that agents primarily want precise relationship facts:

- passport–destination relationship URLs accounted for 5,799 of 7,884 requests (73.6%) in the popular-pages export;
- Markdown accounted for 929 requests (11.8%), including 918 relationship-page requests;
- 298 of 382 requests in the unmet-demand export were recognizable relationship requests;
- the shared Open Graph image received 1,753 requests; it is now one cacheable 1200×630 PNG rather than a per-page rendering workload;
- PerplexityBot led one observed 24-hour bot snapshot, but one crawler snapshot MUST NOT determine product strategy.

The most important AEO lesson is reliability, not special prose for bots. The upstream display name for ISO `NR` briefly changed from “Nauru” to “Naoero,” breaking established paths. Canonical ISO-backed naming and a permanent alias redirect fixed both old and new spellings. Stable identity beats mirroring a volatile supplier label.

The demand export also contained 75 requests for secrets, environment files, framework internals, or administration paths. Those are hostile or irrelevant probes, not content opportunities. They MUST remain cheap, cacheable 404 responses.

## 4. Information architecture and index contract

Every new route family needs an explicit canonical and indexing decision before implementation.

| Surface | Example | Search index | Sitemap | Canonical rule |
| --- | --- | --- | --- | --- |
| Homepage and primary tools | `/`, `/compare`, `/rank`, `/improve` | Yes, for the empty tool | Yes | Self-canonical |
| Passport page | `/passport/portugal` | Yes | Yes | ISO-backed canonical slug |
| Destination page | `/destination/kenya` | Yes | Yes | ISO-backed canonical slug |
| Region/language collection | `/europe`, `/portuguese` | Yes | Yes | Registry-defined slug |
| Verified relationship | `/belgium-kenya-eta` | Yes | Yes | Current access suffix only |
| Pending/conditional/rejected relationship | current relationship URL | No (`noindex,follow`) | No | Current URL remains inspectable |
| Citizenship self-pair | `/estonia-estonia-citizenship` | Redirect | No | `/passport/estonia` |
| Curated comparison | `/portugal-vs-united-states-passport` | Yes | Yes | One order-independent friendly slug |
| Arbitrary comparison | `/compare?set=US&set=PT` | No when parameters are present | No | `/compare`, except redirect to a curated pair |
| Arbitrary ranking | `/rank?set=US,CA` | No when parameters are present | No | `/rank` |
| Arbitrary improvement sequence | `/improve?set=US&set=IT` | No when parameters are present | No | `/improve` |
| Markdown representation | `/passport/portugal.md` | HTML is canonical | No | HTTP `Link` canonical to HTML |
| Negotiated Markdown | `/passport/portugal` with `Accept: text/markdown` | Same canonical resource | No additional URL | Native `.md` representation served with `Vary: Accept` |
| JSON API | `/api/v1/visa/US/JP` | Discovery/API surface, not a landing page | No | Advertised from equivalent HTML where available |
| Status matrix | `/status` | Yes | Yes | Self-canonical |
| AI discovery | `/ai`, `/ai.md`, `/llms.txt` | `/ai` is indexable | `/ai` only | Representations point to `/ai` |
| Unknown or hostile path | `/.env` | No | No | 404; never redirect to a plausible content page |

### Relationship URL rules

The canonical format is:

```text
/{passport}-{destination}-{status}
```

Allowed current status suffixes are `visa-free`, `eta`, `visa-on-arrival`, `evisa`, `visa`, `entry-restricted`, and `citizenship`.

- A recognized relationship with a stale suffix MUST return a permanent redirect to its current category.
- Common, unambiguous names and spellings MAY redirect: `usa`, `uk`, `turkey`, `e-visa`, `voa`, and similar bounded aliases.
- Routing MUST use stable country codes and curated alias maps. It MUST NOT use fuzzy matching that could silently map an unknown place to the wrong country.
- Both reversed set order and legacy comparison paths MUST resolve to the one curated comparison URL when such a page exists.
- Redirect chains SHOULD be one hop.

### The indexability decision tree

For a passport–destination page:

1. Resolve country aliases to canonical entities.
2. Resolve the live access category.
3. Redirect a stale but recognized category suffix to the current suffix.
4. If active official evidence supports that exact current category, return indexable HTML and include it in the appropriate relationship sitemap.
5. If evidence is pending, conditional, rejected, or does not prove the displayed category, keep the page useful and crawlable but return `noindex,follow` and omit it from every sitemap.
6. If the route does not identify a real relationship, return 404.

Do not block a `noindex` page in `robots.txt`: crawlers need to fetch the page to see the directive. `robots.txt` is for crawl management, not reliable removal from search.

### What the “Excluded by noindex” report means

The 7 September review of the first 1,000 reported URLs found:

- 923 relationship URLs and 77 parameterized tool URLs;
- 154 relationship URLs that are now exact, current, and indexable;
- 90 stale relationship URLs that now redirect to an indexable current status;
- 4 stale URLs that redirect to a current but still unverified status;
- 675 current relationship URLs that correctly remain `noindex`; and
- all 77 query-tool URLs intentionally `noindex` to prevent unbounded duplicate scenarios.

Therefore, “Excluded by noindex” is not automatically an error. Classify the sample first. Fix pages only when the evidence and canonical policy say they should be indexed. Search Console can report an old crawl long after the live response has changed.

## 5. Evidence and content quality

### Evidence rules

Published relationship evidence MUST come from primary official material: government immigration and foreign-ministry sites, legislation, gazettes, treaties, or official electronic-entry portals.

Each evidence record SHOULD preserve:

- the passport and destination scope;
- the status it actually supports;
- source authority, title, and URL;
- effective, publication, and review dates when known;
- passport type and visit-purpose scope;
- conditions and exceptions;
- allowed-stay wording without inventing a numeric duration; and
- an official application route where reviewed.

Model one-to-many official policies once and apply their explicit scope to matching relationships. Do not duplicate a treaty or destination schedule into hundreds of hand-copied assertions.

Keep these concepts separate:

- **access status**: visa-free, ETA, VOA, eVisa, visa, restriction, or citizenship;
- **evidence level**: exact, conditional, rejected, or pending;
- **freshness**: when the official source was last reviewed;
- **citizenship compatibility**: whether another nationality may be retained;
- **citizenship acquisition**: whether a documented route may exist for a particular person.

Conditional evidence is valuable, but it MUST NOT be forced into a rank-grade category. Missing evidence means “not yet independently verified,” not “the access status is false.”

### Editorial rules

Every indexable page SHOULD answer a real question with information unique to its subject.

- Passport pages should state the live rank, mobility score, access breakdown, remaining restrictions, data date, and relevant internal links.
- Destination pages should summarize inbound access and link each passport result to its evidence page.
- Relationship pages should state the current category, evidence state, conditions, timeline, official sources, and application route where available.
- Comparison pages must render live scores, directional wins, equal results, and the complete comparison—not a keyword-only shell.
- Articles should derive an original, reproducible result from the dataset or synthesize official legal sources. They should link to live tools that reproduce the claim.

Travel mobility MUST NOT be presented as a proxy for citizenship quality, eligibility, tax treatment, residence rights, consular protection, or practical attainability. For example, the UAE may be a mathematical mobility complement for a US passport while remaining generally unavailable as an ordinary second-citizenship route. An eligible EU nationality can offer live/work/study rights that a visitor-access score does not measure.

Language collections use official, nationally designated administrative, or working-language status. Widespread second-language use alone is insufficient. That is why the United States is not classified as a Spanish-language country and Morocco is not automatically classified as French-language, while Arabic can be included for Israel under its formal status and substantial recognized use.

### Programmatic pages versus thin pages

Scale is justified when the data answers a distinct question. The relationship matrix qualifies because each pair has a different current category and evidence record. Thousands of generic comparison permutations or lightly paraphrased country articles do not qualify.

Before adding a new indexable page family, require all four:

1. a distinct user intent;
2. non-trivial unique data or official-source analysis;
3. a stable canonical identity; and
4. a maintainable internal-link and refresh path.

If any is missing, keep the feature interactive, API-only, or `noindex` until it matures.

## 6. On-page and structured-data rules

### Titles, descriptions, and headings

- Generated titles MUST pass the shared tested 70-character ceiling. This is a practical response to Bing's warning and snippet truncation risk, not a claim that 70 characters is a universal ranking factor.
- Put the entity and primary intent first. Brand text is expendable when space is tight.
- Passport titles prioritize country, “Passport Rank,” and “Visa-Free.”
- Destination titles prioritize destination and “Visa Requirements.”
- Relationship titles retain both places and the actual access category; use curated abbreviations only when necessary.
- The visible H1 can be more descriptive than the title. Do not compress useful page context merely to make title text fit.
- Meta descriptions should be specific, readable summaries. They do not need to repeat every keyword synonym.
- Preserve `MultiPass Rank` capitalization consistently.

### Canonicals and language metadata

- The apex `https://multipassrank.com` is canonical; `www` permanently redirects to it.
- Each HTML page MUST declare one absolute canonical URL.
- English pages declare `hreflang="en"` and `hreflang="x-default"`.
- Query parameters, fragments, aliases, and `.md` representations MUST NOT create a second indexable version of the same answer.
- Fragments may focus a UI, such as destination passport filters, but MUST NOT be the only way to expose indexable content.
- Do not launch translated page families until query evidence, translation quality, and source maintenance justify them.

### Internal links

- Important navigation MUST be a real `<a href>` in server-rendered HTML, not only a JavaScript click handler.
- Whole access cells are links because both people and agents expect the result—not only its label—to be actionable.
- Passport names, destination names, region links, comparison shortcuts, and evidence cells should use descriptive anchor text.
- An article should link to the exact rank, compare, or improve scenario that reproduces its result.
- Avoid huge interchangeable footer link blocks. Curate useful article and product links and preserve a clear hierarchy.

### Structured data

The site is legitimately interpreted as a dataset. Keep Dataset JSON-LD accurate rather than trying to suppress that classification.

- `Dataset` markup MUST contain a useful `name` and `description`.
- It SHOULD declare `creator`, `publisher`, `license`, canonical URL/identifier, temporal coverage or modification date where accurate, and machine-readable distributions.
- License claims MUST preserve the boundary between original evidence metadata/presentation and upstream or official third-party material.
- Breadcrumb structured data should match visible navigation and canonical URLs.
- Structured data MUST describe visible page content; never add markup solely to trigger a search feature.
- Validate representative templates after schema changes, then inspect the deployed URL.

## 7. Agent and answer-engine interface

AEO is an interface-design problem. Make the reliable answer easy to discover, parse, cite, and refresh.

### Required discovery surfaces

- `/ai` and `/ai.md`: human- and agent-readable usage guide;
- `/llms.txt`: lightweight discovery entry point;
- Markdown alternatives for major pages and every relationship page;
- native Markdown from eligible HTML URLs when a client sends `Accept: text/markdown`;
- same-origin JSON APIs for manifest, passport detail, relationship evidence, compare, improve, combination insights, citizenship policy, and citizenship acquisition;
- HTML `<link rel="alternate">` and HTTP `Link` headers advertising available Markdown and JSON;
- canonical redirects for stale statuses and bounded aliases.

### Answer contract for agents

An agent consuming MultiPass Rank SHOULD:

1. get current codes, snapshot version, and checked date from `/api/v1/manifest`;
2. use ISO alpha-2 codes in API and generated tool URLs;
3. open the relationship API or HTML/Markdown evidence page for a pair-specific claim;
4. report the data-check date;
5. distinguish `exact` from `conditional`, `rejected`, and `pending` evidence;
6. cite the canonical page and, for travel decisions, the official authority;
7. distinguish short-visit access from residence and citizenship law; and
8. warn that entry rules can change and final admission remains with authorities.

The public API and Markdown response must use the same taxonomy and dates as HTML. Representation drift is a correctness bug.

Negotiated Markdown reuses the project's maintained `.md` generators rather than converting rendered HTML. Responses use `Content-Type: text/markdown; charset=utf-8`, include an advisory `x-markdown-tokens` estimate, and declare `Vary: Accept` so HTML and Markdown variants cannot be confused by standards-aware caches. Browsers still receive HTML by default, and explicit `.md` URLs remain the most portable fallback.

### Agent-friendly URL examples

```text
/compare?set=US,CA&set=PT
/compare.md?set=US,CA&set=PT
/rank?set=US,CA&set=PT
/improve?set=US&set=IT&set=IE,PT
/api/v1/visa/US/JP
```

One `set` is one comparison option; comma-separated codes form a combined option. Set order matters for `/improve` but not for selecting the canonical friendly one-to-one comparison.

## 8. Mobile, rendering, and accessibility

Mobile is the primary product surface because it supplies roughly two thirds to three quarters of observed human search activity.

- Serve the same primary content and metadata at the same URL on mobile and desktop.
- Primary data MUST be in server-rendered HTML. Do not require tapping, swiping, or running a large client bundle to reveal the answer.
- Keep React hydration limited to interactions that need state: selection, filtering, comparison, and status refresh.
- Every tested viewport MUST avoid page-level horizontal overflow.
- Comparison results on narrow screens SHOULD use compact cards or a grid that preserves labels and values rather than an inner scroll view with detached headers.
- Interactive targets SHOULD be at least 44 CSS pixels and leave a safe zone around add/select controls to prevent accidental navigation.
- Long country names, set labels, and links must wrap without clipping or ellipsizing while usable space remains.
- The brand, current selection state, primary actions, and data date must remain visible and aligned.
- Mobile and desktop must contain equivalent headings, evidence, structured data, and links even when their layout differs.
- Automated browser coverage MUST include a current desktop viewport and a representative phone viewport.

Accessibility and SEO reinforce each other: semantic headings, real links, labels, visible focus, sufficient contrast, and logical reading order make the content easier for both humans and crawlers to interpret.

## 9. Performance and cache policy

The target is a useful SSR response with minimal critical CSS and JavaScript.

- Prefer Astro/server rendering and small islands over app-wide hydration.
- Keep fonts self-hosted and preload only fonts actually needed above the fold.
- Do not add external font CSS or unnecessary preconnects.
- Treat new global CSS and client dependencies as site-wide performance costs.
- Avoid layout reads immediately after DOM writes; forced reflow on a large matrix is expensive on mobile.
- Images and maps need stable dimensions so they do not shift surrounding content.
- Re-run Lighthouse or an equivalent trace after changes to the base layout, global CSS, fonts, or hydrated components. A score alone is not a diagnosis; verify the tested URL and resource host.

Cloudflare cost and speed are part of discoverability:

- the application reads one atomic `snapshot:current` KV value rather than one key per passport or destination;
- public data responses use Cloudflare edge caching and stale-while-revalidate;
- each Worker isolate keeps a short decoded-snapshot cache;
- sitemaps, matrices, relationship pages, and unknown 404s should be cacheable;
- POST compare/improve responses and user-specific arbitrary scenarios should remain private/no-store where appropriate;
- a crawler request MUST NOT fan out into hundreds of billable KV reads.

The old per-record pattern produced 76.57 million KV reads in one billing month. Any data-model change MUST include a read-amplification review.

## 10. Sitemap rules

`/sitemap.xml` is a sitemap index. It points to:

- `/sitemaps/core.xml`; and
- one relationship sitemap for each of the seven regions.

Splitting is appropriate even below Google's hard limit because it makes large relationship inventory easier to generate, cache, debug, and compare by region. A single sitemap is limited to 50,000 URLs or 50 MB uncompressed; only canonical URLs intended for search results belong in it.

Sitemap invariants:

- use absolute apex-host URLs;
- include each canonical HTML URL once;
- include only current, exact-supported relationship suffixes;
- omit query scenarios, aliases, redirects, APIs, errors, incomplete evidence pages, and Markdown alternatives;
- derive `lastmod` from a meaningful data/content update, not deployment time or cosmetic changes;
- keep every sitemap below protocol limits; and
- submit the sitemap index, not each shard as a substitute for the index.

Sitemaps suggest canonical and crawl priorities; they do not force indexing. Internal links, response directives, content quality, and canonical tags must agree with the sitemap.

## 11. Measurement and prioritization

Use each measurement source for the question it can answer:

| Source | Best use | Main limitation |
| --- | --- | --- |
| Google Search Console | Real Google queries, clicks, impressions, positions, indexing state | Withholds low-volume queries; dimensions have different totals and crawl lag |
| Bing Webmaster Tools | Bing index coverage and template diagnostics | Early samples may expose a shared template problem, not isolated pages |
| Cloudflare AEO/bot exports | What agents fetch and which legitimate routes fail | Includes probes and repeated asset requests; bot snapshots are volatile |
| Plausible | Privacy-friendly aggregate page use and product-flow validation | Does not explain search rank or individual behavior |
| DataForSEO | Bounded keyword validation, aliases, market comparison | Estimated/grouped volume; costs money; low-volume queries are often suppressed |
| Lighthouse/DevTools | Rendering, payload, main-thread, and layout diagnosis | Lab conditions and tested origin matter; the score is not field traffic |

### Priority order

Prefer work in this order:

1. incorrect current data or broken canonical routes;
2. legitimate high-frequency 404s or representation failures;
3. pages with first-party impressions but weak answers or mobile UX;
4. missing official evidence on demanded relationships;
5. a new tool or analysis that produces genuinely new information;
6. a small content experiment validated by first-party or bounded keyword research.

Do not let generic keyword volume outrank product relevance or evidence feasibility.

### Research hygiene

- Record the source, export date, measurement window, country/language market, query form, and API cost.
- Keep clicks, impressions, requests, and keyword estimates as separate units.
- Do not sum overlapping query variants or Search Console dimension totals.
- Compare like-for-like windows before claiming growth.
- Treat crawler user-agent names as signals, not proof of referral traffic or citation.
- Store conclusions in the dated research log and promote only durable rules into this guide.

## 12. Release checklist for humans

### Before implementation

- [ ] Read this guide and the relevant source-of-truth files.
- [ ] State the user intent, canonical URL, index state, sitemap state, and refresh path.
- [ ] Check whether an existing page or representation already answers the intent.
- [ ] Identify the official evidence required for factual or legal claims.
- [ ] Check `git status` and preserve user-owned reports and screenshots.

### Before merge

- [ ] Titles generated by changed templates are at most 70 characters.
- [ ] Canonical, robots, redirect, sitemap, Markdown, and JSON behavior agree.
- [ ] Important links are SSR `<a href>` links with useful anchor text.
- [ ] Dataset and breadcrumb markup match visible content and the license boundary.
- [ ] Mobile has no horizontal overflow, clipped country names, detached table headers, or undersized controls.
- [ ] New global JS, CSS, fonts, images, and KV access have a stated cost.
- [ ] `npm run test:all` passes.
- [ ] `npm run test:e2e` passes when UI, routes, rendering, or metadata changed.

### After deployment

- [ ] Check a representative desktop page and mobile page.
- [ ] Check an HTML page plus its Markdown and JSON alternates.
- [ ] Check one valid canonical, one alias redirect, one stale-status redirect, one `noindex` page, and one 404.
- [ ] Confirm `/robots.txt`, `/sitemap.xml`, and at least one core and relationship shard.
- [ ] Inspect cache, canonical, `Link`, robots, and content-type headers.
- [ ] Record material findings and dated metrics in `docs/seo-research.md`.

## 13. Operating protocol for coding and research agents

An agent working on discoverability MUST follow this sequence:

1. **Orient.** Read this guide, `README.md`, and the specific data/evidence guide relevant to the task.
2. **Inspect.** Run `git status --short`; do not edit, delete, or commit user-supplied CSV exports or screenshots unless explicitly requested.
3. **Classify.** Identify whether the task changes data truth, routing, indexing, presentation, analytics, or only documentation.
4. **Protect invariants.** Preserve stable ISO-backed names, existing canonical URLs, deliberate `noindex` decisions, official-source boundaries, privacy, and low KV read amplification.
5. **Measure first.** Parse supplied exports reproducibly. State dates, denominators, units, and uncertainty. Use DataForSEO only when first-party data cannot answer a bounded question; never expose credentials or raw secrets.
6. **Implement minimally.** Change the shared generator or policy layer when a template class is wrong. Avoid hundreds of manual exceptions.
7. **Test the matrix.** Cover canonical, alias, redirect, index/noindex, sitemap membership, long names, mobile layout, Markdown, JSON, and cache headers as relevant.
8. **Validate evidence.** Run the evidence validator and strong-review gate before promotion. An agent-generated candidate is not published proof.
9. **Verify production.** A local success is insufficient for redirects, headers, Worker cache behavior, or live sitemap inventory.
10. **Document.** Append dated observations to the research log. Update this guide only when the durable policy changes.

Agents MUST NOT:

- index uncertain relationship claims to increase URL count;
- turn a query-parameter space into a sitemap inventory;
- infer citizenship eligibility from passport-access gain;
- describe a non-official catalog as evidence;
- create a redirect for an ambiguous or unknown string;
- make freshness claims by changing dates without substantive review;
- add mass-produced prose or translations solely for search traffic;
- weaken mobile content parity for a cleaner screenshot;
- load secrets or credential files into logs, prompts, patches, or reports; or
- interpret security probes as missing public content.

## 14. Recommended next work

The highest-value work remains evidence and product depth:

1. Finish exact current-status evidence, prioritizing the Middle East, Africa, and Asia by real page/agent demand.
2. Add “where strong passports still need visas” analysis with live relationship links.
3. Quantify complementary versus redundant passport pairs instead of publishing more generic pair pages.
4. Solve regional set-cover questions and the value of passport number two through five.
5. Add mixed-nationality group travel as an intersection calculation, distinct from combined-passport union.
6. Build mobility-change timelines only after enough comparable complete snapshots exist.
7. Expand citizenship retention/acquisition pages only when a substantial current official-source record can answer the actual question.
8. Revisit localization when Search Console shows sustained non-English query demand and the project can maintain high-quality translations and source terminology.

For comparison pages, add a friendly indexable route only when at least one of these is true:

- first-party Search Console or agent demand is visible;
- bounded market research finds a real comparison query or common alias;
- the pair demonstrates a distinctive product concept; or
- a reviewed article needs that comparison as a reproducible result.

## 15. Repository source-of-truth map

| Concern | Source |
| --- | --- |
| Product, data boundary, scoring, deployment | [`README.md`](../README.md) |
| Durable SEO/AEO policy | This document |
| Dated search and agent research | [`docs/seo-research.md`](seo-research.md) |
| Evidence research history and source hierarchy | [`docs/visa-evidence-research.md`](visa-evidence-research.md) |
| Smaller-model evidence handoff | [`docs/visa-evidence-model-handoff.md`](visa-evidence-model-handoff.md) |
| Canonical sitemap inventory | [`src/lib/sitemap.ts`](../src/lib/sitemap.ts) |
| Generated title limits | [`src/lib/seo-titles.ts`](../src/lib/seo-titles.ts) |
| Country names, collections, comparisons | [`src/lib/geography.ts`](../src/lib/geography.ts) |
| Relationship URLs and evidence matching | [`src/lib/visa-evidence.ts`](../src/lib/visa-evidence.ts) |
| Agent-facing instructions | [`src/lib/ai-guide.ts`](../src/lib/ai-guide.ts) |
| Markdown negotiation and route eligibility | [`src/lib/markdown-negotiation.ts`](../src/lib/markdown-negotiation.ts) |
| Canonical/alternate/robots metadata | [`src/layouts/BaseLayout.astro`](../src/layouts/BaseLayout.astro) |
| Edge headers and canonical host | [`src/middleware.ts`](../src/middleware.ts) |
| Crawler access | [`public/robots.txt`](../public/robots.txt) |
| Evidence candidate workflow | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |

## 16. Primary external references

These rules are grounded in observed site data and current primary documentation:

- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google: robots meta tags](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Google: robots.txt is not an indexing control](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: URL structure best practices](https://developers.google.com/search/docs/crawling-indexing/url-structure)
- [Google: crawlable link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: mobile-first indexing best practices](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing)
- [Google: Dataset structured data](https://developers.google.com/search/docs/appearance/structured-data/dataset)
- [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Cloudflare: Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
- [Cloudflare: content negotiation and `Vary`](https://developers.cloudflare.com/workers/cache/#content-negotiation-with-vary)

Re-check external guidance before changing foundational behavior; search-engine documentation and crawler capabilities evolve.
