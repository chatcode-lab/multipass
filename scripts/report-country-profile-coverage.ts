import { readFileSync } from "node:fs";
import cohort from "../research/country-profiles/top20-cohort-2026-09-17.json";
import nextCohort from "../research/country-profiles/ranks21-40-cohort-2026-09-22.json";
import { countryProfileCandidateSchema, countryProfileReviewSchema } from "../src/lib/country-profile-schema";
import type { CountryProfileBatch } from "../src/lib/country-profile-schema";
import { indicatorCandidateSchema } from "../src/lib/country-indicator-schema";
import { compileCountryProfileBatches } from "../src/lib/country-profile-catalog";
import { createHash } from "node:crypto";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const batches: CountryProfileBatch[] = [read("src/data/country-profiles.json"), ...read("src/data/country-profile-expansions.json")];
for (const batch of batches) {
  const name = batch.id ?? "pilot-2026-09-17";
  const raw = readFileSync(`research/country-profiles/${name}.candidate.json`, "utf8");
  const candidate = countryProfileCandidateSchema.parse(JSON.parse(raw));
  const review = countryProfileReviewSchema.parse(read(`research/country-profiles/${name}.review.json`));
  if (review.reviewer === candidate.researcher || review.candidateSha256 !== createHash("sha256").update(raw).digest("hex")) throw new Error(`Invalid independent approval: ${name}`);
  if (review.reviewedAt < candidate.retrievedAt || review.recheckBy <= review.reviewedAt) throw new Error(`Invalid review dates: ${name}`);
  const { review: storedReview, ...storedCandidate } = batch;
  delete storedCandidate.id;
  if (JSON.stringify(candidate) !== JSON.stringify(storedCandidate) || JSON.stringify(storedReview) !== JSON.stringify(review)) throw new Error(`Published artifact differs from approval: ${name}`);
}
const { topics } = compileCountryProfileBatches(batches);
const { review: indicatorReview, id: indicatorId = "top20-indicators-2026-09-17", ...indicators } = read("src/data/country-indicators.json");
if (!/^[a-z0-9-]+$/.test(indicatorId)) throw new Error("Invalid indicator audit ID");
indicatorCandidateSchema.parse(indicators);
const indicatorRaw = readFileSync(`research/country-profiles/${indicatorId}.candidate.json`, "utf8");
const approvedIndicatorReview = countryProfileReviewSchema.parse(read(`research/country-profiles/${indicatorId}.review.json`));
if (JSON.stringify(indicators) !== JSON.stringify(JSON.parse(indicatorRaw)) || JSON.stringify(indicatorReview) !== JSON.stringify(approvedIndicatorReview) || indicatorReview.reviewer === indicators.researcher || indicatorReview.candidateSha256 !== createHash("sha256").update(indicatorRaw).digest("hex")) throw new Error("Indicator approval does not match bundled observations");
if (indicatorReview.reviewedAt < indicators.retrievedAt || indicatorReview.recheckBy <= indicatorReview.reviewedAt) throw new Error("Invalid indicator review dates");

const args = process.argv.slice(2);
if (args.some((arg) => !["--top20", "--ranks21-40", "--require-complete"].includes(arg)) || (args.includes("--top20") && args.includes("--ranks21-40"))) throw new Error("Usage: profiles:coverage [--top20|--ranks21-40] [--require-complete]");
const passports = args.includes("--top20") ? cohort.passports : args.includes("--ranks21-40") ? nextCohort.passports : [...cohort.passports, ...nextCohort.passports];
if (new Set(passports.map((row) => row.code)).size !== passports.length) throw new Error("Duplicate passport in frozen cohort");
const rows = passports.map((passport) => {
  const missingTopics = cohort.requiredTopics.filter((topic) => !topics.some((entry) => entry.code === passport.code && entry.topic === topic));
  const outcomes = indicators.observations.filter((entry: { code: string }) => entry.code === passport.code);
  const missingIndicators = cohort.requiredIndicators.filter((metric) => !outcomes.some((entry: { metric: string }) => entry.metric === metric));
  return { code: passport.code, rank: passport.rank, missingTopics, missingIndicators, populatedIndicators: outcomes.filter((entry: { availability: string }) => entry.availability === "available").length, unavailableIndicators: outcomes.filter((entry: { availability: string }) => entry.availability !== "available").length };
});
const result = {
  scope: `Frozen live ranks ${args.includes("--top20") ? "1–20" : args.includes("--ranks21-40") ? "21–40" : "1–40"} including every tie; bundled approved content, not production deployment verification.`,
  targetPassports: rows.length,
  targetTopics: rows.length * cohort.requiredTopics.length,
  approvedTopics: rows.reduce((total, row) => total + cohort.requiredTopics.length - row.missingTopics.length, 0),
  profilesWithAllRequiredOutcomes: rows.filter((row) => !row.missingTopics.length && !row.missingIndicators.length).length,
  populatedIndicators: rows.reduce((total, row) => total + row.populatedIndicators, 0),
  unavailableIndicators: rows.reduce((total, row) => total + row.unavailableIndicators, 0),
  missingIndicatorOutcomes: rows.reduce((total, row) => total + row.missingIndicators.length, 0),
  unresolvedLegalFacts: topics.filter((topic) => passports.some((entry) => entry.code === topic.code)).flatMap((topic) => topic.facts.filter((fact) => fact.state === "not_established").map((fact) => `${topic.code}/${topic.topic}/${fact.id}`)),
  retainedIndiaPilot: topics.some((topic) => topic.code === "IN" && topic.topic === "citizenship") && indicators.observations.filter((row: { code: string }) => row.code === "IN").length === 2,
  rows,
};
console.log(JSON.stringify(result, null, 2));
if (args.includes("--require-complete") && (result.profilesWithAllRequiredOutcomes !== passports.length || !result.retainedIndiaPilot)) process.exitCode = 1;
