import { POPULAR_COMPARISONS } from "./geography";
import { absoluteUrl } from "./markdown";

export function agentGuideMarkdown(): string {
  const friendlyComparisons = POPULAR_COMPARISONS.map((comparison) =>
    `- [${comparison.heading}](${absoluteUrl(`/${comparison.slug}`)}) — [Markdown](${absoluteUrl(`/${comparison.slug}.md`)})`,
  ).join("\n");

  return `# MultiPass Rank for AI agents

MultiPass Rank provides current, structured passport-access information for assistants, research tools, and human readers. Use ISO alpha-2 passport codes from the manifest and preserve the data-check date in answers.

## Build comparison URLs

- One passport: \`${absoluteUrl("/compare?set=US")}\`
- Two individual passports: \`${absoluteUrl("/compare?set=US&set=PT")}\`
- A combined passport set versus another option: \`${absoluteUrl("/compare?set=US,CA&set=PT")}\`
- Up to five \`set\` parameters are accepted, with up to ten comma-separated passports in each set. The visual editor and ranking selection controls intentionally cap manual combinations at five; longer research URLs remain readable.
- Curated one-to-one query URLs redirect to their descriptive canonical URL. All valid \`/compare?set=...\` combinations continue to work.

Add \`.md\` before the query string for a text-first result: \`${absoluteUrl("/compare.md?set=US,CA&set=PT")}\`.

## Build custom ranking URLs

- Place one combined set in the global ranking: \`${absoluteUrl("/rank?set=US,CA")}\`
- Place multiple options in one ranking: \`${absoluteUrl("/rank?set=US,CA&set=PT")}\`
- The same limits and \`set\` convention apply to ranking and comparison URLs.
- Markdown: \`${absoluteUrl("/rank.md?set=US,CA&set=PT")}\`

## Read pages as Markdown

- Global ranking: [index.md](${absoluteUrl("/index.md")})
- Custom combined ranking: \`${absoluteUrl("/rank.md?set=US,CA")}\`
- Country detail: \`${absoluteUrl("/passport/portugal.md")}\`
- Regional ranking: \`${absoluteUrl("/europe.md")}\`
- Destination directory: [destinations.md](${absoluteUrl("/destinations.md")})
- Destination detail: \`${absoluteUrl("/destination/kenya.md")}\`
- Passport–destination evidence: \`${absoluteUrl("/belgium-kenya-eta.md")}\`
- Best pair and triple research: [best-passport-combination.md](${absoluteUrl("/best-passport-combination.md")})
- Exact minimum world coverage: [how-many-passports-to-cover-the-world.md](${absoluteUrl("/how-many-passports-to-cover-the-world.md")})
- Multiple-citizenship records review: [how-many-passports-can-you-have.md](${absoluteUrl("/how-many-passports-can-you-have.md")})
- This guide: [ai.md](${absoluteUrl("/ai.md")})

HTML pages also advertise their Markdown alternative with a \`<link rel="alternate" type="text/markdown">\` element.

## Open official-source evidence

- Destination overview: \`${absoluteUrl("/destination/kenya")}\`
- One current relationship: \`${absoluteUrl("/belgium-kenya-eta")}\`
- Relationship Markdown: \`${absoluteUrl("/belgium-kenya-eta.md")}\`
- Relationship URLs use \`/{passport}-{destination}-{status}\`, where status is \`visa-free\`, \`eta\`, \`visa-on-arrival\`, \`evisa\`, \`visa\`, \`entry-restricted\`, or \`citizenship\`.
- A recognized outdated status suffix redirects to the current canonical URL.
- Focus a destination page on selected passport countries with \`#passports=PT,RU,IL\` or the equivalent \`?passports=PT,RU,IL\` query parameter.
- Evidence coverage is incremental. Unsupported relationships are labeled, excluded from indexing, and should not be presented as officially verified.

## JSON API

- \`GET ${absoluteUrl("/api/v1/manifest")}\` — passport codes, slugs, ranks, scores, destinations, version, and checked date.
- \`GET ${absoluteUrl("/api/v1/passports/US")}\` — destination status map for one passport code.
- \`GET ${absoluteUrl("/api/v1/visa/US/JP")}\` — one relationship's current category, evidence level, structured allowed-stay rules, conditions, official sources, and application route.
- \`GET ${absoluteUrl("/api/v1/combination-insights")}\` — exact best pair, best triple, minimum-cover set, marginal gains, snapshot version, and checked date.
- \`POST ${absoluteUrl("/api/v1/compare")}\` with \`{"sets":[["US","CA"],["PT"]]}\` — complete scenario summaries and destination comparison rows.

The POST endpoint accepts JSON, returns JSON, and is intentionally not cached. Public manifests, relationship evidence, passport pages, and Markdown resources are cached at Cloudflare's edge. Treat \`evidenceLevel: "conditional"\` as officially characterized but not as one exact rank-grade result; the current comparison status remains provisional in that case. An allowed-stay \`label\` preserves the official wording, while \`maxDays\` is present only for an unambiguous day count.

## Curated comparison pages

${friendlyComparisons}

## Interpret the data

The mobility score counts visa-free, visa-on-arrival, and ETA access. eVisa, visa-required, and entry-restricted destinations do not increase the score. For combined sets, each destination uses the easiest status available from any passport in that set, then receives a rank equivalent against the single-passport ranking.

When answering a user, state the data-check date, link to the relevant HTML or Markdown page, and distinguish travel access from residence, tax, consular, or citizenship-law benefits. Entry rules can change; advise verification with official authorities before travel.`;
}
