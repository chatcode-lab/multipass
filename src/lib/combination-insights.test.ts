import { describe, expect, it } from "vitest";
import generatedInsights from "@/data/combination-insights.json";
import fallbackSnapshot from "@/data/fallback.json";
import { analyzePassportCombinations, rankSecondPassportCandidates } from "./combination-insights";
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

  it("ranks second passports by their exact marginal easy-access gain", () => {
    const candidates = rankSecondPassportCandidates("US", snapshot.manifest, snapshot.passports);
    const base = snapshot.passports.US;
    const easy = new Set(["citizenship", "visa_free", "eta", "visa_on_arrival"]);
    const baseEasyCount = snapshot.manifest.destinations.filter((destination) =>
      easy.has(base.statuses[destination.code]),
    ).length;

    expect(candidates).toHaveLength(snapshot.manifest.passports.length - 1);
    expect(candidates.every((candidate) => candidate.code !== "US")).toBe(true);
    expect(candidates[0].combinedAccessibleDestinations).toBeGreaterThanOrEqual(
      candidates.at(-1)!.combinedAccessibleDestinations,
    );
    expect(candidates[0].combinedAccessibleDestinations).toBe(
      baseEasyCount + candidates[0].marginalEasyDestinations,
    );
    expect(candidates[0].combinedMobilityScore).toBe(candidates[0].combinedAccessibleDestinations - 1);
  });
});
