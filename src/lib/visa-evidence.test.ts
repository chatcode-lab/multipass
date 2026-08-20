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
  NEW_ZEALAND_AUSTRALIA_CONDITIONAL_NZETA_CODES,
  NEW_ZEALAND_CONDITIONED_NZETA_CODES,
  NEW_ZEALAND_STANDARD_NZETA_CODES,
  NEW_ZEALAND_VISITOR_VISA_REQUIRED_CODES,
  OFFICIAL_VISA_SOURCES,
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
  UNITED_STATES_VWP_CODES,
  UNITED_STATES_VISITOR_VISA_REQUIRED_GENERAL_CODES,
  UNITED_KINGDOM_APRIL_2025_ETA_CODES,
  UNITED_KINGDOM_EARLY_ETA_CODES,
  UNITED_KINGDOM_JANUARY_2025_ETA_CODES,
  UNITED_KINGDOM_VISITOR_VISA_CODES,
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
    expect(getVisaRelationshipEvidence("AE", "CH", "visa_free").supportsCurrentStatus).toBe(false);
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
