import {
  CONDITIONAL_VISA_EVIDENCE,
  OFFICIAL_VISA_SOURCES,
  type ConditionalVisaEvidence,
  type OfficialVisaSource,
} from "@/data/visa-evidence";
import { REVIEWED_UNKNOWN_OVERRIDES, type ReviewedUnknownOverride } from "@/data/reviewed-unknown-overrides";
import { evidenceRelationshipPairs, type VisaRelationshipEvidence } from "./visa-evidence";
import type { AccessStatus, Destination, PassportAccess, PassportSummary, Region, SnapshotManifest } from "./types";

const OFFICIAL_SOURCES = new Map(OFFICIAL_VISA_SOURCES.map((source) => [source.id, source]));
type SourceMap = ReadonlyMap<string, OfficialVisaSource>;

export function isCurrentEvidence(
  item: { effectiveFrom?: string; effectiveTo?: string },
  asOf = new Date().toISOString().slice(0, 10),
): boolean {
  return (!item.effectiveFrom || item.effectiveFrom <= asOf)
    && (!item.effectiveTo || item.effectiveTo >= asOf);
}

function hasReviewedSources(ids: readonly string[], sources: SourceMap, asOf: string): boolean {
  return ids.length > 0 && ids.every((id) => {
    const source = sources.get(id);
    return source && source.title.trim() && source.publisher.trim()
      && /^https?:\/\//.test(source.url)
      && /^\d{4}-\d{2}-\d{2}$/.test(source.reviewedAt) && source.reviewedAt <= asOf;
  });
}

function usefulConditional(item: ConditionalVisaEvidence, sources: SourceMap, asOf: string): boolean {
  // These are already reviewed publication records, not research candidates.
  // Require an explanation, actionable conditions, and complete citations;
  // merely having a source URL or a possible status is not enough.
  return Boolean(isCurrentEvidence(item, asOf) && item.title.trim() && item.summary.trim()
    && item.possibleStatuses.length && item.conditions?.some((condition) => condition.trim())
    && hasReviewedSources(item.sourceIds, sources, asOf));
}

function usefulCorrection(item: ReviewedUnknownOverride, sources: SourceMap, asOf: string): boolean {
  return Boolean(item.reason.trim()
    && /^\d{4}-\d{2}-\d{2}$/.test(item.reviewedAt) && item.reviewedAt <= asOf
    && /^\d{4}-\d{2}-\d{2}$/.test(item.recheckBy) && item.recheckBy >= asOf
    && hasReviewedSources(item.sourceIds, sources, asOf));
}

/** Search eligibility is separate from exact-status verification and scoring. */
export function relationshipIsIndexable(
  evidence: VisaRelationshipEvidence,
  asOf = new Date().toISOString().slice(0, 10),
): boolean {
  if (evidence.supportsCurrentStatus) return true;
  const sources = new Map(evidence.sources.map((source) => [source.id, source]));
  return evidence.conditional.some((item) => usefulConditional(item, sources, asOf))
    || Boolean(evidence.reviewedUnknown && usefulCorrection(evidence.reviewedUnknown, sources, asOf));
}

export function indexableRelationshipPairs(
  manifest: SnapshotManifest,
  details: Record<string, PassportAccess>,
  region: Region,
  asOf = new Date().toISOString().slice(0, 10),
): Array<{ passport: PassportSummary; destination: Destination; status: AccessStatus }> {
  const passports = new Map(manifest.passports.filter((passport) => passport.region === region)
    .map((passport) => [passport.code, passport]));
  const destinations = new Map(manifest.destinations.map((destination) => [destination.code, destination]));
  const pairs = new Map<string, { passport: PassportSummary; destination: Destination; status: AccessStatus }>();
  const add = (passportCode: string, destinationCode: string, requiredStatus?: AccessStatus) => {
    const passport = passports.get(passportCode);
    const destination = destinations.get(destinationCode);
    const status = details[passportCode]?.statuses[destinationCode];
    if (!passport || !destination || !status || status === "citizenship") return;
    if (requiredStatus && status !== requiredStatus) return;
    pairs.set(`${passportCode}:${destinationCode}`, { passport, destination, status });
  };

  for (const { passport, destination, status } of evidenceRelationshipPairs(manifest, asOf)) {
    add(passport.code, destination.code, status);
  }
  // Expand policy scopes once instead of re-scanning all policies for every
  // matrix cell on each sitemap request. No additional KV reads are needed.
  for (const item of CONDITIONAL_VISA_EVIDENCE) {
    if (!usefulConditional(item, OFFICIAL_SOURCES, asOf)) continue;
    for (const passportCode of item.passportCodes) {
      if (item.excludedPassportCodes?.includes(passportCode)) continue;
      for (const destinationCode of item.destinationCodes) add(passportCode, destinationCode);
    }
  }
  for (const item of REVIEWED_UNKNOWN_OVERRIDES) {
    if (usefulCorrection(item, OFFICIAL_SOURCES, asOf)) add(item.passportCode, item.destinationCode, "unknown");
  }
  return [...pairs.values()];
}
