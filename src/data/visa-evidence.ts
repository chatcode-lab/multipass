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

export const HONG_KONG_VISA_FREE_CODES = [
  "SG", "JP", "KR", "AE", "SE", "BE", "DK", "FI", "FR", "DE", "IE", "IT", "LU", "NL", "NO", "ES",
  "AT", "GR", "MT", "PT", "CH", "HU", "PL", "GB", "AU", "CA", "CZ", "LV", "MY", "NZ", "SK", "SI",
  "HR", "EE", "LI", "LT", "IS", "US", "BG", "RO", "MC", "CY", "CL", "AD", "AR", "BR", "SM", "IL",
  "BB", "BN", "BS", "KN", "VC", "MX", "UY", "SC", "AG", "VA", "CR", "GD", "MU", "PA", "PY", "DM",
  "TT", "LC", "UA", "PE", "RS", "GT", "SV", "CO", "HN", "MH", "WS", "ME", "MK", "TO", "TV", "AL",
  "BA", "GE", "KI", "FM", "PW", "VE", "RU", "QA", "TR", "ZA", "BZ", "KW", "MV", "EC", "SA", "BH",
  "GY", "FJ", "VU", "OM", "JM", "NR", "PG", "BW", "BY", "BO", "KZ", "TH", "SR", "NA", "LS", "MA",
  "DO", "ID", "KE", "MW", "TZ", "TN", "BJ", "PH", "UG", "AM", "CV", "MN", "ZM", "ZW", "MZ", "ST",
  "BF", "GA", "MG", "DZ", "MR", "GQ", "NE", "GN", "ML", "TD", "KM", "EG", "JO", "HT", "BT", "DJ",
] as const;

export const HONG_KONG_VISA_REQUIRED_CODES = [
  "SB", "NI", "MD", "SZ", "RW", "GM", "AZ", "GH", "SL", "KG", "UZ", "CU", "TG", "CI", "SN", "TJ",
  "GW", "AO", "LR", "BI", "CM", "CF", "VN", "KH", "CG", "LA", "CD", "NG", "TM", "MM", "ET", "LB",
  "SS", "SD", "LY", "LK", "ER", "IR", "PS", "BD", "KP", "NP", "SO", "YE", "PK", "IQ", "SY", "AF",
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
  {
    id: "hong-kong-visitor-requirements-2026-08",
    title: "Visit visa and entry permit requirements for Hong Kong",
    url: "https://www.immd.gov.hk/eng/services/visas/visit-transit/visit-visa-entry-permit.html",
    publisher: "Hong Kong Immigration Department",
    jurisdiction: "Hong Kong SAR",
    kind: "government-guidance",
    language: "English",
    reviewedAt: "2026-08-20",
  },
  {
    id: "hong-kong-india-par-current",
    title: "Pre-arrival registration for Indian nationals",
    url: "https://www.immd.gov.hk/eng/services/visas/pre-arrival_registration_for_indian_nationals.html",
    publisher: "Hong Kong Immigration Department",
    jurisdiction: "Hong Kong SAR",
    kind: "official-portal",
    language: "English",
    reviewedAt: "2026-08-20",
  },
  {
    id: "hong-kong-india-par-introduction",
    title: "Online pre-arrival registration for Indian nationals to visit Hong Kong",
    url: "https://www.immd.gov.hk/eng/press/press-releases/20161212.html",
    publisher: "Hong Kong Immigration Department",
    jurisdiction: "Hong Kong SAR",
    kind: "government-guidance",
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
  {
    id: "hong-kong-current-visitor-waivers",
    title: "Hong Kong publishes visa-free periods for ordinary visitors",
    summary: "The Immigration Department's August 2026 schedule lists visa-free visitor periods for the named nationalities and travel documents.",
    status: "visa_free",
    destinationCodes: ["HK"],
    passportCodes: HONG_KONG_VISA_FREE_CODES,
    conditions: [
      "The permitted visitor period varies by passport and is shown in the official schedule.",
      "Normal immigration requirements still apply, and permission to land is not automatic.",
      "The Albania and Serbia entries apply to biometric passports; the schedule also contains document-specific exceptions for several nationalities.",
      "Visitor status does not permit employment, study, residence, or joining a business.",
    ],
    sourceIds: ["hong-kong-visitor-requirements-2026-08"],
  },
  {
    id: "hong-kong-current-prior-visa-list",
    title: "Hong Kong lists nationalities that require a visit visa",
    summary: "The Immigration Department's August 2026 schedule requires the listed ordinary-passport visitors to obtain a visa or entry permit before travel.",
    status: "visa_required",
    destinationCodes: ["HK"],
    passportCodes: HONG_KONG_VISA_REQUIRED_CODES,
    conditions: [
      "Some diplomatic and official passport holders have different exemptions; this policy represents ordinary-passport access.",
      "Direct airside transit exceptions vary by nationality and do not establish permission to enter Hong Kong.",
      "Applications remain subject to individual assessment and normal immigration requirements.",
    ],
    sourceIds: ["hong-kong-visitor-requirements-2026-08"],
  },
  {
    id: "hong-kong-india-pre-arrival-registration-2017",
    title: "Pre-arrival registration became mandatory for Indian visitors",
    summary: "Indian passport holders must successfully complete free online pre-arrival registration before a visa-free visit or non-airside transit of up to 14 days.",
    status: "eta",
    destinationCodes: ["HK"],
    passportCodes: ["IN"],
    announcedOn: "2016-12-12",
    effectiveFrom: "2017-01-23",
    conditions: [
      "The Indian passport must normally be valid for at least six months.",
      "A successful registration is valid for six months or until the linked passport expires, whichever is earlier.",
      "The signed notification slip must be used with the passport linked to the registration.",
      "Each qualifying visit may last up to 14 days; unsuccessful registration requires a visit-visa application.",
    ],
    sourceIds: ["hong-kong-india-par-introduction", "hong-kong-india-par-current"],
    application: {
      url: "https://www.gov.hk/en/apps/immdes2parreg.htm",
      label: "Register on the official Hong Kong government portal",
      processingTime: "The Immigration Department says the online system displays the result immediately.",
      steps: [
        "Open the official pre-arrival registration service and enter the details exactly as shown in the Indian passport.",
        "Submit the free registration and check the result.",
        "Print and sign the notification slip generated after successful registration.",
        "Travel with the signed slip and the same valid passport used for the registration.",
      ],
    },
  },
] as const;
