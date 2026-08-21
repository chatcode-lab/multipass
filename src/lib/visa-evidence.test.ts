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

    expect(zambiaPairs).toHaveLength(195);
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

  it("covers the reviewed Bahrain, Qatar, Saudi Arabia, and Jordan pass", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("BH")).toHaveLength(6);
    expect(getVisaRelationshipEvidence("AE", "BH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("UA", "BH", snapshot.passports.UA.statuses.BH).supportsCurrentStatus).toBe(false);

    expect(pairsFor("QA")).toHaveLength(192);
    expect(getVisaRelationshipEvidence("HK", "QA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RS", "QA", "evisa").supportsCurrentStatus).toBe(true);
    expect(snapshot.passports.HK.statuses.QA).toBe("visa_on_arrival");

    expect(pairsFor("SA")).toHaveLength(79);
    expect(getVisaRelationshipEvidence("GB", "SA", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RU", "SA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "SA", snapshot.passports.BR.statuses.SA).supportsCurrentStatus).toBe(false);

    expect(pairsFor("JO")).toHaveLength(54);
    expect(getVisaRelationshipEvidence("MM", "JO", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "JO", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "JO", snapshot.passports.US.statuses.JO).supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed UAE, Kuwait, Lebanon, and Armenia pass", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("AE")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "AE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BD", "AE", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "AE", snapshot.passports.TW.statuses.AE).supportsCurrentStatus).toBe(false);

    expect(pairsFor("KW")).toHaveLength(59);
    expect(getVisaRelationshipEvidence("MO", "KW", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CL", "KW", snapshot.passports.CL.statuses.KW).supportsCurrentStatus).toBe(false);

    expect(pairsFor("LB")).toHaveLength(195);
    expect(getVisaRelationshipEvidence("PY", "LB", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SY", "LB", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("EG", "LB", snapshot.passports.EG.statuses.LB).supportsCurrentStatus).toBe(false);

    expect(pairsFor("AM")).toHaveLength(144);
    expect(getVisaRelationshipEvidence("AZ", "AM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CA", "AM", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "AM", snapshot.passports.AF.statuses.AM).supportsCurrentStatus).toBe(false);
  });

  it("keeps Iran and Iraq evidence conservative when official nationality scope is incomplete", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("IR")).toHaveLength(40);
    expect(getVisaRelationshipEvidence("BR", "IR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("LB", "IR", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "IR", snapshot.passports.IN.statuses.IR).supportsCurrentStatus).toBe(false);

    expect(pairsFor("IQ")).toHaveLength(1);
    expect(getVisaRelationshipEvidence("IQ", "IQ", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "IQ", snapshot.passports.US.statuses.IQ).supportsCurrentStatus).toBe(false);
  });

  it("keeps Palestine and Syria unresolved while applying Yemen's advance-visa grid", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("PS")).toHaveLength(0);
    expect(getVisaRelationshipEvidence("US", "PS", snapshot.passports.US.statuses.PS).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("PS", "PS", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("SY")).toHaveLength(0);
    expect(getVisaRelationshipEvidence("US", "SY", snapshot.passports.US.statuses.SY).supportsCurrentStatus).toBe(false);
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

    expect(pairsFor("LK")).toHaveLength(196);
    expect(getVisaRelationshipEvidence("SG", "LK", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "LK", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "LK", snapshot.passports.TW.statuses.LK).supportsCurrentStatus).toBe(false);

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

    expect(pairsFor("KH")).toHaveLength(22);
    expect(getVisaRelationshipEvidence("SG", "KH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "KH", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "KH", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "KH", snapshot.passports.US.statuses.KH).supportsCurrentStatus).toBe(false);

    expect(pairsFor("LA")).toHaveLength(162);
    expect(getVisaRelationshipEvidence("BY", "LA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "LA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "LA", snapshot.passports.AF.statuses.LA).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("LA", "LA", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Mongolia and Uzbekistan routes", () => {
    const mongoliaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MN");

    expect(mongoliaPairs).toHaveLength(160);
    expect(getVisaRelationshipEvidence("US", "MN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "MN", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KW", "MN", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("XK", "MN", snapshot.passports.XK.statuses.MN).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("MN", "MN", "citizenship").supportsCurrentStatus).toBe(false);

    const uzbekistanPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "UZ");
    expect(uzbekistanPairs).toHaveLength(196);
    expect(getVisaRelationshipEvidence("HK", "UZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("JO", "UZ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BD", "UZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SA", "UZ", snapshot.passports.SA.statuses.UZ).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("UZ", "UZ", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("covers the reviewed Kazakhstan and Myanmar routes", () => {
    const kazakhstanPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "KZ");
    expect(kazakhstanPairs).toHaveLength(195);
    expect(getVisaRelationshipEvidence("BB", "KZ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MU", "KZ", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "KZ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BD", "KZ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PS", "KZ", snapshot.passports.PS.statuses.KZ).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("KZ", "KZ", "citizenship").supportsCurrentStatus).toBe(true);

    const myanmarPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "MM");
    expect(myanmarPairs).toHaveLength(103);
    expect(getVisaRelationshipEvidence("SG", "MM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "MM", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MN", "MM", "evisa").supportsCurrentStatus).toBe(true);
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

    expect(pairsFor("KG")).toHaveLength(77);
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

    expect(pairsFor("BD")).toHaveLength(20);
    expect(getVisaRelationshipEvidence("EG", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BN", "BD", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "BD", snapshot.passports.DE.statuses.BD).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BD", "BD", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("PK")).toHaveLength(190);
    expect(getVisaRelationshipEvidence("MV", "PK", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DE", "PK", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("QA", "PK", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "PK", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("DZ", "PK", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PK", "PK", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Tajikistan while preserving Afghanistan and Turkmenistan source gaps", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("TJ")).toHaveLength(199);
    expect(getVisaRelationshipEvidence("BB", "TJ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BN", "TJ", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("WS", "TJ", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TJ", "TJ", "citizenship").supportsCurrentStatus).toBe(true);

    expect(pairsFor("TM")).toHaveLength(1);
    expect(getVisaRelationshipEvidence("TM", "TM", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "TM", snapshot.passports.US.statuses.TM).supportsCurrentStatus).toBe(false);

    expect(pairsFor("AF")).toHaveLength(0);
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

    expect(pairsFor("KP")).toHaveLength(0);
    expect(getVisaRelationshipEvidence("US", "KP", snapshot.passports.US.statuses.KP).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("KP", "KP", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Botswana's bounded official schedules without flattening source conflicts", () => {
    const botswanaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "BW");

    expect(botswanaPairs).toHaveLength(170);
    expect(getVisaRelationshipEvidence("US", "BW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RW", "BW", "evisa").supportsCurrentStatus).toBe(true);
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

    expect(pairsFor("TZ")).toHaveLength(194);
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

    expect(pairsFor("NG")).toHaveLength(14);
    expect(getVisaRelationshipEvidence("GH", "NG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ML", "NG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "NG", snapshot.passports.US.statuses.NG).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("NG", "NG", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("SN")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("MR", "SN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "SN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "SN", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SN", "SN", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("MA")).toHaveLength(180);
    expect(getVisaRelationshipEvidence("DZ", "MA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CG", "MA", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "MA", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CI", "MA", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MA", "MA", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers Cameroon and Côte d'Ivoire while documenting Tunisia's source gap", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("CM")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("CF", "CM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NG", "CM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AE", "CM", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CM", "CM", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("CI")).toHaveLength(14);
    expect(getVisaRelationshipEvidence("GN", "CI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BF", "CI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "CI", snapshot.passports.US.statuses.CI).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("CI", "CI", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("TN")).toHaveLength(0);
    expect(getVisaRelationshipEvidence("US", "TN", snapshot.passports.US.statuses.TN).supportsCurrentStatus).toBe(false);
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

  it("covers Eritrea and Gambia while documenting Libya's source gap", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("ER")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("US", "ER", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KE", "ER", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ER", "ER", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("LY")).toHaveLength(0);
    expect(getVisaRelationshipEvidence("US", "LY", snapshot.passports.US.statuses.LY).supportsCurrentStatus).toBe(false);

    expect(pairsFor("GM")).toHaveLength(33);
    expect(getVisaRelationshipEvidence("RU", "GM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GH", "GM", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GM", snapshot.passports.US.statuses.GM).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("GM", "GM", "citizenship").supportsCurrentStatus).toBe(true);
  });

  it("keeps Sudan conservative and supports only South Sudan's named exemptions", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("SD")).toHaveLength(1);
    expect(getVisaRelationshipEvidence("SD", "SD", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "SD", snapshot.passports.US.statuses.SD).supportsCurrentStatus).toBe(false);

    expect(pairsFor("SS")).toHaveLength(4);
    expect(getVisaRelationshipEvidence("KE", "SS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("UG", "SS", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "SS", snapshot.passports.US.statuses.SS).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("SS", "SS", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("covers the reviewed Burkina Faso, Guinea-Bissau, Sierra Leone, and Burundi scopes", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("BF")).toHaveLength(53);
    expect(getVisaRelationshipEvidence("GH", "BF", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BF", snapshot.passports.US.statuses.BF).supportsCurrentStatus).toBe(false);

    expect(pairsFor("GW")).toHaveLength(14);
    expect(getVisaRelationshipEvidence("GH", "GW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ML", "GW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GW", snapshot.passports.US.statuses.GW).supportsCurrentStatus).toBe(false);

    expect(pairsFor("SL")).toHaveLength(100);
    expect(getVisaRelationshipEvidence("GH", "SL", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "SL", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "SL", snapshot.passports.US.statuses.SL).supportsCurrentStatus).toBe(false);

    expect(pairsFor("BI")).toHaveLength(198);
    expect(getVisaRelationshipEvidence("SO", "BI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "BI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MV", "BI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "BI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BI", "BI", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("supports only the narrow CEMAC cohorts for Congo and Gabon", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("CG")).toHaveLength(5);
    expect(getVisaRelationshipEvidence("CM", "CG", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "CG", snapshot.passports.US.statuses.CG).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("CG", "CG", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("GA")).toHaveLength(5);
    expect(getVisaRelationshipEvidence("CG", "GA", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GA", snapshot.passports.US.statuses.GA).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("GA", "GA", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("supports only the narrow CEMAC cohorts for the Central African Republic and Equatorial Guinea", () => {
    const pairsFor = (destinationCode: string) => evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === destinationCode);

    expect(pairsFor("CF")).toHaveLength(5);
    expect(getVisaRelationshipEvidence("CM", "CF", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "CF", snapshot.passports.US.statuses.CF).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("CF", "CF", "citizenship").supportsCurrentStatus).toBe(false);

    expect(pairsFor("GQ")).toHaveLength(5);
    expect(getVisaRelationshipEvidence("CM", "GQ", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "GQ", snapshot.passports.US.statuses.GQ).supportsCurrentStatus).toBe(false);
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

    expect(pairs).toHaveLength(56);
    expect(getVisaRelationshipEvidence("CN", "ST", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("RS", "ST", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "ST", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "ST", snapshot.passports.AF.statuses.ST).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("ST", "ST", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("models Guinea's approval-letter route as ETA rather than eVisa or VOA", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "GN");

    expect(pairs).toHaveLength(193);
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

    expect(maliPairs).toHaveLength(14);
    expect(nigerPairs).toHaveLength(14);
    expect(liberiaPairs).toHaveLength(14);
    expect(getVisaRelationshipEvidence("GH", "ML", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BF", "NE", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("ML", "LR", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "ML", snapshot.passports.US.statuses.ML).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("US", "NE", snapshot.passports.US.statuses.NE).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("US", "LR", snapshot.passports.US.statuses.LR).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("ML", "ML", "citizenship").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("NE", "NE", "citizenship").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("LR", "LR", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("uses Chad's current named exemption list without inferring an eVisa residual", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "TD");

    expect(pairs).toHaveLength(21);
    expect(getVisaRelationshipEvidence("CM", "TD", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BB", "TD", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SG", "TD", "visa_free").supportsCurrentStatus).toBe(true);
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

    expect(pairs).toHaveLength(96);
    expect(getVisaRelationshipEvidence("WS", "AO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "AO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PH", "AO", snapshot.passports.PH.statuses.AO).supportsCurrentStatus).toBe(false);
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

  it("keeps French overseas destinations outside Schengen and narrowly mapped", () => {
    for (const destinationCode of ["GF", "PF", "YT", "NC", "RE"] as const) {
      const pairs = evidenceRelationshipPairs(snapshot.manifest)
        .filter(({ destination }) => destination.code === destinationCode);
      expect(pairs, destinationCode).toHaveLength(31);
      expect(getVisaRelationshipEvidence("NO", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("CO", destinationCode, "visa_free").supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("US", destinationCode, snapshot.passports.US.statuses[destinationCode]).supportsCurrentStatus).toBe(false);
    }

    const frenchWestIndiesPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "FW");
    expect(frenchWestIndiesPairs).toHaveLength(30);
    expect(getVisaRelationshipEvidence("NO", "FW", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CO", "FW", snapshot.passports.CO.statuses.FW).supportsCurrentStatus).toBe(false);
  });

  it("maps Saint Lucia's current visa schedules and treaty waivers", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "LC");

    expect(pairs).toHaveLength(186);
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

    expect(pairs).toHaveLength(188);
    expect(getVisaRelationshipEvidence("MA", "DO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "DO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AF", "DO", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AL", "DO", snapshot.passports.AL.statuses.DO).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("DO", "DO", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("maps Belize's current ordinary-passport visa table without filling ambiguous rows", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "BZ");

    expect(pairs).toHaveLength(193);
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

  it("maps only the named pre-authorized cohorts for United States territories", () => {
    const expectedCounts = new Map([
      ["AS", 46],
      ["GU", 46],
      ["MP", 47],
      ["PR", 42],
      ["VI", 42],
    ]);

    for (const [destinationCode, expected] of expectedCounts) {
      const pairs = evidenceRelationshipPairs(snapshot.manifest)
        .filter(({ destination }) => destination.code === destinationCode);
      expect(pairs, destinationCode).toHaveLength(expected);
    }

    expect(getVisaRelationshipEvidence("QA", "AS", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("WS", "AS", snapshot.passports.WS.statuses.AS).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("AU", "GU", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "MP", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PT", "PR", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PT", "VI", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "PR", snapshot.passports.US.statuses.PR).supportsCurrentStatus).toBe(false);
  });

  it("maps bounded UK territory schedules without filling unsupported territory complements", () => {
    const expectedCounts = new Map([
      ["AI", 199],
      ["TC", 199],
      ["FK", 109],
      ["KY", 198],
      ["BM", 0],
      ["VG", 0],
      ["MS", 0],
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
    expect(getVisaRelationshipEvidence("US", "FK", snapshot.passports.US.statuses.FK).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("PE", "KY", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SS", "KY", snapshot.passports.SS.statuses.KY).supportsCurrentStatus).toBe(false);
  });

  it("keeps Honduras coverage limited to directly recovered current rules", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "HN");

    expect(pairs).toHaveLength(9);
    expect(getVisaRelationshipEvidence("BO", "HN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GT", "HN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("SA", "HN", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GB", "HN", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HN", "HN", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("US", "HN", snapshot.passports.US.statuses.HN).supportsCurrentStatus).toBe(false);
  });

  it("maps El Salvador's full current A, B and C nationality schedule", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "SV");

    expect(pairs).toHaveLength(196);
    expect(getVisaRelationshipEvidence("US", "SV", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("EC", "SV", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BO", "SV", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("PK", "SV", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("TW", "SV", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("HK", "SV", snapshot.passports.HK.statuses.SV).supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("SV", "SV", "citizenship").supportsCurrentStatus).toBe(false);
  });

  it("maps Nicaragua's current A, B and C schedule including India's border visa", () => {
    const pairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination }) => destination.code === "NI");

    expect(pairs).toHaveLength(189);
    expect(getVisaRelationshipEvidence("AD", "NI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("AO", "NI", "visa_required").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("IN", "NI", "visa_on_arrival").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("GT", "NI", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("NI", "NI", "citizenship").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MD", "NI", snapshot.passports.MD.statuses.NI).supportsCurrentStatus).toBe(false);
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
      "www.osas.as",
      "legalaffairs.as.gov",
      "g-cnmi-eta.cbp.dhs.gov",
      "evisa.gov.ai",
      "borderforce.gov.tc",
      "www.gov.fk",
      "www2.gov.bm",
      "bvi.gov.vg",
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
      "www.evisa.gov.bh",
      "www.npra.gov.bh",
      "bahrain.bh",
      "aim.mtt.gov.bh",
      "visitqatar.com",
      "portal.moi.gov.qa",
      "hayya.qa",
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
      "customs.gov.tl",
      "timor-leste.gov.tl",
      "www.consilium.europa.eu",
      "krld.pl",
      "bontang.imigrasi.go.id",
      "evisa.imigrasi.go.id",
      "www.ambcambodgeparis.info",
      "botswanaembassy.org",
      "gov.bw",
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
      "royaumeuni.diplomatie.gouv.ci",
      "visa2egypt.gov.eg",
      "moi.gov.eg",
      "www.mfa.gov.eg",
      "anrpts.gov.mr",
      "www.diplomatie.gov.mr",
      "www.procedures.gov.mr",
      "apim.gov.mr",
      "us.embassyeritrea.org",
      "aladel.gov.ly",
      "lana.gov.ly",
      "embassies.foreign.gov.ly",
      "ldil.gia.gov.ly",
      "gambia.gov.gm",
      "gid.gov.gm",
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
      "anp.ne",
      "discoverliberia.lnta.gov.lr",
      "visaonarrival.lis.gov.lr",
      "evisa.td",
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
      "attorneygeneralchambers.com",
      "externalaffairs.govt.lc",
      "npc.govt.lc",
      "www.govt.lc",
      "www.consilium.europa.eu",
      "concordia.itamaraty.gov.br",
      "www.netherlandsworldwide.nl",
      "gobiernu.cw",
      "dgii.gov.do",
      "servicios360.mirex.gob.do",
      "consultas.mirex.gob.do",
      "migracion.gob.do",
      "mirex.gob.do",
      "immigration.gov.bz",
      "pgrweb.go.cr",
      "www.minex.gob.gt",
      "igm.gob.gt",
      "www.congreso.gob.gt",
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
