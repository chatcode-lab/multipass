import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { VERIFIED_ACCESS_OVERRIDES } from "../src/data/access-overrides";
import { REVIEWED_UNKNOWN_OVERRIDES } from "../src/data/reviewed-unknown-overrides";
import fallbackSnapshot from "../src/data/fallback.json" with { type: "json" };
import queue from "../research/visa-evidence/queue.json" with { type: "json" };
import type { DataSnapshot } from "../src/lib/types";

const code = z.string().regex(/^[A-Z]{2}$/);
const date = z.iso.date();
const httpsUrl = z.url().refine((value) => new URL(value).protocol === "https:", "URL must use HTTPS");
const status = z.enum(["visa_free", "eta", "visa_on_arrival", "evisa", "visa_required", "entry_restricted", "citizenship"]);
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
const allowedStay = z.strictObject({
  label: z.string().min(1),
  basis: z.enum(["per_visit", "per_entry", "rolling_period", "calendar_period", "authority_discretion"]),
  maxDays: z.int().positive().optional(),
  withinDays: z.int().positive().optional(),
  passportCodes: z.array(code).min(1).optional(),
  excludedPassportCodes: z.array(code).min(1).optional(),
  notes: z.array(z.string().min(1)).min(1).optional(),
}).superRefine((item, context) => {
  if (item.withinDays && !item.maxDays) context.addIssue({ code: "custom", message: "withinDays requires maxDays" });
  if (item.withinDays && item.maxDays && item.maxDays > item.withinDays) context.addIssue({ code: "custom", message: "maxDays cannot exceed withinDays" });
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
  allowedStays: z.array(allowedStay).min(1).optional(),
});
const conditionalStatus = z.enum(["visa_free", "eta", "visa_on_arrival", "evisa", "visa_required", "entry_restricted"]);
const conditional = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  reason: z.enum([
    "document_dependent",
    "demographic_dependent",
    "route_dependent",
    "purpose_dependent",
    "authority_discretion",
    "conflicting_official_sources",
    "official_schedule_incomplete",
    "other",
  ]),
  destinationCodes: z.array(code).min(1),
  passportCodes: z.array(code).min(1),
  excludedPassportCodes: z.array(code).min(1).optional(),
  possibleStatuses: z.array(conditionalStatus).min(2),
  announcedOn: date.optional(),
  effectiveFrom: date.optional(),
  effectiveTo: date.optional(),
  conditions: z.array(z.string().min(1)).optional(),
  sourceIds: z.array(z.string()).min(1),
  allowedStays: z.array(allowedStay).min(1).optional(),
  confidence: z.enum(["high", "medium", "low"]),
});
const candidateSchema = z.strictObject({
  batchId: z.string().min(1),
  researchedAt: date,
  sources: z.array(source),
  policies: z.array(policy),
  conditional: z.array(conditional).optional().default([]),
  conflicts: z.array(z.strictObject({
    passportCode: code,
    destinationCode: code,
    snapshotStatus: status,
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
const queueBatch = queue.batches.find(({ id }) => id === candidate.batchId);
const reviewedOverrideByPair = new Map(
  VERIFIED_ACCESS_OVERRIDES.map((item) => [`${item.passportCode}:${item.destinationCode}`, item.status]),
);
const reviewedUnknownByPair = new Map(
  REVIEWED_UNKNOWN_OVERRIDES.map((item) => [`${item.passportCode}:${item.destinationCode}`, item]),
);
const forbiddenDiscoveryHosts = new Set(["wikipedia.org", "www.wikipedia.org", "reddit.com", "www.reddit.com"]);

if (!queueBatch) throw new Error(`Batch ${candidate.batchId} is not in the research queue`);
if (sourceIds.size !== candidate.sources.length) throw new Error("Source IDs must be unique");
if (new Set(candidate.policies.map(({ id }) => id)).size !== candidate.policies.length) throw new Error("Policy IDs must be unique");
if (new Set(candidate.conditional.map(({ id }) => id)).size !== candidate.conditional.length) throw new Error("Conditional evidence IDs must be unique");

const allowedPassportCodes = queueBatch.passportCodes.includes("*")
  ? passportCodes
  : new Set(queueBatch.passportCodes);
const allowedDestinationCodes = queueBatch.destinationCodes.includes("*")
  ? destinationCodes
  : new Set(queueBatch.destinationCodes);
const policyStatusesByPair = new Map<string, Set<z.infer<typeof status>>>();

for (const item of candidate.sources) {
  const words = item.supportingExcerpt.trim().split(/\s+/).length;
  if (words > 25) throw new Error(`${item.id} supportingExcerpt exceeds 25 words`);
  const host = new URL(item.url).hostname;
  if (forbiddenDiscoveryHosts.has(host)) throw new Error(`${item.id} uses a discovery-only host: ${host}`);
}

for (const item of candidate.policies) {
  if (new Set(item.passportCodes).size !== item.passportCodes.length) throw new Error(`${item.id} repeats a passport code`);
  if (new Set(item.destinationCodes).size !== item.destinationCodes.length) throw new Error(`${item.id} repeats a destination code`);
  if (new Set(item.excludedPassportCodes ?? []).size !== (item.excludedPassportCodes ?? []).length) throw new Error(`${item.id} repeats an excluded passport code`);
  if (new Set(item.sourceIds).size !== item.sourceIds.length) throw new Error(`${item.id} repeats a source ID`);
  if (item.effectiveFrom && item.effectiveTo && item.effectiveFrom > item.effectiveTo) throw new Error(`${item.id} has an effectiveFrom date after effectiveTo`);
  for (const value of item.passportCodes) if (!passportCodes.has(value)) throw new Error(`${item.id} has unknown passport code ${value}`);
  for (const value of item.destinationCodes) if (!destinationCodes.has(value)) throw new Error(`${item.id} has unknown destination code ${value}`);
  for (const value of item.excludedPassportCodes ?? []) if (!passportCodes.has(value)) throw new Error(`${item.id} excludes unknown passport code ${value}`);
  for (const value of item.sourceIds) if (!sourceIds.has(value)) throw new Error(`${item.id} references unknown source ${value}`);
  for (const stayRule of item.allowedStays ?? []) {
    for (const value of stayRule.passportCodes ?? []) if (!item.passportCodes.includes(value)) throw new Error(`${item.id} stay rule has out-of-policy passport code ${value}`);
    for (const value of stayRule.excludedPassportCodes ?? []) if (!passportCodes.has(value)) throw new Error(`${item.id} stay rule excludes unknown passport code ${value}`);
  }
  for (const passportCode of item.passportCodes) {
    if (!allowedPassportCodes.has(passportCode)) throw new Error(`${item.id} has out-of-scope passport code ${passportCode}`);
    if (item.excludedPassportCodes?.includes(passportCode)) continue;
    for (const destinationCode of item.destinationCodes) {
      if (!allowedDestinationCodes.has(destinationCode)) throw new Error(`${item.id} has out-of-scope destination code ${destinationCode}`);
      if (item.status === "citizenship" && passportCode !== destinationCode) {
        throw new Error(`${item.id} assigns citizenship to mismatched pair ${passportCode}:${destinationCode}`);
      }
      const pairKey = `${passportCode}:${destinationCode}`;
      const pairStatuses = policyStatusesByPair.get(pairKey) ?? new Set<z.infer<typeof status>>();
      pairStatuses.add(item.status);
      policyStatusesByPair.set(pairKey, pairStatuses);
    }
  }
}

for (const item of candidate.conditional) {
  if (new Set(item.passportCodes).size !== item.passportCodes.length) throw new Error(`${item.id} repeats a passport code`);
  if (new Set(item.destinationCodes).size !== item.destinationCodes.length) throw new Error(`${item.id} repeats a destination code`);
  if (new Set(item.possibleStatuses).size !== item.possibleStatuses.length) throw new Error(`${item.id} repeats a possible status`);
  if (item.effectiveFrom && item.effectiveTo && item.effectiveFrom > item.effectiveTo) throw new Error(`${item.id} has an effectiveFrom date after effectiveTo`);
  for (const value of item.passportCodes) {
    if (!passportCodes.has(value)) throw new Error(`${item.id} has unknown passport code ${value}`);
    if (!allowedPassportCodes.has(value)) throw new Error(`${item.id} has out-of-scope passport code ${value}`);
  }
  for (const value of item.destinationCodes) {
    if (!destinationCodes.has(value)) throw new Error(`${item.id} has unknown destination code ${value}`);
    if (!allowedDestinationCodes.has(value)) throw new Error(`${item.id} has out-of-scope destination code ${value}`);
  }
  for (const value of item.excludedPassportCodes ?? []) if (!passportCodes.has(value)) throw new Error(`${item.id} excludes unknown passport code ${value}`);
  for (const value of item.sourceIds) if (!sourceIds.has(value)) throw new Error(`${item.id} references unknown source ${value}`);
  for (const stayRule of item.allowedStays ?? []) {
    for (const value of stayRule.passportCodes ?? []) if (!item.passportCodes.includes(value)) throw new Error(`${item.id} stay rule has out-of-scope passport code ${value}`);
  }
}

const conflictKeys = new Set<string>();
for (const item of candidate.conflicts) {
  if (!passportCodes.has(item.passportCode) || !destinationCodes.has(item.destinationCode)) throw new Error(`Conflict has an unknown pair ${item.passportCode}:${item.destinationCode}`);
  for (const value of item.sourceIds) if (!sourceIds.has(value)) throw new Error(`Conflict references unknown source ${value}`);
  const pairKey = `${item.passportCode}:${item.destinationCode}`;
  if (conflictKeys.has(pairKey)) throw new Error(`Conflict pair ${pairKey} is repeated`);
  conflictKeys.add(pairKey);
  if (!allowedPassportCodes.has(item.passportCode) || !allowedDestinationCodes.has(item.destinationCode)) throw new Error(`Conflict ${pairKey} is outside the queued scope`);
  const normalizedOfficialStatus = status.safeParse(item.officialStatus);
  if (normalizedOfficialStatus.success && !policyStatusesByPair.get(pairKey)?.has(normalizedOfficialStatus.data)) {
    throw new Error(`Conflict ${pairKey} officialStatus ${item.officialStatus} is not assigned by a policy`);
  }
  if (item.snapshotStatus === item.officialStatus) throw new Error(`Conflict ${pairKey} does not change the snapshot status`);
  const currentStatus = snapshot.passports[item.passportCode]?.statuses[item.destinationCode];
  const reviewedOverride = reviewedOverrideByPair.get(pairKey);
  const reviewedUnknown = reviewedUnknownByPair.get(pairKey);
  const alreadyApplied = (reviewedOverride === currentStatus && item.officialStatus === currentStatus)
    || (currentStatus === "unknown" && reviewedUnknown?.rejectedStatus === item.snapshotStatus);
  if (item.snapshotStatus !== currentStatus && !alreadyApplied) {
    throw new Error(
      `Conflict ${pairKey} has stale snapshotStatus ${item.snapshotStatus}; current fallback is ${currentStatus}`,
    );
  }
}

const unresolvedKeys = new Set<string>();
for (const item of candidate.unresolved) {
  if (!passportCodes.has(item.passportCode) || !destinationCodes.has(item.destinationCode)) throw new Error(`Unresolved item has an unknown pair ${item.passportCode}:${item.destinationCode}`);
  const pairKey = `${item.passportCode}:${item.destinationCode}`;
  if (unresolvedKeys.has(pairKey)) throw new Error(`Unresolved pair ${pairKey} is repeated`);
  unresolvedKeys.add(pairKey);
  if (!allowedPassportCodes.has(item.passportCode) || !allowedDestinationCodes.has(item.destinationCode)) throw new Error(`Unresolved pair ${pairKey} is outside the queued scope`);
  if (policyStatusesByPair.has(pairKey)) throw new Error(`Unresolved pair ${pairKey} is also assigned by a policy`);
}

const requiresCompleteForeignPartition = queueBatch.passportCodes.includes("*")
  && queueBatch.destinationCodes.length === 1
  && candidate.batchId.endsWith("-ordinary-passport-entry-scope");
const requiresCompleteCatalogPartition = queueBatch.passportCodes.includes("*")
  && queueBatch.destinationCodes.length === 1
  && candidate.batchId.endsWith("-complete-visitor-entry-refresh");
if (requiresCompleteForeignPartition || requiresCompleteCatalogPartition) {
  for (const passportCode of allowedPassportCodes) {
    for (const destinationCode of allowedDestinationCodes) {
      if (requiresCompleteForeignPartition && passportCode === destinationCode) continue;
      const pairKey = `${passportCode}:${destinationCode}`;
      if (!policyStatusesByPair.has(pairKey) && !unresolvedKeys.has(pairKey)) throw new Error(`Queued pair ${pairKey} is neither supported nor unresolved`);
    }
  }
}

for (const [pairKey, pairStatuses] of policyStatusesByPair) {
  const [passportCode, destinationCode] = pairKey.split(":");
  const currentStatus = snapshot.passports[passportCode]?.statuses[destinationCode];
  const normalizedCurrentStatus = status.safeParse(currentStatus);
  if (normalizedCurrentStatus.success && pairStatuses.has(normalizedCurrentStatus.data)) continue;
  const reviewedOverride = reviewedOverrideByPair.get(pairKey);
  const unappliedStatuses = [...pairStatuses].filter((officialStatus) => officialStatus !== currentStatus && reviewedOverride !== officialStatus);
  if (unappliedStatuses.length !== 1) continue;
  const conflict = candidate.conflicts.find((item) => `${item.passportCode}:${item.destinationCode}` === pairKey);
  const normalizedConflictStatus = conflict ? status.safeParse(conflict.officialStatus) : undefined;
  if (!conflict || !normalizedConflictStatus?.success || !unappliedStatuses.includes(normalizedConflictStatus.data)) {
    throw new Error(`Supported pair ${pairKey} changes ${currentStatus} to ${unappliedStatuses.join("/")} without a matching conflict`);
  }
}

process.stdout.write(`Validated ${candidate.batchId}: ${candidate.sources.length} sources, ${candidate.policies.length} policies, ${candidate.conditional.length} conditional records, ${candidate.conflicts.length} conflicts, ${candidate.unresolved.length} unresolved.\n`);
