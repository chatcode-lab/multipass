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
    expect(getVisaRelationshipEvidence("BE", "TD", "visa_required").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BI", "CD", "visa_free").policies).toHaveLength(0);
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
    expect(getVisaRelationshipEvidence("AE", "BS", "visa_free").supportsCurrentStatus).toBe(false);
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

    expect(barbadosPairs).toHaveLength(197);
    expect(getVisaRelationshipEvidence("CG", "BB", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HT", "BB", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "BB", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "BB", "evisa").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("MV", "BB", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("PS", "BB", "visa_required").supportsCurrentStatus).toBe(false);
  });

  it("keeps Indonesia's e-VOA within the Visa on Arrival classification", () => {
    const indonesiaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "ID");

    expect(indonesiaPairs).toHaveLength(99);
    expect(getVisaRelationshipEvidence("CL", "ID", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "ID", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "ID", "evisa").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AF", "ID", "visa_required").supportsCurrentStatus).toBe(false);
  });

  it("classifies Rwanda's universal arrival visa without treating fee waivers as visa-free", () => {
    const rwandaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "RW");

    expect(RWANDA_VOA_ORDINARY_PASSPORT_CODES).toHaveLength(198);
    expect(rwandaPairs).toHaveLength(198);
    expect(getVisaRelationshipEvidence("DE", "RW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "RW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "RW", "visa_free").supportsCurrentStatus).toBe(false);
  });

  it("keeps Oman's conditional exemptions explicit and its source divergence unresolved", () => {
    const omanPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "OM");

    expect(omanPairs).toHaveLength(108);
    expect(getVisaRelationshipEvidence("DE", "OM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "OM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "OM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "OM", "evisa").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("TW", "OM", "visa_free").supportsCurrentStatus).toBe(false);
  });

  it("covers Jamaica's explicit ordinary-passport table without inferring omitted rows", () => {
    const jamaicaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "JM");

    expect(jamaicaPairs).toHaveLength(196);
    expect(getVisaRelationshipEvidence("US", "JM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "JM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "JM", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MO", "JM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CG", "JM", "visa_required").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("PS", "JM", "visa_required").supportsCurrentStatus).toBe(false);
  });

  it("covers Zambia's three explicit visitor categories without resolving legacy names", () => {
    const zambiaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "ZM");

    expect(zambiaPairs).toHaveLength(194);
    expect(getVisaRelationshipEvidence("US", "ZM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "ZM", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "ZM", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ME", "ZM", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("TW", "ZM", "evisa").supportsCurrentStatus).toBe(false);
  });

  it("covers Ecuador's explicit eVisa list and visa-free complement", () => {
    const ecuadorPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "EC");

    expect(ECUADOR_EVISA_ORDINARY_PASSPORT_CODES).toHaveLength(45);
    expect(ecuadorPairs).toHaveLength(196);
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
    expect(southKoreaPairs).toHaveLength(111);
    expect(getVisaRelationshipEvidence("CH", "KR", "visa_free", "2026-08-20").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CH", "KR", "visa_free", "2027-01-01").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("CL", "KR", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "KR", "visa_required").supportsCurrentStatus).toBe(false);
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
    const unitedStatesPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "US");
    expect(unitedStatesPairs).toHaveLength(199);
    expect(getVisaRelationshipEvidence("JP", "US", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "US", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "US", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BS", "US", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("FM", "US", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("keeps the Colombia and Peru agreements directional and excludes Ireland", () => {
    expect(getVisaRelationshipEvidence("CO", "DE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "CO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PE", "PT", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PT", "PE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CO", "IE", "visa_free").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("IE", "PE", "visa_free").supportsCurrentStatus).toBe(false);
  });

  it("keeps all 98 nationalities and expands the 96 represented passport issuers", () => {
    expect(ANGOLA_TOURIST_VISA_EXEMPT_CODES).toHaveLength(98);
    const angolaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination, status }) => destination.code === "AO" && status === "visa_free");
    expect(angolaPairs).toHaveLength(96);
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
    expect(getVisaRelationshipEvidence("AD", "TT", snapshot.passports.AD.statuses.TT).supportsCurrentStatus).toBe(false);
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
    expect(pairsFor("VU")).toHaveLength(189);
    expect(getVisaRelationshipEvidence("US", "VU", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CM", "VU", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BH", "VU", snapshot.passports.BH.statuses.VU).supportsCurrentStatus).toBe(false);

    expect(pairsFor("CV")).toHaveLength(156);
    expect(getVisaRelationshipEvidence("US", "CV", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "CV", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AU", "CV", snapshot.passports.AU.statuses.CV).supportsCurrentStatus).toBe(false);

    expect(MOZAMBIQUE_EVISA_ORDINARY_PASSPORT_CODES).toHaveLength(146);
    expect(pairsFor("MZ")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("US", "MZ", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AD", "MZ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NG", "MZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ST", "MZ", "visa_free").supportsCurrentStatus).toBe(true);
  });

  it("covers the reviewed Uganda, Benin, Antigua and Barbuda, and Colombia pass", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("UG")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("AO", "UG", "evisa").supportsCurrentStatus).toBe(true);
    expect(snapshot.passports.AO.statuses.UG).toBe("evisa");

    expect(pairsFor("BJ")).toHaveLength(40);
    expect(getVisaRelationshipEvidence("SG", "BJ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DZ", "BJ", snapshot.passports.DZ.statuses.BJ).supportsCurrentStatus).toBe(false);

    expect(pairsFor("AG")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("TO", "AG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HR", "AG", "evisa").supportsCurrentStatus).toBe(true);
    expect(snapshot.passports.HR.statuses.AG).toBe("evisa");

    expect(pairsFor("CO")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("HK", "CO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IL", "CO", "evisa").supportsCurrentStatus).toBe(true);
    expect(snapshot.passports.IL.statuses.CO).toBe("evisa");
  });

  it("contains only direct HTTPS official-source URLs", () => {
    const officialHosts = new Set([
      "governo.gov.ao",
      "etakenya.go.ke",
      "new.kenyalaw.org",
      "evisa.gouv.cd",
      "eur-lex.europa.eu",
      "home-affairs.ec.europa.eu",
      "www.efta.int",
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
      "www.canada.ca",
      "www.immd.gov.hk",
      "travel.state.gov",
      "www.k-eta.go.kr",
      "overseas.mofa.go.kr",
      "www.immigration.go.kr",
      "visa.go.kr",
      "www.govinfo.gov",
      "www.uscis.gov",
      "www.help.cbp.gov",
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
      "cancilleria.gov.co",
      "www.cancilleria.gov.co",
      "portal.migracioncolombia.gov.co",
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
