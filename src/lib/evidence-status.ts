import {
  CONDITIONAL_VISA_EVIDENCE,
  OFFICIAL_VISA_SOURCES,
  VISA_POLICY_EVIDENCE,
  type ConditionalVisaEvidence,
  type VisaPolicyEvidence,
} from "@/data/visa-evidence";
import { REVIEWED_UNKNOWN_OVERRIDES } from "@/data/reviewed-unknown-overrides";
import { allowedStayApplies, conditionalEvidenceApplies, destinationSlug, policyApplies } from "./visa-evidence";
import type { AccessStatus, PassportAccess, Region, SnapshotManifest } from "./types";

export type EvidenceStatusCell = readonly [
  status: AccessStatus,
  verified: 0 | 1,
  reviewedAtIndex: number,
  policyCount: number,
  sourceCount: number,
  characterized: 0 | 1,
  stayRuleCount: number,
];

export interface EvidenceStatusRegion {
  schemaVersion: 3;
  snapshotVersion: string;
  checkedAt: string;
  asOf: string;
  region: Region;
  dates: string[];
  passports: Array<{
    code: string;
    name: string;
    slug: string;
    region: Region;
  }>;
  destinations: Array<{
    code: string;
    name: string;
    slug: string;
  }>;
  rows: Array<{
    passportCode: string;
    cells: EvidenceStatusCell[];
  }>;
  summary: {
    verified: number;
    characterized: number;
    pending: number;
    total: number;
    percent: number;
    characterizedPercent: number;
  };
  overall: EvidenceCompletionSummary;
}

export type EvidenceCompletionState = "notCovered" | "stale" | "old" | "fresh";

export interface EvidenceCompletionBucket {
  count: number;
  percent: number;
}

export interface EvidenceCompletionSummary {
  asOf: string;
  total: number;
  covered: number;
  percent: number;
  characterized: EvidenceCompletionBucket;
  allowedStay: EvidenceCompletionBucket;
  notCovered: EvidenceCompletionBucket;
  stale: EvidenceCompletionBucket;
  old: EvidenceCompletionBucket;
  fresh: EvidenceCompletionBucket;
}

interface EvidenceAccumulator {
  policyIds: Set<string>;
  sourceIds: Set<string>;
  stayRuleIds: Set<string>;
  reviewedAt?: string;
}

function isPolicyActive(
  policy: Pick<VisaPolicyEvidence | ConditionalVisaEvidence, "effectiveFrom" | "effectiveTo">,
  asOf: string,
): boolean {
  return (!policy.effectiveFrom || policy.effectiveFrom <= asOf)
    && (!policy.effectiveTo || policy.effectiveTo >= asOf);
}

function buildEvidenceByRelationship(
  manifest: SnapshotManifest,
  destinationCodes: Set<string>,
  asOf: string,
): Map<string, EvidenceAccumulator> {
  const sourceById = new Map(OFFICIAL_VISA_SOURCES.map((source) => [source.id, source]));
  const evidenceByRelationship = new Map<string, EvidenceAccumulator>();

  for (const policy of VISA_POLICY_EVIDENCE) {
    if (!isPolicyActive(policy, asOf)) continue;
    for (const destinationCode of policy.destinationCodes) {
      if (!destinationCodes.has(destinationCode)) continue;
      for (const passport of manifest.passports) {
        if (!policyApplies(policy, passport.code, destinationCode)) continue;
        const key = `${passport.code}:${destinationCode}:${policy.status}`;
        const accumulator = evidenceByRelationship.get(key) ?? {
          policyIds: new Set<string>(),
          sourceIds: new Set<string>(),
          stayRuleIds: new Set<string>(),
        };
        accumulator.policyIds.add(policy.id);
        policy.allowedStays?.forEach((rule, index) => {
          if (allowedStayApplies(rule, passport.code)) accumulator.stayRuleIds.add(`${policy.id}:${index}`);
        });
        for (const sourceId of policy.sourceIds) {
          accumulator.sourceIds.add(sourceId);
          const reviewedAt = sourceById.get(sourceId)?.reviewedAt;
          if (reviewedAt && (!accumulator.reviewedAt || reviewedAt > accumulator.reviewedAt)) {
            accumulator.reviewedAt = reviewedAt;
          }
        }
        evidenceByRelationship.set(key, accumulator);
      }
    }
  }

  return evidenceByRelationship;
}

function buildCharacterizationByRelationship(
  manifest: SnapshotManifest,
  destinationCodes: Set<string>,
  asOf: string,
): Map<string, EvidenceAccumulator> {
  const sourceById = new Map(OFFICIAL_VISA_SOURCES.map((source) => [source.id, source]));
  const result = new Map<string, EvidenceAccumulator>();
  const add = (key: string, id: string, sourceIds: readonly string[], reviewedAt?: string) => {
    const accumulator = result.get(key) ?? { policyIds: new Set<string>(), sourceIds: new Set<string>(), stayRuleIds: new Set<string>() };
    accumulator.policyIds.add(id);
    for (const sourceId of sourceIds) {
      accumulator.sourceIds.add(sourceId);
      const date = sourceById.get(sourceId)?.reviewedAt;
      if (date && (!accumulator.reviewedAt || date > accumulator.reviewedAt)) accumulator.reviewedAt = date;
    }
    if (reviewedAt && (!accumulator.reviewedAt || reviewedAt > accumulator.reviewedAt)) accumulator.reviewedAt = reviewedAt;
    result.set(key, accumulator);
  };

  for (const item of CONDITIONAL_VISA_EVIDENCE) {
    if (!isPolicyActive(item, asOf)) continue;
    for (const destinationCode of item.destinationCodes) {
      if (!destinationCodes.has(destinationCode)) continue;
      for (const passport of manifest.passports) {
        if (!conditionalEvidenceApplies(item, passport.code, destinationCode)) continue;
        add(`${passport.code}:${destinationCode}`, item.id, item.sourceIds);
      }
    }
  }
  for (const item of REVIEWED_UNKNOWN_OVERRIDES) {
    if (!destinationCodes.has(item.destinationCode)) continue;
    add(`${item.passportCode}:${item.destinationCode}`, `reviewed-unknown:${item.passportCode}:${item.destinationCode}`, item.sourceIds, item.reviewedAt);
  }
  return result;
}

function completionState(reviewedAt: string | undefined, asOf: string): EvidenceCompletionState {
  if (!reviewedAt) return "notCovered";
  const ageInDays = Math.max(0, Math.floor(
    (Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${reviewedAt}T00:00:00Z`)) / 86_400_000,
  ));
  if (ageInDays <= 30) return "fresh";
  if (ageInDays <= 180) return "old";
  return "stale";
}

function bucket(count: number, total: number): EvidenceCompletionBucket {
  return {
    count,
    percent: total ? Number(((count / total) * 100).toFixed(1)) : 0,
  };
}

export function buildEvidenceCompletionSummary(
  manifest: SnapshotManifest,
  details: Record<string, PassportAccess>,
  asOf = new Date().toISOString().slice(0, 10),
): EvidenceCompletionSummary {
  const evidenceByRelationship = buildEvidenceByRelationship(
    manifest,
    new Set(manifest.destinations.map(({ code }) => code)),
    asOf,
  );
  const characterizationByRelationship = buildCharacterizationByRelationship(
    manifest,
    new Set(manifest.destinations.map(({ code }) => code)),
    asOf,
  );
  const counts: Record<EvidenceCompletionState, number> = {
    notCovered: 0,
    stale: 0,
    old: 0,
    fresh: 0,
  };
  let characterized = 0;
  let allowedStay = 0;

  for (const passport of manifest.passports) {
    for (const destination of manifest.destinations) {
      // The diagonal citizenship/home cells remain visible in the matrix, but
      // completion measures the foreign-access relationships being researched.
      if (passport.code === destination.code) continue;
      const status = details[passport.code]?.statuses[destination.code] ?? "unknown";
      const evidence = evidenceByRelationship.get(`${passport.code}:${destination.code}:${status}`);
      if (evidence?.reviewedAt && evidence.stayRuleIds.size > 0) allowedStay += 1;
      if (!evidence?.reviewedAt && characterizationByRelationship.has(`${passport.code}:${destination.code}`)) characterized += 1;
      counts[completionState(evidence?.reviewedAt, asOf)] += 1;
    }
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const covered = total - counts.notCovered;
  return {
    asOf,
    total,
    covered,
    percent: total ? Number(((covered / total) * 100).toFixed(1)) : 0,
    characterized: bucket(characterized, total),
    allowedStay: bucket(allowedStay, total),
    notCovered: bucket(counts.notCovered, total),
    stale: bucket(counts.stale, total),
    old: bucket(counts.old, total),
    fresh: bucket(counts.fresh, total),
  };
}

export function buildEvidenceStatusRegion(
  manifest: SnapshotManifest,
  details: Record<string, PassportAccess>,
  region: Region,
  asOf = new Date().toISOString().slice(0, 10),
): EvidenceStatusRegion {
  const destinations = manifest.destinations.filter((destination) => destination.region === region);
  const destinationCodes = new Set(destinations.map(({ code }) => code));
  const evidenceByRelationship = buildEvidenceByRelationship(manifest, destinationCodes, asOf);
  const characterizationByRelationship = buildCharacterizationByRelationship(manifest, destinationCodes, asOf);

  const dates = [...new Set([
    ...evidenceByRelationship.values(),
    ...characterizationByRelationship.values(),
  ].flatMap(({ reviewedAt }) => reviewedAt ? [reviewedAt] : []))]
    .sort();
  const dateIndex = new Map(dates.map((date, index) => [date, index]));
  let verified = 0;
  let characterized = 0;
  let pending = 0;
  const rows = manifest.passports.map((passport) => {
    const detail = details[passport.code];
    const cells = destinations.map((destination): EvidenceStatusCell => {
      const status = detail?.statuses[destination.code] ?? "unknown";
      const evidence = evidenceByRelationship.get(`${passport.code}:${destination.code}:${status}`);
      if (!evidence?.reviewedAt) {
        const conditional = characterizationByRelationship.get(`${passport.code}:${destination.code}`);
        if (conditional?.reviewedAt) {
          characterized += 1;
          pending += 1;
          return [
            status,
            0,
            dateIndex.get(conditional.reviewedAt) ?? -1,
            conditional.policyIds.size,
            conditional.sourceIds.size,
            1,
            0,
          ];
        }
        pending += 1;
        return [status, 0, -1, 0, 0, 0, 0];
      }
      verified += 1;
      return [
        status,
        1,
        dateIndex.get(evidence.reviewedAt) ?? -1,
        evidence.policyIds.size,
        evidence.sourceIds.size,
        0,
        evidence.stayRuleIds.size,
      ];
    });
    return { passportCode: passport.code, cells };
  });
  const total = verified + pending;

  return {
    schemaVersion: 3,
    snapshotVersion: manifest.version,
    checkedAt: manifest.checkedAt,
    asOf,
    region,
    dates,
    passports: manifest.passports.map(({ code, name, slug, region: passportRegion }) => ({
      code,
      name,
      slug,
      region: passportRegion,
    })),
    destinations: destinations.map((destination) => ({
      code: destination.code,
      name: destination.name,
      slug: destinationSlug(destination),
    })),
    rows,
    summary: {
      verified,
      characterized,
      pending,
      total,
      percent: total ? Number(((verified / total) * 100).toFixed(1)) : 0,
      characterizedPercent: total ? Number((((verified + characterized) / total) * 100).toFixed(1)) : 0,
    },
    overall: buildEvidenceCompletionSummary(manifest, details, asOf),
  };
}
