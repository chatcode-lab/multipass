import { OFFICIAL_VISA_SOURCES, VISA_POLICY_EVIDENCE, type VisaPolicyEvidence } from "@/data/visa-evidence";
import { destinationSlug, policyApplies } from "./visa-evidence";
import type { AccessStatus, PassportAccess, Region, SnapshotManifest } from "./types";

export type EvidenceStatusCell = readonly [
  status: AccessStatus,
  verified: 0 | 1,
  reviewedAtIndex: number,
  policyCount: number,
  sourceCount: number,
];

export interface EvidenceStatusRegion {
  schemaVersion: 1;
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
    pending: number;
    total: number;
    percent: number;
  };
}

interface EvidenceAccumulator {
  policyIds: Set<string>;
  sourceIds: Set<string>;
  reviewedAt?: string;
}

function isPolicyActive(
  policy: VisaPolicyEvidence,
  asOf: string,
): boolean {
  return (!policy.effectiveFrom || policy.effectiveFrom <= asOf)
    && (!policy.effectiveTo || policy.effectiveTo >= asOf);
}

export function buildEvidenceStatusRegion(
  manifest: SnapshotManifest,
  details: Record<string, PassportAccess>,
  region: Region,
  asOf = new Date().toISOString().slice(0, 10),
): EvidenceStatusRegion {
  const destinations = manifest.destinations.filter((destination) => destination.region === region);
  const destinationCodes = new Set(destinations.map(({ code }) => code));
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
        };
        accumulator.policyIds.add(policy.id);
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

  const dates = [...new Set([...evidenceByRelationship.values()].flatMap(({ reviewedAt }) => reviewedAt ? [reviewedAt] : []))]
    .sort();
  const dateIndex = new Map(dates.map((date, index) => [date, index]));
  let verified = 0;
  let pending = 0;
  const rows = manifest.passports.map((passport) => {
    const detail = details[passport.code];
    const cells = destinations.map((destination): EvidenceStatusCell => {
      const status = detail?.statuses[destination.code] ?? "unknown";
      const evidence = evidenceByRelationship.get(`${passport.code}:${destination.code}:${status}`);
      if (!evidence?.reviewedAt) {
        pending += 1;
        return [status, 0, -1, 0, 0];
      }
      verified += 1;
      return [
        status,
        1,
        dateIndex.get(evidence.reviewedAt) ?? -1,
        evidence.policyIds.size,
        evidence.sourceIds.size,
      ];
    });
    return { passportCode: passport.code, cells };
  });
  const total = verified + pending;

  return {
    schemaVersion: 1,
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
      pending,
      total,
      percent: total ? Number(((verified / total) * 100).toFixed(1)) : 0,
    },
  };
}
