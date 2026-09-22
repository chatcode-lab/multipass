import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { countryProfileCandidateSchema, countryProfileReviewSchema } from "../src/lib/country-profile-schema";
import type { CountryProfileBatch } from "../src/lib/country-profile-schema";
import { compileCountryProfileBatches } from "../src/lib/country-profile-catalog";
import { indicatorCandidateSchema } from "../src/lib/country-indicator-schema";

const [candidatePath, reviewPath, kind, batchId] = process.argv.slice(2);
if (!candidatePath || !reviewPath) throw new Error("Usage: tsx scripts/publish-country-profiles.ts <candidate.json> <review.json> [indicators|topics] [expansion-batch-id]");
if (kind !== "indicators" && !batchId) throw new Error("The legal pilot is immutable. Publish a new reviewed batch with explicit supersedes references instead.");
const raw = await readFile(candidatePath, "utf8");
if (kind && !["indicators", "topics"].includes(kind)) throw new Error("Unknown artifact kind");
const candidate = kind === "indicators" ? indicatorCandidateSchema.parse(JSON.parse(raw)) : countryProfileCandidateSchema.parse(JSON.parse(raw));
const review = countryProfileReviewSchema.parse(JSON.parse(await readFile(reviewPath, "utf8")));
if (review.reviewer === candidate.researcher) throw new Error("Independent review required.");
if (review.candidateSha256 !== createHash("sha256").update(raw).digest("hex")) throw new Error("Candidate changed since review.");
if (review.reviewedAt < candidate.retrievedAt || review.recheckBy <= review.reviewedAt) throw new Error("Invalid review dates.");
if (batchId) {
  if (kind !== "topics" || !/^[a-z0-9-]+$/.test(batchId)) throw new Error("Expansion requires topics and a safe batch ID.");
  if (basename(candidatePath) !== `${batchId}.candidate.json` || basename(reviewPath) !== `${batchId}.review.json`) throw new Error("Batch ID must match its audit filenames.");
  const path = new URL("../src/data/country-profile-expansions.json", import.meta.url);
  const existing = JSON.parse(await readFile(path, "utf8")) as CountryProfileBatch[];
  if (existing.some((batch) => batch.id === batchId)) throw new Error("Batch already published; do not overwrite an approval.");
  const pilot = JSON.parse(await readFile(new URL("../src/data/country-profiles.json", import.meta.url), "utf8")) as CountryProfileBatch;
  const batch = { ...countryProfileCandidateSchema.parse(candidate), review, id: batchId };
  compileCountryProfileBatches([pilot, ...existing, batch]);
  await writeFile(path, `${JSON.stringify([...existing, batch], null, 2)}\n`);
  console.log(`Published approved expansion ${batchId}; retained all prior topics and their reviews. Deployment is separate.`);
} else {
  const path = new URL(`../src/data/${kind === "indicators" ? "country-indicators" : "country-profiles"}.json`, import.meta.url);
  let id: string | undefined;
  if (kind === "indicators") {
    id = basename(candidatePath).replace(/\.candidate\.json$/, "");
    if (!/^[a-z0-9-]+$/.test(id) || basename(candidatePath) !== `${id}.candidate.json` || basename(reviewPath) !== `${id}.review.json`) throw new Error("Indicator audit filenames must share a safe ID.");
    const previous = JSON.parse(await readFile(path, "utf8"));
    const next = indicatorCandidateSchema.parse(candidate);
    if (previous.retrievedAt > next.retrievedAt) throw new Error("Cannot roll indicators back to an older collection.");
    const identities = new Set(next.observations.map((row) => `${row.code}/${row.metric}`));
    if (previous.observations.some((row: { code: string; metric: string }) => !identities.has(`${row.code}/${row.metric}`))) throw new Error("Indicator refresh cannot silently discard a previous collection outcome.");
  }
  await writeFile(path, `${JSON.stringify({ ...candidate, review, ...(id ? { id } : {}) }, null, 2)}\n`);
  console.log(`Published approved ${kind ?? "country-topic"} artifact with ${candidate.sources.length} sources. Deployment is separate.`);
}
