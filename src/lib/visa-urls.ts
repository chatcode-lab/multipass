import { slugifyCountry } from "./passport-shared";
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
const DESTINATION_SLUG_OVERRIDES: Partial<Record<string, string>> = {
  CD: "congo",
  CG: "republic-of-the-congo",
};
const DESTINATION_LEGACY_SLUGS: Partial<Record<string, readonly string[]>> = {
  MF: ["st-maarten"],
};

export interface ResolvedVisaRelationship {
  passport: PassportSummary;
  destination: Destination;
  requestedStatus: AccessStatus;
}

export function destinationSlug(destination: Destination): string {
  return DESTINATION_SLUG_OVERRIDES[destination.code] ?? slugifyCountry(destination.name);
}

export function resolveDestinationBySlug(
  slug: string | undefined,
  manifest: SnapshotManifest,
): Destination | undefined {
  if (!slug) return undefined;
  return manifest.destinations.find((destination) =>
    destinationSlug(destination) === slug
    || DESTINATION_LEGACY_SLUGS[destination.code]?.includes(slug)
  );
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

export function resolveVisaRelationshipSlug(
  slug: string | undefined,
  manifest: SnapshotManifest,
): ResolvedVisaRelationship | null {
  if (!slug) return null;
  const suffix = [...STATUS_BY_SLUG.keys()]
    .sort((first, second) => second.length - first.length)
    .find((candidate) => slug.endsWith(`-${candidate}`));
  if (!suffix) return null;
  const requestedStatus = STATUS_BY_SLUG.get(suffix);
  if (!requestedStatus) return null;
  const pairSlug = slug.slice(0, -(suffix.length + 1));
  const destinations = new Map<string, Destination>();
  for (const destination of manifest.destinations) {
    destinations.set(destinationSlug(destination), destination);
    for (const legacySlug of DESTINATION_LEGACY_SLUGS[destination.code] ?? []) {
      destinations.set(legacySlug, destination);
    }
  }
  const passport = [...manifest.passports]
    .sort((first, second) => second.slug.length - first.slug.length)
    .find((candidate) =>
      pairSlug.startsWith(`${candidate.slug}-`)
      && destinations.has(pairSlug.slice(candidate.slug.length + 1))
    );
  if (!passport) return null;
  const destination = destinations.get(pairSlug.slice(passport.slug.length + 1));
  return destination ? { passport, destination, requestedStatus } : null;
}
