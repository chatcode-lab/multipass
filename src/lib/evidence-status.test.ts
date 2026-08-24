import { describe, expect, it } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import { buildEvidenceCompletionSummary, buildEvidenceStatusRegion } from "./evidence-status";
import type { DataSnapshot } from "./types";

const snapshot = fallbackSnapshot as DataSnapshot;

describe("evidence status matrix", () => {
  it("aligns every passport with every destination in the selected region", () => {
    const matrix = buildEvidenceStatusRegion(snapshot.manifest, snapshot.passports, "EUROPE", "2026-08-22");
    expect(matrix.passports).toHaveLength(snapshot.manifest.passports.length);
    expect(matrix.destinations).toHaveLength(
      snapshot.manifest.destinations.filter(({ region }) => region === "EUROPE").length,
    );
    expect(matrix.rows).toHaveLength(matrix.passports.length);
    expect(matrix.rows.every(({ cells }) => cells.length === matrix.destinations.length)).toBe(true);
    expect(matrix.summary.total).toBe(matrix.passports.length * matrix.destinations.length);
  });

  it("distinguishes supported current evidence from pending relationships", () => {
    const matrix = buildEvidenceStatusRegion(snapshot.manifest, snapshot.passports, "EUROPE", "2026-08-20");
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
    const current = buildEvidenceStatusRegion(snapshot.manifest, snapshot.passports, "ASIA", "2026-08-20");
    const expired = buildEvidenceStatusRegion(snapshot.manifest, snapshot.passports, "ASIA", "2027-01-01");
    const currentSwissRow = current.rows.find(({ passportCode }) => passportCode === "CH")!;
    const expiredSwissRow = expired.rows.find(({ passportCode }) => passportCode === "CH")!;
    const koreaIndex = current.destinations.findIndex(({ code }) => code === "KR");

    expect(currentSwissRow.cells[koreaIndex].slice(0, 2)).toEqual(["visa_free", 1]);
    expect(expiredSwissRow.cells[koreaIndex]).toEqual(["visa_free", 0, -1, 0, 0]);
  });

  it("reports a complete four-state summary for every foreign-access relationship", () => {
    const summary = buildEvidenceCompletionSummary(snapshot.manifest, snapshot.passports, "2026-08-21");
    const bucketTotal = summary.notCovered.count + summary.stale.count + summary.old.count + summary.fresh.count;

    expect(summary.total).toBe(44_974);
    expect(bucketTotal).toBe(summary.total);
    expect(summary.covered).toBe(summary.stale.count + summary.old.count + summary.fresh.count);
    expect(summary.covered).toBe(39_424);
    expect(summary.notCovered.count).toBe(5_550);
    expect(summary.percent).toBe(87.7);
    expect(summary.fresh.count).toBeGreaterThan(0);
  });
});
