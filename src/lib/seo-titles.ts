import { STATUS_META } from "./passport-shared";
import type { AccessStatus, Destination, PassportSummary } from "./types";

export const MAX_PAGE_TITLE_LENGTH = 70;
const BRAND_SUFFIX = " | MultiPass Rank";

const COMPACT_COUNTRY_NAMES: Record<string, string> = {
  BQ: "Caribbean Netherlands",
  CD: "DR Congo",
  CV: "Cape Verde",
  HK: "Hong Kong",
  MF: "French Saint Martin",
  MO: "Macao",
  PS: "Palestine",
  ST: "São Tomé & Príncipe",
  TW: "Taiwan",
  VC: "St Vincent & Grenadines",
};

function addBrandWhenItFits(title: string): string {
  const branded = `${title}${BRAND_SUFFIX}`;
  return branded.length <= MAX_PAGE_TITLE_LENGTH ? branded : title;
}

export function passportPageTitle(passport: Pick<PassportSummary, "name">): string {
  return addBrandWhenItFits(`${passport.name} Passport Rank & Visa-Free`);
}

export function destinationPageTitle(destination: Pick<Destination, "name">): string {
  return addBrandWhenItFits(`${destination.name} Visa Requirements`);
}

export function comparisonPageTitle(shortTitle: string): string {
  return addBrandWhenItFits(`${shortTitle} Passport Comparison`);
}

export function relationshipPageTitle(
  passport: Pick<PassportSummary, "code" | "name">,
  destination: Pick<Destination, "code" | "name">,
  status: AccessStatus,
): string {
  const accessLabel = STATUS_META[status].label;
  const descriptive = `${passport.name} Passport to ${destination.name}: ${accessLabel}`;
  const descriptiveTitle = addBrandWhenItFits(descriptive);
  if (descriptiveTitle.length <= MAX_PAGE_TITLE_LENGTH) return descriptiveTitle;

  const passportName = COMPACT_COUNTRY_NAMES[passport.code] ?? passport.name;
  const destinationName = COMPACT_COUNTRY_NAMES[destination.code] ?? destination.name;
  const compact = `${passportName} to ${destinationName}: ${accessLabel}`;
  const compactTitle = addBrandWhenItFits(compact);
  if (compactTitle.length <= MAX_PAGE_TITLE_LENGTH) return compactTitle;

  // ISO codes are the stable last-resort form if a future source introduces
  // names too long for the descriptive and curated compact forms.
  return addBrandWhenItFits(`${passport.code} Passport to ${destination.code}: ${accessLabel}`);
}
