import type { CountryProfileBatch, CountryProfileCandidate, ReviewedCountryTopic } from "./country-profile-schema";

/** Keep each topic tied to its approving batch; reject accidental replacement. */
export function compileCountryProfileBatches(batches: CountryProfileBatch[]) {
  const topics = new Map<string, ReviewedCountryTopic>();
  const sources = new Map<string, CountryProfileCandidate["sources"][number]>();
  for (const batch of batches) {
    for (const source of batch.sources) {
      const prior = sources.get(source.id);
      if (prior && Object.keys(source).some((key) => prior[key as keyof typeof source] !== source[key as keyof typeof source])) {
        throw new Error(`Conflicting country-profile source ID: ${source.id}`);
      }
      sources.set(source.id, source);
    }
    for (const topic of batch.topics) {
      const id = `${topic.code}/${topic.topic}`;
      if (topics.has(id)) throw new Error(`Duplicate country topic across approved batches: ${id}`);
      topics.set(id, { ...topic, review: batch.review });
    }
  }
  return { topics: [...topics.values()], sources: [...sources.values()] };
}
