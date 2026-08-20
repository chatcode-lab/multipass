import type { AccessStatus } from "@/lib/types";

export type OfficialSourceKind = "law" | "government-guidance" | "official-portal" | "official-dataset";

export interface OfficialVisaSource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  jurisdiction: string;
  kind: OfficialSourceKind;
  language: string;
  reviewedAt: string;
}

export interface VisaApplicationGuide {
  url: string;
  label: string;
  processingTime?: string;
  steps: readonly string[];
}

export interface VisaPolicyEvidence {
  id: string;
  title: string;
  summary: string;
  status: AccessStatus;
  destinationCodes: readonly string[];
  passportCodes?: readonly string[];
  excludedPassportCodes?: readonly string[];
  effectiveFrom?: string;
  announcedOn?: string;
  effectiveTo?: string;
  conditions?: readonly string[];
  sourceIds: readonly string[];
  application?: VisaApplicationGuide;
}

export const ANGOLA_TOURIST_VISA_EXEMPT_CODES = [
  "SZ", "MA", "LS", "GQ", "MU", "SC", "CV", "BW", "MG", "MW", "RW", "ZW", "DZ", "TZ",
  "AE", "IL", "QA", "JP", "SA", "KR", "IN", "ID", "SG", "TL", "CN",
  "CH", "VA", "CZ", "RU", "LU", "HU", "NL", "MC", "BE", "DK", "SE", "ES", "GB", "NO",
  "AT", "BG", "HR", "SK", "EE", "FI", "FR", "GR", "IE", "LV", "LT", "MT", "PL", "RO",
  "TR", "CY", "SI", "DE", "IT", "PT", "IS",
  "US", "MX", "AR", "CA", "CL", "PA", "BR", "UY",
  "AU", "FJ", "MH", "SB", "FM", "NR", "NZ", "PW", "PG", "WS", "TO", "TV", "VU", "NU",
  "AG", "BS", "BB", "BZ", "GD", "GY", "HT", "CK", "JM", "KI", "DO", "LC", "KN", "VC", "SR", "TT",
] as const;

const EU_PASSPORT_CODES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

export const OFFICIAL_VISA_SOURCES: readonly OfficialVisaSource[] = [
  {
    id: "angola-decree-189-23",
    title: "Presidential Decree 189/23: tourist visa exemption",
    url: "https://governo.gov.ao/noticias/1046/governo/decreto-presidencial/angola-isenta-cidadaos-de-98-paises-de-vistos-de-turismo",
    publisher: "Government of Angola",
    jurisdiction: "Angola",
    kind: "law",
    language: "Portuguese",
    reviewedAt: "2026-08-20",
  },
  {
    id: "kenya-jamhuri-2023",
    title: "Presidential announcement introducing visa-free entry and electronic travel authorisation",
    url: "https://www.president.go.ke/wp-content/uploads/DURING-THE-60TH-JAMHURI-DAY-CELEBRATIONS-1.pdf",
    publisher: "Executive Office of the President of Kenya",
    jurisdiction: "Kenya",
    kind: "government-guidance",
    language: "English",
    reviewedAt: "2026-08-20",
  },
  {
    id: "kenya-eta-current",
    title: "Electronic Travel Authorisation services",
    url: "https://immigration.go.ke/eta/",
    publisher: "Kenya Directorate of Immigration Services",
    jurisdiction: "Kenya",
    kind: "official-portal",
    language: "English",
    reviewedAt: "2026-08-20",
  },
  {
    id: "drc-evisa-faq",
    title: "DR Congo eVisa eligibility and process",
    url: "https://evisa.gouv.cd/helps/faqs",
    publisher: "Direction Générale de Migration, Democratic Republic of the Congo",
    jurisdiction: "Democratic Republic of the Congo",
    kind: "official-portal",
    language: "French",
    reviewedAt: "2026-08-20",
  },
  {
    id: "drc-evisa-portal",
    title: "Official DR Congo eVisa application portal",
    url: "https://evisa.gouv.cd/",
    publisher: "Direction Générale de Migration, Democratic Republic of the Congo",
    jurisdiction: "Democratic Republic of the Congo",
    kind: "official-portal",
    language: "French",
    reviewedAt: "2026-08-20",
  },
  {
    id: "eu-brazil-waiver",
    title: "EU–Brazil short-stay visa waiver agreement",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=LEGISSUM%3A4384449",
    publisher: "Publications Office of the European Union",
    jurisdiction: "European Union and Brazil",
    kind: "law",
    language: "English",
    reviewedAt: "2026-08-20",
  },
] as const;

export const VISA_POLICY_EVIDENCE: readonly VisaPolicyEvidence[] = [
  {
    id: "angola-tourist-exemption-2023",
    title: "Tourist visa exemption took effect for 98 nationalities",
    summary: "Presidential Decree 189/23 exempts listed nationals from an Angolan tourist visa for short visits.",
    status: "visa_free",
    destinationCodes: ["AO"],
    passportCodes: ANGOLA_TOURIST_VISA_EXEMPT_CODES,
    effectiveFrom: "2023-09-29",
    announcedOn: "2023-10-02",
    conditions: [
      "Tourist visits only.",
      "Up to 30 days per entry and 90 days in a calendar year.",
      "A passport valid for more than six months and other border formalities may still be required.",
    ],
    sourceIds: ["angola-decree-189-23"],
  },
  {
    id: "kenya-eta-belgium-2024",
    title: "Kenya replaced the visitor visa with an ETA",
    summary: "Kenya abolished visitor visas from January 2024 and introduced electronic travel authorisation before travel. The current immigration service operates the official ETA system.",
    status: "eta",
    destinationCodes: ["KE"],
    passportCodes: ["BE"],
    effectiveFrom: "2024-01-01",
    conditions: [
      "An approved ETA is required before the journey for travellers who are not covered by a current exemption.",
      "Approval does not guarantee admission at the border.",
    ],
    sourceIds: ["kenya-jamhuri-2023", "kenya-eta-current"],
    application: {
      url: "https://etakenya.go.ke/",
      label: "Apply on the official Kenya ETA portal",
      processingTime: "The immigration service advises allowing three working days.",
      steps: [
        "Open the official Kenya ETA portal and start an individual application.",
        "Provide the requested passport, itinerary, contact, and supporting information.",
        "Submit payment where required and retain the application reference.",
        "Wait for approval before beginning the journey and carry the approved authorisation.",
      ],
    },
  },
  {
    id: "drc-electronic-visa-current",
    title: "The official DR Congo eVisa route is available",
    summary: "The migration authority states that foreign visitors may request an eVisa online for tourism, family visits, or business travel.",
    status: "evisa",
    destinationCodes: ["CD"],
    conditions: [
      "The eVisa must be obtained before travel.",
      "The official FAQ describes a single-entry airport visa process and publishes current validity, fee, and processing details.",
    ],
    sourceIds: ["drc-evisa-faq", "drc-evisa-portal"],
    application: {
      url: "https://evisa.gouv.cd/",
      label: "Apply on the official DR Congo eVisa portal",
      processingTime: "The official FAQ states a 72-hour processing period after receipt.",
      steps: [
        "Create an account on the official eVisa portal.",
        "Complete the request and pay the administrative charge shown by the portal.",
        "Wait for the migration authority's analysis and follow any payment instructions.",
        "Download the issued eVisa PDF and retain it for travel.",
      ],
    },
  },
  {
    id: "eu-brazil-short-stay-waiver-2012",
    title: "EU–Brazil short-stay visa waiver entered into force",
    summary: "The reciprocal agreement permits short visa-free stays for citizens of Brazil and European Union member states.",
    status: "visa_free",
    destinationCodes: ["BR"],
    passportCodes: EU_PASSPORT_CODES,
    effectiveFrom: "2012-10-01",
    conditions: ["Short stays only; work and residence remain outside the waiver."],
    sourceIds: ["eu-brazil-waiver"],
  },
] as const;
