import { slugifyCountry } from "./passport-shared";
import type { AccessStatus, Destination, PassportSummary, SnapshotManifest } from "./types";

export const VISA_STATUS_SLUGS: Record<AccessStatus, string> = {
  citizenship: "citizenship",
  visa_free: "visa-free",
  eta: "eta",
  visa_on_arrival: "visa-on-arrival",
  evisa: "evisa",
  visa_required: "visa",
  entry_restricted: "entry-restricted",
  unknown: "status-unknown",
};

const STATUS_BY_SLUG = new Map(Object.entries(VISA_STATUS_SLUGS).map(([status, slug]) => [slug, status as AccessStatus]));
const STATUS_SLUG_ALIASES: Readonly<Record<string, AccessStatus>> = {
  "e-visa": "evisa",
  "electronic-visa": "evisa",
  "electronic-travel-authorization": "eta",
  "electronic-travel-authorisation": "eta",
  "entry-ban": "entry_restricted",
  "no-visa": "visa_free",
  restricted: "entry_restricted",
  unknown: "unknown",
  "visa-exempt": "visa_free",
  "visa-exemption": "visa_free",
  "visa-on-entry": "visa_on_arrival",
  "visa-required": "visa_required",
  "visa-upon-arrival": "visa_on_arrival",
  voa: "visa_on_arrival",
};
for (const [slug, status] of Object.entries(STATUS_SLUG_ALIASES)) STATUS_BY_SLUG.set(slug, status);

const PASSPORT_SLUG_OVERRIDES: Partial<Record<string, string>> = {
  NR: "nauru",
};
const DESTINATION_SLUG_OVERRIDES: Partial<Record<string, string>> = {
  CD: "congo",
  CG: "republic-of-the-congo",
  NR: "nauru",
};
const COMMON_COUNTRY_SLUG_ALIASES: Partial<Record<string, readonly string[]>> = {
  AE: ["uae"],
  BS: ["bahamas"],
  CI: ["ivory-coast", "cote-divoire"],
  CV: ["cape-verde", "cabo-verde"],
  CZ: ["czech-republic"],
  GB: ["uk", "great-britain", "britain"],
  GM: ["gambia"],
  HK: ["hong-kong", "hong-kong-sar"],
  KN: ["saint-kitts-and-nevis"],
  KR: ["republic-of-korea"],
  MO: ["macau", "macao", "macau-sar-china"],
  NR: ["naoero"],
  PS: ["palestine", "state-of-palestine"],
  RU: ["russia"],
  ST: ["sao-tome-principe"],
  TR: ["turkey"],
  TW: ["taiwan", "chinese-taipei"],
  US: ["usa", "united-states-of-america"],
  VA: ["vatican", "holy-see"],
  VC: ["saint-vincent-and-the-grenadines"],
};
const PASSPORT_SLUG_ALIASES: Partial<Record<string, readonly string[]>> = {
  ...COMMON_COUNTRY_SLUG_ALIASES,
  CD: ["democratic-republic-of-the-congo", "dr-congo", "drc"],
  CG: ["republic-of-the-congo", "congo-republic"],
};
const DESTINATION_LEGACY_SLUGS: Partial<Record<string, readonly string[]>> = {
  MF: ["st-maarten"],
};
const DESTINATION_SLUG_ALIASES: Partial<Record<string, readonly string[]>> = {
  ...COMMON_COUNTRY_SLUG_ALIASES,
  CD: ["congo-dem-rep", "democratic-republic-of-the-congo", "dr-congo", "drc"],
  CG: ["congo-republic"],
};

export interface ResolvedVisaRelationship {
  passport: PassportSummary;
  destination: Destination;
  requestedStatus: AccessStatus;
}

function normalizeRequestedSlug(slug: string): string {
  return slug.trim().toLowerCase().replaceAll("_", "-").replace(/-{2,}/g, "-");
}

function passportSlug(passport: Pick<PassportSummary, "code" | "slug">): string {
  return PASSPORT_SLUG_OVERRIDES[passport.code] ?? passport.slug;
}

function passportSlugs(passport: PassportSummary): string[] {
  return [...new Set([
    passportSlug(passport),
    passport.slug,
    ...(PASSPORT_SLUG_ALIASES[passport.code] ?? []),
  ])];
}

function destinationSlugs(destination: Destination): string[] {
  return [...new Set([
    destinationSlug(destination),
    ...(DESTINATION_LEGACY_SLUGS[destination.code] ?? []),
    ...(DESTINATION_SLUG_ALIASES[destination.code] ?? []),
  ])];
}

export function couldBeVisaRelationshipSlug(slug: string | undefined): boolean {
  if (!slug) return false;
  const normalized = normalizeRequestedSlug(slug);
  return [...STATUS_BY_SLUG.keys()].some((candidate) => normalized.endsWith(`-${candidate}`));
}

export function resolvePassportBySlug(
  slug: string | undefined,
  manifest: SnapshotManifest,
): PassportSummary | undefined {
  if (!slug) return undefined;
  const normalized = normalizeRequestedSlug(slug);
  return manifest.passports.find((passport) => passportSlugs(passport).includes(normalized));
}

export function destinationSlug(destination: Destination): string {
  return DESTINATION_SLUG_OVERRIDES[destination.code] ?? slugifyCountry(destination.name);
}

export function resolveDestinationBySlug(
  slug: string | undefined,
  manifest: SnapshotManifest,
): Destination | undefined {
  if (!slug) return undefined;
  const normalized = normalizeRequestedSlug(slug);
  return manifest.destinations.find((destination) => destinationSlugs(destination).includes(normalized));
}

export function visaRelationshipSlug(
  passport: Pick<PassportSummary, "code" | "slug">,
  destination: Destination,
  status: AccessStatus,
): string {
  return `${passportSlug(passport)}-${destinationSlug(destination)}-${VISA_STATUS_SLUGS[status]}`;
}

export function visaRelationshipHref(
  passport: Pick<PassportSummary, "code" | "slug">,
  destination: Destination,
  status: AccessStatus,
): string {
  if (status === "citizenship") return `/passport/${passportSlug(passport)}`;
  return `/${visaRelationshipSlug(passport, destination, status)}`;
}

export function resolveVisaRelationshipSlug(
  slug: string | undefined,
  manifest: SnapshotManifest,
): ResolvedVisaRelationship | null {
  if (!slug) return null;
  const normalizedSlug = normalizeRequestedSlug(slug);
  const suffix = [...STATUS_BY_SLUG.keys()]
    .sort((first, second) => second.length - first.length)
    .find((candidate) => normalizedSlug.endsWith(`-${candidate}`));
  if (!suffix) return null;
  const requestedStatus = STATUS_BY_SLUG.get(suffix);
  if (!requestedStatus) return null;
  const pairSlug = normalizedSlug.slice(0, -(suffix.length + 1));
  const destinations = new Map<string, Destination>();
  for (const destination of manifest.destinations) {
    for (const candidate of destinationSlugs(destination)) destinations.set(candidate, destination);
  }
  const passportCandidates = manifest.passports
    .flatMap((passport) => passportSlugs(passport).map((passportPath) => ({ passport, passportPath })))
    .sort((first, second) => second.passportPath.length - first.passportPath.length);
  const match = passportCandidates.find(({ passportPath }) =>
    pairSlug.startsWith(`${passportPath}-`)
    && destinations.has(pairSlug.slice(passportPath.length + 1))
  );
  if (!match) return null;
  const destination = destinations.get(pairSlug.slice(match.passportPath.length + 1));
  return destination ? { passport: match.passport, destination, requestedStatus } : null;
}
