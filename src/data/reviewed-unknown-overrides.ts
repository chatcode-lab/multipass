import type { AccessStatus } from "@/lib/types";

export interface ReviewedUnknownOverride {
  passportCode: string;
  destinationCode: string;
  rejectedStatus: Exclude<AccessStatus, "citizenship" | "unknown">;
  reason: string;
  sourceIds: readonly string[];
  reviewedAt: string;
  recheckBy: string;
}

/**
 * Exact relationships where current official evidence disproves the imported
 * category but does not establish one passport-wide replacement. These remain
 * pending in evidence coverage and must never be treated as verified policies.
 */
export const REVIEWED_UNKNOWN_OVERRIDES: readonly ReviewedUnknownOverride[] = [
  {
    passportCode: "XK",
    destinationCode: "AZ",
    rejectedStatus: "evisa",
    reason: "Azerbaijan limits ASAN eVisa issuance to its current Foreign Ministry-approved country list, which does not include Kosovo. The available official material does not establish a different ordinary Kosovo-passport visitor route.",
    sourceIds: [
      "azerbaijan-asan-current-evisa-country-list-2026",
      "azerbaijan-asan-current-evisa-conditions",
    ],
    reviewedAt: "2026-08-25",
    recheckBy: "2026-11-25",
  },
  {
    passportCode: "DZ",
    destinationCode: "TR",
    rejectedStatus: "evisa",
    reason: "Türkiye's current rule splits Algerian ordinary-passport holders by age between visa-free, visa-required, and condition-dependent eVisa routes. No single passport-wide category is accurate.",
    sourceIds: ["turkiye-mfa-current-algeria-ordinary-visitor-regime-2026"],
    reviewedAt: "2026-08-24",
    recheckBy: "2026-11-24",
  },
  {
    passportCode: "EG",
    destinationCode: "TR",
    rejectedStatus: "evisa",
    reason: "Türkiye's current rule splits Egyptian ordinary-passport holders by age and qualifying documents between unconditional eVisa, conditional eVisa, and visa-required routes. No single passport-wide category is accurate.",
    sourceIds: ["turkiye-mfa-current-egypt-ordinary-visitor-regime-2026"],
    reviewedAt: "2026-08-24",
    recheckBy: "2026-11-24",
  },
  {
    passportCode: "IQ",
    destinationCode: "TR",
    rejectedStatus: "evisa",
    reason: "Türkiye exempts Iraqi ordinary-passport holders under 15 and over 50, while ages 15–50 require a visa and qualify for eVisa only with specified third-country documents. No single passport-wide category is accurate.",
    sourceIds: ["turkiye-mfa-current-iraq-ordinary-visitor-regime-2026"],
    reviewedAt: "2026-08-24",
    recheckBy: "2026-11-24",
  },
  {
    passportCode: "LY",
    destinationCode: "TR",
    rejectedStatus: "evisa",
    reason: "Türkiye exempts Libyan ordinary-passport holders under 16 and over 45, while ages 16–45 require a visa and qualify for eVisa only with specified third-country documents. No single passport-wide category is accurate.",
    sourceIds: ["turkiye-mfa-current-libya-ordinary-visitor-regime-2026"],
    reviewedAt: "2026-08-24",
    recheckBy: "2026-11-24",
  },
  {
    passportCode: "ES",
    destinationCode: "IR",
    rejectedStatus: "visa_on_arrival",
    reason: "Spain's current Foreign Ministry guidance says Iran's border visa-on-arrival route has not officially resumed and requires pre-application. It does not establish whether the resulting ordinary tourist visa is electronic or mission-issued.",
    sourceIds: ["spain-maec-iran-border-visa-not-resumed-current-2026"],
    reviewedAt: "2026-08-25",
    recheckBy: "2026-11-25",
  },
  {
    passportCode: "TR",
    destinationCode: "LY",
    rejectedStatus: "visa_free",
    reason: "Libya's official ordinary-passport checker makes Turkish access demographic-dependent, returning both country-exempt and electronic-application outcomes. No single passport-wide category is accurate.",
    sourceIds: [
      "libya-lana-evisa-national-platform-activation-2026",
      "libya-evisa-live-ordinary-passport-and-visa-types-2026",
      "libya-evisa-live-turkey-country-configuration-2026",
      "libya-evisa-live-turkey-age-checker-2026",
    ],
    reviewedAt: "2026-08-25",
    recheckBy: "2026-11-25",
  },
  {
    passportCode: "MA",
    destinationCode: "JO",
    rejectedStatus: "visa_on_arrival",
    reason: "Jordan's current official nationality table makes visa on arrival unavailable to Moroccan women aged 16–60 while also stating the general arrival route. No single passport-wide category is accurate.",
    sourceIds: [
      "jordan-tourism-board-live-nationality-visa-table-2026",
      "jordan-moi-current-restricted-nationalities-definition-2026",
    ],
    reviewedAt: "2026-08-25",
    recheckBy: "2026-11-25",
  },
  {
    passportCode: "UA",
    destinationCode: "TN",
    rejectedStatus: "visa_free",
    reason: "Ukraine's current Foreign Ministry matrix places ordinary Ukrainian foreign-travel passports under Tunisia's visa regime while limiting visa-free treatment to diplomatic, service and special passports. It does not establish one safe replacement issuance route.",
    sourceIds: ["ukraine-mfa-tunisia-ordinary-passport-visa-regime-2026"],
    reviewedAt: "2026-08-25",
    recheckBy: "2026-11-25",
  },
  {
    passportCode: "KR",
    destinationCode: "GW",
    rejectedStatus: "visa_on_arrival",
    reason: "Korea's current Foreign Ministry page expressly says ordinary Korean passports are not visa-free for Guinea-Bissau, arrival visas are not issued, and visa-less arrivals are refused. It does not identify one safe replacement issuance route.",
    sourceIds: ["korea-mofa-guinea-bissau-entry-2026"],
    reviewedAt: "2026-08-25",
    recheckBy: "2026-11-25",
  },
  {
    passportCode: "SS",
    destinationCode: "MM",
    rejectedStatus: "evisa",
    reason: "Myanmar's current numbered 100-country ordinary-passport tourist-eVisa schedule excludes South Sudan, directly disproving the fallback eVisa, but current official material does not establish one safe replacement visitor route.",
    sourceIds: ["myanmar-tourism-current-ordinary-passport-tourist-evisa-schedule-2026"],
    reviewedAt: "2026-08-26",
    recheckBy: "2026-11-26",
  },
  {
    passportCode: "GE",
    destinationCode: "DO",
    rejectedStatus: "visa_required",
    reason: "The Dominican Republic's current DGII page directly names Georgia among nationalities requiring a consular visa, while the current MIREX ordinary-passport tourist result says no visa is required without identifying a controlling decree or condition. The conflicting government results do not establish one safe replacement route.",
    sourceIds: [
      "dominican-dgii-live-tourist-card-and-named-visa-list-2026-08-24",
      "dominican-mirex-live-georgia-ordinary-tourist-result-2026-08-24",
    ],
    reviewedAt: "2026-08-26",
    recheckBy: "2026-11-26",
  },
  {
    passportCode: "PG",
    destinationCode: "DO",
    rejectedStatus: "visa_free",
    reason: "The Dominican Republic's current DGII page directly names Papua New Guinea among nationalities requiring a consular visa, while the current MIREX ordinary-passport tourist result says no visa is required without identifying a controlling decree or condition. The conflicting government results do not establish one safe replacement route.",
    sourceIds: [
      "dominican-dgii-live-tourist-card-and-named-visa-list-2026-08-24",
      "dominican-mirex-live-papua-new-guinea-ordinary-tourist-result-2026-08-24",
    ],
    reviewedAt: "2026-08-26",
    recheckBy: "2026-11-26",
  },
  {
    passportCode: "SS",
    destinationCode: "DO",
    rejectedStatus: "visa_required",
    reason: "The Dominican Republic's current DGII page expressly assigns Tourist Card entry to nationalities outside its named consular-visa list, including South Sudan, while the current MIREX ordinary-passport tourist result says a visa is required. Neither source identifies a controlling rule that reconciles the conflict.",
    sourceIds: [
      "dominican-dgii-live-tourist-card-and-named-visa-list-2026-08-24",
      "dominican-mirex-live-south-sudan-ordinary-tourist-result-2026-08-24",
    ],
    reviewedAt: "2026-08-26",
    recheckBy: "2026-11-26",
  },
  {
    passportCode: "UY",
    destinationCode: "GY",
    rejectedStatus: "visa_free",
    reason: "Guyana's current Foreign Ministry schedule limits Uruguay's exemption to diplomatic or official passports, while current Immigration Support Services and consular schedules expressly give ordinary passports 90 visa-free days. The governing law preserves agreement and ministerial exceptions but does not identify which schedule controls.",
    sourceIds: [
      "guyana-mfa-inbound-visa-schedule-july-2025-replay",
      "guyana-iss-landing-permit-schedule-current-replay",
      "guyana-trinidad-mission-schedule-current-replay",
      "guyana-immigration-passports-order-official-compilation-replay",
    ],
    reviewedAt: "2026-08-26",
    recheckBy: "2026-11-26",
  },
  {
    passportCode: "ID",
    destinationCode: "GY",
    rejectedStatus: "visa_free",
    reason: "Guyana's current Foreign Ministry schedule limits Indonesia's exemption to diplomatic, official or service passports, while current Immigration Support Services and consular schedules list Indonesia for 30 days without that limitation. The governing law does not resolve which government schedule controls ordinary passports.",
    sourceIds: [
      "guyana-mfa-inbound-visa-schedule-july-2025-replay",
      "guyana-iss-landing-permit-schedule-current-replay",
      "guyana-trinidad-mission-schedule-current-replay",
      "guyana-immigration-passports-order-official-compilation-replay",
    ],
    reviewedAt: "2026-08-26",
    recheckBy: "2026-11-26",
  },
  {
    passportCode: "CU",
    destinationCode: "GY",
    rejectedStatus: "visa_free",
    reason: "Guyana's current Foreign Ministry and consular schedules limit Cuba's exemption to diplomatic, official or service passports, while current Immigration Support Services guidance lists Cuba without a passport-type limitation. The governing law does not resolve which government schedule controls ordinary passports.",
    sourceIds: [
      "guyana-mfa-inbound-visa-schedule-july-2025-replay",
      "guyana-iss-landing-permit-schedule-current-replay",
      "guyana-trinidad-mission-schedule-current-replay",
      "guyana-immigration-passports-order-official-compilation-replay",
    ],
    reviewedAt: "2026-08-26",
    recheckBy: "2026-11-26",
  },
];

const pairKeys = REVIEWED_UNKNOWN_OVERRIDES.map(({ passportCode, destinationCode }) => `${passportCode}:${destinationCode}`);
if (new Set(pairKeys).size !== pairKeys.length) {
  throw new Error("Reviewed unknown overrides must use unique passport-destination pairs");
}

export function getReviewedUnknownOverride(
  passportCode: string,
  destinationCode: string,
): ReviewedUnknownOverride | undefined {
  return REVIEWED_UNKNOWN_OVERRIDES.find((override) =>
    override.passportCode === passportCode && override.destinationCode === destinationCode
  );
}
