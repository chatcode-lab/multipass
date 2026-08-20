import { describe, expect, it } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import { analyzePassportCombinations } from "./combination-insights";
import type { DataSnapshot } from "./types";

const snapshot = fallbackSnapshot as DataSnapshot;

describe("passport combination research", () => {
  it("finds the exact best pair, triple, and minimum full cover", () => {
    const insights = analyzePassportCombinations(snapshot.manifest, snapshot.passports);

    expect(insights.bestPairs).toMatchObject([
      { codes: ["JP", "AE"], accessibleDestinations: 210 },
    ]);
    expect(insights.bestPairTieCount).toBe(1);
    expect(insights.bestTriples).toMatchObject([
      { codes: ["JP", "AE", "RW"], accessibleDestinations: 217 },
    ]);
    expect(insights.bestTripleTieCount).toBe(1);
    expect(insights.minimumCover.size).toBe(10);
    expect(insights.minimumCover.accessibleDestinations).toBe(227);
    expect(insights.minimumCover.requiredCodes).toEqual(["AF", "KP", "TM"]);
    expect(insights.minimumCover.codes).toHaveLength(10);
  });
});
