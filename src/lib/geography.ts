import type { Destination, PassportSummary, Region } from "./types";

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

export function flagEmojiFor(code: string): string {
  return [...flagCodeFor(code).toUpperCase()]
    .map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65))
    .join("");
}

export function improveHref(sets: readonly (readonly string[])[]): string {
  const params = new URLSearchParams();
  for (const set of sets) {
    if (set.length) params.append("set", set.join(","));
  }
  const query = params.toString();
  return `/improve${query ? `?${query}` : ""}`;
}

// A concise disclosure list of UN M49 / ISO-coded areas that are not modeled
// as separate destinations by the upstream access dataset. Remote uninhabited
// areas are intentionally omitted from this user-facing list.
export const UNTRACKED_DESTINATIONS: readonly Destination[] = [
  { code: "AX", name: "Åland Islands", region: "EUROPE" },
  { code: "BL", name: "Saint Barthélemy", region: "CARIBBEAN" },
  { code: "CC", name: "Cocos (Keeling) Islands", region: "OCEANIA" },
  { code: "CX", name: "Christmas Island", region: "OCEANIA" },
  { code: "EH", name: "Western Sahara", region: "AFRICA" },
  { code: "GG", name: "Guernsey", region: "EUROPE" },
  { code: "IM", name: "Isle of Man", region: "EUROPE" },
  { code: "JE", name: "Jersey", region: "EUROPE" },
  { code: "NF", name: "Norfolk Island", region: "OCEANIA" },
  { code: "PM", name: "Saint Pierre and Miquelon", region: "AMERICAS" },
  { code: "PN", name: "Pitcairn Islands", region: "OCEANIA" },
  { code: "SJ", name: "Svalbard and Jan Mayen", region: "EUROPE" },
  { code: "SX", name: "Sint Maarten (Dutch part)", region: "CARIBBEAN" },
  { code: "TK", name: "Tokelau", region: "OCEANIA" },
  { code: "WF", name: "Wallis and Futuna", region: "OCEANIA" },
] as const;

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

const ARABIC_LANGUAGE_CODES = [
  "AE", "BH", "DJ", "DZ", "EG", "IL", "IQ", "JO", "KM", "KW", "LB", "LY", "MA", "ML",
  "MR", "OM", "PS", "QA", "SA", "SD", "SO", "SY", "TD", "TN", "YE",
] as const;

const FRENCH_LANGUAGE_CODES = [
  "BE", "BJ", "BF", "BI", "CM", "CA", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "GQ",
  "FR", "GA", "GN", "HT", "LU", "MG", "ML", "MC", "NE", "RW", "SN", "SC", "CH", "TG",
  "VU",
] as const;

const PORTUGUESE_LANGUAGE_CODES = [
  "AO", "BR", "CV", "GQ", "GW", "MO", "MZ", "PT", "ST", "TL",
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
    slug: "arabic",
    name: "Arabic-speaking",
    heading: "Arabic-speaking country passports",
    eyebrow: "Passport language group",
    description: "Compare passports from countries and territories where Arabic, or an Arabic variety, has official or formal state-language status.",
    codes: ARABIC_LANGUAGE_CODES,
  },
  {
    slug: "french",
    name: "French-speaking",
    heading: "French-speaking country passports",
    eyebrow: "Passport language group",
    description: "Compare passports from countries where French is an official language or a nationally designated working language.",
    codes: FRENCH_LANGUAGE_CODES,
  },
  {
    slug: "portuguese",
    name: "Portuguese-speaking",
    heading: "Portuguese-speaking country passports",
    eyebrow: "Passport language group",
    description: "Compare passports from Portuguese-language countries and territories, including the nine CPLP states and Macao.",
    codes: PORTUGUESE_LANGUAGE_CODES,
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
  legacySlugs?: readonly string[];
  shortTitle: string;
  heading: string;
  description: string;
  context: string;
  sets: readonly [readonly string[], readonly string[]];
}

export const POPULAR_COMPARISONS: readonly PopularComparison[] = [
  {
    slug: "portugal-vs-united-states-passport",
    shortTitle: "Portugal vs US",
    heading: "Portugal vs United States passport comparison",
    description: "Compare Portugal and United States passport strength, mobility scores, and entry rules for every tracked destination.",
    context: "This comparison is especially useful for US citizens evaluating the practical travel-access dimension of Portuguese or European Union citizenship. It does not cover residence, tax, consular, or citizenship-law differences.",
    sets: [["PT"], ["US"]],
  },
  {
    slug: "united-states-vs-united-kingdom-passport",
    legacySlugs: ["us-vs-uk"],
    shortTitle: "US vs UK",
    heading: "US vs UK passport comparison",
    description: "Compare United States and United Kingdom passport strength, scores, and entry rules for every destination.",
    context: "The destination table makes the practical mobility differences between these two widely held passports explicit, while keeping eVisa and prior-visa requirements separate from easier access.",
    sets: [["US"], ["GB"]],
  },
  {
    slug: "united-states-vs-canada-passport",
    legacySlugs: ["us-vs-canada"],
    shortTitle: "US vs Canada",
    heading: "US vs Canada passport comparison",
    description: "Compare United States and Canadian passport strength, visa-free scores, and destination-level differences.",
    context: "Because the headline scores are close, the destination-level differences are more useful than the global rank alone. Use the differences filter to isolate them.",
    sets: [["US"], ["CA"]],
  },
  {
    slug: "portugal-vs-united-kingdom-passport",
    shortTitle: "Portugal vs UK",
    heading: "Portugal vs United Kingdom passport comparison",
    description: "Compare Portuguese and British passport strength, mobility scores, and destination access in one table.",
    context: "This page focuses on short-stay travel access. European Union movement rights and United Kingdom immigration status are separate legal questions that are not represented by a mobility score.",
    sets: [["PT"], ["GB"]],
  },
  {
    slug: "portugal-vs-spain-passport",
    shortTitle: "Portugal vs Spain",
    heading: "Portugal vs Spain passport comparison",
    description: "Compare Portugal and Spain passport rankings, mobility scores, and destination-by-destination entry rules.",
    context: "Portugal and Spain often sit close in passport rankings. The full access table shows where their current travel rules actually differ.",
    sets: [["PT"], ["ES"]],
  },
  {
    slug: "ireland-vs-united-kingdom-passport",
    shortTitle: "Ireland vs UK",
    heading: "Ireland vs United Kingdom passport comparison",
    description: "Compare Irish and British passport strength, mobility scores, and access rules across every tracked destination.",
    context: "This travel-access comparison does not attempt to score Common Travel Area or European Union citizenship rights; those benefits extend beyond destination entry rules.",
    sets: [["IE"], ["GB"]],
  },
  {
    slug: "brazil-vs-portugal-passport",
    shortTitle: "Brazil vs Portugal",
    heading: "Brazil vs Portugal passport comparison",
    description: "Compare Brazilian and Portuguese passport rankings, mobility scores, and destination access requirements.",
    context: "This page provides a practical travel-access view for a frequently relevant Lusophone comparison. It does not compare eligibility for citizenship or residence.",
    sets: [["BR"], ["PT"]],
  },
  {
    slug: "united-states-vs-singapore-passport",
    shortTitle: "US vs Singapore",
    heading: "United States vs Singapore passport comparison",
    description: "Compare United States and Singapore passport strength, mobility scores, and every destination-level entry difference.",
    context: "Singapore currently leads the single-passport ranking, making this a useful benchmark for the United States. The comparison measures short-visit access only, not whether either citizenship is obtainable.",
    sets: [["US"], ["SG"]],
  },
  {
    slug: "singapore-vs-japan-passport",
    shortTitle: "Singapore vs Japan",
    heading: "Singapore vs Japan passport comparison",
    description: "Compare Singapore and Japan passport ranks, mobility scores, and access requirements for every tracked destination.",
    context: "Both passports sit near the top of the ranking, so their destination-level exceptions are more informative than the small difference between their headline scores.",
    sets: [["SG"], ["JP"]],
  },
  {
    slug: "singapore-vs-malaysia-passport",
    shortTitle: "Singapore vs Malaysia",
    heading: "Singapore vs Malaysia passport comparison",
    description: "Compare Singapore and Malaysia passport strength, global ranks, and destination-by-destination travel access.",
    context: "This neighbouring-country comparison shows where two strong Southeast Asian passports diverge for short visits; it does not compare residence or work rights.",
    sets: [["SG"], ["MY"]],
  },
  {
    slug: "singapore-vs-canada-passport",
    shortTitle: "Singapore vs Canada",
    heading: "Singapore vs Canada passport comparison",
    description: "Compare Singapore and Canadian passport ranks, mobility scores, and current access categories worldwide.",
    context: "The table separates headline strength from the specific destinations where Singaporean and Canadian travellers receive different entry treatment.",
    sets: [["SG"], ["CA"]],
  },
  {
    slug: "canada-vs-australia-passport",
    shortTitle: "Canada vs Australia",
    heading: "Canada vs Australia passport comparison",
    description: "Compare Canadian and Australian passport strength, global ranks, and entry requirements across every destination.",
    context: "Canada and Australia have closely matched mobility profiles. The differences view identifies the comparatively small set of destinations that separates them.",
    sets: [["CA"], ["AU"]],
  },
  {
    slug: "canada-vs-united-kingdom-passport",
    shortTitle: "Canada vs UK",
    heading: "Canada vs United Kingdom passport comparison",
    description: "Compare Canadian and British passport strength, mobility scores, and destination-level visa requirements.",
    context: "This page compares short-stay border access. Commonwealth links, ancestry routes, residence rights, and citizenship eligibility are separate questions.",
    sets: [["CA"], ["GB"]],
  },
  {
    slug: "hong-kong-vs-china-passport",
    shortTitle: "Hong Kong vs China",
    heading: "Hong Kong vs China passport comparison",
    description: "Compare Hong Kong SAR and mainland Chinese passport ranks, mobility scores, and destination access rules.",
    context: "The index treats the HKSAR passport and the People's Republic of China ordinary passport as distinct travel documents. Mainland and Hong Kong entry permits are separate from third-country mobility.",
    sets: [["HK"], ["CN"]],
  },
  {
    slug: "taiwan-vs-china-passport",
    shortTitle: "Taiwan vs China",
    heading: "Taiwan vs China passport comparison",
    description: "Compare Taiwan and China passport ranks, mobility scores, and entry categories for every tracked destination.",
    context: "This page is a travel-document comparison. It does not attempt to resolve political status or replace the special permits used for travel across the Taiwan Strait.",
    sets: [["TW"], ["CN"]],
  },
  {
    slug: "dominica-vs-saint-kitts-and-nevis-passport",
    shortTitle: "Dominica vs St Kitts",
    heading: "Dominica vs Saint Kitts and Nevis passport comparison",
    description: "Compare Dominica and Saint Kitts and Nevis passport ranks, scores, and destination-level entry requirements.",
    context: "The comparison measures current short-visit access only. It does not compare citizenship-by-investment eligibility, due diligence, price, residence, or tax consequences.",
    sets: [["DM"], ["KN"]],
  },
  {
    slug: "germany-vs-united-states-passport",
    shortTitle: "Germany vs US",
    heading: "Germany vs United States passport comparison",
    description: "Compare German and United States passport strength, global ranks, and entry requirements for every tracked destination.",
    context: "The comparison measures short-visit access. European Union movement rights, United States immigration status, and eligibility for either citizenship are separate questions.",
    sets: [["DE"], ["US"]],
  },
  {
    slug: "india-vs-united-states-passport",
    shortTitle: "India vs US",
    heading: "India vs United States passport comparison",
    description: "Compare Indian and United States passport ranks, mobility scores, and destination-by-destination visa requirements.",
    context: "The table shows the substantial difference in short-visit access while preserving each destination's actual category. It does not measure eligibility for citizenship, residence, or work rights.",
    sets: [["IN"], ["US"]],
  },
  {
    slug: "australia-vs-new-zealand-passport",
    shortTitle: "Australia vs New Zealand",
    heading: "Australia vs New Zealand passport comparison",
    description: "Compare Australian and New Zealand passport strength, global ranks, and travel access for every tracked destination.",
    context: "These neighbouring passports have closely matched mobility profiles. The comparison covers short visits, not the separate Trans-Tasman residence and work arrangements.",
    sets: [["AU"], ["NZ"]],
  },
  {
    slug: "australia-vs-united-kingdom-passport",
    shortTitle: "Australia vs UK",
    heading: "Australia vs United Kingdom passport comparison",
    description: "Compare Australian and British passport strength, mobility scores, and destination-level entry requirements.",
    context: "This page compares short-stay border access. Ancestry routes, residence rights, work rights, and citizenship eligibility are outside the mobility score.",
    sets: [["AU"], ["GB"]],
  },
  {
    slug: "ireland-vs-canada-passport",
    shortTitle: "Ireland vs Canada",
    heading: "Ireland vs Canada passport comparison",
    description: "Compare Irish and Canadian passport ranks, mobility scores, and access categories across every tracked destination.",
    context: "The destination table focuses on short visits. European Union rights, Canadian immigration pathways, ancestry, and citizenship eligibility require separate legal analysis.",
    sets: [["IE"], ["CA"]],
  },
  {
    slug: "italy-vs-united-states-passport",
    shortTitle: "Italy vs US",
    heading: "Italy vs United States passport comparison",
    description: "Compare Italian and United States passport strength, rankings, and destination-by-destination entry rules.",
    context: "This is a travel-mobility comparison, not an assessment of Italian citizenship by descent, residence rights, taxation, or whether either citizenship can be acquired.",
    sets: [["IT"], ["US"]],
  },
] as const;

export function getPopularComparison(slug: string | undefined): PopularComparison | undefined {
  return POPULAR_COMPARISONS.find((comparison) =>
    comparison.slug === slug || comparison.legacySlugs?.includes(slug ?? ""),
  );
}

function normalizedSets(sets: readonly (readonly string[])[]): string {
  return sets
    .map((set) => [...set].map((code) => code.toUpperCase()).sort().join(","))
    .sort()
    .join("|");
}

export function getFriendlyComparison(sets: readonly (readonly string[])[]): PopularComparison | undefined {
  if (sets.length !== 2 || sets.some((set) => set.length !== 1)) return undefined;
  const target = normalizedSets(sets);
  return POPULAR_COMPARISONS.find((comparison) => normalizedSets(comparison.sets) === target);
}

export function comparisonHref(sets: readonly (readonly string[])[]): string {
  const friendly = getFriendlyComparison(sets);
  if (friendly) return `/${friendly.slug}`;
  const params = new URLSearchParams();
  for (const set of sets) {
    if (set.length) params.append("set", set.map((code) => code.toUpperCase()).join(","));
  }
  return params.size ? `/compare?${params.toString()}` : "/compare";
}

export function rankHref(sets: readonly (readonly string[])[]): string {
  const params = new URLSearchParams();
  for (const set of sets) {
    if (set.length) params.append("set", set.map((code) => code.toUpperCase()).join(","));
  }
  return params.size ? `/rank?${params.toString()}` : "/rank";
}

export function collectionForRegion(region: Region): PassportCollection | undefined {
  return PASSPORT_COLLECTIONS.find((collection) => collection.region === region);
}

const RELATED_CODES: Partial<Record<string, readonly string[]>> = {
  US: ["PT", "CA", "GB", "IE"],
  GB: ["IE", "PT", "US", "CA"],
  PT: ["US", "BR", "GB", "ES"],
  BR: ["PT", "US", "ES", "AR"],
  CA: ["US", "GB", "PT", "AU"],
  AU: ["NZ", "GB", "US", "CA"],
  IE: ["GB", "US", "PT", "CA"],
  ES: ["PT", "US", "BR", "FR"],
};

const REGION_REFERENCE_CODES: Record<Region, readonly string[]> = {
  AFRICA: ["ZA", "MU", "MA", "US"],
  AMERICAS: ["US", "CA", "BR", "PT"],
  ASIA: ["SG", "JP", "KR", "US"],
  CARIBBEAN: ["BB", "BS", "KN", "US"],
  EUROPE: ["PT", "GB", "DE", "US"],
  "MIDDLE EAST": ["AE", "IL", "TR", "US"],
  OCEANIA: ["AU", "NZ", "GB", "US"],
};

export function relatedPassports(
  passport: PassportSummary,
  passports: readonly PassportSummary[],
  limit = 4,
): PassportSummary[] {
  const comparisonCandidates = POPULAR_COMPARISONS.flatMap(({ sets }) => {
    const [first, second] = sets;
    if (first[0] === passport.code) return [second[0]];
    if (second[0] === passport.code) return [first[0]];
    return [];
  });
  const candidates = [
    ...comparisonCandidates,
    ...(RELATED_CODES[passport.code] ?? []),
    ...REGION_REFERENCE_CODES[passport.region],
  ];
  const byCode = new Map(passports.map((entry) => [entry.code, entry]));
  return [...new Set(candidates)]
    .filter((code) => code !== passport.code && byCode.has(code))
    .slice(0, limit)
    .map((code) => byCode.get(code)!);
}
