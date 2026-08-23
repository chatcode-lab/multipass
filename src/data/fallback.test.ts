import { describe, expect, it } from "vitest";
import fallbackSnapshot from "./fallback.json";
import combinationInsights from "./combination-insights.json";
import { PASSPORT_COLORS } from "./passport-colors";
import { COUNTRY_MAPS, REGION_MAPS } from "./world-map";
import { calculateMobilityScore } from "../lib/passport";
import type { CombinationInsights, DataSnapshot } from "../lib/types";

const snapshot = fallbackSnapshot as DataSnapshot;
const insights = combinationInsights as CombinationInsights;

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

  it("contains a cover color and visible regional marker for every passport", () => {
    expect(Object.keys(PASSPORT_COLORS)).toHaveLength(snapshot.manifest.passports.length);
    expect(Object.keys(COUNTRY_MAPS)).toHaveLength(snapshot.manifest.passports.length);
    expect(Object.keys(REGION_MAPS)).toHaveLength(7);

    for (const passport of snapshot.manifest.passports) {
      expect(PASSPORT_COLORS[passport.code], passport.code).toMatch(/^#[0-9a-f]{6}$/);
      const countryMap = COUNTRY_MAPS[passport.code];
      const regionMap = REGION_MAPS[passport.region];
      expect(countryMap, passport.code).toBeDefined();
      expect(regionMap, passport.region).toBeDefined();
      const [x, y, width, height] = regionMap.viewBox.split(" ").map(Number);
      expect(countryMap.marker[0], `${passport.code} horizontal marker`).toBeGreaterThanOrEqual(x);
      expect(countryMap.marker[0], `${passport.code} horizontal marker`).toBeLessThanOrEqual(x + width);
      expect(countryMap.marker[1], `${passport.code} vertical marker`).toBeGreaterThanOrEqual(y);
      expect(countryMap.marker[1], `${passport.code} vertical marker`).toBeLessThanOrEqual(y + height);
    }

    expect(COUNTRY_MAPS.DE.path.length).toBeGreaterThan(100);
    expect(COUNTRY_MAPS.SG.marker).toEqual([757.1, 242]);
  });

  it("keeps the generated combination research on the bundled snapshot", () => {
    expect(insights.snapshotVersion).toBe(snapshot.manifest.version);
    expect(insights.checkedAt).toBe(snapshot.manifest.checkedAt);
    expect(insights.destinationCount).toBe(snapshot.manifest.destinations.length);
  });

  it("applies verified destination-authority corrections to the bundled snapshot", () => {
    expect(snapshot.passports.IN.statuses.HK).toBe("eta");
    expect(snapshot.passports.MD.statuses.GD).toBe("visa_on_arrival");
    expect(snapshot.passports.UZ.statuses.DJ).toBe("evisa");
    expect(snapshot.passports.PH.statuses.TR).toBe("visa_required");
    expect(snapshot.passports.HK.statuses.AO).toBe("visa_free");
    expect(snapshot.passports.HK.statuses.BO).toBe("visa_on_arrival");
    expect(snapshot.passports.DM.statuses.TR).toBe("visa_required");
    expect(snapshot.passports.HU.statuses.TD).toBe("evisa");
    expect(snapshot.passports.HU.statuses.CI).toBe("visa_on_arrival");
    expect(snapshot.passports.CZ.statuses.DJ).toBe("evisa");
    expect(snapshot.passports.SI.statuses.IR).toBe("evisa");
    expect(snapshot.passports.SI.statuses.SS).toBe("visa_required");
    expect(snapshot.passports.PL.statuses.CI).toBe("visa_on_arrival");
  });
});
