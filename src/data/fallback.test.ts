import { describe, expect, it } from "vitest";
import fallbackSnapshot from "./fallback.json";
import { PASSPORT_COLORS } from "./passport-colors";
import { COUNTRY_MAPS, REGION_MAPS } from "./world-map";
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
});
