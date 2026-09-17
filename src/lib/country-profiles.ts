import artifact from "../data/country-profiles.json";
import expansions from "../data/country-profile-expansions.json";
import type { CountryProfileBatch, CountryTopic, ReviewedCountryTopic } from "./country-profile-schema";
import { compileCountryProfileBatches } from "./country-profile-catalog";
import { absoluteUrl, escapeMarkdown } from "./markdown";
import { countryIndicators, INDICATOR_REVIEW, INDICATOR_SCOPE } from "./country-indicators";

// Approved, bundled content: no upstream fetch or per-field KV reads.
export const COUNTRY_PROFILE_BATCHES = [artifact, ...expansions] as CountryProfileBatch[];
const catalog = compileCountryProfileBatches(COUNTRY_PROFILE_BATCHES);
export const COUNTRY_TOPICS = catalog.topics;
export const COUNTRY_PROFILE_SOURCES = catalog.sources;
export const PROFILE_CACHE_CONTROL = "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800";
export const TOPIC_LABELS = { citizenship: "Citizenship requirements", taxes: "Tax residence & income" } as const;
export const PROFILE_DISCLAIMERS = {
  citizenship: "General information, not legal advice or a finding of eligibility. Requirements depend on the route, applicant and filing date. Verify the official instructions before applying.",
  taxes: "General information, not personal tax advice. Nationality, tax residence and source of income are different questions. Consult the tax authority or a qualified adviser for your circumstances.",
} as const;

export function countryTopics(code: string): ReviewedCountryTopic[] {
  return COUNTRY_TOPICS.filter((entry) => entry.code === code);
}

export function countryTopic(code: string, topic: string | undefined): ReviewedCountryTopic | undefined {
  return countryTopics(code).find((entry) => entry.topic === topic);
}

export function countryTopicSources(topic: CountryTopic) {
  const ids = new Set(topic.facts.flatMap((fact) => fact.sourceIds));
  return COUNTRY_PROFILE_SOURCES.filter((source) => ids.has(source.id));
}

export function countryTopicHref(slug: string, topic: CountryTopic["topic"]): string {
  return `/passport/${slug}/${topic}`;
}

export function countryProfileJson(code: string, slug: string) {
  const topics = countryTopics(code);
  const observations = countryIndicators(code);
  const reviews = [...new Map(topics.map((topic) => [topic.review.candidateSha256, topic.review])).values()];
  const ids = new Set(topics.flatMap((entry) => entry.facts.flatMap((fact) => fact.sourceIds)));
  return {
    schemaVersion: 1, passportCode: code, passportUrl: absoluteUrl(`/passport/${slug}`),
    scope: "Selected country-topic summaries; not a complete account of citizenship law or personal tax liability. These facts do not change mobility scores.",
    // Retained topics carry their original review; a new tax batch does not
    // silently refresh a country's citizenship facts or the rest of the catalog.
    review: reviews.length === 1 ? reviews[0] : null,
    reviewScope: "A common review is provided only when all topics share one approval. Otherwise consult each topic's review; no collection means no review.",
    reviews,
    coverage: { citizenship: topics.some((topic) => topic.topic === "citizenship") ? "reviewed_scope" : "not_collected", taxes: topics.some((topic) => topic.topic === "taxes") ? "reviewed_scope" : "not_collected" },
    topics: topics.map((topic) => ({ ...topic, url: absoluteUrl(countryTopicHref(slug, topic.topic)), disclaimer: PROFILE_DISCLAIMERS[topic.topic] })),
    sources: COUNTRY_PROFILE_SOURCES.filter((source) => ids.has(source.id)),
    indicators: { scope: INDICATOR_SCOPE, review: observations.length ? INDICATOR_REVIEW : null, coverage: observations.length ? "reviewed_scope" : "not_collected", observations },
  };
}

export function countryTopicMarkdown(topic: ReviewedCountryTopic, slug: string): string {
  const sources = countryTopicSources(topic);
  const sourceLink = (id: string) => {
    const source = sources.find((entry) => entry.id === id)!;
    return `[${escapeMarkdown(source.publisher)}: ${escapeMarkdown(source.title)}](${source.url})`;
  };
  return `# ${topic.title}

${topic.summary}

Scope: ${topic.scope}

Jurisdiction: ${topic.jurisdiction}. Sources reviewed ${topic.review.reviewedAt}; review due ${topic.review.recheckBy}.

${PROFILE_DISCLAIMERS[topic.topic]}

${topic.facts.map((fact) => `## ${fact.label}\n\n${fact.text}\n\nEvidence: ${fact.state.replaceAll("_", " ")}. ${fact.sourceIds.map(sourceLink).join("; ")}. Source location: ${fact.locator}.${fact.effectiveFrom ? ` Effective from ${fact.effectiveFrom}.` : ""}`).join("\n\n")}

## Scope and limitations

${topic.limits.map((limit) => `- ${limit}`).join("\n")}

## Explore this passport

- [Passport rank and travel access](${absoluteUrl(`/passport/${slug}`)})
${countryTopics(topic.code).filter((entry) => entry.topic !== topic.topic).map((entry) => `- [${TOPIC_LABELS[entry.topic]}](${absoluteUrl(countryTopicHref(slug, entry.topic))})`).join("\n")}
- [Country-profile JSON, including sources and scoped requirements](${absoluteUrl(`/api/v1/country-profiles/${topic.code}`)})
- [Multiple-citizenship policy guide](${absoluteUrl("/dual-citizenship-countries")})

[Canonical page](${absoluteUrl(countryTopicHref(slug, topic.topic))})`;
}

export function countryTopicLinksMarkdown(code: string, slug: string): string {
  const topics = countryTopics(code);
  return topics.length ? `## Citizenship and tax context\n\nSeparate from travel access and mobility rank.\n\n${topics.map((topic) => `- [${topic.title}](${absoluteUrl(countryTopicHref(slug, topic.topic))}) — ${topic.summary}`).join("\n")}\n\n` : "";
}
