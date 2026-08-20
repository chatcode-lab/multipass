import {
  ACCESS_STATUSES,
  REGIONS,
  type AccessStatus,
  type ComparisonCell,
  type ComparisonResult,
  type Destination,
  type PassportAccess,
  type PassportSet,
  type PassportSummary,
  type Region,
  type SnapshotManifest,
  type SourceCountry,
  type SourcePassportDetail,
} from "./types";

export const STATUS_META: Record<
  AccessStatus,
  { label: string; shortLabel: string; description: string }
> = {
  citizenship: {
    label: "Citizenship",
    shortLabel: "Home",
    description: "Right of entry as a citizen",
  },
  visa_free: {
    label: "Visa-free",
    shortLabel: "Free",
    description: "No visa required before travel",
  },
  eta: {
    label: "ETA",
    shortLabel: "ETA",
    description: "Advance electronic permission for visa-exempt travel",
  },
  visa_on_arrival: {
    label: "Visa on arrival",
    shortLabel: "VOA",
    description: "Visa available at the border or airport",
  },
  evisa: {
    label: "eVisa",
    shortLabel: "eVisa",
    description: "A visa applied for and issued electronically before travel",
  },
  visa_required: {
    label: "Visa required",
    shortLabel: "Visa",
    description: "Traditional visa required before travel",
  },
  unknown: {
    label: "Unknown",
    shortLabel: "—",
    description: "No validated access record is available",
  },
};

export const ACCESS_EASE_WEIGHT: Record<AccessStatus, number> = {
  citizenship: 5,
  visa_free: 5,
  eta: 4,
  visa_on_arrival: 3,
  evisa: 2,
  visa_required: 1,
  unknown: 0,
};

const SCORED_STATUSES = new Set<AccessStatus>([
  "citizenship",
  "visa_free",
  "eta",
  "visa_on_arrival",
]);

export const MAX_PASSPORT_SETS = 5;
export const MAX_PASSPORTS_PER_SET = 10;

export function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

export function slugifyCountry(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeRegion(value: string): Region {
  const region = value.trim().toUpperCase() as Region;
  if (!REGIONS.includes(region)) {
    throw new Error(`Unsupported region: ${value}`);
  }
  return region;
}

export function buildDestinationCatalog(countries: SourceCountry[]): Destination[] {
  const destinations = countries.map((country) => ({
    code: normalizeCode(country.code),
    name: country.country.trim(),
    region: normalizeRegion(country.region),
  }));

  const uniqueCodes = new Set(destinations.map(({ code }) => code));
  if (destinations.length !== 227 || uniqueCodes.size !== destinations.length) {
    throw new Error(
      `Expected 227 unique destinations, received ${destinations.length} (${uniqueCodes.size} unique)`,
    );
  }

  return destinations.sort((a, b) => a.name.localeCompare(b.name));
}

function assignStatuses(
  target: Record<string, AccessStatus>,
  entries: { code: string }[],
  status: AccessStatus,
): void {
  for (const entry of entries) {
    const code = normalizeCode(entry.code);
    const existing = target[code];
    if (existing && existing !== status) {
      throw new Error(`Destination ${code} appears in both ${existing} and ${status}`);
    }
    target[code] = status;
  }
}

export function normalizePassportDetail(
  detail: SourcePassportDetail,
  destinations: Destination[],
): PassportAccess {
  const code = normalizeCode(detail.code);
  const statuses: Record<string, AccessStatus> = {};

  assignStatuses(statuses, detail.visa_required ?? [], "visa_required");
  assignStatuses(statuses, detail.visa_online ?? [], "evisa");
  assignStatuses(statuses, detail.visa_on_arrival ?? [], "visa_on_arrival");
  assignStatuses(statuses, detail.electronic_travel_authorisation ?? [], "eta");
  assignStatuses(statuses, detail.visa_free_access ?? [], "visa_free");

  const destinationCodes = new Set(destinations.map((destination) => destination.code));
  for (const statusCode of Object.keys(statuses)) {
    if (!destinationCodes.has(statusCode)) {
      throw new Error(`${code} contains unknown destination ${statusCode}`);
    }
  }

  // A few upstream records classify the issuer's own country as visa-free while
  // most omit it. Normalize both shapes to an explicit citizenship status.
  delete statuses[code];

  if (Object.keys(statuses).length !== destinations.length - 1) {
    throw new Error(
      `${code} must contain every non-home destination exactly once; received ${Object.keys(statuses).length}`,
    );
  }

  statuses[code] = "citizenship";
  const mobilityScore = calculateMobilityScore(statuses);

  return {
    code,
    name: detail.country.trim(),
    statuses,
    mobilityScore,
  };
}

export function calculateMobilityScore(statuses: Record<string, AccessStatus>): number {
  const accessible = Object.values(statuses).filter((status) => SCORED_STATUSES.has(status)).length;
  return Math.max(0, accessible - 1);
}

export function buildPassportSummaries(
  countries: SourceCountry[],
  details: Record<string, PassportAccess>,
): PassportSummary[] {
  return buildPassportSummariesFromScores(
    countries,
    Object.fromEntries(Object.entries(details).map(([code, detail]) => [code, detail.mobilityScore])),
  );
}

export function buildPassportSummariesFromScores(
  countries: SourceCountry[],
  scores: Record<string, number>,
): PassportSummary[] {
  const issuers = countries.filter((country) => country.has_data);
  if (issuers.length !== 199) {
    throw new Error(`Expected 199 passport issuers, received ${issuers.length}`);
  }

  const orderedScores = [...new Set(Object.values(scores))].sort((a, b) => b - a);

  return issuers
    .map((country) => {
      const code = normalizeCode(country.code);
      const mobilityScore = scores[code];
      if (mobilityScore === undefined) throw new Error(`Missing normalized passport score for ${code}`);
      return {
        code,
        name: country.country.trim(),
        slug: slugifyCountry(country.country),
        region: normalizeRegion(country.region),
        mobilityScore,
        rank: orderedScores.indexOf(mobilityScore) + 1,
      };
    })
    .sort((a, b) => a.rank - b.rank || b.mobilityScore - a.mobilityScore || a.name.localeCompare(b.name));
}

export function rankEquivalent(score: number, passports: PassportSummary[]): number {
  const higherScores = new Set(
    passports.filter((passport) => passport.mobilityScore > score).map((passport) => passport.mobilityScore),
  );
  return higherScores.size + 1;
}

export function denseRankByScore(scores: Iterable<number>): Map<number, number> {
  return new Map(
    [...new Set(scores)]
      .sort((first, second) => second - first)
      .map((score, index) => [score, index + 1]),
  );
}

export function parsePassportSets(values: string[], validCodes: Set<string>): PassportSet[] {
  return values.slice(0, MAX_PASSPORT_SETS).flatMap((value) => {
    const codes = [...new Set(value.split(",").map(normalizeCode))]
      .filter((code) => validCodes.has(code))
      .slice(0, MAX_PASSPORTS_PER_SET);
    return codes.length > 0 ? [{ codes }] : [];
  });
}

function bestCell(codes: string[], destinationCode: string, details: Record<string, PassportAccess>): ComparisonCell {
  let bestStatus: AccessStatus = "unknown";
  let via: string[] = [];

  for (const code of codes) {
    const status = details[code]?.statuses[destinationCode] ?? "unknown";
    const isPreferredHomeLabel =
      ACCESS_EASE_WEIGHT[status] === ACCESS_EASE_WEIGHT[bestStatus] &&
      status === "citizenship" &&
      bestStatus !== "citizenship";
    if (ACCESS_EASE_WEIGHT[status] > ACCESS_EASE_WEIGHT[bestStatus] || isPreferredHomeLabel) {
      bestStatus = status;
      via = [code];
    } else if (status === bestStatus) {
      via.push(code);
    }
  }

  return { status: bestStatus, via };
}

export function comparePassportSets(
  sets: PassportSet[],
  manifest: SnapshotManifest,
  details: Record<string, PassportAccess>,
): ComparisonResult {
  if (sets.length === 0 || sets.length > MAX_PASSPORT_SETS) {
    throw new Error("Choose between one and five passport sets");
  }

  const summaries = new Map(manifest.passports.map((passport) => [passport.code, passport]));
  for (const set of sets) {
    if (set.codes.length === 0 || set.codes.length > MAX_PASSPORTS_PER_SET) {
      throw new Error("Each set must contain between one and ten passports");
    }
    for (const code of set.codes) {
      if (!summaries.has(code) || !details[code]) throw new Error(`Unknown passport code: ${code}`);
    }
  }

  const rows = manifest.destinations.map((destination) => {
    const cells = sets.map((set) => bestCell(set.codes, destination.code, details));
    return {
      destination,
      cells,
      isEqual: cells.every(
        (cell) => ACCESS_EASE_WEIGHT[cell.status] === ACCESS_EASE_WEIGHT[cells[0]?.status ?? "unknown"],
      ),
    };
  });

  const scenarios = sets.map((set, index) => {
    const cells = rows.map((row) => row.cells[index]);
    const statusCounts = Object.fromEntries(ACCESS_STATUSES.map((status) => [status, 0])) as Record<
      AccessStatus,
      number
    >;
    for (const cell of cells) statusCounts[cell.status] += 1;
    const accessible = cells.filter((cell) => SCORED_STATUSES.has(cell.status)).length;
    const mobilityScore = Math.max(0, accessible - 1);
    const names = set.codes.map((code) => summaries.get(code)?.name ?? code);

    return {
      id: `set-${index + 1}`,
      codes: set.codes,
      name: names.join(" + "),
      mobilityScore,
      rankEquivalent: rankEquivalent(mobilityScore, manifest.passports),
      statusCounts,
    };
  });

  return { scenarios, rows, checkedAt: manifest.checkedAt };
}
