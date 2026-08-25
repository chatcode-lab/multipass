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
    expect(expiredSwissRow.cells[koreaIndex]).toEqual(["visa_free", 0, -1, 0, 0]);
  });

  it("keeps reviewed unknown relationships pending rather than claiming verified coverage", () => {
    const matrix = buildEvidenceStatusRegion(snapshot.manifest, details, "EUROPE", "2026-08-25");
    const kosovoRow = matrix.rows.find(({ passportCode }) => passportCode === "XK")!;
    const azerbaijanIndex = matrix.destinations.findIndex(({ code }) => code === "AZ");

    expect(kosovoRow.cells[azerbaijanIndex]).toEqual(["unknown", 0, -1, 0, 0]);

    const libyaMatrix = buildEvidenceStatusRegion(snapshot.manifest, details, "AFRICA", "2026-08-25");
    const libyaIndex = libyaMatrix.destinations.findIndex(({ code }) => code === "LY");
    expect(libyaMatrix.rows.find(({ passportCode }) => passportCode === "TR")!.cells[libyaIndex])
      .toEqual(["unknown", 0, -1, 0, 0]);

    const tunisiaIndex = libyaMatrix.destinations.findIndex(({ code }) => code === "TN");
    expect(libyaMatrix.rows.find(({ passportCode }) => passportCode === "UA")!.cells[tunisiaIndex])
      .toEqual(["unknown", 0, -1, 0, 0]);
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

  it("reports a complete four-state summary for every foreign-access relationship", () => {
    const summary = buildEvidenceCompletionSummary(snapshot.manifest, details, "2026-08-21");
    const bucketTotal = summary.notCovered.count + summary.stale.count + summary.old.count + summary.fresh.count;

    expect(summary.total).toBe(44_974);
    expect(bucketTotal).toBe(summary.total);
    expect(summary.covered).toBe(summary.stale.count + summary.old.count + summary.fresh.count);
    expect(summary.covered).toBe(40_032);
    expect(summary.notCovered.count).toBe(4_942);
    expect(summary.percent).toBe(89);
    expect(summary.fresh.count).toBeGreaterThan(0);
  });
});
