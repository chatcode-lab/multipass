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
- Up to five \`set\` parameters are accepted, with up to five comma-separated passports in each set.
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
- This guide: [ai.md](${absoluteUrl("/ai.md")})

HTML pages also advertise their Markdown alternative with a \`<link rel="alternate" type="text/markdown">\` element.

## Open official-source evidence

- Destination overview: \`${absoluteUrl("/destination/kenya")}\`
- One current relationship: \`${absoluteUrl("/belgium-kenya-eta")}\`
- Relationship Markdown: \`${absoluteUrl("/belgium-kenya-eta.md")}\`
- Relationship URLs use \`/{passport}-{destination}-{status}\`, where status is \`visa-free\`, \`eta\`, \`visa-on-arrival\`, \`evisa\`, \`visa\`, or \`citizenship\`.
- A recognized outdated status suffix redirects to the current canonical URL.
- Focus a destination page on selected passport countries with \`#passports=PT,RU,IL\` or the equivalent \`?passports=PT,RU,IL\` query parameter.
- Evidence coverage is incremental. Unsupported relationships are labeled, excluded from indexing, and should not be presented as officially verified.

## JSON API

- \`GET ${absoluteUrl("/api/v1/manifest")}\` — passport codes, slugs, ranks, scores, destinations, version, and checked date.
- \`GET ${absoluteUrl("/api/v1/passports/US")}\` — destination status map for one passport code.
- \`POST ${absoluteUrl("/api/v1/compare")}\` with \`{"sets":[["US","CA"],["PT"]]}\` — complete scenario summaries and destination comparison rows.

The POST endpoint accepts JSON, returns JSON, and is intentionally not cached. Public manifests, passport pages, and Markdown resources are cached at Cloudflare's edge.

## Curated comparison pages

${friendlyComparisons}

## Interpret the data

The mobility score counts visa-free, visa-on-arrival, and ETA access. eVisa and visa-required destinations do not increase the score. For combined sets, each destination uses the easiest status available from any passport in that set, then receives a rank equivalent against the single-passport ranking.

When answering a user, state the data-check date, link to the relevant HTML or Markdown page, and distinguish travel access from residence, tax, consular, or citizenship-law benefits. Entry rules can change; advise verification with official authorities before travel.`;
}
