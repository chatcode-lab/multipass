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
