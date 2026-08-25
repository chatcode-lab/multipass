import { OFFICIAL_VISA_SOURCES, VISA_POLICY_EVIDENCE, type OfficialVisaSource, type VisaPolicyEvidence } from "@/data/visa-evidence";
import { getReviewedUnknownOverride, type ReviewedUnknownOverride } from "@/data/reviewed-unknown-overrides";
import type { AccessStatus, Destination, PassportSummary, SnapshotManifest } from "./types";
export {
  destinationSlug,
  resolveDestinationBySlug,
  resolveVisaRelationshipSlug,
  VISA_STATUS_SLUGS,
  visaRelationshipHref,
  visaRelationshipSlug,
  type ResolvedVisaRelationship,
} from "./visa-urls";
const SOURCE_BY_ID = new Map(OFFICIAL_VISA_SOURCES.map((source) => [source.id, source]));

export interface VisaRelationshipEvidence {
  policies: VisaPolicyEvidence[];
  sources: OfficialVisaSource[];
  supportsCurrentStatus: boolean;
  reviewedAt?: string;
  reviewedUnknown?: ReviewedUnknownOverride;
}

export function policyApplies(policy: VisaPolicyEvidence, passportCode: string, destinationCode: string): boolean {
  if (!policy.destinationCodes.includes(destinationCode)) return false;
  if (policy.passportCodes && !policy.passportCodes.includes(passportCode)) return false;
  if (policy.excludedPassportCodes?.includes(passportCode)) return false;
  return true;
}

export function getVisaRelationshipEvidence(
  passportCode: string,
  destinationCode: string,
  currentStatus: AccessStatus,
  asOf = new Date().toISOString().slice(0, 10),
): VisaRelationshipEvidence {
  const reviewedUnknown = currentStatus === "unknown"
    ? getReviewedUnknownOverride(passportCode, destinationCode)
    : undefined;
  const policies = VISA_POLICY_EVIDENCE
    .filter((policy) =>
      policyApplies(policy, passportCode, destinationCode)
      && (policy.status === currentStatus || Boolean(policy.effectiveTo))
    )
    .sort((first, second) => (second.effectiveFrom ?? second.announcedOn ?? "").localeCompare(first.effectiveFrom ?? first.announcedOn ?? ""));
  const sourceIds = new Set([
    ...policies.flatMap((policy) => [...policy.sourceIds]),
    ...(reviewedUnknown?.sourceIds ?? []),
  ]);
  const sources = [...sourceIds].flatMap((id) => {
    const source = SOURCE_BY_ID.get(id);
    return source ? [source] : [];
  });
  const reviewedAt = sources.map((source) => source.reviewedAt).sort().at(-1);
  return {
    policies,
    sources,
    supportsCurrentStatus: policies.some((policy) =>
      policy.status === currentStatus
      && (!policy.effectiveFrom || policy.effectiveFrom <= asOf)
      && (!policy.effectiveTo || policy.effectiveTo >= asOf)
    ),
    reviewedAt,
    reviewedUnknown,
  };
}

export function policiesForDestination(destinationCode: string): VisaPolicyEvidence[] {
  return VISA_POLICY_EVIDENCE
    .filter((policy) => policy.destinationCodes.includes(destinationCode))
    .sort((first, second) => (second.effectiveFrom ?? second.announcedOn ?? "").localeCompare(first.effectiveFrom ?? first.announcedOn ?? ""));
}

export function officialSourcesForPolicies(policies: readonly VisaPolicyEvidence[]): OfficialVisaSource[] {
  const ids = new Set(policies.flatMap((policy) => [...policy.sourceIds]));
  return [...ids].flatMap((id) => {
    const source = SOURCE_BY_ID.get(id);
    return source ? [source] : [];
  });
}

export function evidenceRelationshipPairs(manifest: SnapshotManifest): Array<{ passport: PassportSummary; destination: Destination; status: AccessStatus }> {
  const pairs = new Map<string, { passport: PassportSummary; destination: Destination; status: AccessStatus }>();
  const today = new Date().toISOString().slice(0, 10);
  for (const policy of VISA_POLICY_EVIDENCE) {
    if (policy.effectiveFrom && policy.effectiveFrom > today) continue;
    if (policy.effectiveTo && policy.effectiveTo < today) continue;
    for (const destinationCode of policy.destinationCodes) {
      const destination = manifest.destinations.find((entry) => entry.code === destinationCode);
      if (!destination) continue;
      for (const passport of manifest.passports) {
        if (!policyApplies(policy, passport.code, destinationCode)) continue;
        pairs.set(`${passport.code}:${destinationCode}:${policy.status}`, { passport, destination, status: policy.status });
      }
    }
  }
  return [...pairs.values()];
}
