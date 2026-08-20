import type { AccessStatus } from "@/lib/types";

export interface VerifiedAccessOverride {
  passportCode: string;
  destinationCode: string;
  status: AccessStatus;
  reason: string;
  sourceUrl: string;
  reviewedAt: string;
}

/**
 * Narrow corrections where a current destination authority is more specific
 * than the upstream category. Keep this list small and source every entry.
 */
export const VERIFIED_ACCESS_OVERRIDES: readonly VerifiedAccessOverride[] = [
  {
    passportCode: "IN",
    destinationCode: "HK",
    status: "eta",
    reason: "Hong Kong requires Indian visitors to complete pre-arrival registration before a visa-free visit.",
    sourceUrl: "https://www.immd.gov.hk/eng/services/visas/pre-arrival_registration_for_indian_nationals.html",
    reviewedAt: "2026-08-20",
  },
] as const;
