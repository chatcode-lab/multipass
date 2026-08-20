import { describe, expect, it } from "vitest";
import {
  applyVerifiedAccessOverrides,
  calculateMobilityScore,
  comparePassportSets,
  denseRankByScore,
  normalizePassportDetail,
  parsePassportSets,
  rankEquivalent,
  reconcileManifestPassportDetails,
  slugifyCountry,
} from "./passport";
import type { Destination, PassportAccess, PassportSummary, SnapshotManifest, SourcePassportDetail } from "./types";

describe("passport calculations", () => {
  it("normalizes readable country slugs", () => {
    expect(slugifyCountry("São Tomé & Príncipe")).toBe("sao-tome-and-principe");
  });

  it("counts scored access and removes one home destination", () => {
    expect(
      calculateMobilityScore({
        AA: "citizenship",
        BB: "visa_free",
        CC: "eta",
        DD: "visa_on_arrival",
        EE: "evisa",
      }),
    ).toBe(3);
  });

  it("applies narrowly sourced status corrections before scoring", () => {
    const destinations = [
      { code: "IN", name: "India", region: "ASIA" },
      { code: "HK", name: "Hong Kong", region: "ASIA" },
    ] satisfies Destination[];
    const detail = {
      code: "IN",
      country: "India",
      visa_required: [],
      visa_online: [{ code: "HK", name: "Hong Kong" }],
      visa_on_arrival: [],
      electronic_travel_authorisation: [],
      visa_free_access: [],
    } satisfies SourcePassportDetail;

    expect(normalizePassportDetail(detail, destinations)).toMatchObject({
      statuses: { IN: "citizenship", HK: "eta" },
      mobilityScore: 1,
    });
  });

  it("applies reviewed Kenya ETA corrections to live passport records", () => {
    expect(applyVerifiedAccessOverrides({
      code: "GY",
      name: "Guyana",
      statuses: { GY: "citizenship", KE: "eta" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { GY: "citizenship", KE: "visa_free" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "ID",
      name: "Indonesia",
      statuses: { ID: "citizenship", KE: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { ID: "citizenship", KE: "eta" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "GY",
      name: "Synthetic Guyana",
      statuses: { GY: "citizenship", XX: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { GY: "citizenship", XX: "visa_free" }, mobilityScore: 1 });
  });

  it("normalizes the UK visa-national cohort to an advance visitor visa", () => {
    expect(applyVerifiedAccessOverrides({
      code: "AF",
      name: "Afghanistan",
      statuses: { AF: "citizenship", GB: "evisa" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { AF: "citizenship", GB: "visa_required" }, mobilityScore: 0 });
  });

  it("applies Mexico's reviewed electronic-visa and visa-list corrections", () => {
    expect(applyVerifiedAccessOverrides({
      code: "BR",
      name: "Brazil",
      statuses: { BR: "citizenship", MX: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { BR: "citizenship", MX: "evisa" }, mobilityScore: 0 });

    expect(applyVerifiedAccessOverrides({
      code: "VA",
      name: "Vatican City",
      statuses: { VA: "citizenship", MX: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { VA: "citizenship", MX: "visa_required" }, mobilityScore: 0 });
  });

  it("applies The Bahamas' reviewed Kosovo visa exemption", () => {
    expect(applyVerifiedAccessOverrides({
      code: "XK",
      name: "Kosovo",
      statuses: { XK: "citizenship", BS: "evisa" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { XK: "citizenship", BS: "visa_free" }, mobilityScore: 1 });
  });

  it("applies reviewed Mauritius and Malaysia corrections", () => {
    expect(applyVerifiedAccessOverrides({
      code: "GY",
      name: "Guyana",
      statuses: { GY: "citizenship", MU: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { GY: "citizenship", MU: "visa_required" }, mobilityScore: 0 });

    expect(applyVerifiedAccessOverrides({
      code: "CM",
      name: "Cameroon",
      statuses: { CM: "citizenship", MY: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { CM: "citizenship", MY: "evisa" }, mobilityScore: 0 });

    expect(applyVerifiedAccessOverrides({
      code: "NE",
      name: "Niger",
      statuses: { NE: "citizenship", MY: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { NE: "citizenship", MY: "evisa" }, mobilityScore: 0 });
  });

  it("applies reviewed Barbados ordinary-passport corrections", () => {
    expect(applyVerifiedAccessOverrides({
      code: "CG",
      name: "Republic of the Congo",
      statuses: { CG: "citizenship", BB: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { CG: "citizenship", BB: "visa_free" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "HT",
      name: "Haiti",
      statuses: { HT: "citizenship", BB: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { HT: "citizenship", BB: "visa_required" }, mobilityScore: 0 });
  });

  it("applies Indonesia's reviewed BVK and VOA classifications", () => {
    expect(applyVerifiedAccessOverrides({
      code: "BR",
      name: "Brazil",
      statuses: { BR: "citizenship", ID: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { BR: "citizenship", ID: "visa_on_arrival" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "CL",
      name: "Chile",
      statuses: { CL: "citizenship", ID: "visa_on_arrival" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { CL: "citizenship", ID: "visa_free" }, mobilityScore: 1 });
  });

  it("normalizes Rwanda's fee-waived arrival visas as visa on arrival", () => {
    expect(applyVerifiedAccessOverrides({
      code: "GH",
      name: "Ghana",
      statuses: { GH: "citizenship", RW: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { GH: "citizenship", RW: "visa_on_arrival" }, mobilityScore: 1 });
  });

  it("applies Jamaica's reviewed prior-visa, exemption, and port-of-entry rows", () => {
    expect(applyVerifiedAccessOverrides({
      code: "AE",
      name: "United Arab Emirates",
      statuses: { AE: "citizenship", JM: "visa_on_arrival" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { AE: "citizenship", JM: "visa_required" }, mobilityScore: 0 });

    expect(applyVerifiedAccessOverrides({
      code: "MO",
      name: "Macao",
      statuses: { MO: "citizenship", JM: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { MO: "citizenship", JM: "visa_free" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "TW",
      name: "Taiwan",
      statuses: { TW: "citizenship", JM: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { TW: "citizenship", JM: "visa_on_arrival" }, mobilityScore: 1 });
  });

  it("applies Zambia's reviewed arrival and prior-clearance classifications", () => {
    expect(applyVerifiedAccessOverrides({
      code: "GH",
      name: "Ghana",
      statuses: { GH: "citizenship", ZM: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { GH: "citizenship", ZM: "visa_on_arrival" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "SS",
      name: "South Sudan",
      statuses: { SS: "citizenship", ZM: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { SS: "citizenship", ZM: "evisa" }, mobilityScore: 0 });
  });

  it("normalizes Ecuador's digitally issued visitor visas as eVisas", () => {
    expect(applyVerifiedAccessOverrides({
      code: "AL",
      name: "Albania",
      statuses: { AL: "citizenship", EC: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { AL: "citizenship", EC: "evisa" }, mobilityScore: 0 });

    expect(applyVerifiedAccessOverrides({
      code: "AF",
      name: "Afghanistan",
      statuses: { AF: "citizenship", EC: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { AF: "citizenship", EC: "evisa" }, mobilityScore: 0 });
  });

  it("applies Nepal's current arrival-visa exclusion list", () => {
    expect(applyVerifiedAccessOverrides({
      code: "IR",
      name: "Iran",
      statuses: { IR: "citizenship", NP: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { IR: "citizenship", NP: "visa_on_arrival" }, mobilityScore: 1 });
  });

  it("applies reviewed Maldives, Seychelles, Samoa, and Trinidad and Tobago classifications", () => {
    expect(applyVerifiedAccessOverrides({
      code: "AZ",
      name: "Azerbaijan",
      statuses: { AZ: "citizenship", MV: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { AZ: "citizenship", MV: "visa_on_arrival" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "XK",
      name: "Kosovo",
      statuses: { XK: "citizenship", SC: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { XK: "citizenship", SC: "eta" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "AT",
      name: "Austria",
      statuses: { AT: "citizenship", WS: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { AT: "citizenship", WS: "visa_on_arrival" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "CN",
      name: "China",
      statuses: { CN: "citizenship", TT: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { CN: "citizenship", TT: "evisa" }, mobilityScore: 0 });
  });

  it("applies reviewed UAE, Kuwait, and Lebanon classifications", () => {
    expect(applyVerifiedAccessOverrides({
      code: "US",
      name: "United States",
      statuses: { US: "citizenship", AE: "visa_on_arrival" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { US: "citizenship", AE: "visa_free" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "BD",
      name: "Bangladesh",
      statuses: { BD: "citizenship", AE: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { BD: "citizenship", AE: "evisa" }, mobilityScore: 0 });

    expect(applyVerifiedAccessOverrides({
      code: "MO",
      name: "Macao",
      statuses: { MO: "citizenship", KW: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { MO: "citizenship", KW: "visa_on_arrival" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "PY",
      name: "Paraguay",
      statuses: { PY: "citizenship", LB: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { PY: "citizenship", LB: "visa_on_arrival" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "SY",
      name: "Syria",
      statuses: { SY: "citizenship", LB: "visa_on_arrival" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { SY: "citizenship", LB: "visa_required" }, mobilityScore: 0 });
  });

  it("applies Yemen's reviewed advance-visa corrections", () => {
    expect(applyVerifiedAccessOverrides({
      code: "HK",
      name: "Hong Kong",
      statuses: { HK: "citizenship", YE: "visa_free" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { HK: "citizenship", YE: "visa_required" }, mobilityScore: 0 });

    expect(applyVerifiedAccessOverrides({
      code: "AE",
      name: "United Arab Emirates",
      statuses: { AE: "citizenship", YE: "visa_on_arrival" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { AE: "citizenship", YE: "visa_required" }, mobilityScore: 0 });
  });

  it("applies Armenia's live ordinary-passport checker corrections", () => {
    expect(applyVerifiedAccessOverrides({
      code: "AZ",
      name: "Azerbaijan",
      statuses: { AZ: "citizenship", AM: "visa_required" },
      mobilityScore: 0,
    })).toMatchObject({ statuses: { AZ: "citizenship", AM: "visa_free" }, mobilityScore: 1 });

    expect(applyVerifiedAccessOverrides({
      code: "CA",
      name: "Canada",
      statuses: { CA: "citizenship", AM: "visa_on_arrival" },
      mobilityScore: 1,
    })).toMatchObject({ statuses: { CA: "citizenship", AM: "evisa" }, mobilityScore: 0 });
  });

  it("uses dense rank equivalents", () => {
    const passports = [190, 188, 188, 187, 180].map(
      (mobilityScore, index) => ({ mobilityScore, code: `${index}`, name: `${index}` }) as PassportSummary,
    );
    expect(rankEquivalent(191, passports)).toBe(1);
    expect(rankEquivalent(188, passports)).toBe(2);
    expect(rankEquivalent(186, passports)).toBe(4);
  });

  it("reconciles manifest scores and dense ranks with corrected details", () => {
    const manifest = {
      schemaVersion: 1,
      version: "test",
      checkedAt: "2026-01-01T00:00:00.000Z",
      publishedAt: "2026-01-01T00:00:00.000Z",
      destinations: [],
      passports: [
        { code: "AA", name: "Alpha", slug: "alpha", region: "EUROPE", mobilityScore: 3, rank: 1 },
        { code: "BB", name: "Beta", slug: "beta", region: "ASIA", mobilityScore: 1, rank: 2 },
      ],
    } satisfies SnapshotManifest;
    const corrected = reconcileManifestPassportDetails(manifest, {
      BB: { code: "BB", name: "Beta", statuses: {}, mobilityScore: 4 },
    });

    expect(corrected.passports.map(({ code, mobilityScore, rank }) => ({ code, mobilityScore, rank }))).toEqual([
      { code: "BB", mobilityScore: 4, rank: 1 },
      { code: "AA", mobilityScore: 3, rank: 2 },
    ]);
  });

  it("recalculates dense ranks when custom scores are inserted", () => {
    const ranks = denseRankByScore([200, 192, 188, 188, 187]);
    expect(ranks.get(200)).toBe(1);
    expect(ranks.get(192)).toBe(2);
    expect(ranks.get(188)).toBe(3);
    expect(ranks.get(187)).toBe(4);
  });

  it("parses, deduplicates, validates, and caps URL sets", () => {
    const valid = new Set(["BR", "PT", "US"]);
    expect(parsePassportSets(["br,PT,br", "xx", "US"], valid)).toEqual([
      { codes: ["BR", "PT"] },
      { codes: ["US"] },
    ]);

    const elevenCodes = Array.from({ length: 11 }, (_, index) => `A${index}`);
    expect(parsePassportSets([elevenCodes.join(",")], new Set(elevenCodes))[0].codes).toHaveLength(10);
  });

  it("chooses the easiest status and marks equal rows", () => {
    const manifest: SnapshotManifest = {
      schemaVersion: 1,
      version: "test",
      checkedAt: "2026-01-01T00:00:00.000Z",
      publishedAt: "2026-01-01T00:00:00.000Z",
      destinations: [
        { code: "AA", name: "Alpha", region: "EUROPE" },
        { code: "BB", name: "Beta", region: "ASIA" },
      ],
      passports: [
        { code: "AA", name: "Alpha", slug: "alpha", region: "EUROPE", mobilityScore: 1, rank: 1 },
        { code: "BB", name: "Beta", slug: "beta", region: "ASIA", mobilityScore: 0, rank: 2 },
      ],
    };
    const details: Record<string, PassportAccess> = {
      AA: { code: "AA", name: "Alpha", mobilityScore: 1, statuses: { AA: "citizenship", BB: "visa_free" } },
      BB: { code: "BB", name: "Beta", mobilityScore: 0, statuses: { AA: "visa_required", BB: "citizenship" } },
    };
    const result = comparePassportSets([{ codes: ["AA"] }, { codes: ["AA", "BB"] }], manifest, details);
    expect(result.rows[0].cells[1]).toEqual({ status: "citizenship", via: ["AA"] });
    expect(result.rows[1].cells[1]).toEqual({ status: "citizenship", via: ["BB"] });
    expect(result.rows[0].isEqual).toBe(true);
    expect(result.rows[1].isEqual).toBe(true);
    expect(result.scenarios[0].mobilityScore).toBe(1);
    expect(result.scenarios[1].mobilityScore).toBe(1);
  });
});
