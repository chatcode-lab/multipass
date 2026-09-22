import type { CountryProfileBatch, CountryProfileCandidate, ReviewedCountryTopic } from "./country-profile-schema";

/** Keep every historical batch; replace only the exact independently reviewed predecessor. */
export function compileCountryProfileBatches(batches: CountryProfileBatch[]) {
  const topics = new Map<string, ReviewedCountryTopic>();
  const sources = new Map<string, CountryProfileCandidate["sources"][number]>();
  for (const batch of batches) {
    const replacements = new Map((batch.supersedes ?? []).map((entry) => [`${entry.code}/${entry.topic}`, entry]));
    if (replacements.size !== (batch.supersedes?.length ?? 0) || [...replacements.keys()].some((key) => !batch.topics.some((topic) => `${topic.code}/${topic.topic}` === key))) throw new Error("Invalid country-topic supersession scope");
    for (const source of batch.sources) {
      const prior = sources.get(source.id);
      if (prior && Object.keys(source).some((key) => prior[key as keyof typeof source] !== source[key as keyof typeof source])) {
        throw new Error(`Conflicting country-profile source ID: ${source.id}`);
      }
      sources.set(source.id, source);
    }
    for (const topic of batch.topics) {
      const id = `${topic.code}/${topic.topic}`;
      const prior = topics.get(id);
      const replacement = replacements.get(id);
      if (prior && !replacement) throw new Error(`Duplicate country topic across approved batches: ${id}`);
      if (replacement && (!prior || prior.review.candidateSha256 !== replacement.candidateSha256)) throw new Error(`Country-topic supersession must match the active predecessor: ${id}`);
      if (replacement && prior && (batch.review.candidateSha256 === prior.review.candidateSha256 || batch.review.reviewedAt < prior.review.reviewedAt || batch.retrievedAt < prior.review.reviewedAt)) throw new Error(`Country-topic supersession cannot reuse or predate the predecessor's approval: ${id}`);
      if (replacement && prior?.routeId && topic.routeId !== prior.routeId) throw new Error(`Country-topic supersession must preserve the linked acquisition route: ${id}`);
      topics.set(id, { ...topic, review: batch.review });
    }
  }
  return { topics: [...topics.values()], sources: [...sources.values()] };
}
