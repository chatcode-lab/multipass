import { describe, expect, it, vi } from "vitest";
import fallback from "@/data/fallback.json";
import { OFFICIAL_VISA_SOURCES } from "@/data/visa-evidence";
import { REVIEWED_UNKNOWN_OVERRIDES, getReviewedUnknownOverride } from "@/data/reviewed-unknown-overrides";
import { REVIEWED_UNKNOWN_RECHECKS } from "@/data/reviewed-unknown-rechecks";
import { correctionRecheckNote, getVisaRelationshipEvidence } from "./visa-evidence";
import { relationshipIsIndexable, indexableRelationshipPairs } from "./visa-indexing";
import { buildEvidenceStatusRegion } from "./evidence-status";
import { applyAccessOverrides } from "./passport";
import { visaRelationshipMarkdown } from "./visa-markdown";
import { REGIONS, type DataSnapshot } from "./types";

const snapshot = fallback as DataSnapshot;
const renewed = [["US", "BF"], ["NR", "BZ"], ["BH", "VU"], ["MC", "VU"], ["RW", "VU"]];
const overdue = [["NZ", "NU"], ["AD", "GT"], ["LU", "UA"], ["FJ", "XK"]];
const all = [...renewed, ...overdue, ["DO", "MD"]];
const normalized = (day: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${day}T12:00:00Z`));
  try {
    return Object.fromEntries(Object.entries(snapshot.passports).map(([code, detail]) => [code, applyAccessOverrides(detail)]));
  } finally {
    vi.useRealTimers();
  }
};

describe("independently reviewed correction rechecks", () => {
  it("preserves the ten earlier decisions and their expired window before the recheck", () => {
    expect(REVIEWED_UNKNOWN_RECHECKS).toHaveLength(10);
    for (const [passport, destination] of all) {
      const base = REVIEWED_UNKNOWN_OVERRIDES.find((item) => item.passportCode === passport && item.destinationCode === destination)!;
      expect(base.recheckBy).toBe("2026-09-26");
      expect(getReviewedUnknownOverride(passport, destination, "2026-09-28")).toEqual(base);
      for (const day of ["2026-09-26", "2026-09-27", "2026-09-28"]) {
        const evidence = getVisaRelationshipEvidence(passport, destination, "unknown", day);
        expect(relationshipIsIndexable(evidence, day)).toBe(day === "2026-09-26");
        expect(evidence.sources.every((source) => source.reviewedAt <= day)).toBe(true);
      }
    }
  });

  it("renews only five reconfirmed correction windows, with inclusive boundaries", () => {
    for (const [passport, destination] of renewed) {
      for (const day of ["2026-09-29", "2026-10-29", "2026-10-30"]) {
        const evidence = getVisaRelationshipEvidence(passport, destination, "unknown", day);
        expect(evidence.reviewedUnknown).toMatchObject({ reviewedAt: "2026-09-29", lastRecheckedAt: "2026-09-29", recheckBy: "2026-10-29" });
        expect(relationshipIsIndexable(evidence, day)).toBe(day !== "2026-10-30");
        expect(evidence.supportsCurrentStatus).toBe(false);
      }
    }
  });

  it("does not treat an inconclusive recheck as a renewed correction", () => {
    for (const [passport, destination] of overdue) {
      const evidence = getVisaRelationshipEvidence(passport, destination, "unknown", "2026-09-29");
      expect(evidence.reviewedUnknown).toMatchObject({ reviewedAt: "2026-08-26", lastRecheckedAt: "2026-09-29", recheckBy: "2026-09-26" });
      expect(relationshipIsIndexable(evidence, "2026-09-29")).toBe(false);
      expect(correctionRecheckNote(evidence.reviewedUnknown!, "2026-09-29")).toContain("Further verification remains overdue");
    }
  });

  it("exposes the Moldova document distinction without a rank-grade policy or false legal dates", () => {
    const evidence = getVisaRelationshipEvidence("DO", "MD", "unknown", "2026-09-29");
    expect(evidence.evidenceLevel).toBe("conditional");
    expect(evidence.supportsCurrentStatus).toBe(false);
    expect(evidence.conditional).toHaveLength(1);
    expect(evidence.conditional[0].possibleStatuses).toEqual(["evisa", "visa_free"]);
    expect(evidence.conditional[0].effectiveFrom).toBeUndefined();
    expect(evidence.conditional[0].allowedStays).toBeUndefined();
    expect(evidence.reviewedUnknown?.recheckBy).toBe("2026-09-26");
    expect(relationshipIsIndexable(evidence, "2026-09-29")).toBe(true);
    expect(relationshipIsIndexable({ ...evidence, conditional: [] }, "2026-09-29")).toBe(false);
  });

  it("cites newly read sources without restamping the historical records", () => {
    const sources = new Map(OFFICIAL_VISA_SOURCES.map((item) => [item.id, item]));
    for (const recheck of REVIEWED_UNKNOWN_RECHECKS) {
      expect(recheck.sourceIds.every((id) => sources.get(id)?.reviewedAt === recheck.checkedAt)).toBe(true);
      const base = getReviewedUnknownOverride(recheck.passportCode, recheck.destinationCode, "2026-09-28")!;
      expect(base.sourceIds.every((id) => sources.get(id)!.reviewedAt < recheck.checkedAt)).toBe(true);
    }
  });

  it("adds precisely six eligible URLs and leaves every status and score unchanged", () => {
    const before = normalized("2026-09-28");
    const after = normalized("2026-09-29");
    expect(after).toEqual(before);
    const pairs = (day: string) => new Set(REGIONS.flatMap((region) => indexableRelationshipPairs(snapshot.manifest, after, region, day))
      .map(({ passport, destination }) => `${passport.code}:${destination.code}`));
    const oldPairs = pairs("2026-09-28");
    const newPairs = pairs("2026-09-29");
    expect([...newPairs].filter((pair) => !oldPairs.has(pair)).sort()).toEqual([...renewed, ["DO", "MD"]].map((pair) => pair.join(":")).sort());
    expect([...oldPairs].filter((pair) => !newPairs.has(pair))).toEqual([]);
    for (const [passport, destination] of all) expect(after[passport].statuses[destination]).toBe("unknown");
  });

  it("updates characterization dates without claiming new exact matrix coverage", () => {
    const details = normalized("2026-09-29");
    const current = buildEvidenceStatusRegion(snapshot.manifest, details, "OCEANIA", "2026-09-29");
    const prior = buildEvidenceStatusRegion(snapshot.manifest, details, "OCEANIA", "2026-09-28");
    const niue = current.destinations.findIndex(({ code }) => code === "NU");
    for (const [matrix, expected] of [[current, "2026-09-29"], [prior, "2026-08-26"]] as const) {
      const cell = matrix.rows.find(({ passportCode }) => passportCode === "NZ")!.cells[niue];
      expect(cell.slice(0, 2)).toEqual(["unknown", 0]);
      expect(cell[5]).toBe(1);
      expect(matrix.dates[cell[2]]).toBe(expected);
    }
  });

  it("narrows the Niue overstatement in Markdown and distinguishes overdue research from legal expiry", () => {
    const evidence = getVisaRelationshipEvidence("NZ", "NU", "unknown", "2026-09-29");
    const markdown = visaRelationshipMarkdown(snapshot.manifest,
      snapshot.manifest.passports.find(({ code }) => code === "NZ")!,
      snapshot.manifest.destinations.find(({ code }) => code === "NU")!, "unknown", evidence);
    expect(markdown).toContain("not proven false");
    expect(markdown).toContain("withheld pending clarification");
    expect(markdown).toContain("Research targets are not legal expiry dates");
    expect(markdown).not.toContain("is not current");
  });
});
