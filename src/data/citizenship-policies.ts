export type MultipleCitizenshipPolicyStatus = "generally_allowed" | "conditional" | "generally_restricted";

export interface CitizenshipPolicySource {
  label: string;
  publisher: string;
  url: string;
}

export interface CitizenshipPolicy {
  code: string;
  country: string;
  status: MultipleCitizenshipPolicyStatus;
  headline: string;
  summary: string;
  practicalNotes: string[];
  reviewedAt: string;
  sources: CitizenshipPolicySource[];
}

export const CITIZENSHIP_POLICY_STATUS_META: Record<MultipleCitizenshipPolicyStatus, { label: string; shortLabel: string }> = {
  generally_allowed: { label: "Generally permits multiple citizenship", shortLabel: "Generally allowed" },
  conditional: { label: "Permitted only in some circumstances", shortLabel: "Conditional" },
  generally_restricted: { label: "Generally restricts multiple citizenship", shortLabel: "Generally restricted" },
};

export const CITIZENSHIP_POLICIES: CitizenshipPolicy[] = [
  {
    code: "US",
    country: "United States",
    status: "generally_allowed",
    headline: "United States law permits dual and multiple nationality.",
    summary: "A US citizen may acquire another nationality without having to choose between it and US citizenship, although the other country's law still controls whether that nationality can be retained.",
    practicalNotes: [
      "US dual nationals must enter and leave the United States using a US passport.",
      "Tax, military, registration and consular-protection obligations can still overlap.",
    ],
    reviewedAt: "2026-08-28",
    sources: [{
      label: "Dual Nationality",
      publisher: "US Department of State",
      url: "https://travel.state.gov/en/international-travel/planning/personal-needs/dual-nationality.html",
    }],
  },
  {
    code: "GB",
    country: "United Kingdom",
    status: "generally_allowed",
    headline: "The United Kingdom allows dual citizenship.",
    summary: "A British citizen can apply for another citizenship and keep British citizenship, subject to the other country's rules.",
    practicalNotes: [
      "British consular assistance may be unavailable while a dual national is in the country of their other nationality.",
      "British or Irish dual citizens cannot use an ETA to travel to the UK and should carry an eligible passport or entitlement document.",
    ],
    reviewedAt: "2026-08-28",
    sources: [{
      label: "Dual citizenship",
      publisher: "Government of the United Kingdom",
      url: "https://www.gov.uk/dual-citizenship",
    }],
  },
  {
    code: "PT",
    country: "Portugal",
    status: "generally_allowed",
    headline: "Portuguese law allows a Portuguese citizen to hold other nationalities.",
    summary: "Portugal does not require a person to give up another nationality in order to acquire Portuguese nationality, but the other country's law may impose its own loss or renunciation rule.",
    practicalNotes: [
      "Portuguese nationality routes depend on facts such as birth, parentage, residence, family relationship and ties to the Portuguese community.",
    ],
    reviewedAt: "2026-08-28",
    sources: [{
      label: "Como obter a nacionalidade portuguesa",
      publisher: "Ministry of Justice, Portugal",
      url: "https://justica.gov.pt/Guias/como-obter-nacionalidade-portuguesa",
    }],
  },
  {
    code: "DE",
    country: "Germany",
    status: "generally_allowed",
    headline: "Germany's modern citizenship law permits multiple citizenship.",
    summary: "Since the 2024 reform, naturalising applicants generally no longer have to give up their previous nationality under German law; the law of the other country still matters.",
    practicalNotes: [
      "Germany's current standard naturalisation residence period is five years when the other requirements are met.",
    ],
    reviewedAt: "2026-08-28",
    sources: [
      {
        label: "Modernisation of citizenship law",
        publisher: "Federal Government of Germany",
        url: "https://www.bundesregierung.de/breg-de/aktuelles/modernisation-citizenship-law-2254382",
      },
      {
        label: "Citizenship after five years at the earliest",
        publisher: "Federal Government of Germany",
        url: "https://www.bundesregierung.de/breg-de/suche/kabinett-einbuergerung-2350620",
      },
    ],
  },
  {
    code: "CA",
    country: "Canada",
    status: "generally_allowed",
    headline: "Canada allows dual and multiple citizenship.",
    summary: "Canadian law allows a Canadian citizen to take another citizenship and allows a person becoming Canadian to retain another citizenship, although the other country's rules may still cause loss.",
    practicalNotes: [
      "Dual Canadian citizens generally need a valid Canadian passport to board a flight to Canada; Canadian-American dual citizens have a specific US-passport exception.",
      "Canada's rules do not protect the other citizenship from that country's loss or renunciation law.",
    ],
    reviewedAt: "2026-08-30",
    sources: [
      {
        label: "What is dual citizenship?",
        publisher: "Immigration, Refugees and Citizenship Canada",
        url: "https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=356",
      },
      {
        label: "Dual Canadian citizens need a valid Canadian passport",
        publisher: "Government of Canada",
        url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/dual-canadian-citizens-visit-canada.html",
      },
    ],
  },
  {
    code: "AU",
    country: "Australia",
    status: "generally_allowed",
    headline: "Australian citizens may hold another citizenship when the other country permits it.",
    summary: "Australia's official citizenship guidance expressly recognizes dual and multiple citizenship; the law of every other country in the combination remains independently relevant.",
    practicalNotes: [
      "An Australian citizen remains subject to Australian law in Australia and to specified Australian laws while overseas.",
      "Consular assistance can be limited in the country of the person's other nationality.",
    ],
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Australian Citizenship: Our Common Bond",
      publisher: "Department of Home Affairs, Australia",
      url: "https://immi.homeaffairs.gov.au/citizenship-subsite/files/our-common-bond-testable.pdf",
    }],
  },
  {
    code: "FR",
    country: "France",
    status: "generally_allowed",
    headline: "France permits dual and multiple nationality.",
    summary: "French law does not require a person becoming French to renounce an existing nationality, or a French citizen acquiring another nationality to renounce French nationality.",
    practicalNotes: [
      "A French multiple national is generally treated only as a national of the other country while in that country, which can limit French diplomatic protection.",
      "A person becoming French declares which existing nationalities they intend to retain or renounce.",
    ],
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Peut-on avoir plusieurs nationalités en France ?",
      publisher: "Service Public, French Republic",
      url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F334",
    }],
  },
  {
    code: "IE",
    country: "Ireland",
    status: "generally_allowed",
    headline: "Irish law allows a person to retain another citizenship.",
    summary: "An Irish citizen does not have to give up Irish citizenship to become a citizen elsewhere, and a person does not have to give up another citizenship to become Irish by naturalisation, birth, or descent.",
    practicalNotes: [
      "The other country's law may still require renunciation or cause automatic loss.",
      "Irish consular protection can be limited while a dual citizen is in the country of their other nationality.",
    ],
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Dual Citizenship",
      publisher: "Immigration Service Delivery, Department of Justice, Ireland",
      url: "https://www.irishimmigration.ie/how-to-become-a-citizen/dual-citizenship/",
    }],
  },
  {
    code: "IT",
    country: "Italy",
    status: "generally_allowed",
    headline: "Italy generally permits an Italian citizen to retain a later foreign citizenship.",
    summary: "Since Law No. 91/1992 took effect, acquiring a foreign citizenship does not ordinarily cause loss of Italian citizenship unless the person formally renounces it, subject to international agreements.",
    practicalNotes: [
      "Citizenship recognition by descent was materially restricted in 2025 for people born abroad who already hold another citizenship.",
      "Historic loss, reacquisition, descent, and treaty cases require route-specific review.",
    ],
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Cittadinanza",
      publisher: "Ministry of Foreign Affairs and International Cooperation, Italy",
      url: "https://www.esteri.it/it/servizi-consolari-e-visti/normativa_consolare/serviziconsolari/cittadinanza/",
    }],
  },
  {
    code: "BR",
    country: "Brazil",
    status: "generally_allowed",
    headline: "Brazil no longer removes nationality merely because another nationality was acquired.",
    summary: "Constitutional Amendment No. 131 of 2023 removed voluntary acquisition of another nationality as an automatic ground for loss; loss now generally requires an express request or judicial cancellation in the defined cases.",
    practicalNotes: [
      "An express loss request cannot be accepted where it would create statelessness.",
      "Renunciation does not prevent later reacquisition of original Brazilian nationality under the law.",
    ],
    reviewedAt: "2026-08-30",
    sources: [{
      label: "Constitutional Amendment No. 131",
      publisher: "Presidency of the Federative Republic of Brazil",
      url: "https://www.presidencia.gov.br/ccivil_03/constituicao/emendas/emc/emc131.htm",
    }],
  },
  {
    code: "ES",
    country: "Spain",
    status: "conditional",
    headline: "Spanish dual-nationality outcomes depend on origin, the other country, residence, and conservation procedures.",
    summary: "Spain protects dual nationality without renunciation for specified Ibero-American countries, Andorra, the Philippines, Equatorial Guinea and Portugal; a bilateral convention separately covers France. Other acquisition and retention cases can require renunciation declarations or a timely declaration to conserve Spanish nationality.",
    practicalNotes: [
      "Some Spanish citizens resident abroad must declare their wish to retain Spanish nationality within three years of acquiring or exclusively using another nationality.",
      "People born and resident abroad to a Spanish parent also born abroad can face a separate conservation deadline after majority or emancipation.",
    ],
    reviewedAt: "2026-08-30",
    sources: [
      {
        label: "Tener la Doble Nacionalidad",
        publisher: "Ministry of Justice, Spain",
        url: "https://www.mjusticia.gob.es/es/ciudadania/nacionalidad/que-es-nacionalidad/tener-doble-nacionalidad",
      },
      {
        label: "Spanish Civil Code, Article 24",
        publisher: "Official State Gazette, Spain",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763",
      },
      {
        label: "Spain–France nationality convention",
        publisher: "Official State Gazette, Spain",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-4916",
      },
    ],
  },
  {
    code: "IL",
    country: "Israel",
    status: "conditional",
    headline: "Israeli multiple-citizenship treatment depends strongly on the acquisition route.",
    summary: "Israel has official procedures for citizens who already hold another nationality, but ordinary naturalisation of a permanent resident requires relinquishing the other citizenship or proving it will cease after naturalisation.",
    practicalNotes: [
      "Citizenship acquired through return, birth, residence, naturalisation, or grant can engage different rules.",
      "A mobility combination containing Israel should not be treated as legally attainable without checking the person's acquisition route and the other country's law.",
    ],
    reviewedAt: "2026-08-30",
    sources: [
      {
        label: "Naturalisation for permanent residents",
        publisher: "Population and Immigration Authority, Israel",
        url: "https://www.gov.il/en/service/request_for_citizenship_of_a_person_who_holds_pemanent_residency",
      },
      {
        label: "Renounce Israeli citizenship to keep foreign citizenship",
        publisher: "Population and Immigration Authority, Israel",
        url: "https://www.gov.il/en/service/treatment_of_waiver_of_citizenship_for_applicant_who_keeps_previous_citizenship",
      },
    ],
  },
  {
    code: "IN",
    country: "India",
    status: "generally_restricted",
    headline: "India does not allow Indian and foreign citizenship to be held simultaneously.",
    summary: "Overseas Citizenship of India is a separate immigration status, not Indian citizenship and not a second passport.",
    practicalNotes: [
      "An OCI card provides a lifelong multiple-entry visa and specified benefits, but it does not make its holder an Indian citizen.",
      "A proposed passport combination containing India and another citizenship may therefore be legally incompatible for many adults.",
    ],
    reviewedAt: "2026-08-28",
    sources: [{
      label: "Overseas Citizenship of India Cardholder — introduction",
      publisher: "Ministry of Home Affairs, India",
      url: "https://www.mha.gov.in/sites/default/files/OCIIntroduction_23072021.pdf",
    }],
  },
  {
    code: "CN",
    country: "China",
    status: "generally_restricted",
    headline: "China does not recognize dual nationality for Chinese nationals.",
    summary: "The Nationality Law rejects dual nationality and provides for loss of Chinese nationality in specified cases of voluntary foreign naturalisation.",
    practicalNotes: [
      "Birth, parents' settlement abroad and how another nationality was acquired can change the result.",
      "A proposed China-plus-another-country combination requires individual nationality-law review.",
    ],
    reviewedAt: "2026-08-28",
    sources: [{
      label: "Nationality Law of the People's Republic of China",
      publisher: "National Immigration Administration, China",
      url: "https://en.nia.gov.cn/n147418/n147458/c155976/content.html",
    }],
  },
  {
    code: "SG",
    country: "Singapore",
    status: "generally_restricted",
    headline: "Singapore does not allow adults to retain dual citizenship.",
    summary: "Singapore citizenship procedures require an undertaking acknowledging that dual citizenship is not allowed; age, acquisition route and National Service obligations require individual review.",
    practicalNotes: [
      "Renouncing or losing citizenship before completing National Service can affect the person and family members' later immigration applications.",
    ],
    reviewedAt: "2026-08-28",
    sources: [
      {
        label: "Singapore citizenship oral undertaking",
        publisher: "Immigration & Checkpoints Authority, Singapore",
        url: "https://www.ica.gov.sg/docs/default-source/ica/forms/oral-undertaking-form.pdf",
      },
      {
        label: "Becoming a Singapore citizen",
        publisher: "Immigration & Checkpoints Authority, Singapore",
        url: "https://www.ica.gov.sg/reside/citizenship",
      },
    ],
  },
  {
    code: "JP",
    country: "Japan",
    status: "conditional",
    headline: "Japan requires multiple nationals to choose a nationality under prescribed rules.",
    summary: "A Japanese national who voluntarily acquires a foreign nationality loses Japanese nationality; people who hold more than one nationality through other circumstances are subject to choice and notification rules.",
    practicalNotes: [
      "The applicable deadline depends on the person's age and when multiple nationality arose.",
      "Naturalisation in Japan generally requires the applicant to have no nationality or to lose the prior nationality on naturalisation, subject to a narrow exception.",
    ],
    reviewedAt: "2026-08-28",
    sources: [{
      label: "Nationality Q&A",
      publisher: "Ministry of Justice, Japan",
      url: "https://www.moj.go.jp/EN/MINJI/minji78.html",
    }],
  },
  {
    code: "NL",
    country: "Netherlands",
    status: "conditional",
    headline: "Dutch multiple citizenship depends on the acquisition route and exceptions.",
    summary: "Naturalising applicants are generally required to renounce another citizenship when possible, with defined exceptions; Dutch citizens may also automatically lose Dutch citizenship when voluntarily acquiring another citizenship unless an exception applies.",
    practicalNotes: [
      "Exceptions include some spouses or registered partners of Dutch citizens and recognized refugees.",
      "The other country's law can independently cause nationality loss.",
    ],
    reviewedAt: "2026-08-28",
    sources: [{
      label: "Dual citizenship",
      publisher: "Government of the Netherlands",
      url: "https://www.government.nl/themes/migration-and-travel/dutch-citizenship/dual-citizenship",
    }],
  },
  {
    code: "PH",
    country: "Philippines",
    status: "conditional",
    headline: "Philippine retention and reacquisition rules protect specified natural-born Filipinos.",
    summary: "Republic Act No. 9225 allows natural-born Philippine citizens who acquire foreign citizenship to retain or reacquire Philippine citizenship through the statutory process; it is not a universal route for every foreign national.",
    practicalNotes: [
      "Eligible applicants must complete the prescribed application and oath process.",
      "The law can permit two or more concurrent citizenships for people within its scope.",
    ],
    reviewedAt: "2026-08-28",
    sources: [
      {
        label: "Republic Act No. 9225",
        publisher: "Senate of the Philippines Legislative Reference Bureau",
        url: "https://ldr.senate.gov.ph/legislative%2Bissuances/Republic%20Act%20No.%209225",
      },
      {
        label: "RA 9225 dual-citizenship FAQ",
        publisher: "Department of Foreign Affairs, Philippines",
        url: "https://romepe.dfa.gov.ph/images/FAQs_-_Dual_Citizenship_as_of_Feb_2020.pdf",
      },
    ],
  },
  {
    code: "ID",
    country: "Indonesia",
    status: "conditional",
    headline: "Indonesia provides limited dual citizenship for qualifying children.",
    summary: "Qualifying children may hold limited dual citizenship, but they must choose one nationality after turning 18 or marrying, within the statutory period.",
    practicalNotes: [
      "The limited status applies only to children in categories defined by Indonesia's nationality law.",
      "Registration, affidavit and passport-use requirements can apply before the choice deadline.",
    ],
    reviewedAt: "2026-08-28",
    sources: [{
      label: "Children with limited dual citizenship",
      publisher: "Directorate General of Immigration, Indonesia",
      url: "https://ngurahrai.imigrasi.go.id/anak-berkewarganegaraan-ganda/",
    }],
  },
];

export const CITIZENSHIP_POLICY_BY_CODE = new Map(CITIZENSHIP_POLICIES.map((policy) => [policy.code, policy]));
