import type { AccessStatus } from "@/lib/types";
import { UNITED_KINGDOM_VISITOR_VISA_CODES } from "./visa-evidence";

export interface VerifiedAccessOverride {
  passportCode: string;
  destinationCode: string;
  status: AccessStatus;
  reason: string;
  sourceUrl: string;
  reviewedAt: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

/**
 * Corrections where a current destination authority is more specific than the
 * upstream category. Prefer a reviewed policy cohort over duplicated pairs.
 */
export const VERIFIED_ACCESS_OVERRIDES: readonly VerifiedAccessOverride[] = [
  {
    passportCode: "GY",
    destinationCode: "KE",
    status: "visa_free",
    reason: "Kenya's current ETA rules exempt Guyanese nationals for stays not exceeding 90 days.",
    sourceUrl: "https://new.kenyalaw.org/akn/ke/act/ln/2025/93",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "ID",
    destinationCode: "KE",
    status: "eta",
    reason: "Kenya requires an ETA for Indonesian visitors, who are not in the current nationality-exemption schedules.",
    sourceUrl: "https://etakenya.go.ke/how-to-apply",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "IN",
    destinationCode: "HK",
    status: "eta",
    reason: "Hong Kong requires Indian visitors to complete pre-arrival registration before a visa-free visit.",
    sourceUrl: "https://www.immd.gov.hk/eng/services/visas/pre-arrival_registration_for_indian_nationals.html",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "KH",
    destinationCode: "JP",
    status: "visa_required",
    reason: "Japan's eVisa route depends on residence and other conditions; Cambodian nationality alone does not establish universal eVisa eligibility.",
    sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/visaonline.html",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "MN",
    destinationCode: "JP",
    status: "visa_required",
    reason: "Japan's accredited-agency eVisa route depends on residence in Mongolia and other conditions; nationality alone is insufficient.",
    sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/visaonline.html",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "SA",
    destinationCode: "JP",
    status: "visa_required",
    reason: "Japan's eVisa route depends on residence and other conditions; Saudi nationality alone does not establish universal eVisa eligibility.",
    sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/visaonline.html",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "ZA",
    destinationCode: "JP",
    status: "visa_required",
    reason: "Japan's eVisa route depends on residence and other conditions; South African nationality alone does not establish universal eVisa eligibility.",
    sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/visaonline.html",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "SS",
    destinationCode: "SG",
    status: "evisa",
    reason: "Singapore ICA lists South Sudan travel documents as visa-required and uses a prior electronic visa process.",
    sourceUrl: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "CH",
    destinationCode: "KR",
    status: "visa_free",
    reason: "Switzerland is temporarily exempt from K-ETA through 31 December 2026.",
    sourceUrl: "https://overseas.mofa.go.kr/ch-en/brd/m_23429/view.do?seq=22",
    reviewedAt: "2026-08-20",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
  },
  {
    passportCode: "LI",
    destinationCode: "KR",
    status: "visa_free",
    reason: "Liechtenstein is temporarily exempt from K-ETA through 31 December 2026.",
    sourceUrl: "https://overseas.mofa.go.kr/ch-en/brd/m_23429/view.do?seq=22",
    reviewedAt: "2026-08-20",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
  },
  {
    passportCode: "CL",
    destinationCode: "KR",
    status: "eta",
    reason: "Chile appears in the live K-ETA eligibility table and is not in the current temporary-exemption cohort.",
    sourceUrl: "https://www.k-eta.go.kr/portal/guide/viewetaalification.do?locale=EN",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "TV",
    destinationCode: "IL",
    status: "eta",
    reason: "Israel's current ordinary-passport dataset marks Tuvalu as visa-exempt, so ETA-IL is required for visitor travel.",
    sourceUrl: "https://israel-entry.piba.gov.il/api/getalldata",
    reviewedAt: "2026-08-20",
  },
  {
    passportCode: "MD",
    destinationCode: "IL",
    status: "visa_required",
    reason: "Israel's current ordinary national-passport row for Moldova requires a visitor visa.",
    sourceUrl: "https://israel-entry.piba.gov.il/api/getalldata",
    reviewedAt: "2026-08-20",
  },
  ...(["AM", "KZ", "UZ"] as const).map((passportCode) => ({
    passportCode,
    destinationCode: "TW",
    status: "evisa" as const,
    reason: "Taiwan BOCA currently permits a document-conditioned eVisa route for this nationality through 31 March 2027.",
    sourceUrl: "https://visawebapp.boca.gov.tw/BOCA_EVISA/MRV04FORM.do",
    reviewedAt: "2026-08-20",
    effectiveFrom: "2026-03-31",
    effectiveTo: "2027-03-31",
  })),
  {
    passportCode: "RU",
    destinationCode: "TW",
    status: "evisa",
    reason: "Taiwan BOCA currently permits Russian ordinary-passport eVisa applications through 6 July 2027.",
    sourceUrl: "https://visawebapp.boca.gov.tw/BOCA_EVISA/MRV04FORM.do",
    reviewedAt: "2026-08-20",
    effectiveFrom: "2026-07-07",
    effectiveTo: "2027-07-06",
  },
  ...(["HT", "TR"] as const).map((passportCode) => ({
    passportCode,
    destinationCode: "TW",
    status: "evisa" as const,
    reason: "Taiwan BOCA includes this nationality in its current ordinary-passport eVisa eligibility list, subject to the published conditions.",
    sourceUrl: "https://visawebapp.boca.gov.tw/BOCA_EVISA/MRV04FORM.do",
    reviewedAt: "2026-08-20",
  })),
  ...(["BF", "NI", "SB"] as const).map((passportCode) => ({
    passportCode,
    destinationCode: "TW",
    status: "visa_required" as const,
    reason: "This nationality is outside Taiwan's current ordinary-passport exemption and nationality-wide eVisa lists, so the statutory advance-visa default applies.",
    sourceUrl: "https://www.boca.gov.tw/cp-160-268-b9f2c-2.html",
    reviewedAt: "2026-08-20",
  })),
  ...(["MO", "PS", "KP"] as const).map((passportCode) => ({
    passportCode,
    destinationCode: "AU",
    status: "visa_required" as const,
    reason: "Australia requires all other passport holders to obtain the appropriate visa before travel; online subclass 600 processing is not a nationality-wide eVisa.",
    sourceUrl: "https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia/can-i-go-to-australia",
    reviewedAt: "2026-08-20",
  })),
  ...UNITED_KINGDOM_VISITOR_VISA_CODES.map((passportCode) => ({
    passportCode,
    destinationCode: "GB",
    status: "visa_required" as const,
    reason: "The UK Visa National List requires advance entry clearance; an online form and visa-centre appointment are not a universal eVisa route.",
    sourceUrl: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national-list",
    reviewedAt: "2026-08-20",
  })),
] as const;
