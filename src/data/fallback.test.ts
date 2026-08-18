import { describe, expect, it } from "vitest";
import fallbackSnapshot from "./fallback.json";
import { calculateMobilityScore } from "../lib/passport";
import type { DataSnapshot } from "../lib/types";

const snapshot = fallbackSnapshot as DataSnapshot;

describe("bundled passport snapshot", () => {
  it("contains one complete, internally consistent dataset", () => {
    expect(snapshot.manifest.destinations).toHaveLength(227);
    expect(snapshot.manifest.passports).toHaveLength(199);
    expect(new Set(snapshot.manifest.destinations.map(({ code }) => code)).size).toBe(227);
    expect(new Set(snapshot.manifest.passports.map(({ code }) => code)).size).toBe(199);

    for (const summary of snapshot.manifest.passports) {
      const detail = snapshot.passports[summary.code];
      if (!detail) throw new Error(`Missing fallback passport detail for ${summary.code}`);
      expect(Object.keys(detail.statuses), summary.code).toHaveLength(227);
      expect(calculateMobilityScore(detail.statuses), summary.code).toBe(summary.mobilityScore);
    }
  });
});
