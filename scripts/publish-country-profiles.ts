import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { countryProfileCandidateSchema, countryProfileReviewSchema } from "../src/lib/country-profile-schema";
import { indicatorCandidateSchema } from "../src/lib/country-indicator-schema";

const [candidatePath, reviewPath, kind] = process.argv.slice(2);
if (!candidatePath || !reviewPath) throw new Error("Usage: tsx scripts/publish-country-profiles.ts <candidate.json> <review.json>");
const raw = await readFile(candidatePath, "utf8");
if (kind && kind !== "indicators") throw new Error("Unknown artifact kind");
const candidate = kind === "indicators" ? indicatorCandidateSchema.parse(JSON.parse(raw)) : countryProfileCandidateSchema.parse(JSON.parse(raw));
const review = countryProfileReviewSchema.parse(JSON.parse(await readFile(reviewPath, "utf8")));
if (review.reviewer === candidate.researcher) throw new Error("Independent review required.");
if (review.candidateSha256 !== createHash("sha256").update(raw).digest("hex")) throw new Error("Candidate changed since review.");
if (review.reviewedAt < candidate.retrievedAt || review.recheckBy <= review.reviewedAt) throw new Error("Invalid review dates.");
await writeFile(new URL(`../src/data/${kind === "indicators" ? "country-indicators" : "country-profiles"}.json`, import.meta.url), `${JSON.stringify({ ...candidate, review }, null, 2)}\n`);
console.log(`Published approved ${kind ?? "country-topic"} artifact with ${candidate.sources.length} sources. Deployment is separate.`);
