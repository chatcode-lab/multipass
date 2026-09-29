import type { ReviewedUnknownOverride } from "./reviewed-unknown-overrides";

export interface ReviewedUnknownRecheck {
  passportCode: string;
  destinationCode: string;
  rejectedStatus: ReviewedUnknownOverride["rejectedStatus"];
  checkedAt: string;
  reason: string;
  sourceIds: readonly string[];
  /** Only a reconfirmed correction may renew its research/indexing window. */
  recheckBy?: string;
}

/** Append-only follow-ups. Omitted recheckBy deliberately retains the expired target. */
export const REVIEWED_UNKNOWN_RECHECKS: readonly ReviewedUnknownRecheck[] = [
  ...["BH", "MC", "RW"].map((passportCode): ReviewedUnknownRecheck => ({
    passportCode,
    destinationCode: "VU",
    rejectedStatus: "visa_free",
    checkedAt: "2026-09-29",
    recheckBy: "2026-10-29",
    reason: `Vanuatu Immigration still lists this nationality in both its exempt and non-exempt visitor cohorts. Its tourist instructions require arrival issuance for the former and advance approval for the latter. The current contradiction does not establish a safe passport-wide category.${passportCode === "RW" ? " Rwanda's separate no-visa wording does not reconcile the destination lists." : ""}`,
    sourceIds: ["pass416-vu-live-opposing-country-lists", "pass416-vu-live-tourist-issuance-timing",
      ...(passportCode === "RW" ? ["pass416-rw-ordinary-passport-vanuatu-row"] : [])],
  })),
  {
    passportCode: "NZ",
    destinationCode: "NU",
    rejectedStatus: "visa_on_arrival",
    checkedAt: "2026-09-29",
    reason: "Niue Tourism's FAQ expressly includes New Zealand in its tourist visa waiver, while the detailed arrival-permit list omits it. That omission does not itself prove a prior-visa requirement, and a travel-visa waiver can coexist with an arrival stay permit. The reviewed Act distinguishes the two permissions; a complete current implementing exemption schedule was not retrieved. The earlier claim that arrival treatment was disproved was too strong. The rank category remains unresolved, not proven false.",
    sourceIds: ["pass416-nu-tourism-live-nz-inconsistency", "pass416-nu-immigration-act-official-2019-consolidation", "pass416-nu-official-legislation-table-through-2024"],
  },
  {
    passportCode: "US",
    destinationCode: "BF",
    rejectedStatus: "evisa",
    checkedAt: "2026-09-29",
    recheckBy: "2026-10-29",
    reason: "Current US guidance still confirms suspended visa issuance to Americans with limited exceptions, consistent with Burkina Faso's signed reciprocal-visa communiqué. Neither establishes treatment of already-valid visas or the exception categories. A generic eVisa application link does not prove a functioning US-national route; an ordinary visitor entry ban or single replacement status is not established.",
    sourceIds: ["pass416-burkina-reciprocal-visa-communique", "pass416-us-state-burkina-visa-suspension"],
  },
  {
    passportCode: "NR",
    destinationCode: "BZ",
    rejectedStatus: "visa_free",
    checkedAt: "2026-09-29",
    recheckBy: "2026-10-29",
    reason: "Belize Immigration's current nationality table still gives Nauru the internally contradictory visa-required value YES - NO. Its separate US, Canadian and Schengen document exemptions do not resolve the Nauruan passport-only baseline. No safe replacement category is established.",
    sourceIds: ["pass416-belize-nauru-contradictory-table"],
  },
  {
    passportCode: "AD",
    destinationCode: "GT",
    rejectedStatus: "visa_free",
    checkedAt: "2026-09-29",
    reason: "Guatemala's Migration Institute currently links a Category A graphic expressly naming Andorra as visa-exempt. The graphic's filename dates its update to 2023. The earlier Foreign Ministry A/B duplication could not be reopened, so its continuing contradiction or resolution was not freshly verified. A controlling current instrument or authority clarification is still needed; the expired correction review window has not been renewed.",
    sourceIds: ["pass416-guatemala-igm-category-a-image"],
  },
  {
    passportCode: "LU",
    destinationCode: "UA",
    rejectedStatus: "visa_free",
    checkedAt: "2026-09-29",
    reason: "Luxembourg's current guidance expressly prescribes a pre-travel e-Tourist Visa for Ukraine, while an accessible Ukrainian government accession-response document records Luxembourg's ordinary-passport waiver as of April 2022. The current Ukrainian decree and nationality rule could not be retrieved. The historical waiver does not establish present force, and the issuer guidance alone does not establish destination eVisa eligibility. No current replacement route is verified; the old review window is not renewed.",
    sourceIds: ["pass416-luxembourg-ukraine-etourist-guidance", "pass416-ukraine-eu-questionnaire-historical-ordinary-luxembourg"],
  },
  {
    passportCode: "FJ",
    destinationCode: "XK",
    rejectedStatus: "visa_free",
    checkedAt: "2026-09-29",
    reason: "Kosovo's signed December 2025 decision introduces a Fiji visa regime only on Official Gazette publication, while the live Foreign Ministry list still names Fiji as exempt. Fresh Gazette searches did not retrieve the publication; that absence is not proof of nonpublication. Current force and any replacement visa's issuance route remain unverified, so the old correction window is not renewed.",
    sourceIds: ["pass416-kosovo-decision-14-280-fiji-publication-clause", "pass416-kosovo-mfa-fiji-live-short-stay-waiver-list"],
  },
  {
    passportCode: "DO",
    destinationCode: "MD",
    rejectedStatus: "evisa",
    checkedAt: "2026-09-29",
    reason: "Moldova's Romanian Foreign Ministry list distinguishes the visa-required Dominican Republic from visa-exempt Dominica; the English page still duplicates the Dominican Republic name. The Romanian required-list footnote waives qualifying foreign visa or residence-permit holders, while the official eVisa service issues approved type-C tourist visas as PDFs. These document-dependent routes are characterized below, but no single rank-grade status or newly verified effective date is asserted.",
    sourceIds: ["pass416-moldova-romanian-dominican-required-dominica-exempt", "pass416-moldova-english-dominican-translation-discrepancy", "pass416-moldova-evisa-type-c-pdf-issuance", "pass416-moldova-tourism-passport-requirements"],
  },
];
