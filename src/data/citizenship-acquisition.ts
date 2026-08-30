import type { CitizenshipPolicySource } from "./citizenship-policies";

export type CitizenshipAcquisitionRouteType = "descent" | "naturalisation" | "marriage" | "restoration";

export interface CitizenshipAcquisitionRoute {
  id: string;
  countryCode: string;
  country: string;
  type: CitizenshipAcquisitionRouteType;
  title: string;
  summary: string;
  requirements: string[];
  residenceRequirement?: string;
  languageRequirement?: string;
  transitionNote?: string;
  reviewedAt: string;
  sources: CitizenshipPolicySource[];
}

export const CITIZENSHIP_ROUTE_TYPE_LABELS: Record<CitizenshipAcquisitionRouteType, string> = {
  descent: "Birth or descent",
  naturalisation: "Residence and naturalisation",
  marriage: "Marriage or civil partnership",
  restoration: "Restoration or reacquisition",
};

export const CITIZENSHIP_ACQUISITION_ROUTES: CitizenshipAcquisitionRoute[] = [
  {
    id: "portugal-descent-2026",
    countryCode: "PT",
    country: "Portugal",
    type: "descent",
    title: "Portuguese nationality through a Portuguese ancestor",
    summary: "Portugal recognizes parentage-based routes and its May 2026 reform extends a route to great-grandchildren of an original Portuguese citizen, subject to the amended law and implementing procedure.",
    requirements: [
      "The family link and civil-status record chain must establish the qualifying Portuguese ancestor.",
      "The exact route differs for a Portuguese parent, grandparent, or great-grandparent and may require additional ties or declarations.",
    ],
    transitionNote: "The 2026 reform is new and the Government stated that several provisions still required complementary regulation. Applicants should use the updated profile guide for their precise generation and filing date.",
    reviewedAt: "2026-08-30",
    sources: [
      {
        label: "Como obter a nacionalidade portuguesa",
        publisher: "Ministry of Justice, Portugal",
        url: "https://justica.gov.pt/Guias/como-obter-nacionalidade-portuguesa",
      },
      {
        label: "New nationality-law rules effective 19 May 2026",
        publisher: "Ministry of Justice, Portugal",
        url: "https://justica.gov.pt/Noticias/Lei-da-Nacionalidade-novas-regras-entram-em-vigor-a-19-de-maio",
      },
    ],
  },
  {
    id: "portugal-naturalisation-2026",
    countryCode: "PT",
    country: "Portugal",
    type: "naturalisation",
    title: "Portuguese nationality through legal residence",
    summary: "For applications under the law effective 19 May 2026, the ordinary minimum is seven years for nationals of EU member states or Portuguese-speaking countries and ten years for nationals of other states.",
    requirements: [
      "Legal residence for the applicable minimum period.",
      "The amended law adds knowledge of Portuguese culture, history, symbols, rights, duties, and state organization, a democratic-rule-of-law declaration, defined criminal and sanctions checks, and capacity for self-support.",
    ],
    residenceRequirement: "7 years for EU or Portuguese-speaking-country nationals; 10 years for other nationals.",
    languageRequirement: "Sufficient Portuguese remains part of the naturalisation framework; the amended law adds civic and cultural knowledge requirements.",
    transitionNote: "The new periods apply to applications filed after 19 May 2026. Pending applications remain under the prior text. A separate government overview still displays five years and marks itself as being updated, so the later reform notice controls this summary.",
    reviewedAt: "2026-08-30",
    sources: [{
      label: "New nationality-law rules effective 19 May 2026",
      publisher: "Ministry of Justice, Portugal",
      url: "https://justica.gov.pt/Noticias/Lei-da-Nacionalidade-novas-regras-entram-em-vigor-a-19-de-maio",
    }],
  },
  {
    id: "germany-naturalisation-2026",
    countryCode: "DE",
    country: "Germany",
    type: "naturalisation",
    title: "German citizenship through naturalisation",
    summary: "A person who meets the ordinary statutory conditions can generally claim naturalisation after more than five years of lawful residence.",
    requirements: [
      "A permanent right of residence or qualifying residence status.",
      "Ability to support the applicant and dependent family members, subject to statutory exceptions.",
      "Knowledge of Germany's legal and social order, usually demonstrated through the naturalisation test.",
      "Commitment to the free democratic basic order and no disqualifying criminal conviction.",
    ],
    residenceRequirement: "More than 5 years of lawful residence for the standard route.",
    languageRequirement: "German at B1 level or another accepted proof.",
    reviewedAt: "2026-08-30",
    sources: [{
      label: "The path to German citizenship",
      publisher: "Make it in Germany, Federal Government of Germany",
      url: "https://www.make-it-in-germany.com/en/visa-residence/living-permanently/naturalisation",
    }],
  },
  {
    id: "ireland-descent-2026",
    countryCode: "IE",
    country: "Ireland",
    type: "descent",
    title: "Irish citizenship through a parent or grandparent",
    summary: "A person born abroad is automatically Irish when a parent was an Irish citizen born on the island of Ireland; specified people with an Irish-born grandparent or an Irish-citizen parent born abroad can become citizens through Foreign Birth Registration.",
    requirements: [
      "The qualifying parent must have been an Irish citizen at the time of birth.",
      "Foreign Birth Registration requires the official civil-status records linking the applicant to the qualifying parent or grandparent.",
      "Citizenship through Foreign Birth Registration begins when the person is entered on the register, not retroactively for every downstream birth.",
    ],
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Born abroad",
      publisher: "Department of Foreign Affairs, Ireland",
      url: "https://www.dfa.ie/citizenship/born-abroad/",
    }],
  },
  {
    id: "ireland-naturalisation-2026",
    countryCode: "IE",
    country: "Ireland",
    type: "naturalisation",
    title: "Irish citizenship through reckonable residence",
    summary: "The standard adult route requires five years of reckonable residence: one continuous year immediately before applying plus four years during the preceding eight years.",
    requirements: [
      "Age 18 or over, provable identity, and the required legal residence record.",
      "Good character, intention to reside in Ireland, and willingness to attend a ceremony and make the declaration of fidelity.",
      "Absences in the final continuous year are limited under the published rule, subject to ministerial discretion for exceptional additional days.",
    ],
    residenceRequirement: "5 years in the previous 9, including 1 continuous year immediately before applying.",
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Become an Irish citizen by naturalisation",
      publisher: "Immigration Service Delivery, Department of Justice, Ireland",
      url: "https://www.irishimmigration.ie/how-to-become-a-citizen/become-an-irish-citizen-by%20-naturalisation/",
    }],
  },
  {
    id: "canada-naturalisation-2026",
    countryCode: "CA",
    country: "Canada",
    type: "naturalisation",
    title: "Canadian citizenship for permanent residents",
    summary: "The ordinary adult route requires permanent-resident status and at least 1,095 days of physical presence in Canada during the five-year eligibility period.",
    requirements: [
      "Valid permanent-resident status and no applicable prohibition.",
      "At least 1,095 days of physical presence during the five years before signing the application, with at least 730 days as a permanent resident.",
      "Income-tax filing for the required years when legally required, plus the citizenship oath if approved.",
      "Applicants aged 18 to 54 must meet the language and citizenship-test requirements, unless a waiver applies.",
    ],
    residenceRequirement: "1,095 days during the previous 5 years, including at least 730 days as a permanent resident.",
    languageRequirement: "English or French speaking and listening at CLB/NCLC 4 for applicants aged 18–54, subject to waivers.",
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Canadian citizenship for adults and minor children: who can apply",
      publisher: "Immigration, Refugees and Citizenship Canada",
      url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/adult-minor/who.html",
    }],
  },
  {
    id: "australia-descent-2026",
    countryCode: "AU",
    country: "Australia",
    type: "descent",
    title: "Australian citizenship by descent",
    summary: "A person born outside Australia may qualify when a parent was an Australian citizen at the time of the person's birth.",
    requirements: [
      "The applicant must have been born outside Australia.",
      "The qualifying person must have been the applicant's parent and an Australian citizen when the applicant was born.",
      "Applicants aged 18 or over must satisfy the good-character requirement.",
    ],
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Become an Australian citizen by descent",
      publisher: "Department of Home Affairs, Australia",
      url: "https://immi.homeaffairs.gov.au/citizenship/become-a-citizen/by-descent",
    }],
  },
  {
    id: "australia-conferral-2026",
    countryCode: "AU",
    country: "Australia",
    type: "naturalisation",
    title: "Australian citizenship by conferral",
    summary: "The general route requires four years in Australia on a valid visa, including the final 12 months as a permanent resident or qualifying Special Category visa holder.",
    requirements: [
      "Permanent-resident or qualifying Special Category visa status when applying and when the application is decided.",
      "No more than 12 months total absence during the four years, including no more than 90 days in the final 12 months.",
      "Intention to live in Australia or maintain a close and continuing link while overseas.",
      "Character, knowledge, language, and pledge requirements apply according to age and circumstances.",
    ],
    residenceRequirement: "4 years on a valid visa immediately before applying, including the last 12 months as a permanent resident or qualifying SCV holder.",
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Become an Australian citizen by conferral",
      publisher: "Department of Home Affairs, Australia",
      url: "https://immi.homeaffairs.gov.au/citizenship/become-a-citizen/permanent-resident",
    }],
  },
  {
    id: "france-naturalisation-2026",
    countryCode: "FR",
    country: "France",
    type: "naturalisation",
    title: "French nationality by decree",
    summary: "The standard residence-based route generally requires at least five years of habitual and continuous residence in France, together with integration, language, conduct, and residence conditions.",
    requirements: [
      "Habitual and continuous residence in France with the applicant's family where applicable.",
      "A valid residence status when required and evidence of professional and social integration.",
      "Good conduct and no disqualifying conviction or expulsion measure.",
      "From 2026, civic knowledge is assessed through an examination in addition to the language requirement.",
    ],
    residenceRequirement: "Generally 5 years, with statutory reductions or exemptions for defined cases.",
    languageRequirement: "French-language proof at the current statutory level; the official application page controls accepted evidence and exemptions.",
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Naturalisation française par décret",
      publisher: "Service Public, French Republic",
      url: "https://www.service-public.fr/particuliers/vosdroits/F34708",
    }],
  },
  {
    id: "spain-residence-2026",
    countryCode: "ES",
    country: "Spain",
    type: "naturalisation",
    title: "Spanish nationality through legal residence",
    summary: "The general residence period is ten years, with shorter statutory periods for refugees, nationals of specified countries, and defined personal or family circumstances.",
    requirements: [
      "Residence must be legal, continuous, and immediately before the application.",
      "The general period is ten years; it is five years for refugees and two years for nationals by origin of Ibero-American countries, Andorra, the Philippines, Equatorial Guinea or Portugal, and for Sephardic applicants within the law's scope.",
      "Defined one-year routes include several birth, option, guardianship, marriage, widowhood, and Spanish-parent or grandparent circumstances.",
      "Good civic conduct and sufficient integration are required.",
    ],
    residenceRequirement: "10 years generally; 5, 2, or 1 year for defined statutory cohorts.",
    transitionNote: "Retention of the prior nationality is a separate question: Spain's renunciation and dual-nationality exceptions depend on the person's original nationality and route.",
    reviewedAt: "2026-08-30",
    sources: [
      {
        label: "Spanish nationality by residence",
        publisher: "Ministry of Justice, Spain",
        url: "https://www.mjusticia.gob.es/es/ciudadania/tramites/nacionalidad-residencia",
      },
      {
        label: "Spanish Civil Code, Article 22",
        publisher: "Official State Gazette, Spain",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763",
      },
    ],
  },
  {
    id: "italy-descent-2026",
    countryCode: "IT",
    country: "Italy",
    type: "descent",
    title: "Italian citizenship by descent after the 2025 reform",
    summary: "Italy still recognizes citizenship through an Italian parent, but the 2025 reform restricts automatic recognition for many people born abroad who already hold another citizenship and makes the listed statutory exceptions decisive.",
    requirements: [
      "The applicant must prove the complete civil-status chain from the Italian ancestor and that citizenship was transmitted under the law in force at each event.",
      "For a person born abroad who holds another citizenship, Article 3-bis exceptions introduced in 2025 now control whether automatic acquisition is recognized.",
      "Historic naturalisation, renunciation, maternal-line timing, minority, and residence facts can change the result.",
    ],
    transitionNote: "Do not rely on pre-28 March 2025 generational summaries. The Foreign Ministry's current guidance and the competent consulate must be checked against the filing date and family history.",
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Cittadinanza — current acquisition rules",
      publisher: "Ministry of Foreign Affairs and International Cooperation, Italy",
      url: "https://www.esteri.it/it/servizi-consolari-e-visti/normativa_consolare/serviziconsolari/cittadinanza/",
    }],
  },
];

export const CITIZENSHIP_ACQUISITION_ROUTES_BY_COUNTRY = new Map<string, CitizenshipAcquisitionRoute[]>(
  [...new Set(CITIZENSHIP_ACQUISITION_ROUTES.map((route) => route.countryCode))].map((countryCode) => [
    countryCode,
    CITIZENSHIP_ACQUISITION_ROUTES.filter((route) => route.countryCode === countryCode),
  ]),
);

