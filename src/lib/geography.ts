import type { PassportSummary, Region } from "./types";

export function formatRegion(region: Region): string {
  return region
    .toLowerCase()
    .split(" ")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function flagCodeFor(code: string): string {
  // French West Indies is an upstream aggregate rather than an ISO country.
  return code === "FW" ? "fr" : code.toLowerCase();
}

export interface PassportCollection {
  slug: string;
  name: string;
  heading: string;
  eyebrow: string;
  description: string;
  region?: Region;
  codes?: readonly string[];
}

const ENGLISH_LANGUAGE_CODES = [
  "AG", "AU", "BS", "BB", "BZ", "BW", "BI", "CM", "CA", "DM", "SZ", "FJ", "GM", "GH",
  "GD", "GY", "IN", "IE", "JM", "KE", "KI", "LS", "LR", "MW", "MT", "MH", "MU", "FM",
  "NA", "NR", "NZ", "NG", "PK", "PW", "PG", "PH", "RW", "KN", "LC", "VC", "WS", "SC",
  "SL", "SG", "SB", "ZA", "SS", "SD", "TZ", "TO", "TT", "TV", "UG", "GB", "US", "VU",
  "ZM", "ZW",
] as const;

const SPANISH_LANGUAGE_CODES = [
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "SV", "GQ", "GT", "HN", "MX", "NI",
  "PA", "PY", "PE", "ES", "UY", "VE",
] as const;

const EUROPEAN_UNION_CODES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

export const PASSPORT_COLLECTIONS: readonly PassportCollection[] = [
  {
    slug: "europe",
    name: "Europe",
    heading: "European passport ranking",
    eyebrow: "Regional passport index",
    description: "Compare European passport rankings, mobility scores, and visa-free access in one focused table.",
    region: "EUROPE",
  },
  {
    slug: "africa",
    name: "Africa",
    heading: "African passport ranking",
    eyebrow: "Regional passport index",
    description: "Compare African passport rankings and see which passports offer the broadest visa-free travel access.",
    region: "AFRICA",
  },
  {
    slug: "asia",
    name: "Asia",
    heading: "Asian passport ranking",
    eyebrow: "Regional passport index",
    description: "Explore the Asian passport ranking by mobility score, regional position, and global rank.",
    region: "ASIA",
  },
  {
    slug: "americas",
    name: "Americas",
    heading: "Americas passport ranking",
    eyebrow: "Regional passport index",
    description: "Compare passport strength across North, Central, and South America using a consistent mobility score.",
    region: "AMERICAS",
  },
  {
    slug: "caribbean",
    name: "Caribbean",
    heading: "Caribbean passport ranking",
    eyebrow: "Regional passport index",
    description: "Compare Caribbean passports by visa-free reach, mobility score, and position in the global index.",
    region: "CARIBBEAN",
  },
  {
    slug: "middle-east",
    name: "Middle East",
    heading: "Middle East passport ranking",
    eyebrow: "Regional passport index",
    description: "Compare Middle Eastern passports by practical travel access, regional position, and global rank.",
    region: "MIDDLE EAST",
  },
  {
    slug: "oceania",
    name: "Oceania",
    heading: "Oceania passport ranking",
    eyebrow: "Regional passport index",
    description: "Compare passports from Oceania by mobility score and access without prior visa approval.",
    region: "OCEANIA",
  },
  {
    slug: "english",
    name: "English-speaking",
    heading: "English-speaking country passports",
    eyebrow: "Passport collection",
    description: "Compare passports from countries where English has official or established national administrative status.",
    codes: ENGLISH_LANGUAGE_CODES,
  },
  {
    slug: "spanish",
    name: "Spanish-speaking",
    heading: "Spanish-speaking country passports",
    eyebrow: "Passport collection",
    description: "Compare passports from countries where Spanish is an official national language.",
    codes: SPANISH_LANGUAGE_CODES,
  },
  {
    slug: "european-union",
    name: "European Union",
    heading: "European Union passport ranking",
    eyebrow: "Passport collection",
    description: "Compare the passports of all 27 European Union member states by mobility score and global rank.",
    codes: EUROPEAN_UNION_CODES,
  },
] as const;

export function getPassportCollection(slug: string | undefined): PassportCollection | undefined {
  return PASSPORT_COLLECTIONS.find((collection) => collection.slug === slug);
}

export function passportsInCollection(
  passports: PassportSummary[],
  collection: PassportCollection,
): PassportSummary[] {
  const codes = collection.codes ? new Set<string>(collection.codes) : null;
  return passports.filter((passport) =>
    collection.region ? passport.region === collection.region : codes?.has(passport.code),
  );
}

export interface PopularComparison {
  slug: string;
  shortTitle: string;
  heading: string;
  description: string;
  sets: [string[], string[]];
}

export const POPULAR_COMPARISONS: readonly PopularComparison[] = [
  {
    slug: "us-vs-uk",
    shortTitle: "US vs UK",
    heading: "US vs UK passport comparison",
    description: "Compare United States and United Kingdom passport strength, scores, and entry rules for every destination.",
    sets: [["US"], ["GB"]],
  },
  {
    slug: "us-vs-canada",
    shortTitle: "US vs Canada",
    heading: "US vs Canada passport comparison",
    description: "Compare United States and Canadian passport strength, visa-free scores, and destination-level differences.",
    sets: [["US"], ["CA"]],
  },
] as const;

export function getPopularComparison(slug: string | undefined): PopularComparison | undefined {
  return POPULAR_COMPARISONS.find((comparison) => comparison.slug === slug);
}
