import { describe, expect, it } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import { buildEvidenceCompletionSummary, buildEvidenceStatusRegion } from "./evidence-status";
import { applyAccessOverrides } from "./passport";
import type { DataSnapshot } from "./types";

const snapshot = fallbackSnapshot as DataSnapshot;
const details = Object.fromEntries(
  Object.entries(snapshot.passports).map(([code, detail]) => [code, applyAccessOverrides(detail)]),
);

describe("evidence status matrix", () => {
  it("aligns every passport with every destination in the selected region", () => {
    const matrix = buildEvidenceStatusRegion(snapshot.manifest, details, "EUROPE", "2026-08-22");
    expect(matrix.passports).toHaveLength(snapshot.manifest.passports.length);
    expect(matrix.destinations).toHaveLength(
      snapshot.manifest.destinations.filter(({ region }) => region === "EUROPE").length,
    );
    expect(matrix.rows).toHaveLength(matrix.passports.length);
    expect(matrix.rows.every(({ cells }) => cells.length === matrix.destinations.length)).toBe(true);
    expect(matrix.summary.total).toBe(matrix.passports.length * matrix.destinations.length);
  });

  it("distinguishes supported current evidence from pending relationships", () => {
    const matrix = buildEvidenceStatusRegion(snapshot.manifest, details, "EUROPE", "2026-08-20");
    const japanRow = matrix.rows.find(({ passportCode }) => passportCode === "JP")!;
    const guyanaRow = matrix.rows.find(({ passportCode }) => passportCode === "GY")!;
    const germanyIndex = matrix.destinations.findIndex(({ code }) => code === "DE");
    const albaniaIndex = matrix.destinations.findIndex(({ code }) => code === "AL");

    expect(japanRow.cells[germanyIndex].slice(0, 2)).toEqual(["visa_free", 1]);
    expect(matrix.dates[japanRow.cells[germanyIndex][2]]).toBe("2026-08-20");
    expect(japanRow.cells[germanyIndex][3]).toBeGreaterThan(0);
    expect(japanRow.cells[germanyIndex][4]).toBeGreaterThan(0);
    expect(guyanaRow.cells[albaniaIndex].slice(0, 2)).toEqual(["visa_free", 1]);
    expect(matrix.dates[guyanaRow.cells[albaniaIndex][2]]).toBe("2026-08-22");
  });

  it("does not count an expired temporary policy as current verification", () => {
    const current = buildEvidenceStatusRegion(snapshot.manifest, details, "ASIA", "2026-08-20");
    const expired = buildEvidenceStatusRegion(snapshot.manifest, details, "ASIA", "2027-01-01");
    const currentSwissRow = current.rows.find(({ passportCode }) => passportCode === "CH")!;
    const expiredSwissRow = expired.rows.find(({ passportCode }) => passportCode === "CH")!;
    const koreaIndex = current.destinations.findIndex(({ code }) => code === "KR");

    expect(currentSwissRow.cells[koreaIndex].slice(0, 2)).toEqual(["visa_free", 1]);
    expect(expiredSwissRow.cells[koreaIndex]).toEqual(["visa_free", 0, -1, 0, 0, 0, 0]);
  });

  it("marks reviewed unknown relationships as characterized without claiming exact verification", () => {
    const matrix = buildEvidenceStatusRegion(snapshot.manifest, details, "EUROPE", "2026-08-25");
    const kosovoRow = matrix.rows.find(({ passportCode }) => passportCode === "XK")!;
    const azerbaijanIndex = matrix.destinations.findIndex(({ code }) => code === "AZ");

    expect(kosovoRow.cells[azerbaijanIndex].slice(0, 2)).toEqual(["unknown", 0]);
    expect(kosovoRow.cells[azerbaijanIndex][5]).toBe(1);

    const libyaMatrix = buildEvidenceStatusRegion(snapshot.manifest, details, "AFRICA", "2026-08-25");
    const libyaIndex = libyaMatrix.destinations.findIndex(({ code }) => code === "LY");
    expect(libyaMatrix.rows.find(({ passportCode }) => passportCode === "TR")!.cells[libyaIndex][5]).toBe(1);

    const tunisiaIndex = libyaMatrix.destinations.findIndex(({ code }) => code === "TN");
    expect(libyaMatrix.rows.find(({ passportCode }) => passportCode === "UA")!.cells[tunisiaIndex][5]).toBe(1);

    const guineaBissauIndex = libyaMatrix.destinations.findIndex(({ code }) => code === "GW");
    expect(libyaMatrix.rows.find(({ passportCode }) => passportCode === "KR")!.cells[guineaBissauIndex][5]).toBe(1);

    const asiaMatrix = buildEvidenceStatusRegion(snapshot.manifest, details, "ASIA", "2026-08-26");
    const myanmarIndex = asiaMatrix.destinations.findIndex(({ code }) => code === "MM");
    expect(asiaMatrix.rows.find(({ passportCode }) => passportCode === "SS")!.cells[myanmarIndex][5]).toBe(1);
  });

  it("marks Palestinian Territory route cohorts as characterized but unverified", () => {
    const middleEast = buildEvidenceStatusRegion(snapshot.manifest, details, "MIDDLE EAST", "2026-08-27");
    const palestineIndex = middleEast.destinations.findIndex(({ code }) => code === "PS");
    const cell = (passportCode: string) =>
      middleEast.rows.find(({ passportCode: code }) => code === passportCode)!.cells[palestineIndex];

    expect(cell("CA")[1]).toBe(0);
    expect(cell("CA")[5]).toBe(1);
    expect(cell("TR")[1]).toBe(0);
    expect(cell("TR")[5]).toBe(1);
    expect(cell("IL")[5]).toBe(0);
  });

  it("marks Liberia's mission-dependent visa routes as characterized but unverified", () => {
    const africa = buildEvidenceStatusRegion(snapshot.manifest, details, "AFRICA", "2026-08-27");
    const liberiaIndex = africa.destinations.findIndex(({ code }) => code === "LR");
    const cell = (passportCode: string) =>
      africa.rows.find(({ passportCode: code }) => code === passportCode)!.cells[liberiaIndex];

    expect(cell("AU")[1]).toBe(0);
    expect(cell("AU")[5]).toBe(1);
    expect(cell("AF")[1]).toBe(0);
    expect(cell("AF")[5]).toBe(1);
    expect(cell("SG").slice(0, 2)).toEqual(["visa_required", 1]);
  });

  it("marks Niger's residence-dependent visa routes as characterized but unverified", () => {
    const africa = buildEvidenceStatusRegion(snapshot.manifest, details, "AFRICA", "2026-08-27");
    const nigerIndex = africa.destinations.findIndex(({ code }) => code === "NE");
    const cell = (passportCode: string) =>
      africa.rows.find(({ passportCode: code }) => code === passportCode)!.cells[nigerIndex];

    expect(cell("KR")[1]).toBe(0);
    expect(cell("KR")[5]).toBe(1);
    expect(cell("AF")[1]).toBe(0);
    expect(cell("AF")[5]).toBe(1);
    expect(cell("SG").slice(0, 2)).toEqual(["visa_required", 1]);
  });

  it("marks Bangladesh's mission- and route-dependent residuals as characterized but unverified", () => {
    const asia = buildEvidenceStatusRegion(snapshot.manifest, details, "ASIA", "2026-08-28");
    const bangladeshIndex = asia.destinations.findIndex(({ code }) => code === "BD");
    const cell = (passportCode: string) =>
      asia.rows.find(({ passportCode: code }) => code === passportCode)!.cells[bangladeshIndex];

    expect(cell("BR")[1]).toBe(0);
    expect(cell("BR")[5]).toBe(1);
    expect(cell("AF")[1]).toBe(0);
    expect(cell("AF")[5]).toBe(1);
    expect(cell("BE").slice(0, 2)).toEqual(["visa_on_arrival", 1]);
  });

  it("counts Ireland's reviewed Syria and Turkmenistan routes as supported", () => {
    const middleEast = buildEvidenceStatusRegion(snapshot.manifest, details, "MIDDLE EAST", "2026-08-25");
    const asia = buildEvidenceStatusRegion(snapshot.manifest, details, "ASIA", "2026-08-25");
    const syriaIndex = middleEast.destinations.findIndex(({ code }) => code === "SY");
    const turkmenistanIndex = asia.destinations.findIndex(({ code }) => code === "TM");

    expect(middleEast.rows.find(({ passportCode }) => passportCode === "IE")!.cells[syriaIndex].slice(0, 2))
      .toEqual(["visa_required", 1]);
    expect(asia.rows.find(({ passportCode }) => passportCode === "IE")!.cells[turkmenistanIndex].slice(0, 2))
      .toEqual(["visa_required", 1]);
  });

  it("counts the reviewed Singaporean, Korean and Mexican African routes as supported", () => {
    const africa = buildEvidenceStatusRegion(snapshot.manifest, details, "AFRICA", "2026-08-25");
    const destinationIndex = (code: string) => africa.destinations.findIndex((destination) => destination.code === code);
    const cell = (passportCode: string, destinationCode: string) =>
      africa.rows.find((row) => row.passportCode === passportCode)!.cells[destinationIndex(destinationCode)];

    expect(cell("SG", "LR").slice(0, 2)).toEqual(["visa_required", 1]);
    expect(cell("SG", "GW").slice(0, 2)).toEqual(["visa_on_arrival", 1]);
    expect(cell("SG", "NE").slice(0, 2)).toEqual(["visa_required", 1]);
    expect(cell("KR", "CF").slice(0, 2)).toEqual(["visa_required", 1]);
    expect(cell("KR", "SD").slice(0, 2)).toEqual(["visa_on_arrival", 1]);
    expect(cell("MX", "LR").slice(0, 2)).toEqual(["visa_required", 1]);
  });

  it("counts the refreshed Bangladesh European arrival cohort as supported", () => {
    const asia = buildEvidenceStatusRegion(snapshot.manifest, details, "ASIA", "2026-08-26");
    const bangladeshIndex = asia.destinations.findIndex(({ code }) => code === "BD");
    for (const passportCode of ["AD", "AL", "AT", "BA", "BE", "BY", "EE", "LT", "LU", "LV", "MK", "PL", "SM", "UA", "VA"] as const) {
      expect(asia.rows.find((row) => row.passportCode === passportCode)!.cells[bangladeshIndex].slice(0, 2))
        .toEqual(["visa_on_arrival", 1]);
    }
  });

  it("counts the adjudicated Barbados-Russia and Nauru-Vatican routes as supported", () => {
    const europe = buildEvidenceStatusRegion(snapshot.manifest, details, "EUROPE", "2026-08-26");
    const vaticanIndex = europe.destinations.findIndex(({ code }) => code === "VA");
    expect(europe.rows.find(({ passportCode }) => passportCode === "NR")!.cells[vaticanIndex].slice(0, 2))
      .toEqual(["visa_required", 1]);

    const russiaIndex = europe.destinations.findIndex(({ code }) => code === "RU");
    expect(europe.rows.find(({ passportCode }) => passportCode === "BB")!.cells[russiaIndex].slice(0, 2))
      .toEqual(["evisa", 1]);
  });

  it("counts South Sudan's adjudicated Bahamas and Bosnia routes as supported", () => {
    const caribbean = buildEvidenceStatusRegion(snapshot.manifest, details, "CARIBBEAN", "2026-08-26");
    const europe = buildEvidenceStatusRegion(snapshot.manifest, details, "EUROPE", "2026-08-26");
    const bahamasIndex = caribbean.destinations.findIndex(({ code }) => code === "BS");
    const bosniaIndex = europe.destinations.findIndex(({ code }) => code === "BA");

    expect(caribbean.rows.find(({ passportCode }) => passportCode === "SS")!.cells[bahamasIndex].slice(0, 2))
      .toEqual(["visa_free", 1]);
    expect(europe.rows.find(({ passportCode }) => passportCode === "SS")!.cells[bosniaIndex].slice(0, 2))
      .toEqual(["visa_required", 1]);
  });

  it("counts the adjudicated DR Congo-Eswatini and Saint Kitts-Nigeria routes as supported", () => {
    const africa = buildEvidenceStatusRegion(snapshot.manifest, details, "AFRICA", "2026-08-26");
    const eswatiniIndex = africa.destinations.findIndex(({ code }) => code === "SZ");
    const nigeriaIndex = africa.destinations.findIndex(({ code }) => code === "NG");

    expect(africa.rows.find(({ passportCode }) => passportCode === "CD")!.cells[eswatiniIndex].slice(0, 2))
      .toEqual(["visa_required", 1]);
    expect(africa.rows.find(({ passportCode }) => passportCode === "KN")!.cells[nigeriaIndex].slice(0, 2))
      .toEqual(["visa_free", 1]);
  });

  it("counts the corrected Turkish route into The Gambia as supported", () => {
    const africa = buildEvidenceStatusRegion(snapshot.manifest, details, "AFRICA", "2026-08-26");
    const gambiaIndex = africa.destinations.findIndex(({ code }) => code === "GM");

    expect(africa.rows.find(({ passportCode }) => passportCode === "TR")!.cells[gambiaIndex].slice(0, 2))
      .toEqual(["visa_required", 1]);
  });

  it("counts Oman's reviewed sponsored tourist eVisa routes as supported", () => {
    const middleEast = buildEvidenceStatusRegion(snapshot.manifest, details, "MIDDLE EAST", "2026-08-26");
    const omanIndex = middleEast.destinations.findIndex(({ code }) => code === "OM");

    for (const passportCode of ["AF", "KP", "PS"] as const) {
      expect(middleEast.rows.find(({ passportCode: code }) => code === passportCode)!.cells[omanIndex].slice(0, 2))
        .toEqual(["evisa", 1]);
    }
  });

  it("counts the nine supported EU-member and Tajikistan Ukraine waivers while preserving reviewed unknowns", () => {
    const europe = buildEvidenceStatusRegion(snapshot.manifest, details, "EUROPE", "2026-08-26");
    const ukraineIndex = europe.destinations.findIndex(({ code }) => code === "UA");

    for (const passportCode of ["AT", "BE", "CY", "CZ", "FI", "GR", "MT", "PT", "RO", "TJ"] as const) {
      expect(europe.rows.find(({ passportCode: code }) => code === passportCode)!.cells[ukraineIndex].slice(0, 2))
        .toEqual(["visa_free", 1]);
    }

    expect(europe.rows.find(({ passportCode }) => passportCode === "LU")!.cells[ukraineIndex][5]).toBe(1);
    expect(europe.rows.find(({ passportCode }) => passportCode === "TW")!.cells[ukraineIndex][5]).toBe(1);
  });

  it("reports a complete four-state summary for every foreign-access relationship", () => {
    const summary = buildEvidenceCompletionSummary(snapshot.manifest, details, "2026-09-01");
    const bucketTotal = summary.notCovered.count + summary.stale.count + summary.old.count + summary.fresh.count;

    expect(summary.total).toBe(44_974);
    expect(bucketTotal).toBe(summary.total);
    expect(summary.covered).toBe(summary.stale.count + summary.old.count + summary.fresh.count);
    expect(summary.covered).toBe(40_941);
    expect(summary.notCovered.count).toBe(4_033);
    expect(summary.characterized.count).toBe(839);
    expect(summary.allowedStay.count).toBeGreaterThan(1_000);
    expect(summary.percent).toBe(91);
    expect(summary.fresh.count).toBeGreaterThan(0);
  });

  it("uses the recovered North Macedonia checker while preserving the missing HKSAR result", () => {
    const europe = buildEvidenceStatusRegion(snapshot.manifest, details, "EUROPE", "2026-09-01");
    const northMacedoniaIndex = europe.destinations.findIndex(({ code }) => code === "MK");
    const cell = (passportCode: string) =>
      europe.rows.find(({ passportCode: code }) => code === passportCode)!.cells[northMacedoniaIndex];

    expect(cell("NZ").slice(0, 2)).toEqual(["visa_free", 1]);
    expect(cell("LA").slice(0, 2)).toEqual(["visa_required", 1]);
    expect(cell("HK").slice(0, 2)).toEqual(["visa_free", 0]);
  });
});
