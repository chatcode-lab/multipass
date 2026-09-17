import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { countryProfileCandidateSchema, countryProfileReviewSchema } from "../src/lib/country-profile-schema";
import type { CountryProfileBatch } from "../src/lib/country-profile-schema";
import { compileCountryProfileBatches } from "../src/lib/country-profile-catalog";
import { indicatorCandidateSchema } from "../src/lib/country-indicator-schema";

const [candidatePath, reviewPath, kind, batchId] = process.argv.slice(2);
if (!candidatePath || !reviewPath) throw new Error("Usage: tsx scripts/publish-country-profiles.ts <candidate.json> <review.json> [indicators|topics] [expansion-batch-id]");
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
  if (kind !== "indicators") {
    const existing = JSON.parse(await readFile(new URL("../src/data/country-profile-expansions.json", import.meta.url), "utf8")) as CountryProfileBatch[];
    compileCountryProfileBatches([{ ...countryProfileCandidateSchema.parse(candidate), review }, ...existing]);
  }
  await writeFile(path, `${JSON.stringify({ ...candidate, review }, null, 2)}\n`);
  console.log(`Published approved ${kind ?? "country-topic"} artifact with ${candidate.sources.length} sources. Deployment is separate.`);
}
