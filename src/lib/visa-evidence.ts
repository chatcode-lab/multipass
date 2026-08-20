import { OFFICIAL_VISA_SOURCES, VISA_POLICY_EVIDENCE, type OfficialVisaSource, type VisaPolicyEvidence } from "@/data/visa-evidence";
import { slugifyCountry } from "./passport";
import type { AccessStatus, Destination, PassportSummary, SnapshotManifest } from "./types";

export const VISA_STATUS_SLUGS: Record<AccessStatus, string> = {
  citizenship: "citizenship",
  visa_free: "visa-free",
  eta: "eta",
  visa_on_arrival: "visa-on-arrival",
  evisa: "evisa",
  visa_required: "visa",
  unknown: "status-unknown",
};

const STATUS_BY_SLUG = new Map(Object.entries(VISA_STATUS_SLUGS).map(([status, slug]) => [slug, status as AccessStatus]));
const SOURCE_BY_ID = new Map(OFFICIAL_VISA_SOURCES.map((source) => [source.id, source]));
const DESTINATION_SLUG_OVERRIDES: Partial<Record<string, string>> = {
  CD: "congo",
  CG: "republic-of-the-congo",
};

export interface ResolvedVisaRelationship {
  passport: PassportSummary;
  destination: Destination;
  requestedStatus: AccessStatus;
}

export interface VisaRelationshipEvidence {
  policies: VisaPolicyEvidence[];
  sources: OfficialVisaSource[];
  supportsCurrentStatus: boolean;
  reviewedAt?: string;
}

export function destinationSlug(destination: Destination): string {
  return DESTINATION_SLUG_OVERRIDES[destination.code] ?? slugifyCountry(destination.name);
}

export function visaRelationshipSlug(
  passport: Pick<PassportSummary, "slug">,
  destination: Destination,
  status: AccessStatus,
): string {
  return `${passport.slug}-${destinationSlug(destination)}-${VISA_STATUS_SLUGS[status]}`;
}

export function visaRelationshipHref(
  passport: Pick<PassportSummary, "slug">,
  destination: Destination,
  status: AccessStatus,
): string {
  if (status === "citizenship") return `/passport/${passport.slug}`;
  return `/${visaRelationshipSlug(passport, destination, status)}`;
}

export function resolveVisaRelationshipSlug(slug: string | undefined, manifest: SnapshotManifest): ResolvedVisaRelationship | null {
  if (!slug) return null;
  const suffix = [...STATUS_BY_SLUG.keys()]
    .sort((first, second) => second.length - first.length)
    .find((candidate) => slug.endsWith(`-${candidate}`));
  if (!suffix) return null;
  const requestedStatus = STATUS_BY_SLUG.get(suffix);
  if (!requestedStatus) return null;
  const pairSlug = slug.slice(0, -(suffix.length + 1));
  const destinations = new Map(manifest.destinations.map((destination) => [destinationSlug(destination), destination]));
  const passport = [...manifest.passports]
    .sort((first, second) => second.slug.length - first.slug.length)
    .find((candidate) => pairSlug.startsWith(`${candidate.slug}-`) && destinations.has(pairSlug.slice(candidate.slug.length + 1)));
  if (!passport) return null;
  const destination = destinations.get(pairSlug.slice(passport.slug.length + 1));
  return destination ? { passport, destination, requestedStatus } : null;
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
  const policies = VISA_POLICY_EVIDENCE
    .filter((policy) =>
      policyApplies(policy, passportCode, destinationCode)
      && (policy.status === currentStatus || Boolean(policy.effectiveTo))
    )
    .sort((first, second) => (second.effectiveFrom ?? second.announcedOn ?? "").localeCompare(first.effectiveFrom ?? first.announcedOn ?? ""));
  const sourceIds = new Set(policies.flatMap((policy) => [...policy.sourceIds]));
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
