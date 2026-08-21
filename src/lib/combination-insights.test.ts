import { describe, expect, it } from "vitest";
import generatedInsights from "@/data/combination-insights.json";
import fallbackSnapshot from "@/data/fallback.json";
import { analyzePassportCombinations } from "./combination-insights";
import type { CombinationInsights, DataSnapshot } from "./types";

const snapshot = fallbackSnapshot as DataSnapshot;
const bundledInsights = generatedInsights as CombinationInsights;

describe("passport combination research", () => {
  it("finds the exact best pair, triple, and minimum full cover", () => {
    const insights = analyzePassportCombinations(snapshot.manifest, snapshot.passports);

    expect(insights).toEqual(bundledInsights);
    expect(insights.bestPairTieCount).toBeGreaterThanOrEqual(insights.bestPairs.length);
    expect(new Set(insights.bestPairs.map(({ accessibleDestinations }) => accessibleDestinations)).size).toBe(1);
    expect(insights.bestPairs.every(({ codes }) => codes.length === 2)).toBe(true);
    expect(insights.bestTripleTieCount).toBeGreaterThanOrEqual(insights.bestTriples.length);
    expect(new Set(insights.bestTriples.map(({ accessibleDestinations }) => accessibleDestinations)).size).toBe(1);
    expect(insights.bestTriples.every(({ codes }) => codes.length === 3)).toBe(true);
    expect(insights.minimumCover.accessibleDestinations).toBe(snapshot.manifest.destinations.length);
    expect(insights.minimumCover.codes).toHaveLength(insights.minimumCover.size);
    expect(insights.minimumCover.requiredCodes.every((code) => insights.minimumCover.codes.includes(code))).toBe(true);
  });
});
