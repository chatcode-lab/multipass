import { describe, expect, it, vi } from "vitest";
import fallback from "@/data/fallback.json";
import archive from "@/data/reviewed-visa-evidence.json";
import { OFFICIAL_VISA_SOURCES, REVIEWED_POLICY_REFRESHES, VISA_POLICY_EVIDENCE } from "@/data/visa-evidence";
import { buildEvidenceCompletionSummary } from "./evidence-status";
import { applyAccessOverrides } from "./passport";
import { getVisaRelationshipEvidence, policiesForDestination } from "./visa-evidence";
import { visaRelationshipMarkdown } from "./visa-markdown";
import type { DataSnapshot } from "./types";

const snapshot = fallback as DataSnapshot;
const asOf = "2026-09-29";
const cohorts = [
  { previous: "vietnam-resolution44-12-nationals-visa-exempt", codes: ["DE", "FR", "IT", "ES", "GB", "RU", "JP", "KR", "DK", "SE", "NO", "FI"], start: "2025-03-15", end: "2028-03-14", before: "2025-03-14", after: "2028-03-15" },
  { previous: "vietnam-resolution229-12-nationals-visa-exempt", codes: ["BE", "BG", "HR", "CZ", "HU", "LU", "NL", "PL", "RO", "SK", "SI", "CH"], start: "2025-08-15", end: "2028-08-14", before: "2025-08-14", after: "2028-08-15" },
] as const;

describe("Vietnam's reviewed unilateral visitor waivers", () => {
  it("refreshes exactly the original cohorts and dates without erasing the archived mistake", () => {
    const sources = new Map(OFFICIAL_VISA_SOURCES.map((source) => [source.id, source]));
    const codes = new Set<string>();
    for (const cohort of cohorts) {
      const old = archive.policies.find(({ id }) => id === cohort.previous)!;
      expect(old.conditions?.join(" ")).toContain("at least 30 days outside");
      const replacement = VISA_POLICY_EVIDENCE.find(({ id }) => id === REVIEWED_POLICY_REFRESHES[cohort.previous])!;
      expect(replacement).toBeDefined();
      expect(replacement).toMatchObject({ status: "visa_free", destinationCodes: ["VN"], effectiveFrom: cohort.start, effectiveTo: cohort.end });
      expect([...(replacement.passportCodes ?? [])].sort()).toEqual([...cohort.codes].sort());
      expect(replacement.excludedPassportCodes ?? []).toEqual([]);
      expect(replacement.sourceIds.every((id) => sources.get(id)?.reviewedAt === asOf)).toBe(true);
      expect(policiesForDestination("VN").some(({ id }) => id === cohort.previous)).toBe(false);
      for (const code of cohort.codes) {
        expect(codes.has(code)).toBe(false);
        codes.add(code);
        expect(snapshot.passports[code].statuses.VN).toBe("visa_free");
      }
    }
    expect(codes.size).toBe(24);
  });

  it("provides one scoped 45-day stay and the corrected conditions for all 24 passports", () => {
    for (const cohort of cohorts) for (const code of cohort.codes) {
      const evidence = getVisaRelationshipEvidence(code, "VN", "visa_free", asOf);
      expect(evidence.supportsCurrentStatus).toBe(true);
      expect(evidence.reviewedAt).toBe(asOf);
      expect(evidence.allowedStays).toHaveLength(1);
      expect(evidence.allowedStays[0]).toMatchObject({ maxDays: 45, basis: "per_entry" });
      expect(evidence.allowedStays[0].withinDays).toBeUndefined();
      const policy = evidence.policies.find(({ id }) => id === REVIEWED_POLICY_REFRESHES[cohort.previous])!;
      const conditions = policy.conditions?.join(" ") ?? "";
      expect(conditions).toMatch(/six months|six-month|6 months|06 months/);
      expect(conditions).toMatch(/30.day/i);
      expect(conditions).toMatch(/removed|removal|abolished/i);
      expect(conditions).not.toContain("at least 30 days outside");
      expect(conditions).toMatch(/admissib|admission|entry conditions/i);
    }
  });

  it.each(cohorts)("keeps the $previous legal endpoints inclusive", (cohort) => {
    const code = cohort.codes[0];
    for (const day of [cohort.start, cohort.end]) {
      expect(getVisaRelationshipEvidence(code, "VN", "visa_free", day).allowedStays).toEqual(expect.arrayContaining([expect.objectContaining({ maxDays: 45 })]));
    }
    for (const day of [cohort.before, cohort.after]) {
      expect(getVisaRelationshipEvidence(code, "VN", "visa_free", day).allowedStays.some(({ maxDays }) => maxDays === 45)).toBe(false);
    }
  });

  it("retains Resolution 229's tourism scope and the separate Resolution 44 purpose wording", () => {
    const [first, second] = cohorts.map(({ previous }) => VISA_POLICY_EVIDENCE.find(({ id }) => id === REVIEWED_POLICY_REFRESHES[previous])!);
    expect(`${first.summary} ${first.conditions?.join(" ")}`).toMatch(/regardless of.*purpose/i);
    expect(`${second.summary} ${second.conditions?.join(" ")}`).toMatch(/tourism/i);
    expect(`${second.summary} ${second.conditions?.join(" ")}`).not.toMatch(/regardless of (?:passport type (?:or|and) )?(?:entry )?purpose/i);
  });

  it("does not give bilateral or eVisa passports the unilateral stay", () => {
    for (const [code, status, days] of [["SG", "visa_free", 30], ["KZ", "visa_free", 30], ["US", "evisa", undefined]] as const) {
      const evidence = getVisaRelationshipEvidence(code, "VN", status, asOf);
      expect(evidence.policies.some(({ id }) => id.startsWith("pass417-"))).toBe(false);
      expect(evidence.allowedStays.some(({ maxDays }) => maxDays === 45)).toBe(false);
      if (days) expect(evidence.allowedStays).toEqual(expect.arrayContaining([expect.objectContaining({ maxDays: days })]));
    }
  });

  it("enriches stays without adding exact coverage or relabeling access", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${asOf}T12:00:00Z`));
    try {
      const details = Object.fromEntries(Object.entries(snapshot.passports).map(([code, detail]) => [code, applyAccessOverrides(detail)]));
      const completion = buildEvidenceCompletionSummary(snapshot.manifest, details, asOf);
      expect(completion).toMatchObject({ total: 44_974, covered: 40_941, notCovered: { count: 4_033 }, allowedStay: { count: 4_428 } });
    } finally {
      vi.useRealTimers();
    }
  });

  it("publishes the same corrected scope and source links in native Markdown", () => {
    for (const code of ["GB", "BE"]) {
      const evidence = getVisaRelationshipEvidence(code, "VN", "visa_free", asOf);
      const markdown = visaRelationshipMarkdown(snapshot.manifest,
        snapshot.manifest.passports.find((passport) => passport.code === code)!,
        snapshot.manifest.destinations.find((destination) => destination.code === "VN")!, "visa_free", evidence);
      expect(markdown).toContain(evidence.allowedStays[0].label);
      expect(markdown).not.toContain("at least 30 days outside");
      for (const source of evidence.sources) expect(markdown).toContain(source.url);
    }
  });
});
