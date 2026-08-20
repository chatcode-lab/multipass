import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import fallbackSnapshot from "../src/data/fallback.json" with { type: "json" };
import queue from "../research/visa-evidence/queue.json" with { type: "json" };
import type { DataSnapshot } from "../src/lib/types";

const code = z.string().regex(/^[A-Z]{2}$/);
const date = z.iso.date();
const httpsUrl = z.url().refine((value) => new URL(value).protocol === "https:", "URL must use HTTPS");
const status = z.enum(["visa_free", "eta", "visa_on_arrival", "evisa", "visa_required", "citizenship"]);
const source = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  url: httpsUrl,
  publisher: z.string().min(1),
  jurisdiction: z.string().min(1),
  kind: z.enum(["law", "government-guidance", "official-portal", "official-dataset"]),
  language: z.string().min(1),
  reviewedAt: date,
  officialityEvidence: z.string().min(1),
  supportingExcerpt: z.string().min(1),
});
const application = z.strictObject({
  url: httpsUrl,
  label: z.string().min(1),
  processingTime: z.string().min(1).optional(),
  steps: z.array(z.string().min(1)).min(1),
});
const policy = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  status,
  destinationCodes: z.array(code).min(1),
  passportCodes: z.array(code).min(1),
  excludedPassportCodes: z.array(code).min(1).optional(),
  announcedOn: date.optional(),
  effectiveFrom: date.optional(),
  effectiveTo: date.optional(),
  conditions: z.array(z.string().min(1)),
  sourceIds: z.array(z.string()).min(1),
  confidence: z.enum(["high", "medium", "low"]),
  application: application.optional(),
});
const candidateSchema = z.strictObject({
  batchId: z.string().min(1),
  researchedAt: date,
  sources: z.array(source),
  policies: z.array(policy),
  conflicts: z.array(z.strictObject({
    passportCode: code,
    destinationCode: code,
    snapshotStatus: z.string().min(1),
    officialStatus: z.string().min(1),
    explanation: z.string().min(1),
    sourceIds: z.array(z.string()).min(1),
  })),
  unresolved: z.array(z.strictObject({
    passportCode: code,
    destinationCode: code,
    reason: z.string().min(1),
    searchedOfficialDomains: z.array(z.string().min(1)),
  })),
});

const candidatePath = process.argv[2];
if (!candidatePath) throw new Error("Usage: npm run evidence:validate -- <candidate.json>");
const candidate = candidateSchema.parse(JSON.parse(await readFile(resolve(candidatePath), "utf8")));
const snapshot = fallbackSnapshot as DataSnapshot;
const passportCodes = new Set(snapshot.manifest.passports.map(({ code: value }) => value));
const destinationCodes = new Set(snapshot.manifest.destinations.map(({ code: value }) => value));
const sourceIds = new Set(candidate.sources.map(({ id }) => id));
const forbiddenDiscoveryHosts = new Set(["wikipedia.org", "www.wikipedia.org", "reddit.com", "www.reddit.com"]);

if (!queue.batches.some(({ id }) => id === candidate.batchId)) throw new Error(`Batch ${candidate.batchId} is not in the research queue`);
if (sourceIds.size !== candidate.sources.length) throw new Error("Source IDs must be unique");
if (new Set(candidate.policies.map(({ id }) => id)).size !== candidate.policies.length) throw new Error("Policy IDs must be unique");

for (const item of candidate.sources) {
  const words = item.supportingExcerpt.trim().split(/\s+/).length;
  if (words > 25) throw new Error(`${item.id} supportingExcerpt exceeds 25 words`);
  const host = new URL(item.url).hostname;
  if (forbiddenDiscoveryHosts.has(host)) throw new Error(`${item.id} uses a discovery-only host: ${host}`);
}

for (const item of candidate.policies) {
  for (const value of item.passportCodes) if (!passportCodes.has(value)) throw new Error(`${item.id} has unknown passport code ${value}`);
  for (const value of item.destinationCodes) if (!destinationCodes.has(value)) throw new Error(`${item.id} has unknown destination code ${value}`);
  for (const value of item.excludedPassportCodes ?? []) if (!passportCodes.has(value)) throw new Error(`${item.id} excludes unknown passport code ${value}`);
  for (const value of item.sourceIds) if (!sourceIds.has(value)) throw new Error(`${item.id} references unknown source ${value}`);
}

for (const item of candidate.conflicts) {
  if (!passportCodes.has(item.passportCode) || !destinationCodes.has(item.destinationCode)) throw new Error(`Conflict has an unknown pair ${item.passportCode}:${item.destinationCode}`);
  for (const value of item.sourceIds) if (!sourceIds.has(value)) throw new Error(`Conflict references unknown source ${value}`);
}

for (const item of candidate.unresolved) {
  if (!passportCodes.has(item.passportCode) || !destinationCodes.has(item.destinationCode)) throw new Error(`Unresolved item has an unknown pair ${item.passportCode}:${item.destinationCode}`);
}

process.stdout.write(`Validated ${candidate.batchId}: ${candidate.sources.length} sources, ${candidate.policies.length} policies, ${candidate.conflicts.length} conflicts, ${candidate.unresolved.length} unresolved.\n`);
