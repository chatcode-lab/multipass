import { describe, expect, it } from "vitest";
import {
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
