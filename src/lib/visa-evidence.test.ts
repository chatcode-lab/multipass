import { describe, expect, it } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import {
  ANGOLA_TOURIST_VISA_EXEMPT_CODES,
  AUSTRALIA_ETA_CODES,
  AUSTRALIA_EVISITOR_ONLY_CODES,
  AUSTRALIA_VISITOR_VISA_REQUIRED_CODES,
  CANADA_CONDITIONAL_ETA_CODES,
  CANADA_DOCUMENT_CONSTRAINED_ETA_CODES,
  CANADA_ETA_ORDINARY_PASSPORT_CODES,
  CANADA_VISITOR_VISA_REQUIRED_CODES,
  EU_EEA_SWISS_FREE_MOVEMENT_DESTINATION_CODES,
  EU_EEA_SWISS_FREE_MOVEMENT_PASSPORT_CODES,
  ECUADOR_EVISA_ORDINARY_PASSPORT_CODES,
  EU_SCHENGEN_ANNEX_I_ORDINARY_PASSPORT_CODES,
  EU_SCHENGEN_ANNEX_II_BIOMETRIC_CODES,
  EU_SCHENGEN_ANNEX_II_UNCONDITIONAL_CODES,
  EU_SCHENGEN_VISA_POLICY_DESTINATION_CODES,
  HKSAR_EU_SCHENGEN_VISA_FREE_DESTINATION_CODES,
  HONG_KONG_VISA_FREE_CODES,
  HONG_KONG_VISA_REQUIRED_CODES,
  KENYA_60_DAY_ETA_EXEMPT_CODES,
  KENYA_90_DAY_ETA_EXEMPT_CODES,
  KENYA_EAC_ETA_EXEMPT_CODES,
  JAPAN_EPASSPORT_VISA_EXEMPT_CODES,
  JAPAN_MRP_VISA_EXEMPT_CODES,
  JAPAN_ORDINARY_90_DAY_VISA_EXEMPT_CODES,
  JAPAN_VISA_REQUIRED_CODES,
  IRELAND_EEA_SWISS_FREE_MOVEMENT_CODES,
  IRELAND_EU_FREE_MOVEMENT_CODES,
  IRELAND_ORDINARY_VISA_FREE_CODES,
  IRELAND_ORDINARY_VISA_REQUIRED_CODES,
  ISRAEL_ETA_IL_ORDINARY_PASSPORT_CODES,
  ISRAEL_VISITOR_VISA_REQUIRED_ORDINARY_PASSPORT_CODES,
  MALDIVES_VOA_ORDINARY_PASSPORT_CODES,
  MOZAMBIQUE_EVISA_ORDINARY_PASSPORT_CODES,
  NEW_ZEALAND_AUSTRALIA_CONDITIONAL_NZETA_CODES,
  NEW_ZEALAND_CONDITIONED_NZETA_CODES,
  NEW_ZEALAND_STANDARD_NZETA_CODES,
  NEW_ZEALAND_VISITOR_VISA_REQUIRED_CODES,
  OFFICIAL_VISA_SOURCES,
  PALAU_PRECLEARANCE_ETA_ORDINARY_PASSPORT_CODES,
  RWANDA_VOA_ORDINARY_PASSPORT_CODES,
  SAMOA_VOA_ORDINARY_PASSPORT_CODES,
  SEYCHELLES_ETA_ORDINARY_PASSPORT_CODES,
  SINGAPORE_EVISA_CODES,
  SINGAPORE_VISA_FREE_COMPLEMENT_CODES,
  SOUTH_KOREA_KETA_30_DAY_CODES,
  SOUTH_KOREA_KETA_90_DAY_CODES,
  SOUTH_KOREA_KETA_THREE_MONTH_CODES,
  SOUTH_KOREA_TEMPORARY_KETA_EXEMPT_90_DAY_CODES,
  SOUTH_KOREA_TEMPORARY_KETA_EXEMPT_THREE_MONTH_CODES,
  TAIWAN_30_DAY_VISA_EXEMPT_CODES,
  TAIWAN_90_DAY_VISA_EXEMPT_CODES,
  TAIWAN_EVISA_CODES,
  TAIWAN_TRIAL_14_DAY_VISA_EXEMPT_CODES,
  TAIWAN_VISITOR_VISA_REQUIRED_CODES,
  TRINIDAD_AND_TOBAGO_EVISA_ORDINARY_PASSPORT_CODES,
  UNITED_STATES_PP10998_VISITOR_RESTRICTION_CODES,
  UNITED_STATES_VWP_CODES,
  UNITED_STATES_VISITOR_VISA_REQUIRED_GENERAL_CODES,
  UNITED_KINGDOM_APRIL_2025_ETA_CODES,
  UNITED_KINGDOM_EARLY_ETA_CODES,
  UNITED_KINGDOM_JANUARY_2025_ETA_CODES,
  UNITED_KINGDOM_VISITOR_VISA_CODES,
  VANUATU_VOA_ORDINARY_PASSPORT_CODES,
  VISA_POLICY_EVIDENCE,
} from "@/data/visa-evidence";
import type { DataSnapshot } from "./types";
import {
  destinationSlug,
  evidenceRelationshipPairs,
  getVisaRelationshipEvidence,
  resolveDestinationBySlug,
  resolveVisaRelationshipSlug,
  visaRelationshipHref,
} from "./visa-evidence";

const snapshot = fallbackSnapshot as DataSnapshot;

describe("visa relationship URLs", () => {
  it("resolves readable passport, destination, and requested-status slugs", () => {
    const resolved = resolveVisaRelationshipSlug("belgium-congo-evisa", snapshot.manifest);
    expect(resolved).toMatchObject({
      passport: { code: "BE" },
      destination: { code: "CD" },
      requestedStatus: "evisa",
    });
    expect(visaRelationshipHref(resolved!.passport, resolved!.destination, resolved!.requestedStatus))
      .toBe("/belgium-congo-evisa");
  });

  it("still resolves a recognized but outdated status for canonical redirecting", () => {
    expect(resolveVisaRelationshipSlug("belgium-chad-evisa", snapshot.manifest)).toMatchObject({
      passport: { code: "BE" },
      destination: { code: "TD" },
      requestedStatus: "evisa",
    });
  });

  it("keeps legacy St. Maarten URLs resolvable after correcting MF to French Saint Martin", () => {
    const destination = resolveDestinationBySlug("st-maarten", snapshot.manifest);
    expect(destination).toMatchObject({ code: "MF", name: "Saint Martin (French part)" });
    expect(destinationSlug(destination!)).toBe("saint-martin-french-part");
    expect(resolveVisaRelationshipSlug("belgium-st-maarten-visa-free", snapshot.manifest)).toMatchObject({
      passport: { code: "BE" },
      destination: { code: "MF" },
      requestedStatus: "visa_free",
    });
  });

  it("uses the passport page as the canonical citizenship record", () => {
    const estonia = snapshot.manifest.passports.find(({ code }) => code === "EE")!;
    const destination = snapshot.manifest.destinations.find(({ code }) => code === "EE")!;
    expect(visaRelationshipHref(estonia, destination, "citizenship")).toBe("/passport/estonia");
  });

  it("keeps destination and passport–destination slugs unique across the catalog", () => {
    const destinationSlugs = snapshot.manifest.destinations.map(destinationSlug);
    expect(new Set(destinationSlugs).size).toBe(snapshot.manifest.destinations.length);

    const pairSlugs = snapshot.manifest.passports.flatMap((passport) =>
      snapshot.manifest.destinations.map((destination) => `${passport.slug}-${destinationSlug(destination)}`),
    );
    expect(new Set(pairSlugs).size).toBe(snapshot.manifest.passports.length * snapshot.manifest.destinations.length);
  });
});

describe("official visa evidence", () => {
  it("supports the seeded policy examples without claiming unsupported pairs", () => {
    expect(getVisaRelationshipEvidence("BE", "AO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "KE", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "CD", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "HK", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "TD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BI", "CD", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("expands Hong Kong's reviewed ordinary-passport schedule without flattening special arrangements", () => {
    expect(HONG_KONG_VISA_FREE_CODES).toHaveLength(144);
    expect(HONG_KONG_VISA_REQUIRED_CODES).toHaveLength(48);
    expect(new Set([...HONG_KONG_VISA_FREE_CODES, ...HONG_KONG_VISA_REQUIRED_CODES, "IN"]).size).toBe(193);
    expect(HONG_KONG_VISA_FREE_CODES).not.toContain("MO");
    expect(HONG_KONG_VISA_REQUIRED_CODES).not.toContain("TW");

    const hongKongPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "HK");
    expect(hongKongPairs).toHaveLength(194);
    expect(getVisaRelationshipEvidence("CN", "HK", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("models Kenya's current ETA scope while leaving the misspelled Saint Kitts entry unresolved", () => {
    expect(KENYA_EAC_ETA_EXEMPT_CODES).toHaveLength(6);
    expect(KENYA_90_DAY_ETA_EXEMPT_CODES).toHaveLength(42);
    expect(KENYA_60_DAY_ETA_EXEMPT_CODES).toHaveLength(28);

    const kenyaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "KE");
    expect(kenyaPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("GY", "KE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ID", "KE", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KN", "KE", "visa_free").supportsCurrentStatus).toBe(false);
  });

  it("covers HKSAR access to 30 EU and Schengen destinations", () => {
    expect(HKSAR_EU_SCHENGEN_VISA_FREE_DESTINATION_CODES).toHaveLength(30);
    expect(getVisaRelationshipEvidence("HK", "CH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "CY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "IE", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("covers high-confidence EU and Schengen Annex I and Annex II cohorts", () => {
    expect(EU_SCHENGEN_VISA_POLICY_DESTINATION_CODES).toHaveLength(30);
    expect(EU_SCHENGEN_ANNEX_I_ORDINARY_PASSPORT_CODES).toHaveLength(104);
    expect(EU_SCHENGEN_ANNEX_II_UNCONDITIONAL_CODES).toHaveLength(37);
    expect(EU_SCHENGEN_ANNEX_II_BIOMETRIC_CODES).toHaveLength(6);
    expect(getVisaRelationshipEvidence("VU", "DE", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "FR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GE", "CH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "CY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "DE", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("covers EU, EEA, Swiss, and Irish cross-border free movement", () => {
    expect(EU_EEA_SWISS_FREE_MOVEMENT_DESTINATION_CODES).toHaveLength(30);
    expect(EU_EEA_SWISS_FREE_MOVEMENT_PASSPORT_CODES).toHaveLength(31);
    expect(getVisaRelationshipEvidence("IE", "DE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "NO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "CH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "CH", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("adds agreement-backed EU waivers in both directions", () => {
    expect(getVisaRelationshipEvidence("AE", "DE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "AE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VC", "FR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "VC", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NR", "DE", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AE", "CH", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("covers Brazil and Mexico from destination-authority ordinary-passport lists", () => {
    const brazilPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "BR");
    const mexicoPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MX");

    expect(brazilPairs).toHaveLength(199);
    expect(mexicoPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("CN", "BR", "visa_free", "2026-08-20").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "BR", "visa_free", "2027-01-01").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("US", "BR", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "MX", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VA", "MX", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "MX", "visa_required").supportsCurrentStatus).toBe(false);
  });

  it("covers Fiji's complete visa-exempt and pre-entry-visa cohorts", () => {
    const fijiPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "FJ");

    expect(fijiPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("AU", "FJ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "FJ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "FJ", "visa_on_arrival").supportsCurrentStatus).toBe(false);
  });

  it("covers South Africa's complete foreign ordinary-passport scope", () => {
    const southAfricaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "ZA");

    expect(southAfricaPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("AU", "ZA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "ZA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "ZA", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("keeps The Bahamas' explicit current classifications and ambiguous rows separate", () => {
    expect(getVisaRelationshipEvidence("XK", "BS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "BS", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "BS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "BS", "evisa").supportsCurrentStatus).toBe(false);
  });

  it("covers Mauritius while leaving obsolete or absent country rows unresolved", () => {
    const mauritiusPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MU");

    expect(mauritiusPairs).toHaveLength(196);
    expect(getVisaRelationshipEvidence("US", "MU", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ID", "MU", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GY", "MU", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ME", "MU", "visa_required").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("XK", "MU", "visa_required").supportsCurrentStatus).toBe(false);
  });

  it("covers Malaysia's current social-visit framework and expires India's temporary exemption", () => {
    const malaysiaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MY");

    expect(malaysiaPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("US", "MY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CM", "MY", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NE", "MY", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "MY", "visa_free", "2026-12-31").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "MY", "visa_free", "2027-01-01").supportsCurrentStatus).toBe(false);
  });

  it("covers Barbados' explicit current rows without calling its online letter an eVisa", () => {
    const barbadosPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "BB");

    expect(barbadosPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("CG", "BB", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HT", "BB", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "BB", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "BB", "evisa").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("MV", "BB", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("PS", "BB", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("keeps Indonesia's e-VOA within the Visa on Arrival classification", () => {
    const indonesiaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "ID");

    expect(indonesiaPairs).toHaveLength(189);
    expect(getVisaRelationshipEvidence("CL", "ID", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "ID", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "ID", "evisa").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AG", "ID", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "ID", "visa_required").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("XK", "ID", snapshot.passports.XK.statuses.ID).supportsCurrentStatus).toBe(false);
  });

  it("classifies Rwanda's universal arrival visa without treating fee waivers as visa-free", () => {
    const rwandaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "RW");

    expect(RWANDA_VOA_ORDINARY_PASSPORT_CODES).toHaveLength(198);
    expect(rwandaPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("DE", "RW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "RW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "RW", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("RW", "RW", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("keeps Oman's conditional exemptions explicit and its source divergence unresolved", () => {
    const omanPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "OM");

    expect(omanPairs).toHaveLength(109);
    expect(getVisaRelationshipEvidence("DE", "OM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "OM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "OM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "OM", "evisa").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("TW", "OM", "visa_free").supportsCurrentStatus).toBe(false);
  });

  it("covers Jamaica's explicit ordinary-passport table without inferring omitted rows", () => {
    const jamaicaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "JM");

    expect(jamaicaPairs).toHaveLength(197);
    expect(getVisaRelationshipEvidence("US", "JM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "JM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "JM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "JM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CG", "JM", "visa_required").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("PS", "JM", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("covers Zambia's three explicit visitor categories without resolving legacy names", () => {
    const zambiaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "ZM");

    expect(zambiaPairs).toHaveLength(196);
    expect(getVisaRelationshipEvidence("US", "ZM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "ZM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "ZM", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZM", "ZM", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ME", "ZM", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("TW", "ZM", "evisa").supportsCurrentStatus).toBe(false);
  });

  it("covers Ecuador's explicit eVisa list and visa-free complement", () => {
    const ecuadorPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "EC");

    expect(ECUADOR_EVISA_ORDINARY_PASSPORT_CODES).toHaveLength(45);
    expect(ecuadorPairs).toHaveLength(197);
    expect(getVisaRelationshipEvidence("AL", "EC", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PK", "EC", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "EC", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "EC", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("TW", "EC", "visa_required").supportsCurrentStatus).toBe(false);
  });

  it("covers Argentina's complete ordinary-tourist matrix and conditional AVE routes", () => {
    const argentinaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "AR");

    expect(new Set(argentinaPairs.map(({ passport }) => passport.code)).size).toBe(199);
    expect(getVisaRelationshipEvidence("US", "AR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AL", "AR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AL", "AR", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "AR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "AR", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("covers Nepal's visitor scope without calling its online arrival form an eVisa", () => {
    const nepalPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "NP");

    expect(new Set(nepalPairs.map(({ passport }) => passport.code)).size).toBe(198);
    expect(getVisaRelationshipEvidence("IN", "NP", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IR", "NP", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PK", "NP", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "NP", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "NP", "evisa").supportsCurrentStatus).toBe(false);
  });

  it("covers Canada's current nationality and document-qualified visitor rules", () => {
    expect(CANADA_ETA_ORDINARY_PASSPORT_CODES).toHaveLength(47);
    expect(CANADA_DOCUMENT_CONSTRAINED_ETA_CODES).toHaveLength(6);
    expect(CANADA_CONDITIONAL_ETA_CODES).toHaveLength(17);
    expect(CANADA_VISITOR_VISA_REQUIRED_CODES).toHaveLength(127);

    const canadaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "CA");
    expect(canadaPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("US", "CA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "CA", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "CA", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AG", "CA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "CA", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("models Australia's ETA, eVisitor, and New Zealand arrival routes", () => {
    expect(AUSTRALIA_ETA_CODES).toHaveLength(33);
    expect(AUSTRALIA_EVISITOR_ONLY_CODES).toHaveLength(12);
    expect(AUSTRALIA_VISITOR_VISA_REQUIRED_CODES).toHaveLength(152);
    const etaCodes = new Set<string>(AUSTRALIA_ETA_CODES);
    expect(AUSTRALIA_EVISITOR_ONLY_CODES.some((code) => etaCodes.has(code))).toBe(false);

    const australiaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "AU");
    expect(australiaPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("NZ", "AU", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "AU", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BG", "AU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "AU", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "AU", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("covers Japan's full ordinary-passport catalog with document conditions", () => {
    expect(JAPAN_ORDINARY_90_DAY_VISA_EXEMPT_CODES).toHaveLength(55);
    expect(JAPAN_EPASSPORT_VISA_EXEMPT_CODES).toHaveLength(7);
    expect(JAPAN_MRP_VISA_EXEMPT_CODES).toHaveLength(3);
    expect(JAPAN_VISA_REQUIRED_CODES).toHaveLength(124);

    const japanPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "JP");
    expect(japanPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("TH", "JP", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ID", "JP", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KH", "JP", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MN", "JP", "evisa").supportsCurrentStatus).toBe(false);
  });

  it("covers New Zealand's full ordinary-passport baseline without mode-based duplicate URLs", () => {
    expect(NEW_ZEALAND_STANDARD_NZETA_CODES).toHaveLength(51);
    expect(NEW_ZEALAND_CONDITIONED_NZETA_CODES).toHaveLength(9);
    expect(NEW_ZEALAND_VISITOR_VISA_REQUIRED_CODES).toHaveLength(137);
    expect(NEW_ZEALAND_AUSTRALIA_CONDITIONAL_NZETA_CODES).toHaveLength(13);

    const newZealandPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "NZ");
    expect(newZealandPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("AU", "NZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "NZ", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "NZ", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "NZ", "visa_required").policies).toHaveLength(2);
  });

  it("covers Singapore's visa-required list and its explicit operational complement", () => {
    expect(SINGAPORE_EVISA_CODES).toHaveLength(35);
    expect(SINGAPORE_VISA_FREE_COMPLEMENT_CODES).toHaveLength(153);
    const singaporePairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "SG");
    expect(singaporePairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("SS", "SG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "SG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "SG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "SG", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("models South Korea's current K-ETA scope and time-limited exemption", () => {
    expect(SOUTH_KOREA_TEMPORARY_KETA_EXEMPT_90_DAY_CODES).toHaveLength(18);
    expect(SOUTH_KOREA_TEMPORARY_KETA_EXEMPT_THREE_MONTH_CODES).toHaveLength(5);
    expect(SOUTH_KOREA_KETA_30_DAY_CODES).toHaveLength(29);
    expect(SOUTH_KOREA_KETA_90_DAY_CODES).toHaveLength(47);
    expect(SOUTH_KOREA_KETA_THREE_MONTH_CODES).toHaveLength(5);

    const southKoreaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "KR");
    expect(southKoreaPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("CH", "KR", "visa_free", "2026-08-20").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "KR", "visa_free", "2027-01-01").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("CL", "KR", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "KR", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("covers Israel's ordinary-passport ETA and visitor-visa baseline", () => {
    expect(ISRAEL_ETA_IL_ORDINARY_PASSPORT_CODES).toHaveLength(100);
    expect(ISRAEL_VISITOR_VISA_REQUIRED_ORDINARY_PASSPORT_CODES).toHaveLength(97);
    const israelPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "IL");
    expect(israelPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("TV", "IL", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "IL", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PS", "IL", "unknown").supportsCurrentStatus).toBe(false);
  });

  it("covers Taiwan's current ordinary-passport entry scope without flattening special documents", () => {
    expect(TAIWAN_90_DAY_VISA_EXEMPT_CODES).toHaveLength(54);
    expect(TAIWAN_30_DAY_VISA_EXEMPT_CODES).toHaveLength(7);
    expect(TAIWAN_TRIAL_14_DAY_VISA_EXEMPT_CODES).toHaveLength(3);
    expect(TAIWAN_EVISA_CODES).toHaveLength(19);
    expect(TAIWAN_VISITOR_VISA_REQUIRED_CODES).toHaveLength(110);

    const taiwanPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "TW");
    expect(taiwanPairs).toHaveLength(197);
    expect(getVisaRelationshipEvidence("JP", "TW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "TW", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AM", "TW", "evisa", "2026-08-20").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AM", "TW", "evisa", "2027-04-01").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BF", "TW", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "TW", "visa_required").supportsCurrentStatus).toBe(false);
  });

  it("covers Ireland's full ordinary-passport baseline without conditional-program URLs", () => {
    expect(IRELAND_EU_FREE_MOVEMENT_CODES).toHaveLength(26);
    expect(IRELAND_EEA_SWISS_FREE_MOVEMENT_CODES).toHaveLength(4);
    expect(IRELAND_ORDINARY_VISA_FREE_CODES).toHaveLength(44);
    expect(IRELAND_ORDINARY_VISA_REQUIRED_CODES).toHaveLength(123);

    const irelandPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "IE");
    expect(irelandPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("GB", "IE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "IE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "IE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "IE", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("covers the United Kingdom ETA and visitor-visa baseline", () => {
    expect(UNITED_KINGDOM_EARLY_ETA_CODES).toHaveLength(6);
    expect(UNITED_KINGDOM_JANUARY_2025_ETA_CODES).toHaveLength(43);
    expect(UNITED_KINGDOM_APRIL_2025_ETA_CODES).toHaveLength(34);
    expect(UNITED_KINGDOM_VISITOR_VISA_CODES).toHaveLength(114);

    const unitedKingdomPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "GB");
    expect(unitedKingdomPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("IE", "GB", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "GB", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "GB", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "GB", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("covers the United States visitor baseline and preserves narrow exceptions", () => {
    expect(UNITED_STATES_VWP_CODES).toHaveLength(42);
    expect(UNITED_STATES_VISITOR_VISA_REQUIRED_GENERAL_CODES).toHaveLength(149);
    expect(UNITED_STATES_PP10998_VISITOR_RESTRICTION_CODES).toHaveLength(39);
    const unitedStatesPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "US");
    expect(unitedStatesPairs).toHaveLength(160);
    expect(getVisaRelationshipEvidence("JP", "US", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "US", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "US", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BS", "US", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FM", "US", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "US", snapshot.passports.AF.statuses.US).supportsCurrentStatus).toBe(false);
  });

  it("keeps the Colombia and Peru EU agreements directional while allowing independent inbound rules", () => {
    expect(getVisaRelationshipEvidence("CO", "DE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "CO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PE", "PT", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PT", "PE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CO", "IE", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("IE", "PE", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("keeps the original 98-country Angola schedule and its later Philippines addition", () => {
    expect(ANGOLA_TOURIST_VISA_EXEMPT_CODES).toHaveLength(98);
    const angolaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination, status }) => destination.code === "AO" && status === "visa_free");
    expect(angolaPairs).toHaveLength(98);
    expect(getVisaRelationshipEvidence("PH", "AO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(snapshot.manifest.passports.some(({ code }) => code === "CK" || code === "NU")).toBe(false);
  });

  it("covers island destination-wide entry rules and Trinidad and Tobago's explicit eVisa cohort", () => {
    expect(MALDIVES_VOA_ORDINARY_PASSPORT_CODES).toHaveLength(197);
    expect(SEYCHELLES_ETA_ORDINARY_PASSPORT_CODES).toHaveLength(198);
    expect(SAMOA_VOA_ORDINARY_PASSPORT_CODES).toHaveLength(198);
    expect(TRINIDAD_AND_TOBAGO_EVISA_ORDINARY_PASSPORT_CODES).toHaveLength(6);

    expect(getVisaRelationshipEvidence("AZ", "MV", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IL", "MV", "visa_required").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("XK", "SC", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AT", "WS", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "TT", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VU", "TT", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZM", "TT", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZW", "TT", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "TT", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AD", "TT", snapshot.passports.AD.statuses.TT).supportsCurrentStatus).toBe(false);
  });

  it("supports Saint Vincent and the Grenadines' named pre-entry and residual visa-free cohorts", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "VC");

    expect(pairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("BD", "VC", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NP", "VC", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "VC", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VC", "VC", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Madagascar, Palau, Vanuatu, Cabo Verde, and Mozambique pass", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("MG")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("PS", "MG", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(snapshot.passports.PS.statuses.MG).toBe("visa_on_arrival");

    expect(PALAU_PRECLEARANCE_ETA_ORDINARY_PASSPORT_CODES).toHaveLength(10);
    expect(pairsFor("PW")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("KH", "PW", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CY", "PW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IL", "PW", "visa_on_arrival").supportsCurrentStatus).toBe(true);

    expect(VANUATU_VOA_ORDINARY_PASSPORT_CODES).toHaveLength(113);
    expect(pairsFor("VU")).toHaveLength(191);
    expect(getVisaRelationshipEvidence("US", "VU", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CM", "VU", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BH", "VU", snapshot.passports.BH.statuses.VU).supportsCurrentStatus).toBe(false);

    expect(pairsFor("CV")).toHaveLength(159);
    expect(getVisaRelationshipEvidence("US", "CV", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "CV", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "CV", snapshot.passports.AU.statuses.CV).supportsCurrentStatus).toBe(false);

    expect(MOZAMBIQUE_EVISA_ORDINARY_PASSPORT_CODES).toHaveLength(146);
    expect(pairsFor("MZ")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "MZ", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AD", "MZ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NG", "MZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ST", "MZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MZ", "MZ", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Uganda, Benin, Antigua and Barbuda, and Colombia pass", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("UG")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("AO", "UG", "evisa").supportsCurrentStatus).toBe(true);
    expect(snapshot.passports.AO.statuses.UG).toBe("evisa");
    expect(getVisaRelationshipEvidence("UG", "UG", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("BJ")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("SG", "BJ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DZ", "BJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BJ", "BJ", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("AG")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("TO", "AG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HR", "AG", "evisa").supportsCurrentStatus).toBe(true);
    expect(snapshot.passports.HR.statuses.AG).toBe("evisa");

    expect(pairsFor("CO")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("HK", "CO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IL", "CO", "evisa").supportsCurrentStatus).toBe(true);
    expect(snapshot.passports.IL.statuses.CO).toBe("evisa");
  });

  it("covers the reviewed Bahrain, Qatar, Saudi Arabia, and Jordan pass", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("BH")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("AE", "BH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("UA", "BH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BB", "BH", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IR", "BH", "visa_required").supportsCurrentStatus).toBe(true);

    expect(pairsFor("QA")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("HK", "QA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RS", "QA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IL", "QA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "QA", "evisa").supportsCurrentStatus).toBe(true);
    expect(snapshot.passports.HK.statuses.QA).toBe("visa_on_arrival");

    expect(pairsFor("SA")).toHaveLength(81);
    expect(getVisaRelationshipEvidence("GB", "SA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "SA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IL", "SA", "visa_on_arrival").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BD", "SA", "visa_required").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BR", "SA", snapshot.passports.BR.statuses.SA).supportsCurrentStatus).toBe(false);

    expect(pairsFor("JO")).toHaveLength(97);
    expect(getVisaRelationshipEvidence("MM", "JO", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "JO", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "JO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "JO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "JO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "JO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "JO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "JO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
  });

  it("covers the reviewed UAE, Kuwait, Lebanon, and Armenia pass", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("AE")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "AE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BD", "AE", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "AE", snapshot.passports.TW.statuses.AE).supportsCurrentStatus).toBe(false);

    expect(pairsFor("KW")).toHaveLength(60);
    expect(getVisaRelationshipEvidence("MO", "KW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CL", "KW", snapshot.passports.CL.statuses.KW).supportsCurrentStatus).toBe(false);

    expect(pairsFor("LB")).toHaveLength(195);
    expect(getVisaRelationshipEvidence("PY", "LB", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SY", "LB", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("EG", "LB", snapshot.passports.EG.statuses.LB).supportsCurrentStatus).toBe(false);

    expect(pairsFor("AM")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("AZ", "AM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "AM", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "AM", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("keeps Iran and Iraq evidence conservative when official nationality scope is incomplete", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("IR")).toHaveLength(51);
    expect(getVisaRelationshipEvidence("BR", "IR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LB", "IR", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "IR", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "IR", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "IR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "IR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "IR", snapshot.passports.IN.statuses.IR).supportsCurrentStatus).toBe(false);

    expect(pairsFor("IQ")).toHaveLength(30);
    expect(getVisaRelationshipEvidence("IQ", "IQ", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "IQ", "evisa").supportsCurrentStatus).toBe(true);
  });

  it("supports named Turkish access to Palestine and Syria while applying Yemen's advance-visa grid", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("PS")).toHaveLength(9);
    expect(getVisaRelationshipEvidence("TR", "PS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "PS", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "PS", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "PS", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "PS", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "PS", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IT", "PS", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "PS", snapshot.passports.US.statuses.PS).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("PS", "PS", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("SY")).toHaveLength(15);
    expect(getVisaRelationshipEvidence("TR", "SY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "SY", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "SY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "SY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "SY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "SY", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SY", "SY", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("YE")).toHaveLength(196);
    expect(getVisaRelationshipEvidence("HK", "YE", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "YE", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IL", "YE", snapshot.passports.IL.statuses.YE).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("XK", "YE", snapshot.passports.XK.statuses.YE).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("YE", "YE", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed India, Sri Lanka, and Vietnam pass", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("IN")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("NP", "IN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "IN", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "IN", "visa_required").supportsCurrentStatus).toBe(true);

    expect(pairsFor("LK")).toHaveLength(197);
    expect(getVisaRelationshipEvidence("SG", "LK", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "LK", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "LK", snapshot.passports.TW.statuses.LK).supportsCurrentStatus).toBe(true);

    expect(pairsFor("VN")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("DE", "VN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "VN", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VN", "VN", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("covers Thailand's current ordinary-passport schedules", () => {
    const thailandPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "TH");

    expect(thailandPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("NL", "TH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ET", "TH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "TH", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TH", "TH", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("covers the reviewed Philippines, Cambodia, and Laos pass", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("PH")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("TV", "PH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "PH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "PH", "visa_required").supportsCurrentStatus).toBe(true);

    expect(pairsFor("KH")).toHaveLength(196);
    expect(getVisaRelationshipEvidence("SG", "KH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "KH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "KH", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "KH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "KH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "KH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "KH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "KH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "KH", snapshot.passports.US.statuses.KH).supportsCurrentStatus).toBe(true);

    expect(pairsFor("LA")).toHaveLength(162);
    expect(getVisaRelationshipEvidence("BY", "LA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "LA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "LA", snapshot.passports.AF.statuses.LA).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("LA", "LA", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Mongolia and Uzbekistan routes", () => {
    const mongoliaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MN");

    expect(mongoliaPairs).toHaveLength(163);
    expect(getVisaRelationshipEvidence("US", "MN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "MN", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KW", "MN", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "MN", snapshot.passports.XK.statuses.MN).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("MN", "MN", "citizenship").supportsCurrentStatus).toBe(false);

    const uzbekistanPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "UZ");
    expect(uzbekistanPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("HK", "UZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JO", "UZ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BD", "UZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SA", "UZ", snapshot.passports.SA.statuses.UZ).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("UZ", "UZ", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("covers the reviewed Kazakhstan and Myanmar routes", () => {
    const kazakhstanPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "KZ");
    expect(kazakhstanPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("BB", "KZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MU", "KZ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "KZ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BD", "KZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PS", "KZ", snapshot.passports.PS.statuses.KZ).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KZ", "KZ", "citizenship").supportsCurrentStatus).toBe(true);

    const myanmarPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MM");
    expect(myanmarPairs).toHaveLength(104);
    expect(getVisaRelationshipEvidence("SG", "MM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "MM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MN", "MM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "MM", snapshot.passports.AF.statuses.MM).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("MM", "MM", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Macao, Brunei, and Kyrgyzstan routes", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("MO")).toHaveLength(196);
    expect(getVisaRelationshipEvidence("AR", "MO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DO", "MO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BD", "MO", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "MO", snapshot.passports.CN.statuses.MO).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("MO", "MO", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("BN")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "BN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "BN", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "BN", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BN", "BN", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("KG")).toHaveLength(81);
    expect(getVisaRelationshipEvidence("RS", "KG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MV", "KG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AL", "KG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TH", "KG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "KG", snapshot.passports.AF.statuses.KG).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("KG", "KG", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers mainland China's reviewed ordinary-passport baseline", () => {
    const chinaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "CN");

    expect(chinaPairs).toHaveLength(195);
    expect(getVisaRelationshipEvidence("WS", "CN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "CN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DM", "CN", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "CN", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "CN", snapshot.passports.HK.statuses.CN).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("CN", "CN", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Bhutan, Bangladesh, and Pakistan routes", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("BT")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("IN", "BT", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BD", "BT", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BT", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BT", "BT", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("BD")).toHaveLength(47);
    expect(getVisaRelationshipEvidence("EG", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BN", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "BD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BD", "BD", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("PK")).toHaveLength(190);
    expect(getVisaRelationshipEvidence("MV", "PK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "PK", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("QA", "PK", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "PK", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DZ", "PK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PK", "PK", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Tajikistan and named Turkmenistan rows while preserving source gaps", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("TJ")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("BB", "TJ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BN", "TJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("WS", "TJ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TJ", "TJ", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("TM")).toHaveLength(21);
    expect(getVisaRelationshipEvidence("TM", "TM", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KZ", "TM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "TM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TR", "TM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "TM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "TM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "TM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "TM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "TM", snapshot.passports.CA.statuses.TM).supportsCurrentStatus).toBe(false);

    expect(pairsFor("AF")).toHaveLength(6);
    expect(getVisaRelationshipEvidence("FR", "AF", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "AF", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TR", "AF", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "AF", snapshot.passports.US.statuses.AF).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AF", "AF", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Timor-Leste while preserving North Korea's unpublished nationality scope", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(new Set(pairsFor("TL").map(({ passport }) => passport.code)).size).toBe(199);
    expect(getVisaRelationshipEvidence("PT", "TL", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "TL", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FI", "TL", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FI", "TL", "visa_on_arrival").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("SG", "TL", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ID", "TL", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TL", "TL", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("KP")).toHaveLength(6);
    expect(getVisaRelationshipEvidence("DE", "KP", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "KP", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "KP", snapshot.passports.US.statuses.KP).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("KP", "KP", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Botswana's bounded official schedules without flattening source conflicts", () => {
    const botswanaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "BW");
    const currentBotswanaPairs = botswanaPairs.filter(({ passport, status }) =>
      snapshot.passports[passport.code].statuses.BW === status,
    );

    expect(currentBotswanaPairs).toHaveLength(181);
    expect(getVisaRelationshipEvidence("US", "BW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "BW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MZ", "BW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "BW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "BW", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AO", "BW", snapshot.passports.AO.statuses.BW).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BW", "BW", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Namibia, Zimbabwe, and Ethiopia schedules", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("NA")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("SG", "NA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "NA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MT", "NA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NA", "NA", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("ZW")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "ZW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "ZW", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZW", "ZW", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BO", "ZW", snapshot.passports.BO.statuses.ZW).supportsCurrentStatus).toBe(false);

    expect(pairsFor("ET")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("KE", "ET", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "ET", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CL", "ET", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ET", "ET", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("covers the reviewed Ghana and Tanzania schedules", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("GH")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("BJ", "GH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "GH", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "GH", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "GH", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("TZ")).toHaveLength(196);
    expect(getVisaRelationshipEvidence("CD", "TZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LK", "TZ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "TZ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TZ", "TZ", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("covers Malawi's reviewed schedules without resolving current source conflicts", () => {
    const malawiPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MW");

    expect(malawiPairs).toHaveLength(192);
    expect(getVisaRelationshipEvidence("DO", "MW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "MW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CD", "MW", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MW", "MW", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("WS", "MW", snapshot.passports.WS.statuses.MW).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("IL", "MW", snapshot.passports.IL.statuses.MW).supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Algeria, Nigeria, and Senegal schedules", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("DZ")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("MA", "DZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MV", "DZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "DZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DZ", "DZ", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("NG")).toHaveLength(188);
    expect(getVisaRelationshipEvidence("GH", "NG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ML", "NG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NG", "NG", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("SN")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("MR", "SN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "SN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "SN", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SN", "SN", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("MA")).toHaveLength(194);
    expect(getVisaRelationshipEvidence("DZ", "MA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CG", "MA", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "MA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CI", "MA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MA", "MA", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Cameroon, Côte d'Ivoire, and named Tunisia outbound rows", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("CM")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("CF", "CM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NG", "CM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "CM", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CM", "CM", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("CI")).toHaveLength(50);
    expect(getVisaRelationshipEvidence("GN", "CI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BF", "CI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CI", "CI", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("TN")).toHaveLength(38);
    expect(getVisaRelationshipEvidence("KZ", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TR", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "TN", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("covers the reviewed Egypt and Mauritania visitor schedules", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("EG")).toHaveLength(192);
    expect(getVisaRelationshipEvidence("US", "EG", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "EG", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KZ", "EG", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "EG", snapshot.passports.HK.statuses.EG).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("EG", "EG", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("MR")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("ML", "MR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SY", "MR", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "MR", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MR", "MR", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Eritrea and Gambia with named outbound Libya evidence", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("ER")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "ER", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KE", "ER", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ER", "ER", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("LY")).toHaveLength(196);
    expect(getVisaRelationshipEvidence("US", "LY", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "LY", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "LY", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "LY", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BJ", "LY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IL", "LY", snapshot.passports.IL.statuses.LY).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("TR", "LY", snapshot.passports.TR.statuses.LY).supportsCurrentStatus).toBe(false);

    expect(pairsFor("GM")).toHaveLength(183);
    expect(getVisaRelationshipEvidence("RU", "GM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "GM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "GM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "GM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "GM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GA", "GM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ST", "GM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ID", "GM", snapshot.passports.ID.statuses.GM).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("GM", "GM", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("keeps Sudan conservative and supports only South Sudan's named exemptions", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("SD")).toHaveLength(13);
    expect(getVisaRelationshipEvidence("SD", "SD", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TR", "SD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "SD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "SD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "SD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "SD", snapshot.passports.CA.statuses.SD).supportsCurrentStatus).toBe(false);

    expect(pairsFor("SS")).toHaveLength(20);
    expect(getVisaRelationshipEvidence("KE", "SS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("UG", "SS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "SS", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "SS", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "SS", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "SS", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "SS", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "SS", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "SS", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "SS", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Burkina Faso, Guinea-Bissau, Sierra Leone, and Burundi scopes", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("BF")).toHaveLength(66);
    expect(getVisaRelationshipEvidence("GH", "BF", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "BF", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "BF", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "BF", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "BF", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "BF", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BF", snapshot.passports.US.statuses.BF).supportsCurrentStatus).toBe(false);

    expect(pairsFor("GW")).toHaveLength(35);
    expect(getVisaRelationshipEvidence("GH", "GW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ML", "GW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "GW", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "GW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "GW", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "GW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "GW", "visa_required").supportsCurrentStatus).toBe(true);

    expect(pairsFor("SL")).toHaveLength(28);
    expect(getVisaRelationshipEvidence("GH", "SL", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "SL", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "SL", snapshot.passports.AF.statuses.SL).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("US", "SL", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "SL", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "SL", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "SL", snapshot.passports.IE.statuses.SL).supportsCurrentStatus).toBe(false);

    expect(pairsFor("BI")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("SO", "BI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "BI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MV", "BI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BI", "BI", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("supports the CEMAC cohorts and named outbound rows for Congo and Gabon", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("CG")).toHaveLength(20);
    expect(getVisaRelationshipEvidence("CM", "CG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "CG", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "CG", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "CG", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CG", "CG", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("GA")).toHaveLength(200);
    expect(getVisaRelationshipEvidence("CG", "GA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GA", snapshot.passports.US.statuses.GA).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GA", "GA", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("supports CEMAC and named outbound rows for the Central African Republic and Equatorial Guinea", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("CF")).toHaveLength(15);
    expect(getVisaRelationshipEvidence("CM", "CF", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "CF", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "CF", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "CF", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CF", "CF", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("GQ")).toHaveLength(195);
    expect(getVisaRelationshipEvidence("CM", "GQ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "GQ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "GQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "GQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GQ", "GQ", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Lesotho and Eswatini schedules conservatively", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("LS")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("FJ", "LS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "LS", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LS", "LS", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("SZ")).toHaveLength(192);
    expect(getVisaRelationshipEvidence("TW", "SZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "SZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "SZ", snapshot.passports.CN.statuses.SZ).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("SZ", "SZ", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("keeps São Tomé's third-country-document waiver conditional", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "ST");

    expect(pairs).toHaveLength(60);
    expect(getVisaRelationshipEvidence("CN", "ST", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RS", "ST", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "ST", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "ST", snapshot.passports.AF.statuses.ST).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("ST", "ST", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("models Guinea's approval-letter route as ETA rather than eVisa or VOA", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "GN");

    expect(pairs).toHaveLength(194);
    expect(getVisaRelationshipEvidence("GH", "GN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GN", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "GN", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "GN", snapshot.passports.HK.statuses.GN).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("GN", "GN", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Togo's current ordinary-passport checker and all-African exemption", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "TG");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("GH", "TG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "TG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MY", "TG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "TG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TG", "TG", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("keeps Mali, Niger, and Liberia to their directly supported ECOWAS and AES cohorts", () => {
    const maliPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "ML");
    const nigerPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "NE");
    const liberiaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "LR");

    expect(maliPairs).toHaveLength(28);
    expect(nigerPairs).toHaveLength(30);
    expect(liberiaPairs).toHaveLength(29);
    expect(getVisaRelationshipEvidence("GH", "ML", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BF", "NE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ML", "LR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "NE", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "NE", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "LR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "ML", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "LR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "ML", snapshot.passports.US.statuses.ML).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("US", "NE", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "LR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "ML", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "NE", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "LR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ML", "ML", "citizenship").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("NE", "NE", "citizenship").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("LR", "LR", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("uses Chad's current named exemption list without inferring an eVisa residual", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "TD");

    expect(pairs).toHaveLength(35);
    expect(getVisaRelationshipEvidence("CM", "TD", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BB", "TD", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "TD", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "TD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "TD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "TD", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "TD", snapshot.passports.US.statuses.TD).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("TD", "TD", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("applies Somalia's later all-arrivals ETA rule", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "SO");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("US", "SO", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "SO", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ET", "SO", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SO", "SO", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("maps Angola's Decree 189/23 tourist exemption schedule", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "AO");

    expect(pairs).toHaveLength(100);
    expect(getVisaRelationshipEvidence("WS", "AO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "AO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PH", "AO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZA", "AO", snapshot.passports.ZA.statuses.AO).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AO", "AO", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Dominica's named and conditional short-stay exemptions", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "DM");

    expect(pairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "DM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "DM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "DM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DM", "DM", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("keeps French overseas destinations outside Schengen with territory-specific scope", () => {
    for (const destinationCode of ["GF", "YT", "RE"] as const) {
      const pairs = evidenceRelationshipPairs(snapshot.manifest)
        .filter(({ destination }) => destination.code === destinationCode);
      expect(pairs, destinationCode).toHaveLength(192);
      expect(getVisaRelationshipEvidence("NO", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("CO", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("US", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("AF", destinationCode, "visa_required").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("AL", destinationCode, snapshot.passports.AL.statuses[destinationCode]).supportsCurrentStatus).toBe(false);
    }

    for (const destinationCode of ["PF", "NC"] as const) {
      const pairs = evidenceRelationshipPairs(snapshot.manifest)
        .filter(({ destination }) => destination.code === destinationCode);
      expect(pairs, destinationCode).toHaveLength(192);
      expect(getVisaRelationshipEvidence("NO", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("CO", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("US", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("AF", destinationCode, "visa_required").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("AL", destinationCode, snapshot.passports.AL.statuses[destinationCode]).supportsCurrentStatus).toBe(false);
    }
    expect(getVisaRelationshipEvidence("GE", "NC", "visa_required").supportsCurrentStatus).toBe(true);

    const frenchWestIndiesPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "FW");
    expect(frenchWestIndiesPairs).toHaveLength(190);
    expect(getVisaRelationshipEvidence("NO", "FW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "FW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("EC", "FW", snapshot.passports.EC.statuses.FW).supportsCurrentStatus).toBe(false);
  });

  it("maps Saint Lucia's current visa schedules and treaty waivers", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "LC");

    expect(pairs).toHaveLength(187);
    expect(getVisaRelationshipEvidence("BR", "LC", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "LC", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "LC", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CD", "LC", snapshot.passports.CD.statuses.LC).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("LC", "LC", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the Dutch Caribbean's explicit waiver and residual visa rules", () => {
    for (const destinationCode of ["AW", "CW", "BQ"] as const) {
      const pairs = evidenceRelationshipPairs(snapshot.manifest)
        .filter(({ destination }) => destination.code === destinationCode);
      expect(pairs, destinationCode).toHaveLength(199);
      expect(getVisaRelationshipEvidence("US", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("AF", destinationCode, "visa_required").supportsCurrentStatus).toBe(true);
    }

    expect(getVisaRelationshipEvidence("JM", "CW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JM", "AW", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JM", "BQ", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("keeps Dominican Republic conflicts unresolved while covering direct cohorts", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "DO");

    expect(pairs).toHaveLength(191);
    expect(getVisaRelationshipEvidence("MA", "DO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MN", "DO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "DO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "DO", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AL", "DO", snapshot.passports.AL.statuses.DO).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("DO", "DO", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("maps Belize's current ordinary-passport visa table without filling ambiguous rows", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "BZ");

    expect(pairs).toHaveLength(194);
    expect(getVisaRelationshipEvidence("US", "BZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "BZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "BZ", snapshot.passports.SS.statuses.BZ).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("NR", "BZ", snapshot.passports.NR.statuses.BZ).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BZ", "BZ", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("maps Costa Rica's 2025 ordinary-passport directive and restricted residual", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "CR");

    expect(pairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "CR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "CR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "CR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CR", "CR", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("maps Guatemala's current A, B and C categories plus its citizen-entry right", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "GT");

    expect(pairs).toHaveLength(194);
    expect(getVisaRelationshipEvidence("US", "GT", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("EC", "GT", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "GT", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GT", "GT", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AD", "GT", snapshot.passports.AD.statuses.GT).supportsCurrentStatus).toBe(false);
  });

  it("maps reviewed visitor cohorts for United States territories conservatively", () => {
    const expectedCounts = new Map([
      ["AS", 199],
      ["GU", 160],
      ["MP", 160],
      ["PR", 160],
      ["VI", 160],
    ]);

    for (const [destinationCode, expected] of expectedCounts) {
      const pairs = evidenceRelationshipPairs(snapshot.manifest)
        .filter(({ destination }) => destination.code === destinationCode);
      expect(pairs, destinationCode).toHaveLength(expected);
    }

    expect(getVisaRelationshipEvidence("QA", "AS", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "AS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("WS", "AS", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "AS", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "GU", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "MP", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BS", "GU", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BS", "MP", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "GU", snapshot.passports.AF.statuses.GU).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AF", "MP", snapshot.passports.AF.statuses.MP).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("PT", "PR", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PT", "VI", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BS", "PR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BS", "VI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "PR", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("maps reviewed UK territory schedules at their supported scope", () => {
    const expectedCounts = new Map([
      ["AI", 199],
      ["TC", 199],
      ["FK", 199],
      ["KY", 198],
      ["BM", 199],
      ["VG", 101],
      ["MS", 198],
    ]);

    for (const [destinationCode, expected] of expectedCounts) {
      const pairs = evidenceRelationshipPairs(snapshot.manifest)
        .filter(({ destination }) => destination.code === destinationCode);
      expect(pairs, destinationCode).toHaveLength(expected);
    }

    expect(getVisaRelationshipEvidence("MO", "AI", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "AI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MC", "TC", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "FK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "FK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PE", "KY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "KY", snapshot.passports.SS.statuses.KY).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("GB", "BM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "BM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "BM", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("combines British Virgin Islands outbound exemptions with the current inbound visa schedule", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "VG");

    expect(pairs).toHaveLength(101);
    expect(getVisaRelationshipEvidence("CN", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "VG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GY", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CY", "VG", snapshot.passports.CY.statuses.VG).supportsCurrentStatus).toBe(false);
  });

  it("maps Honduras' current CA-4 schedule without filling absent issuers or the home cell", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "HN");

    expect(pairs).toHaveLength(166);
    expect(getVisaRelationshipEvidence("BO", "HN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GT", "HN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SA", "HN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "HN", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CR", "HN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FJ", "HN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DO", "HN", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LV", "HN", "visa_required").supportsCurrentStatus).toBe(true);
    for (const passportCode of ["AL", "HK", "MO", "XK", "HN"] as const) {
      expect(getVisaRelationshipEvidence(
        passportCode,
        "HN",
        snapshot.passports[passportCode].statuses.HN,
      ).supportsCurrentStatus).toBe(false);
    }
  });

  it("maps El Salvador's full current A, B and C nationality schedule", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "SV");

    expect(pairs).toHaveLength(197);
    expect(getVisaRelationshipEvidence("US", "SV", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("EC", "SV", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BO", "SV", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PK", "SV", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "SV", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "SV", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SV", "SV", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("maps Nicaragua's current A, B and C schedule including India's border visa", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "NI");

    expect(pairs).toHaveLength(190);
    expect(getVisaRelationshipEvidence("AD", "NI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AO", "NI", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "NI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GT", "NI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NI", "NI", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "NI", snapshot.passports.MD.statuses.NI).supportsCurrentStatus).toBe(false);
  });

  it("maps Uruguay's current common-passport admission schedule without filling unsupported rows", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "UY");

    expect(pairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "UY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "UY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "UY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "UY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PS", "UY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "UY", snapshot.passports.XK.statuses.UY).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("UY", "UY", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("maps Chile's current transient-stay schedule without treating online filing as eVisa", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "CL");

    expect(pairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("ID", "CL", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MN", "CL", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SR", "CL", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "CL", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "CL", snapshot.passports.XK.statuses.CL).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("CL", "CL", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("maps Bolivia's current groups and later bilateral waivers without filling unresolved API rows", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "BO");

    expect(pairs).toHaveLength(179);
    expect(getVisaRelationshipEvidence("KR", "BO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HN", "BO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DO", "BO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "BO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AR", "BO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SV", "BO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AD", "BO", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LY", "BO", snapshot.passports.LY.statuses.BO).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BO", "BO", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("maps Paraguay's reconciled current tourist and arrival-visa cohorts", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "PY");

    expect(pairs).toHaveLength(183);
    expect(getVisaRelationshipEvidence("BS", "PY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("QA", "PY", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("OM", "PY", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VE", "PY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "PY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PY", "PY", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "PY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PH", "PY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MN", "PY", snapshot.passports.MN.statuses.PY).supportsCurrentStatus).toBe(false);
  });

  it("covers Venezuela's named air-entry waivers and electronic tourist visas", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "VE");

    expect(pairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("EC", "VE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ID", "VE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LK", "VE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MV", "VE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("OM", "VE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "VE", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "VE", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VE", "VE", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("supports Panama's directly reviewed stamped-visa rows", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "PA");

    expect(pairs).toHaveLength(78);
    expect(getVisaRelationshipEvidence("CU", "PA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DO", "PA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DO", "PA", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("VE", "PA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TR", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GY", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "PA", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("maps Guyana's reconciled exemptions and residual visa-required baseline", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "GY");

    expect(pairs).toHaveLength(194);
    expect(getVisaRelationshipEvidence("QA", "GY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AL", "GY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BO", "GY", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "GY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MX", "GY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CO", "GY", snapshot.passports.CO.statuses.GY).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("ES", "GY", snapshot.passports.ES.statuses.GY).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GY", "GY", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("maps Suriname's complete visa-abolition partition without treating its entry fee as eVisa", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "SR");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("AF", "SR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DO", "SR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VE", "SR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HT", "SR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "SR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SR", "SR", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("maps Peru's current ordinary-passport tourist schedule without flattening conditional rows", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "PE");

    expect(pairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("GE", "PE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "PE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "PE", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PE", "PE", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "PE", snapshot.passports.CN.statuses.PE).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "PE", snapshot.passports.IN.statuses.PE).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("VE", "PE", snapshot.passports.VE.statuses.PE).supportsCurrentStatus).toBe(true);
  });

  it("maps St Helena's eVisa schedule and border-issued short-term entry permit", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "SH");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("MM", "SH", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HR", "SH", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SI", "SH", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "SH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "SH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
  });

  it("keeps Solomon Islands' explicit waivers separate from concessional visa on arrival", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "SB");

    expect(pairs).toHaveLength(75);
    expect(getVisaRelationshipEvidence("FR", "SB", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "SB", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "SB", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IS", "SB", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "SB", snapshot.passports.AF.statuses.SB).supportsCurrentStatus).toBe(false);
  });

  it("covers Papua New Guinea's named arrival, electronic, and advance-visa cohorts", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "PG");

    expect(pairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("JP", "PG", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "PG", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ID", "PG", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AG", "PG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VN", "PG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KE", "PG", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "PG", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NA", "PG", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PG", "PG", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("maps Montserrat's current visitor lists and electronically issued visas", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MS");

    expect(pairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("HT", "MS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "MS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "MS", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "MS", snapshot.passports.XK.statuses.MS).supportsCurrentStatus).toBe(false);
  });

  it("maps Cook Islands' universal border-issued visitor permit", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "CK");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("NZ", "CK", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "CK", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "CK", "visa_on_arrival").supportsCurrentStatus).toBe(true);
  });

  it("keeps Niue's named arrival-permit cohort separate from advance visas", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "NU");

    expect(pairs).toHaveLength(197);
    expect(getVisaRelationshipEvidence("FJ", "NU", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "NU", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "NU", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NZ", "NU", snapshot.passports.NZ.statuses.NU).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("PT", "NU", snapshot.passports.PT.statuses.NU).supportsCurrentStatus).toBe(false);
  });

  it("maps Nauru's current waiver, on-arrival and advance-visa schedules", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "NR");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("NR", "NR", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "NR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ES", "NR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "NR", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TH", "NR", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "NR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "NR", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("maps Tonga's current arrival cohort and exhaustive advance-visa residual", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "TO");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("TO", "TO", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "TO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "TO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NZ", "TO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NO", "TO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "TO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "TO", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("maps Micronesia's universal permit-free short-visitor rule", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "FM");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("FM", "FM", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "FM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "FM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "FM", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("maps Tuvalu's treaty waivers and statutory arrival permits", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "TV");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("TV", "TV", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "TV", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NZ", "TV", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "TV", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "TV", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "TV", "visa_on_arrival").supportsCurrentStatus).toBe(true);
  });

  it("keeps Marshall Islands evidence to current named and diplomatic-ties cohorts", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MH");

    expect(pairs).toHaveLength(127);
    expect(getVisaRelationshipEvidence("MH", "MH", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "MH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "MH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TO", "MH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LC", "MH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    for (const passportCode of ["PK", "SR", "BJ", "SA", "PA", "GM", "RW", "BF", "RS", "SM", "JM", "NP", "QA", "AG"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "MH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("GT", "MH", snapshot.passports.GT.statuses.MH).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BS", "MH", snapshot.passports.BS.statuses.MH).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AL", "MH", snapshot.passports.AL.statuses.MH).supportsCurrentStatus).toBe(false);
  });

  it("maps Kiribati's current exemption schedule and advance-visa complement", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "KI");

    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("KI", "KI", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TZ", "KI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "KI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "KI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MT", "KI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "KI", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("keeps Albania, Georgia, and Azerbaijan aligned to independently reviewed current schedules", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("AL")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("BH", "AL", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("QA", "AL", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GY", "AL", "visa_free").supportsCurrentStatus).toBe(true);

    expect(pairsFor("GE")).toHaveLength(191);
    expect(getVisaRelationshipEvidence("CN", "GE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "GE", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IR", "GE", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "GE", snapshot.passports.HK.statuses.GE).supportsCurrentStatus).toBe(false);

    expect(pairsFor("AZ")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("BH", "AZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "AZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SR", "AZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "AZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MY", "AZ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "AZ", snapshot.passports.XK.statuses.AZ).supportsCurrentStatus).toBe(false);
  });

  it("keeps Serbia, Türkiye, and Russia aligned to independently reviewed current schedules", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("RS")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("HK", "RS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "RS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "RS", snapshot.passports.TW.statuses.RS).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "RS", snapshot.passports.XK.statuses.RS).supportsCurrentStatus).toBe(false);

    expect(pairsFor("TR")).toHaveLength(167);
    expect(getVisaRelationshipEvidence("AG", "TR", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AO", "TR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AM", "TR", snapshot.passports.AM.statuses.TR).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BT", "TR", snapshot.passports.BT.statuses.TR).supportsCurrentStatus).toBe(false);

    expect(pairsFor("RU")).toHaveLength(197);
    expect(getVisaRelationshipEvidence("UA", "RU", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AT", "RU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BB", "RU", snapshot.passports.BB.statuses.RU).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("XK", "RU", snapshot.passports.XK.statuses.RU).supportsCurrentStatus).toBe(false);
  });

  it("keeps Moldova, Montenegro, and the supported North Macedonia cohort aligned to reviewed official sources", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("MD")).toHaveLength(195);
    expect(getVisaRelationshipEvidence("CU", "MD", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SD", "MD", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DM", "MD", snapshot.passports.DM.statuses.MD).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("DO", "MD", snapshot.passports.DO.statuses.MD).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("TW", "MD", snapshot.passports.TW.statuses.MD).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("XK", "MD", snapshot.passports.XK.statuses.MD).supportsCurrentStatus).toBe(false);

    expect(pairsFor("ME")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("AZ", "ME", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VU", "ME", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ME", "ME", "citizenship").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("RU", "ME", "visa_free", "2026-10-31").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "ME", "visa_required", "2026-11-01").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KZ", "ME", "visa_required", "2026-10-02").supportsCurrentStatus).toBe(true);

    expect(pairsFor("MK")).toHaveLength(47);
    expect(getVisaRelationshipEvidence("US", "MK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "MK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "MK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MK", "MK", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "MK", snapshot.passports.CN.statuses.MK).supportsCurrentStatus).toBe(true);
  });

  it("keeps the reviewed Bosnia, Kosovo, and Andorra relationships aligned to current official rules", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("BA")).toHaveLength(197);
    expect(getVisaRelationshipEvidence("BA", "BA", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BH", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BH", "BA", "visa_free", "2026-09-30").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TR", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "BA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "BA", snapshot.passports.SS.statuses.BA).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("XK", "BA", snapshot.passports.XK.statuses.BA).supportsCurrentStatus).toBe(false);

    expect(pairsFor("XK")).toHaveLength(197);
    expect(getVisaRelationshipEvidence("XK", "XK", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BW", "XK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("UA", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NZ", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "XK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "XK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BA", "XK", snapshot.passports.BA.statuses.XK).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("FJ", "XK", snapshot.passports.FJ.statuses.XK).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("SI", "XK", snapshot.passports.SI.statuses.XK).supportsCurrentStatus).toBe(true);

    expect(pairsFor("AD")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("AD", "AD", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KR", "AD", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "AD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NR", "AD", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("keeps the reviewed Monaco, San Marino, and Belarus relationships aligned to current official rules", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("MC")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "MC", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NR", "MC", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MC", "MC", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("SM")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("SM", "SM", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GE", "SM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NR", "SM", "visa_required").supportsCurrentStatus).toBe(true);

    expect(pairsFor("BY")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("BY", "BY", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("EG", "BY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BY", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KN", "BY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "BY", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "BY", snapshot.passports.XK.statuses.BY).supportsCurrentStatus).toBe(false);
  });

  it("keeps the reviewed Faroe Islands, Greenland, Gibraltar, and Vatican access legs aligned", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("FO")).toHaveLength(199);
    expect(pairsFor("GL")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("XK", "FO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "GL", "visa_required").supportsCurrentStatus).toBe(true);

    expect(pairsFor("GI")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("AE", "GI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NR", "GI", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PG", "GI", "visa_required").supportsCurrentStatus).toBe(true);

    expect(pairsFor("VA")).toHaveLength(197);
    expect(getVisaRelationshipEvidence("VA", "VA", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "VA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "VA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RS", "VA", snapshot.passports.RS.statuses.VA).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("NR", "VA", snapshot.passports.NR.statuses.VA).supportsCurrentStatus).toBe(false);
  });

  it("supports named outbound rows for Ukraine, Djibouti, and Comoros", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("UA")).toHaveLength(82);
    expect(getVisaRelationshipEvidence("UA", "UA", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KZ", "UA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TR", "UA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "UA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "UA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "UA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "UA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "UA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "UA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "UA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BT", "UA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BZ", "UA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PH", "UA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JM", "UA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "UA", "visa_free").supportsCurrentStatus).toBe(true);

    expect(pairsFor("DJ")).toHaveLength(26);
    expect(getVisaRelationshipEvidence("DJ", "DJ", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TR", "DJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "DJ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "DJ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "DJ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "DJ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "DJ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "DJ", "evisa").supportsCurrentStatus).toBe(true);

    expect(pairsFor("KM")).toHaveLength(24);
    expect(getVisaRelationshipEvidence("KM", "KM", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TR", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
  });

  it("supports the reviewed Cuba, Haiti and Saint Kitts and Nevis scopes", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    const currentCubaPairs = pairsFor("CU").filter(({ passport, status }) =>
      snapshot.passports[passport.code].statuses.CU === status,
    );
    expect(currentCubaPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("CN", "CU", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RS", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IE", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "CU", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JP", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "CU", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KE", "CU", "visa_required").supportsCurrentStatus).toBe(true);

    expect(pairsFor("HT")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("HT", "HT", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("YE", "HT", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "HT", "visa_free").supportsCurrentStatus).toBe(true);

    expect(pairsFor("KN")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("KN", "KN", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AG", "KN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HR", "KN", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "KN", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("UA", "KN", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BY", "KN", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "KN", "eta").supportsCurrentStatus).toBe(true);
  });

  it("supports the complete Saint Martin French territorial schedule", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MF");
    expect(pairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("BE", "MF", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LC", "MF", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "MF", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("supports reviewed Portuguese, Swedish, and Finnish outbound rows", () => {
    expect(getVisaRelationshipEvidence("PT", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PT", "VG", snapshot.passports.PT.statuses.VG).supportsCurrentStatus).toBe(false);

    expect(getVisaRelationshipEvidence("SE", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SE", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SE", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SE", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SE", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("FI", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FI", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FI", "BA", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("supports reviewed Belgian, Danish, and Norwegian outbound rows", () => {
    expect(getVisaRelationshipEvidence("BE", "LY", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "DJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "IQ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "SY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "TM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("DK", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DK", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DK", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DK", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DK", "IQ", snapshot.passports.DK.statuses.IQ).supportsCurrentStatus).toBe(false);

    expect(getVisaRelationshipEvidence("NO", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NO", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NO", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NO", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NO", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
  });

  it("applies reviewed Canadian, Spanish, Italian, and central European corrections", () => {
    for (const passportCode of ["CA", "ES", "AT"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    }
    expect(snapshot.passports.CA.statuses.DJ).toBe("evisa");
    expect(snapshot.passports.CA.statuses.PY).toBe("visa_free");
    expect(snapshot.passports.ES.statuses.SS).toBe("visa_required");
    expect(snapshot.passports.ES.statuses.BD).toBe("visa_required");
    expect(snapshot.passports.ES.statuses.GW).toBe("visa_required");
    expect(snapshot.passports.IT.statuses.TD).toBe("evisa");
    expect(snapshot.passports.IT.statuses.SY).toBe("visa_on_arrival");
    expect(snapshot.passports.IT.statuses.BF).toBe("visa_on_arrival");
    expect(snapshot.passports.IT.statuses.GW).toBe("visa_required");
    expect(snapshot.passports.IT.statuses.DJ).toBe("evisa");
    expect(snapshot.passports.AT.statuses.IQ).toBe("visa_required");
    expect(snapshot.passports.AT.statuses.DJ).toBe("evisa");
  });

  it("uses actual issuance timing for newly reviewed European and Pacific passports", () => {
    for (const passportCode of ["CH", "LT", "HR", "EE", "LV", "MT", "JP"] as const) {
      expect(snapshot.passports[passportCode].statuses.IQ).toBe("visa_on_arrival");
      expect(getVisaRelationshipEvidence(passportCode, "IQ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    }
    expect(snapshot.passports.DK.statuses.SL).toBe("evisa");
    expect(snapshot.passports.NO.statuses.IR).toBe("visa_required");
    expect(snapshot.passports.AU.statuses.PY).toBe("visa_free");
    expect(snapshot.passports.AU.statuses.IR).toBe("visa_required");
    expect(snapshot.passports.AU.statuses.TT).toBe("evisa");
    expect(snapshot.passports.NZ.statuses.PY).toBe("visa_free");
    expect(getVisaRelationshipEvidence("JP", "TT", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "SL", "visa_on_arrival").supportsCurrentStatus).toBe(true);
  });

  it("keeps conditional and explicitly stale outbound claims unresolved", () => {
    for (const passportCode of ["LU", "IS", "MT"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "UA", snapshot.passports[passportCode].statuses.UA).supportsCurrentStatus).toBe(false);
    }
    expect(getVisaRelationshipEvidence("IL", "JO", snapshot.passports.IL.statuses.JO).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("LV", "TM", snapshot.passports.LV.statuses.TM).supportsCurrentStatus).toBe(false);
  });

  it("supports reviewed Palestinian, Libyan, and Yemeni outbound rows", () => {
    expect(getVisaRelationshipEvidence("PS", "XK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PS", "CU", snapshot.passports.PS.statuses.CU).supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("LY", "LY", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LY", "BD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LY", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LY", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LY", "TN", snapshot.passports.LY.statuses.TN).supportsCurrentStatus).toBe(false);

    expect(getVisaRelationshipEvidence("YE", "BD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("YE", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("YE", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("YE", "SD", snapshot.passports.YE.statuses.SD).supportsCurrentStatus).toBe(false);
  });

  it("supports reviewed Afghan, Macao, and Burundian outbound rows", () => {
    expect(getVisaRelationshipEvidence("AF", "BA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "XK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "VG", "evisa").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("MO", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "DJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "SS", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "UA", "evisa").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("BI", "BA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BI", "XK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BI", "SS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BI", "VG", "evisa").supportsCurrentStatus).toBe(true);
  });

  it("supports reviewed Somali, Syrian, and Angolan outbound rows", () => {
    expect(getVisaRelationshipEvidence("SO", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SO", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SO", "BA", "visa_required").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("SY", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SY", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SY", "BA", "visa_required").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("AO", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AO", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AO", "TN", snapshot.passports.AO.statuses.TN).supportsCurrentStatus).toBe(false);
  });

  it("supports reviewed Moldovan, Montenegrin, and Zambian outbound rows", () => {
    expect(getVisaRelationshipEvidence("MD", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "BD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "DJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "LR", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "KH", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "XK", "visa_required").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("ME", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ME", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ME", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ME", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("ZM", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZM", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZM", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZM", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZM", "UA", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("supports reviewed Zimbabwean, Mauritanian, and Congolese outbound rows", () => {
    expect(getVisaRelationshipEvidence("ZW", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZW", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZW", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZW", "UA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ZW", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("MR", "LY", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MR", "CI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MR", "GW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MR", "TD", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MR", "CU", "evisa").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("CG", "CG", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CG", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CG", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CG", "CI", snapshot.passports.CG.statuses.CI).supportsCurrentStatus).toBe(false);
  });

  it("supports reviewed Eritrean, Timorese, and DRC outbound rows", () => {
    expect(getVisaRelationshipEvidence("ER", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ER", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ER", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ER", "UA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ER", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("TL", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TL", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TL", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TL", "KH", snapshot.passports.TL.statuses.KH).supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("CD", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CD", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CD", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CD", "CG", snapshot.passports.CD.statuses.CG).supportsCurrentStatus).toBe(false);
  });

  it("supports reviewed Malawian, Tanzanian, and Lao outbound rows", () => {
    expect(getVisaRelationshipEvidence("MW", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MW", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MW", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MW", "GQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MW", "UA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MW", "KH", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MW", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("TZ", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TZ", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TZ", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TZ", "GQ", "evisa").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("LA", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LA", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LA", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LA", "UA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LA", "KH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LA", "KP", snapshot.passports.LA.statuses.KP).supportsCurrentStatus).toBe(false);
  });

  it("supports reviewed Rwandan and Mozambican rows without flattening held routes", () => {
    for (const destinationCode of ["BD", "CF", "CI", "GW", "LR", "ML", "NE"] as const) {
      expect(getVisaRelationshipEvidence("RW", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("RW", "CG", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "DJ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "SS", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "GQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "UA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "KH", snapshot.passports.RW.statuses.KH).supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("MZ", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MZ", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MZ", "GQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MZ", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MZ", "UA", snapshot.passports.MZ.statuses.UA).supportsCurrentStatus).toBe(false);

    expect(getVisaRelationshipEvidence("SD", "CU", snapshot.passports.SD.statuses.CU).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SD", "CI", snapshot.passports.SD.statuses.CI).supportsCurrentStatus).toBe(false);
  });

  it("supports reviewed Albanian, North Macedonian, and Serbian outbound rows", () => {
    for (const destinationCode of ["BA", "XK"] as const) {
      expect(getVisaRelationshipEvidence("AL", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["CU", "NG", "GQ"] as const) {
      expect(getVisaRelationshipEvidence("AL", destinationCode, "evisa").supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("AL", "CI", snapshot.passports.AL.statuses.CI).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AL", "UA", snapshot.passports.AL.statuses.UA).supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("MK", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MK", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MK", "GQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MK", "CI", snapshot.passports.MK.statuses.CI).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("MK", "KH", snapshot.passports.MK.statuses.KH).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MK", "UA", snapshot.passports.MK.statuses.UA).supportsCurrentStatus).toBe(true);

    for (const destinationCode of ["BA", "PA"] as const) {
      expect(getVisaRelationshipEvidence("RS", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["DJ", "NG", "GQ"] as const) {
      expect(getVisaRelationshipEvidence("RS", destinationCode, "evisa").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["IQ", "TN", "ML", "GW", "BD"] as const) {
      expect(getVisaRelationshipEvidence("RS", destinationCode, "visa_required").supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("RS", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RS", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RS", "UA", snapshot.passports.RS.statuses.UA).supportsCurrentStatus).toBe(false);
  });

  it("supports Guyana's current named outbound waivers", () => {
    for (const destinationCode of ["AL", "GD", "PA"] as const) {
      expect(getVisaRelationshipEvidence("GY", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
    }
  });

  it("supports reviewed Tongan, Haitian, and Myanmar outbound rows", () => {
    for (const passportCode of ["TO", "HT", "MM"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "NG", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "GQ", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CI", snapshot.passports[passportCode].statuses.CI).supportsCurrentStatus).toBe(false);
    }
    expect(getVisaRelationshipEvidence("MM", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MM", "KH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TO", "KH", snapshot.passports.TO.statuses.KH).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HT", "CU", snapshot.passports.HT.statuses.CU).supportsCurrentStatus).toBe(true);
  });

  it("supports reviewed Armenian, Bosnian, and HKSAR outbound rows", () => {
    for (const passportCode of ["AM", "BA", "HK"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "NG", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "GQ", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CI", snapshot.passports[passportCode].statuses.CI).supportsCurrentStatus).toBe(false);
      expect(getVisaRelationshipEvidence(passportCode, "CU", snapshot.passports[passportCode].statuses.CU).supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("AM", "UA", snapshot.passports.AM.statuses.UA).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BA", "BA", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "KH", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("supports reviewed Burkinabè, Israeli, and Sri Lankan outbound rows", () => {
    expect(getVisaRelationshipEvidence("BF", "GQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BF", "NG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BF", "CU", snapshot.passports.BF.statuses.CU).supportsCurrentStatus).toBe(true);

    for (const passportCode of ["IL", "LK"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "NG", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "GQ", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CI", snapshot.passports[passportCode].statuses.CI).supportsCurrentStatus).toBe(false);
      expect(getVisaRelationshipEvidence(passportCode, "CU", snapshot.passports[passportCode].statuses.CU).supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("IL", "PS", snapshot.passports.IL.statuses.PS).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("LK", "KH", "visa_required").supportsCurrentStatus).toBe(true);
  });

  it("supports reviewed Equatorial Guinean, Lebanese, and Nauruan outbound rows", () => {
    expect(getVisaRelationshipEvidence("GQ", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GQ", "CF", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GQ", "GQ", snapshot.passports.GQ.statuses.GQ).supportsCurrentStatus).toBe(false);

    for (const passportCode of ["LB", "NR"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "NG", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "GQ", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CU", snapshot.passports[passportCode].statuses.CU).supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CI", snapshot.passports[passportCode].statuses.CI).supportsCurrentStatus).toBe(false);
    }
  });

  it("supports reviewed Iraqi, Iranian, and Venezuelan outbound rows", () => {
    for (const passportCode of ["IQ", "IR", "VE"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "NG", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "GQ", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CU", snapshot.passports[passportCode].statuses.CU).supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CI", snapshot.passports[passportCode].statuses.CI).supportsCurrentStatus).toBe(false);
      expect(getVisaRelationshipEvidence(passportCode, "UA", snapshot.passports[passportCode].statuses.UA).supportsCurrentStatus).toBe(false);
    }
    expect(getVisaRelationshipEvidence("VE", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("VE", "PA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IQ", "KH", snapshot.passports.IQ.statuses.KH).supportsCurrentStatus).toBe(true);
  });

  it("supports reviewed Antiguan, Dominican, and Bhutanese outbound rows", () => {
    for (const passportCode of ["AG", "DM"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "BA", "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "NG", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "GQ", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CU", snapshot.passports[passportCode].statuses.CU).supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CI", snapshot.passports[passportCode].statuses.CI).supportsCurrentStatus).toBe(false);
    }

    expect(getVisaRelationshipEvidence("BT", "NG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BT", "GQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BT", "BD", snapshot.passports.BT.statuses.BD).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BT", "KH", snapshot.passports.BT.statuses.KH).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BT", "UA", "evisa").supportsCurrentStatus).toBe(true);
  });

  it("supports reviewed Andorran, Argentine, and Azerbaijani outbound rows", () => {
    for (const passportCode of ["AD", "AR", "AZ"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "BA", "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "NG", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "GQ", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CU", snapshot.passports[passportCode].statuses.CU).supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CI", snapshot.passports[passportCode].statuses.CI).supportsCurrentStatus).toBe(false);
      expect(getVisaRelationshipEvidence(passportCode, "UA", snapshot.passports[passportCode].statuses.UA).supportsCurrentStatus).toBe(false);
    }
    expect(getVisaRelationshipEvidence("AR", "TN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AR", "PA", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("supports the reviewed Malaysia, Philippines, India, Grenada, and BVI rows", () => {
    expect(getVisaRelationshipEvidence("MY", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PH", "BA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PH", "XK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "PA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "SL", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "KG", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "GD", "visa_free").supportsCurrentStatus).toBe(true);
    for (const passportCode of ["CH", "IS", "LI", "NO", "SM", "US", "VE"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "GD", "visa_free").supportsCurrentStatus).toBe(true);
    }

    for (const passportCode of ["AF", "IL", "UA", "PS"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "VG", "evisa").supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("CN", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GY", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "VG", snapshot.passports.AU.statuses.VG).supportsCurrentStatus).toBe(false);
  });

  it("supports reviewed Belarusian, Belizean, and Brazilian outbound rows", () => {
    for (const passportCode of ["BY", "BZ", "BR"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "NG", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "GQ", "evisa").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CU", snapshot.passports[passportCode].statuses.CU).supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "CI", snapshot.passports[passportCode].statuses.CI).supportsCurrentStatus).toBe(false);
      expect(getVisaRelationshipEvidence(passportCode, "KH", snapshot.passports[passportCode].statuses.KH).supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence(passportCode, "UA", snapshot.passports[passportCode].statuses.UA).supportsCurrentStatus).toBe(passportCode === "BZ");
    }
  });

  it("supports the reviewed Equatorial Guinea, Nigeria, and Bosnia residual cohorts", () => {
    for (const passportCode of ["AF", "AU", "CN", "NP", "US", "VA"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "GQ", "evisa").supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("GQ", "GQ", snapshot.passports.GQ.statuses.GQ).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("CM", "GQ", "visa_free").supportsCurrentStatus).toBe(true);

    for (const passportCode of ["CZ", "TR", "US", "VA"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "NG", "evisa").supportsCurrentStatus).toBe(true);
    }
    for (const passportCode of ["AF", "BB", "GE", "KE", "SZ", "ZA"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "NG", snapshot.passports[passportCode].statuses.NG).supportsCurrentStatus).toBe(false);
    }

    for (const passportCode of ["AT", "MY", "BR", "VA"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "BA", "visa_free").supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("HK", "BA", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("keeps unsupported South Sudan, Djibouti, and Comoros residual cohorts unverified", () => {
    for (const passportCode of ["AF", "AR", "BR", "BY", "IN"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "SS", snapshot.passports[passportCode].statuses.SS).supportsCurrentStatus).toBe(false);
      expect(getVisaRelationshipEvidence(passportCode, "DJ", snapshot.passports[passportCode].statuses.DJ).supportsCurrentStatus).toBe(false);
      expect(getVisaRelationshipEvidence(passportCode, "KM", snapshot.passports[passportCode].statuses.KM).supportsCurrentStatus).toBe(false);
    }
  });

  it("applies the universal Saint Kitts and Nevis ETA without inferring Liberia or omitted BVI complements", () => {
    for (const passportCode of ["AF", "BR", "CZ", "US", "VA"] as const) {
      expect(snapshot.passports[passportCode].statuses.KN).toBe("eta");
      expect(getVisaRelationshipEvidence(passportCode, "KN", "eta").supportsCurrentStatus).toBe(true);
    }

    expect(getVisaRelationshipEvidence("LR", "LR", "citizenship").supportsCurrentStatus).toBe(true);
    for (const passportCode of ["BR", "IN"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "LR", snapshot.passports[passportCode].statuses.LR).supportsCurrentStatus).toBe(false);
      expect(getVisaRelationshipEvidence(passportCode, "VG", snapshot.passports[passportCode].statuses.VG).supportsCurrentStatus).toBe(false);
    }
  });

  it("corrects Gabon sticker issuance, verifies Saint Vincent and Gambia, and holds Bangladesh", () => {
    for (const passportCode of ["MA", "MU", "ZA"] as const) {
      expect(snapshot.passports[passportCode].statuses.GA).toBe("visa_free");
      expect(getVisaRelationshipEvidence(passportCode, "GA", "visa_free").supportsCurrentStatus).toBe(true);
    }
    for (const passportCode of ["AF", "BR", "SG", "US"] as const) {
      expect(snapshot.passports[passportCode].statuses.GA).toBe("visa_on_arrival");
      expect(getVisaRelationshipEvidence(passportCode, "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    }
    expect(snapshot.passports.XK.statuses.GA).toBe("evisa");
    expect(getVisaRelationshipEvidence("XK", "GA", "evisa").supportsCurrentStatus).toBe(false);

    for (const passportCode of ["BR", "PK", "SG", "US"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "VC", "visa_free").supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("AF", "GM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "GM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "GM", "visa_free").supportsCurrentStatus).toBe(true);
    for (const passportCode of ["AF", "BR", "CL"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "BD", snapshot.passports[passportCode].statuses.BD).supportsCurrentStatus).toBe(false);
    }
  });

  it("supports the shared French West Indies territorial schedule without flattening document exceptions", () => {
    for (const passportCode of ["BR", "KI", "PE", "SG"] as const) {
      expect(snapshot.passports[passportCode].statuses.FW).toBe("visa_free");
      expect(getVisaRelationshipEvidence(passportCode, "FW", "visa_free").supportsCurrentStatus).toBe(true);
    }
    for (const passportCode of ["AF", "CN", "IN", "ZA"] as const) {
      expect(snapshot.passports[passportCode].statuses.FW).toBe("visa_required");
      expect(getVisaRelationshipEvidence(passportCode, "FW", "visa_required").supportsCurrentStatus).toBe(true);
    }
    for (const passportCode of ["AL", "BA", "EC", "MD", "ME", "MK", "RS", "UA", "VU"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "FW", snapshot.passports[passportCode].statuses.FW).supportsCurrentStatus).toBe(false);
    }
  });

  it("supports narrow São Tomé waivers without inferring the residual complement", () => {
    for (const passportCode of ["CH", "ZA"] as const) {
      expect(snapshot.passports[passportCode].statuses.ST).toBe("visa_free");
      expect(getVisaRelationshipEvidence(passportCode, "ST", "visa_free").supportsCurrentStatus).toBe(true);
    }
    for (const passportCode of ["AF", "SG"] as const) {
      expect(getVisaRelationshipEvidence(passportCode, "ST", snapshot.passports[passportCode].statuses.ST).supportsCurrentStatus).toBe(false);
    }
  });

  it("supports reviewed Spanish, Italian, and South Korean outbound rows", () => {
    expect(getVisaRelationshipEvidence("ES", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ES", "IQ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ES", "TM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ES", "LY", "evisa").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("IT", "XK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IT", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IT", "IQ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IT", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IT", "TM", "visa_on_arrival").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("KR", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KR", "KM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KR", "KH", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KR", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KR", "UA", snapshot.passports.KR.statuses.UA).supportsCurrentStatus).toBe(false);
  });

  it("supports reviewed Taiwan and South Sudan outbound rows without flattening held routes", () => {
    expect(getVisaRelationshipEvidence("TW", "BY", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "LR", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "UZ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "DJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "EC", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "SA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "VG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "CV", snapshot.passports.TW.statuses.CV).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("TW", "CN", snapshot.passports.TW.statuses.CN).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("SS", "CU", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "UA", snapshot.passports.SS.statuses.UA).supportsCurrentStatus).toBe(false);
  });

  it("supports the reviewed French, Swiss, and Dutch outbound rows", () => {
    expect(getVisaRelationshipEvidence("FR", "LY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "TM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "GA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "GQ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "CI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "GW", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FR", "NG", "visa_required").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("CH", "BA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "UA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "CU", "evisa").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("NL", "TM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "LR", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "BD", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "DJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NL", "GQ", "evisa").supportsCurrentStatus).toBe(true);
  });

  it("covers the reviewed Turkish, Hong Kong, Taiwan, Brazilian, Gulf, and Mexican residuals conservatively", () => {
    for (const destinationCode of ["BW", "JO", "MK", "TT", "VU"] as const) {
      expect(getVisaRelationshipEvidence("TR", destinationCode, snapshot.passports.TR.statuses[destinationCode]).supportsCurrentStatus).toBe(true);
    }
    expect(getVisaRelationshipEvidence("HK", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "RS", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "LK", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "MK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("QA", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("QA", "KZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("QA", "MN", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MX", "TR", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MX", "OM", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "BS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "CF", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "GQ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "SY", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SA", "UZ", "visa_free").supportsCurrentStatus).toBe(true);

    expect(getVisaRelationshipEvidence("TW", "HK", snapshot.passports.TW.statuses.HK).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("SA", "JO", snapshot.passports.SA.statuses.JO).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AE", "LR", snapshot.passports.AE.statuses.LR).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AE", "SS", snapshot.passports.AE.statuses.SS).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AE", "TT", snapshot.passports.AE.statuses.TT).supportsCurrentStatus).toBe(false);
  });

  it("covers reviewed Argentine, Chilean, Russian, and Kuwaiti residuals conservatively", () => {
    expect(getVisaRelationshipEvidence("AR", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AR", "TT", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AR", "GD", snapshot.passports.AR.statuses.GD).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("CL", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CL", "MK", snapshot.passports.CL.statuses.MK).supportsCurrentStatus).toBe(false);

    for (const destinationCode of ["GD", "JO", "TT"] as const) {
      expect(getVisaRelationshipEvidence("RU", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
    }

    for (const destinationCode of ["AF", "AO", "CF", "TD", "CG", "GD", "LR", "ML", "NE", "KP", "MK", "TT", "TM"] as const) {
      expect(getVisaRelationshipEvidence("KW", destinationCode, "visa_required").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["BW", "JO", "PA", "SD", "TN", "UA"] as const) {
      expect(getVisaRelationshipEvidence("KW", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["CV", "KM", "DJ", "GW", "SY"] as const) {
      expect(getVisaRelationshipEvidence("KW", destinationCode, "visa_on_arrival").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["BF", "CI", "IQ", "PS", "SL", "SS"] as const) {
      expect(getVisaRelationshipEvidence("KW", destinationCode, snapshot.passports.KW.statuses[destinationCode]).supportsCurrentStatus).toBe(false);
    }
  });

  it("covers reviewed Bruneian, Chinese, Thai, and Moroccan residuals conservatively", () => {
    expect(getVisaRelationshipEvidence("BN", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MA", "PA", "visa_required").supportsCurrentStatus).toBe(true);

    for (const [destinationCode, status] of [
      ["KG", "evisa"],
      ["IQ", "evisa"],
      ["JO", "visa_on_arrival"],
      ["TN", "visa_free"],
      ["PE", "visa_required"],
      ["PA", "visa_required"],
      ["KM", "visa_on_arrival"],
      ["MH", "visa_required"],
      ["MK", "visa_required"],
    ] as const) {
      expect(getVisaRelationshipEvidence("CN", destinationCode, status).supportsCurrentStatus).toBe(true);
    }
    expect(snapshot.passports.CN.statuses.KM).toBe("visa_on_arrival");

    expect(getVisaRelationshipEvidence("TH", "PA", "visa_free").supportsCurrentStatus).toBe(true);
    for (const destinationCode of ["CV", "KM", "GW", "JO", "SL"] as const) {
      expect(getVisaRelationshipEvidence("TH", destinationCode, "visa_on_arrival").supportsCurrentStatus).toBe(true);
    }

    for (const [passportCode, destinationCode] of [
      ["BN", "GD"],
      ["CN", "SY"],
      ["TH", "DJ"],
      ["MA", "UA"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("covers reviewed Malaysian, Rwandan, Kazakhstani, and Mauritian residuals conservatively", () => {
    expect(snapshot.passports.MY.statuses.IQ).toBe("visa_on_arrival");
    expect(getVisaRelationshipEvidence("MY", "IQ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "CD", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "ST", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KZ", "JO", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MU", "TR", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MU", "PA", "visa_free").supportsCurrentStatus).toBe(true);

    for (const [passportCode, destinationCode] of [
      ["MY", "SL"],
      ["RW", "JO"],
      ["KZ", "PA"],
      ["MU", "AF"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("covers reviewed Moldovan, Uzbekistani, and Philippine residuals conservatively", () => {
    expect(snapshot.passports.MD.statuses.GD).toBe("visa_on_arrival");
    expect(getVisaRelationshipEvidence("MD", "GD", "visa_on_arrival").supportsCurrentStatus).toBe(true);

    for (const destinationCode of ["GD", "JO", "UA"] as const) {
      expect(getVisaRelationshipEvidence("UZ", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["KM", "GW"] as const) {
      expect(getVisaRelationshipEvidence("UZ", destinationCode, "visa_on_arrival").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["DJ", "SS"] as const) {
      expect(getVisaRelationshipEvidence("UZ", destinationCode, "evisa").supportsCurrentStatus).toBe(true);
    }

    expect(getVisaRelationshipEvidence("PH", "PY", "visa_free").supportsCurrentStatus).toBe(true);
    for (const destinationCode of ["PA", "TR", "GD"] as const) {
      expect(getVisaRelationshipEvidence("PH", destinationCode, "visa_required").supportsCurrentStatus).toBe(true);
    }

    for (const [passportCode, destinationCode] of [
      ["BY", "PA"],
      ["UZ", "PS"],
      ["UZ", "SL"],
      ["PH", "SA"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("covers reviewed Palestinian and Afghan residuals while preserving unavailable and unsupported routes", () => {
    for (const destinationCode of ["AF", "AO", "BB", "BW", "DJ", "GN", "IR", "LR", "SS", "TR"] as const) {
      expect(getVisaRelationshipEvidence("PS", destinationCode, "visa_required").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["BD", "KM", "GW"] as const) {
      expect(getVisaRelationshipEvidence("PS", destinationCode, "visa_on_arrival").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["BF", "KG", "ST"] as const) {
      expect(getVisaRelationshipEvidence("PS", destinationCode, "evisa").supportsCurrentStatus).toBe(true);
    }
    for (const destinationCode of ["BO", "JO"] as const) {
      expect(getVisaRelationshipEvidence("PS", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
    }

    expect(snapshot.passports.AF.statuses.TR).toBe("visa_required");
    for (const destinationCode of ["GD", "MN", "PA", "TR"] as const) {
      expect(getVisaRelationshipEvidence("AF", destinationCode, "visa_required").supportsCurrentStatus).toBe(true);
    }

    for (const [passportCode, destinationCode] of [
      ["PS", "US"],
      ["AF", "US"],
      ["SS", "US"],
      ["XK", "CL"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("covers reviewed Hong Kong, Dominica and Tonga residuals without flattening U.S. suspensions", () => {
    for (const [passportCode, destinationCode, status] of [
      ["HK", "AO", "visa_free"],
      ["HK", "BO", "visa_on_arrival"],
      ["HK", "KM", "visa_on_arrival"],
      ["DM", "GD", "visa_free"],
      ["DM", "IS", "visa_free"],
      ["DM", "PA", "visa_free"],
      ["DM", "TR", "visa_required"],
      ["TO", "IS", "visa_free"],
    ] as const) {
      expect(getVisaRelationshipEvidence(passportCode, destinationCode, status).supportsCurrentStatus).toBe(true);
    }

    expect(snapshot.passports.HK.statuses.AO).toBe("visa_free");
    expect(snapshot.passports.HK.statuses.BO).toBe("visa_on_arrival");
    expect(snapshot.passports.DM.statuses.TR).toBe("visa_required");

    for (const passportCode of ["DM", "TO"] as const) {
      expect(
        getVisaRelationshipEvidence(passportCode, "US", snapshot.passports[passportCode].statuses.US)
          .supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("covers reviewed Albanian, Somali and Syrian residuals while preserving conditional holds", () => {
    for (const [passportCode, destinationCode, status] of [
      ["AL", "GD", "visa_required"],
      ["AL", "PA", "visa_required"],
      ["AL", "UA", "visa_free"],
      ["SO", "GD", "visa_required"],
      ["SO", "PA", "visa_required"],
      ["SY", "PA", "visa_required"],
    ] as const) {
      expect(getVisaRelationshipEvidence(passportCode, destinationCode, status).supportsCurrentStatus).toBe(true);
    }

    for (const [passportCode, destinationCode] of [
      ["AL", "MK"],
      ["AL", "TT"],
      ["LY", "TR"],
      ["LY", "US"],
      ["SO", "US"],
      ["SY", "US"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("covers reviewed Bosnian, Burundian, Congolese and North Macedonian residuals", () => {
    for (const [passportCode, destinationCode, status] of [
      ["BA", "GD", "visa_on_arrival"],
      ["BA", "DO", "visa_required"],
      ["BA", "PA", "visa_free"],
      ["BI", "CD", "visa_free"],
      ["BI", "TZ", "visa_free"],
      ["CG", "GD", "visa_required"],
      ["CG", "PA", "visa_required"],
      ["CG", "BS", "evisa"],
      ["MK", "GD", "visa_on_arrival"],
      ["MK", "PA", "visa_free"],
      ["MK", "UA", "visa_free"],
    ] as const) {
      expect(getVisaRelationshipEvidence(passportCode, destinationCode, status).supportsCurrentStatus).toBe(true);
      expect(snapshot.passports[passportCode].statuses[destinationCode]).toBe(status);
    }

    for (const [passportCode, destinationCode] of [
      ["BA", "MK"],
      ["BI", "US"],
      ["CG", "US"],
      ["MK", "VU"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("covers reviewed Israeli, Haitian, Iranian and Sudanese residuals while preserving prohibitions", () => {
    for (const [passportCode, destinationCode, status] of [
      ["IL", "GD", "visa_free"],
      ["IL", "UA", "visa_free"],
      ["HT", "GD", "visa_free"],
      ["IR", "GD", "visa_required"],
      ["IR", "PA", "visa_required"],
      ["SD", "GD", "visa_required"],
      ["SD", "PA", "visa_required"],
    ] as const) {
      expect(getVisaRelationshipEvidence(passportCode, destinationCode, status).supportsCurrentStatus).toBe(true);
      expect(snapshot.passports[passportCode].statuses[destinationCode]).toBe(status);
    }

    for (const [passportCode, destinationCode] of [
      ["IL", "MV"],
      ["IL", "SA"],
      ["HT", "US"],
      ["IR", "US"],
      ["SD", "US"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("covers reviewed Angolan, Antiguan, Marshallese and Nauruan residuals conservatively", () => {
    for (const [passportCode, destinationCode, status] of [
      ["AO", "GD", "visa_required"],
      ["AG", "GD", "visa_free"],
      ["AG", "PA", "visa_free"],
      ["MH", "GD", "visa_required"],
      ["MH", "IS", "visa_free"],
      ["MH", "PA", "visa_free"],
      ["NR", "GD", "visa_free"],
      ["NR", "IS", "visa_required"],
      ["NR", "PA", "visa_free"],
    ] as const) {
      expect(getVisaRelationshipEvidence(passportCode, destinationCode, status).supportsCurrentStatus).toBe(true);
      expect(snapshot.passports[passportCode].statuses[destinationCode]).toBe(status);
    }

    for (const [passportCode, destinationCode] of [
      ["AO", "US"],
      ["AG", "US"],
      ["MH", "UA"],
      ["NR", "BZ"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("covers reviewed Timorese, Venezuelan, Zambian and Zimbabwean residuals conservatively", () => {
    for (const [passportCode, destinationCode, status] of [
      ["TL", "GD", "visa_required"],
      ["TL", "IS", "visa_free"],
      ["VE", "PE", "visa_required"],
      ["ZM", "GD", "visa_free"],
      ["ZM", "PA", "visa_required"],
      ["ZW", "GD", "visa_required"],
      ["ZW", "PA", "visa_required"],
    ] as const) {
      expect(getVisaRelationshipEvidence(passportCode, destinationCode, status).supportsCurrentStatus).toBe(true);
      expect(snapshot.passports[passportCode].statuses[destinationCode]).toBe(status);
    }

    for (const [passportCode, destinationCode] of [
      ["TL", "PA"],
      ["VE", "US"],
      ["ZM", "US"],
      ["ZW", "US"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("closes supportable German and Italian gaps while retaining unavailable routes", () => {
    for (const [passportCode, destinationCode, status] of [
      ["DE", "NE", "visa_required"],
      ["DE", "SL", "visa_on_arrival"],
      ["IT", "PS", "eta"],
    ] as const) {
      expect(getVisaRelationshipEvidence(passportCode, destinationCode, status).supportsCurrentStatus).toBe(true);
      expect(snapshot.passports[passportCode].statuses[destinationCode]).toBe(status);
    }

    for (const [passportCode, destinationCode] of [
      ["GB", "AF"],
      ["GB", "PS"],
      ["ES", "IR"],
      ["DE", "AF"],
      ["IT", "LR"],
      ["IT", "SS"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("closes supportable United States, Belgian and Dutch gaps without flattening suspensions", () => {
    for (const [passportCode, destinationCode, status] of [
      ["US", "TT", "visa_free"],
      ["BE", "SS", "evisa"],
      ["NL", "DJ", "evisa"],
      ["NL", "IR", "visa_required"],
      ["NL", "SS", "evisa"],
    ] as const) {
      expect(getVisaRelationshipEvidence(passportCode, destinationCode, status).supportsCurrentStatus).toBe(true);
      expect(snapshot.passports[passportCode].statuses[destinationCode]).toBe(status);
    }

    for (const [passportCode, destinationCode] of [
      ["US", "BF"],
      ["US", "TD"],
      ["US", "ML"],
      ["CA", "IR"],
      ["BE", "BD"],
      ["NL", "SL"],
    ] as const) {
      expect(
        getVisaRelationshipEvidence(
          passportCode,
          destinationCode,
          snapshot.passports[passportCode].statuses[destinationCode],
        ).supportsCurrentStatus,
      ).toBe(false);
    }
  });

  it("contains only direct HTTPS official-source URLs", () => {
    const officialHosts = new Set([
      "mvp.gov.ba",
      "www.mvp.gov.ba",
      "www.swedenabroad.se",
      "um.fi",
      "diplomatie.belgium.be",
      "um.dk",
      "e.gov.kw",
      "dailynews.gov.bw",
      "www.dsi.gov.mo",
      "www.bvi.gov.vg",
      "gndembassyprc.mofa.gov.gd",
      "grenadaembassyusa.org",
      "laws.gov.gd",
      "grenadaparliament.gd",
      "www.gov.gd",
      "www.somalia.gov.so",
      "italia.mirex.gov.ao",
      "www.mohais.gov.zm",
      "zimfa.gov.zw",
      "procedures.gov.mr",
      "diplomatie.gov.mr",
      "sgg.cg",
      "www.exteriores.gob.es",
      "exteriores.gob.es",
      "www.viaggiaresicuri.it",
      "www.0404.go.kr",
      "0404.go.kr",
      "evisacuba.cu",
      "evisagw.evisacuba.cu",
      "en.thnet.gov.cn",
      "www.mac.gov.tw",
      "www.diplomatie.gouv.fr",
      "www.msb.gov.ba",
      "www.nederlandwereldwijd.nl",
      "switzerland.tmembassy.gov.tm",
      "governo.gov.ao",
      "cipra.gov.ao",
      "plataformacipra.gov.ao",
      "www.sme.gov.ao",
      "etakenya.go.ke",
      "new.kenyalaw.org",
      "evisa.gouv.cd",
      "eur-lex.europa.eu",
      "home-affairs.ec.europa.eu",
      "www.efta.int",
      "www.consilium.europa.eu",
      "www.govern.ad",
      "www.boe.es",
      "legimonaco.mc",
      "www.esteri.sm",
      "www.gov.sm",
      "www.esteri.it",
      "law.by",
      "mfa.gov.by",
      "gpk.gov.by",
      "e-pasluga.by",
      "nyidanmark.dk",
      "www.nyidanmark.dk",
      "www.gibraltar.gov.gi",
      "www.vaticanstate.va",
      "epass.vatican.va",
      "consvancouver.esteri.it",
      "zakon.rada.gov.ua",
      "dmsu.gov.ua",
      "mvs.gov.ua",
      "mfa.gov.ua",
      "www.egouv.dj",
      "guide.visitdjibouti.dj",
      "www.journalofficiel.dj",
      "justice.gouv.km",
      "www.cuba.travel",
      "www.kdmid.ru",
      "www.mfa.gov.rs",
      "www.haiti.org",
      "immigration.mict.gouv.ht",
      "dgi.gouv.ht",
      "ofnac.gouv.ht",
      "lawcommission.gov.kn",
      "pressroom.oecs.int",
      "www.knatravelform.kn",
      "www.skn-igs.gov.kn",
      "nia.gov.kn",
      "ciu.gov.kn",
      "granpol.gov.ba",
      "cms.granpol.gov.ba",
      "sluzbenilist.ba",
      "gzk.rks-gov.net",
      "kryeministri.rks-gov.net",
      "mpb.rks-gov.net",
      "ambasadat.net",
      "www.smartraveller.gov.au",
      "www.ireland.ie",
      "www.auswaertiges-amt.de",
      "www.anzen.mofa.go.jp",
      "www.sem.admin.ch",
      "immi.homeaffairs.gov.au",
      "www.legislation.gov.au",
      "www.mofa.go.jp",
      "www.uk.emb-japan.go.jp",
      "www.immigration.govt.nz",
      "nzeta.immigration.govt.nz",
      "legislation.govt.nz",
      "sso.agc.gov.sg",
      "www.ica.gov.sg",
      "www.mfa.gov.sg",
      "punetejashtme.gov.al",
      "arkiva.punetejashtme.gov.al",
      "e-visa.al",
      "qbz.gov.al",
      "france.mfa.gov.ge",
      "ge.china-embassy.gov.cn",
      "www.matsne.gov.ge",
      "matsne.gov.ge",
      "www.evisa.gov.ge",
      "australia.mfa.gov.ge",
      "www.evisa.gov.az",
      "evisa.gov.az",
      "www.mfa.gov.az",
      "un.mfa.gov.az",
      "www.migration.gov.az",
      "migration.gov.az",
      "asan.gov.az",
      "chisinau.mfa.gov.az",
      "beijing.mfa.gov.sg",
      "hongkong.mfa.gov.sg",
      "taipei.mfa.gov.sg",
      "seoul.mfa.gov.sg",
      "dubai.mfa.gov.sg",
      "canberra.mfa.gov.sg",
      "wellington.mfa.gov.sg",
      "washington.mfa.gov.sg",
      "geneva-wto.mfa.gov.sg",
      "www.irishimmigration.ie",
      "www.irishstatutebook.ie",
      "www.visas.inis.gov.ie",
      "www.gov.uk",
      "www.legislation.gov.uk",
      "evisa.sainthelena.gov.sh",
      "www.sainthelena.gov.sh",
      "solomons.gov.sb",
      "www.investsolomons.gov.sb",
      "immigration.gov.sb",
      "ica.gov.pg",
      "evisa.ica.gov.pg",
      "www.immigration.ms",
      "mfai.gov.ck",
      "www.niueisland.com",
      "mof.gov.nu",
      "www.gov.nu",
      "ronlaw.gov.nr",
      "justice.gov.nr",
      "www.nauru.gov.nr",
      "www.revenue.gov.to",
      "www.gov.to",
      "www.regjeringen.no",
      "tongaembassycn.gov.to",
      "ago.gov.to",
      "www.ago.gov.to",
      "fsmembassy.fm",
      "tuvalu-legislation.tv",
      "treaties.un.org",
      "www.treaties.mfat.govt.nz",
      "rmiimmigration.org",
      "rmiparliament.org",
      "www.rmiparliament.org",
      "rminitijela.com",
      "www.rmiembassyus.org",
      "mofa.gov.qa",
      "immigration.mfai.gov.ki",
      "www.mfa.gov.ki",
      "www.canada.ca",
      "www.immd.gov.hk",
      "travel.state.gov",
      "travel.gc.ca",
      "www.k-eta.go.kr",
      "overseas.mofa.go.kr",
      "www.immigration.go.kr",
      "visa.go.kr",
      "www.govinfo.gov",
      "www.ecfr.gov",
      "www.whitehouse.gov",
      "www.uscis.gov",
      "www.help.cbp.gov",
      "www.osas.as",
      "legalaffairs.as.gov",
      "g-cnmi-eta.cbp.dhs.gov",
      "esta.cbp.dhs.gov",
      "evisa.gov.ai",
      "borderforce.gov.tc",
      "www.gov.fk",
      "www2.gov.bm",
      "bvi.gov.vg",
      "gov.vg",
      "laws.gov.vg",
      "www.bvitourism.com",
      "otp.gov.ky",
      "www.gov.ms",
      "inm.gob.hn",
      "portalunico.iaip.gob.hn",
      "tsc.gob.hn",
      "www.tsc.gob.hn",
      "rree.gob.sv",
      "www.migracion.gob.sv",
      "www.cocesna.org",
      "legislacion.asamblea.gob.ni",
      "israel-entry.piba.gov.il",
      "www.gov.il",
      "embassies.gov.il",
      "www.boca.gov.tw",
      "visawebapp.boca.gov.tw",
      "www.immigration.gov.tw",
      "www.gov.br",
      "www.inm.gob.mx",
      "www.gob.mx",
      "consulmex.sre.gob.mx",
      "embamex.sre.gob.mx",
      "lovdata.no",
      "www.llv.li",
      "www.immigration.gov.fj",
      "www.dha.gov.za",
      "ehome.dha.gov.za",
      "www.gov.za",
      "mofa.gov.bs",
      "evisa.mofa.gov.bs",
      "cdn.bahamas.gov.bs",
      "www.immigration.gov.bs",
      "passport.govmu.org",
      "www.imi.gov.my",
      "malaysiavisa.imi.gov.my",
      "imigresen-online.imi.gov.my",
      "www.kln.gov.my",
      "www.foreign.gov.bb",
      "immigration.gov.bb",
      "apps.immigration.gov.bb",
      "kanwilsultra.imigrasi.go.id",
      "jakartapusat.imigrasi.go.id",
      "www.imigrasi.go.id",
      "manado.imigrasi.go.id",
      "www.migration.gov.rw",
      "www.fm.gov.om",
      "www.rop.gov.om",
      "www.pica.gov.jm",
      "mfaft.gov.jm",
      "www.zambiaimmigration.gov.zm",
      "eservices.zambiaimmigration.gov.zm",
      "www.cancilleria.gob.ec",
      "serviciosdigitales.cancilleria.gob.ec",
      "www.migraciones.gob.ar",
      "www.boletinoficial.gob.ar",
      "www.argentina.gob.ar",
      "immigration.gov.np",
      "tia.immigration.gov.np",
      "mofa.gov.np",
      "www.immigration.gov.mv",
      "imuga.immigration.gov.mv",
      "www.ics.gov.sc",
      "mfa.gov.sc",
      "www.gov.sc",
      "seychelles.govtas.com",
      "tourism.gov.sc",
      "nationalsecurity.gov.tt",
      "foreign.gov.tt",
      "homelandsecurity.gov.tt",
      "ttconnect.gov.tt",
      "mpmc.gov.ws",
      "www.ag.gov.ws",
      "www.samoa.travel",
      "www.mta.gov.mg",
      "ambamad-moscou.diplomatie.gov.mg",
      "cnlegis.gov.mg",
      "ambamad-paris.diplomatie.gov.mg",
      "bcbp.pw",
      "immigration.gov.vu",
      "www.gov.cv",
      "portalconsular.mnec.gov.cv",
      "boe.incv.cv",
      "evisa.gov.mz",
      "minec.gov.mz",
      "www.immigration.go.ug",
      "immigration.go.ug",
      "kigali.mofa.go.ug",
      "abuja.mofa.go.ug",
      "dei.gouv.bj",
      "www.gouv.bj",
      "api-mae.diplomatie.bj",
      "evisa.bj",
      "sgg.gouv.bj",
      "immigration.gov.ag",
      "www.mfa.gov.bt",
      "cancilleria.gov.co",
      "www.cancilleria.gov.co",
      "portal.migracioncolombia.gov.co",
      "www.evisa.gov.bh",
      "www.npra.gov.bh",
      "bahrain.bh",
      "aim.mtt.gov.bh",
      "visitqatar.com",
      "portal.moi.gov.qa",
      "hayya.qa",
      "beta-api.hayya.qa",
      "visa.visitsaudi.com",
      "www.visitsaudi.com",
      "www.mofa.gov.sa",
      "moi.gov.jo",
      "www.mofa.gov.ae",
      "u.ae",
      "icp.gov.ae",
      "kuwaitvisa.moi.gov.kw",
      "www.kuna.net.kw",
      "www.kuwaitairport.gov.kw",
      "www.general-security.gov.lb",
      "www.mfa.am",
      "evisa.mfa.am",
      "www.arlis.am",
      "evisa.mfa.ir",
      "www.moj.gov.iq",
      "evisa.iq",
      "mofa.gov.iq",
      "ur.gov.iq",
      "www.iaa.gov.il",
      "eaip.gaca.gov.sy",
      "www.mofa-ye.org",
      "yemenevisa.org",
      "www.mha.gov.in",
      "indianvisaonline.gov.in",
      "www.indianvisaonline.gov.in",
      "www.mea.gov.in",
      "www.immigration.gov.lk",
      "eta.gov.lk",
      "www.eta.gov.lk",
      "evisa.gov.vn",
      "en.baochinhphu.vn",
      "baochinhphu.vn",
      "mofa.gov.vn",
      "vanban.chinhphu.vn",
      "congbao.cdnchinhphu.vn",
      "vbpl.moj.gov.vn",
      "consular.mfa.go.th",
      "image.mfa.go.th",
      "thaievisa.go.th",
      "tdac.immigration.go.th",
      "www.mfa.go.th",
      "mfa.go.th",
      "evisa.gov.ph",
      "ws.evisa.gov.ph",
      "immigration.gov.ph",
      "melbournepcg.org",
      "www.evisa.gov.kh",
      "arrival.gov.kh",
      "immigration.gov.kh",
      "www.mofa.gov.la",
      "laoevisa.gov.la",
      "mxf.laoevisa.gov.la",
      "www.immigration.gov.la",
      "api.immigration.gov.la",
      "en.consul.mn",
      "immigration.gov.mn",
      "www.immigration.gov.mn",
      "evisa.mn",
      "www.evisa.mn",
      "gov.uz",
      "e-visa.gov.uz",
      "constitution.gov.uz",
      "www.gov.kz",
      "evisa.moip.gov.mm",
      "www.mofa.gov.mm",
      "presoffministry.gov.mm",
      "www.gov.mo",
      "www.mfa.gov.bn",
      "www.immigration.gov.bn",
      "www.agc.gov.bn",
      "export.gov.kg",
      "www.evisa.e-gov.kg",
      "www.gov.kg",
      "en.nia.gov.cn",
      "cs.mfa.gov.cn",
      "www.doi.gov.bt",
      "immi.gov.bt",
      "bhutan.travel",
      "www.moha.gov.bt",
      "dip.gov.bd",
      "visa.gov.bd",
      "copenhagen.mofa.gov.bd",
      "manama.mofa.gov.bd",
      "birmingham.mofa.gov.bd",
      "brussels.mofa.gov.bd",
      "bdlaws.minlaw.gov.bd",
      "dgip.gov.pk",
      "mofa.gov.pk",
      "sip.mfa.tj",
      "www.visa.gov.tj",
      "mmk.tj",
      "mfa.tj",
      "www.mfa.gov.tm",
      "migration.gov.tm",
      "turkmenistan.gov.tm",
      "www.turkmenistan.gov.tm",
      "moi.gov.af",
      "mfa.gov.af",
      "afghanembassy.org",
      "customs.gov.tl",
      "timor-leste.gov.tl",
      "www.consilium.europa.eu",
      "krld.pl",
      "bontang.imigrasi.go.id",
      "evisa.imigrasi.go.id",
      "www.ambcambodgeparis.info",
      "botswanaembassy.org",
      "gov.bw",
      "www.gov.bw",
      "www.dfat.gov.au",
      "www.botswanatourism.co.bw",
      "www.evisa.gov.bw",
      "mhaiss.gov.na",
      "mha.gov.na",
      "eservices.mhaiss.gov.na",
      "www.zimimmigration.gov.zw",
      "www.evisa.gov.zw",
      "www.npa.gov.zw",
      "www.evisa.gov.et",
      "justice.gov.et",
      "www.ofag.gov.et",
      "evisa.immigration.gov.gh",
      "mfa.gov.gh",
      "passport.mfa.gov.gh",
      "www.addisababa.mfa.gov.gh",
      "gis.gov.gh",
      "visa.immigration.go.tz",
      "www.immigration.go.tz",
      "www.parliament.go.tz",
      "evisa.gov.mw",
      "immigration.gov.mw",
      "visitmalawi.mw",
      "www.malawi.gov.mw",
      "malawihighcommission.co.uk",
      "mfa.gov.dz",
      "emboslo.mfa.gov.dz",
      "www.joradp.dz",
      "interieur.gov.dz",
      "embdublin.mfa.gov.dz",
      "cglondon.mfa.gov.dz",
      "embbrussels.mfa.gov.dz",
      "immigration.gov.ng",
      "lecard.immigration.gov.ng",
      "ecowas.int",
      "www.ecowas.int",
      "consulsen-paris.gouv.sn",
      "www.diplomatie.gouv.sn",
      "diplomatie.gouv.sn",
      "api.acces-maroc.ma",
      "www.acces-maroc.ma",
      "adala.justice.gov.ma",
      "www.diplocam.cm",
      "spm.gov.cm",
      "cemac.int",
      "www.prc.cm",
      "www.econsulat.tn",
      "www.social.gov.tn",
      "pm.gov.tn",
      "ecois.ecowas.int",
      "snedai.com",
      "www.diplomatie.gouv.ci",
      "royaumeuni.diplomatie.gouv.ci",
      "visa2egypt.gov.eg",
      "moi.gov.eg",
      "www.mfa.gov.eg",
      "anrpts.gov.mr",
      "www.diplomatie.gov.mr",
      "www.procedures.gov.mr",
      "apim.gov.mr",
      "us.embassyeritrea.org",
      "balkaununiku.gov.tl",
      "diplomatie.gouv.cd",
      "www.guineaecuatorialpress.com",
      "equatorialguinea-evisa.com",
      "lsp.moic.gov.la",
      "aladel.gov.ly",
      "lana.gov.ly",
      "back.evisa.gov.ly",
      "embassies.foreign.gov.ly",
      "ldil.gia.gov.ly",
      "gambia.gov.gm",
      "gid.gov.gm",
      "www.minfor.gov.gy",
      "mola.gov.gy",
      "londonhc.mission.gov.gy",
      "newdelhihc.mission.gov.gy",
      "passports.gov.sd",
      "sudan.gov.sd",
      "moj.gov.sd",
      "mofaic.gov.ss",
      "www.evisa.gov.ss",
      "tradeinfohub.gov.ss",
      "gouvernement.gov.bf",
      "turkiye.diplomatie.gov.bf",
      "www.visaburkina.bf",
      "police.gov.bf",
      "slid.gov.sl",
      "www.evisa.sl",
      "evisa.sl",
      "ntb.gov.sl",
      "thecommonwealth.org",
      "migration.gov.bi",
      "tourisme.gov.bi",
      "www.eac.int",
      "www.sgg.cg",
      "developpement-durable.gouv.cg",
      "gouvernement.ga",
      "evisa.dgdi.ga",
      "www.affaires-etrangeres.gouv.ga",
      "paris.diplomatie.gouv.cf",
      "www.guineaecuatorialpress.com",
      "www.lesothoemb-usa.gov.ls",
      "www.homeaffairs.gov.ls",
      "www.gov.ls",
      "www.gov.sz",
      "evisa.gov.sz",
      "www.smf.st",
      "mne.gov.st",
      "www.cplp.org",
      "european-union.europa.eu",
      "www.paf.gov.gn",
      "www.republiquetogolaise.tg",
      "voyage.gouv.tg",
      "service-public.gouv.tg",
      "amap.ml",
      "www.diplomatiemdc.gouv.ml",
      "diplomatie.gouv.ne",
      "www.ambaniger-bruxelles.be",
      "www.amba-mali.be",
      "anp.ne",
      "discoverliberia.lnta.gov.lr",
      "visaonarrival.lis.gov.lr",
      "lis.gov.lr",
      "senate.gov.lr",
      "evisa.td",
      "mfa.gov.rs",
      "slgl.pravno-informacioni-sistem.rs",
      "www.mfa.gov.tr",
      "evisa.gov.tr",
      "en.goc.gov.tr",
      "www.goc.gov.tr",
      "www.nvi.gov.tr",
      "www.kdmid.ru",
      "evisa.kdmid.ru",
      "kremlin.ru",
      "mfa.gov.md",
      "www.evisa.gov.md",
      "www.border.gov.md",
      "www.gov.me",
      "mfa.gov.mk",
      "mvr.gov.mk",
      "migration.mia.gov.am",
      "www.iddeea.gov.ba",
      "www.slvesnik.com.mk",
      "ldbis.pravda.gov.mk",
      "aip.scaa.gov.so",
      "immigration.gov.so",
      "web.mfa.gov.so",
      "arabiasaudita.mirex.gov.ao",
      "joanesburgo.mirex.gov.ao",
      "www.dominica.gov.dm",
      "printery.dominica.gov.dm",
      "www.nationalsecurity.gov.dm",
      "www.france-visas.gouv.fr",
      "france-visas.gouv.fr",
      "www.immigration.interieur.gouv.fr",
      "www.legifrance.gouv.fr",
      "attorneygeneralchambers.com",
      "externalaffairs.govt.lc",
      "npc.govt.lc",
      "www.govt.lc",
      "security.gov.vc",
      "evisa.gov.vc",
      "foreign.gov.vc",
      "www.gov.vc",
      "www.consilium.europa.eu",
      "concordia.itamaraty.gov.br",
      "www.netherlandsworldwide.nl",
      "gobiernu.cw",
      "dgii.gov.do",
      "www.tribunalconstitucional.gob.do",
      "tribunalsitestorage.blob.core.windows.net",
      "servicios360.mirex.gob.do",
      "consultas.mirex.gob.do",
      "migracion.gob.do",
      "mirex.gob.do",
      "immigration.gov.bz",
      "pgrweb.go.cr",
      "www.minex.gob.gt",
      "igm.gob.gt",
      "www.congreso.gob.gt",
      "www.gub.uy",
      "www.chile.gob.cl",
      "www.consulado.gob.cl",
      "serviciomigraciones.cl",
      "consulados.cancilleria.gob.bo",
      "cancilleria.gob.bo",
      "diputados.gob.bo",
      "migracion.gob.bo",
      "servicios.cancilleria.gob.bo",
      "visas.cancilleria.gob.bo",
      "www.gacetaoficialdebolivia.gob.bo",
      "www.planalto.gov.br",
      "migraciones.gov.py",
      "www.mre.gov.py",
      "mppre.gob.ve",
      "francia.consuladovenezuela.org",
      "nalog.gov.by",
      "etune.cancilleria.gob.ar",
      "uapi.daftar.org",
      "fipa.vijeceministara.gov.ba",
      "sps.gov.ba",
      "minfor.gov.gy",
      "eservices.iss.gov.gy",
      "guyanahctrinidad.mission.gov.gy",
      "burgerzaken.gov.sr",
      "gov.sr",
      "www.bermudalaws.bm",
      "www.gov.bm",
      "www2.gov.bm",
      "mejlis.gov.tm",
      "legislation.gov.fk",
      "www.legislation.gov.fk",
      "www.migracion.gob.pa",
      "www.gacetaoficial.gob.pa",
      "mire.gob.pa",
      "www2.mre.gov.py",
      "www.embassyofpanama.org",
      "uscode.house.gov",
      "sp.visitjordan.com",
      "voa.specialbranch.gov.bd",
      "www.mfa.gov.lv",
      "www.bmeia.gv.at",
      "konzinfo.mfa.gov.hu",
      "www.mzv.sk",
      "mvep.gov.hr",
      "mgr.0404.go.kr",
      "lisbon.mofa.gov.bd",
      "www.mfa.gr",
      "www.gov.pl",
      "keliauk.urm.lt",
      "mfa.bg",
      "www.mfa.bg",
      "mzv.gov.cz",
      "reisitargalt.vm.ee",
      "romania.tmembassy.gov.tm",
      "tunisz.mfa.gov.hu",
      "www.gov.si",
      "cdn.www.gob.pe",
      "www.gob.pe",
      "www.facebook.com",
      "tokyo.mfa.gov.rs",
      "evisa.gov.mn",
      "portales.sre.gob.mx",
      "evisa.rop.gov.om",
      "president.uz",
      "aplicacao.itamaraty.gov.br",
      "peraturan.go.id",
      "www.mofa.pna.ps",
      "island.is",
      "files.reglugerd.is",
    ]);
    for (const source of OFFICIAL_VISA_SOURCES) {
      const url = new URL(source.url);
      expect(url.protocol, source.id).toBe("https:");
      expect(officialHosts.has(url.hostname), source.id).toBe(true);
      expect(source.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("keeps source and policy identifiers unique and references resolvable", () => {
    const sourceIds = OFFICIAL_VISA_SOURCES.map(({ id }) => id);
    const policyIds = VISA_POLICY_EVIDENCE.map(({ id }) => id);
    expect(new Set(sourceIds).size).toBe(sourceIds.length);
    expect(new Set(policyIds).size).toBe(policyIds.length);

    const knownSources = new Set(sourceIds);
    for (const policy of VISA_POLICY_EVIDENCE) {
      expect(policy.sourceIds.length, policy.id).toBeGreaterThan(0);
      for (const sourceId of policy.sourceIds) expect(knownSources.has(sourceId), `${policy.id}:${sourceId}`).toBe(true);
    }
  });
});
