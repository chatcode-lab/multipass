import { afterEach, describe, expect, it, vi } from "vitest";
import fallback from "@/data/fallback.json";
import archive from "@/data/reviewed-visa-evidence.json";
import { THAILAND_2026_VISITOR_POLICIES, VISA_POLICY_EVIDENCE } from "@/data/visa-evidence";
import { applyAccessOverrides, calculateMobilityScore } from "./passport";
import { getVisaRelationshipEvidence, policyApplies } from "./visa-evidence";
import { visaRelationshipMarkdown } from "./visa-markdown";
import type { AccessStatus, DataSnapshot } from "./types";

const snapshot = fallback as DataSnapshot;
const today = "2026-11-02";
afterEach(() => vi.useRealTimers());

describe("Thailand's adopted September 2026 entry revision", () => {
  it("covers each foreign passport once with one current stay, preserving Thai citizenship", () => {
    const codes = new Set<string>();
    const totals: Partial<Record<AccessStatus, number>> = {};
    for (const policy of THAILAND_2026_VISITOR_POLICIES) for (const code of policy.passportCodes ?? []) {
      expect(codes.has(code)).toBe(false);
      codes.add(code);
      totals[policy.status] = (totals[policy.status] ?? 0) + 1;
      const evidence = getVisaRelationshipEvidence(code, "TH", policy.status, today);
      expect(evidence.supportsCurrentStatus).toBe(true);
      expect(evidence.reviewedAt).toBe(today);
      expect(evidence.allowedStays).toHaveLength(1);
      expect(evidence.allowedStays[0]).toEqual(policy.allowedStays![0]);
    }
    expect(codes.size).toBe(198);
    expect(totals).toEqual({ visa_free: 78, visa_on_arrival: 3, evisa: 117 });
    expect(codes.has("TH")).toBe(false);
    const home = getVisaRelationshipEvidence("TH", "TH", "citizenship", today);
    expect(home.supportsCurrentStatus).toBe(true);
    expect(home.reviewedAt).not.toBe(today);
    expect(home.allowedStays).toHaveLength(0);
  });

  it.each([
    ["NL", "visa_free", 60, "visa_free", 30],
    ["MX", "visa_free", 60, "evisa", 60],
    ["ET", "visa_on_arrival", 15, "evisa", 60],
    ["AZ", "evisa", undefined, "visa_on_arrival", 15],
    ["SC", "visa_on_arrival", 15, "visa_free", 15],
    ["KG", "visa_on_arrival", 15, "visa_free", 30],
    ["MU", "visa_free", 60, "visa_free", 15],
  ] as const)("applies %s's new category and stay at the actual UTC commencement", (code, before, oldDays, after, newDays) => {
    vi.useFakeTimers();
    for (const [instant, status, days] of [
      ["2026-09-14T23:59:59.999Z", before, oldDays],
      ["2026-09-15T00:00:00.000Z", after, newDays],
    ] as const) {
      vi.setSystemTime(new Date(instant));
      const detail = applyAccessOverrides(snapshot.passports[code]);
      expect(detail.statuses.TH).toBe(status);
      expect(detail.mobilityScore).toBe(calculateMobilityScore(detail.statuses));
      expect(applyAccessOverrides(detail)).toEqual(detail);
      const evidence = getVisaRelationshipEvidence(code, "TH", status);
      expect(evidence.supportsCurrentStatus).toBe(true);
      if (days) expect(evidence.allowedStays).toEqual([expect.objectContaining({ maxDays: days })]);
      else expect(evidence.allowedStays).toHaveLength(0);
    }
  });

  it("keeps the repealed schedules historical and preserves the grandfathered admission explanation", () => {
    for (const id of ["thailand-current-60-day-waiver-until-gazette-transition-2026", "thailand-current-15-day-voa-until-gazette-transition-2026", "thailand-global-evisa-foreign-ordinary-passports"]) {
      expect(archive.policies.find((policy) => policy.id === id)?.effectiveTo).toBeUndefined();
      expect(VISA_POLICY_EVIDENCE.find((policy) => policy.id === id)?.effectiveTo).toBe("2026-09-14");
    }
    const policy = THAILAND_2026_VISITOR_POLICIES.find((item) => item.passportCodes?.includes("NL"))!;
    expect(policy).toMatchObject({ announcedOn: "2026-08-31", effectiveFrom: "2026-09-15" });
    expect(policy.conditions?.join(" ")).toContain("immigration-stamped end date");
    expect(policy.conditions?.join(" ")).toContain("not extend this new tourism scheme to short business automatically");
    expect(policy.conditions?.join(" ")).toContain("Malaysia, Brunei, Indonesia and Singapore");
  });

  it("corrects bilateral durations without inventing commencement or exporting land restrictions to treaties", () => {
    for (const [code, days] of [["MM", 14], ["KH", 14], ["TL", 30], ["CN", 30], ["CL", 90], ["KR", 90], ["PE", 90]] as const) {
      const policy = THAILAND_2026_VISITOR_POLICIES.find((item) => item.passportCodes?.includes(code))!;
      expect(policy.effectiveFrom).toBeUndefined();
      expect(policy.conditions?.join(" ")).not.toContain("twice per calendar year");
      expect(getVisaRelationshipEvidence(code, "TH", "visa_free", today).allowedStays)
        .toEqual([expect.objectContaining({ maxDays: days })]);
    }
    expect(getVisaRelationshipEvidence("MM", "TH", "visa_free", today).policies.some((policy) =>
      policy.conditions?.some((condition) => condition.includes("only through international airports")))).toBe(true);
  });

  it("normalizes arbitrary live statuses to the full reviewed partition without expanding partial catalogs", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${today}T12:00:00Z`));
    for (const policy of THAILAND_2026_VISITOR_POLICIES) for (const code of policy.passportCodes ?? []) {
      for (const stale of ["visa_free", "visa_on_arrival", "evisa", "unknown"] as const) {
        const statuses = { [code]: "citizenship" as const, TH: stale };
        const normalized = applyAccessOverrides({ code, name: code, mobilityScore: calculateMobilityScore(statuses), statuses });
        expect(normalized.statuses.TH).toBe(policy.status);
        expect(normalized.mobilityScore).toBe(calculateMobilityScore(normalized.statuses));
      }
      const partial = { code, name: code, mobilityScore: 0, statuses: { [code]: "citizenship" as const } };
      expect(applyAccessOverrides(partial)).toBe(partial);
    }
  });

  it("refines only Taiwan's Anguilla evidence and distinguishes the visitor stay from visa validity", () => {
    const id = "anguilla-live-selector-evisa-eligible-ordinary-passports";
    const original = archive.policies.find((policy) => policy.id === id)!;
    const remaining = VISA_POLICY_EVIDENCE.find((policy) => policy.id === id)!;
    expect(remaining.passportCodes).toEqual(original.passportCodes.filter((code) => code !== "TW"));
    expect(remaining.sourceIds).toEqual(original.sourceIds);
    const evidence = getVisaRelationshipEvidence("TW", "AI", "evisa", today);
    expect(evidence.policies).toHaveLength(1);
    expect(evidence.policies[0].effectiveFrom).toBeUndefined();
    expect(evidence.allowedStays).toEqual([expect.objectContaining({ maxDays: 90, basis: "per_visit" })]);
    expect(evidence.allowedStays[0].notes?.join(" ")).toContain("not the deadline for first use");
    expect(policyApplies(remaining, "CN", "AI")).toBe(true);
    expect(getVisaRelationshipEvidence("CN", "AI", "evisa", today).reviewedAt).not.toBe(today);
  });

  it("includes the same new stay and current application steps in agent Markdown", () => {
    for (const [code, destination, status] of [["NL", "TH", "visa_free"], ["MX", "TH", "evisa"], ["AZ", "TH", "visa_on_arrival"], ["TW", "AI", "evisa"]] as const) {
      const evidence = getVisaRelationshipEvidence(code, destination, status, today);
      const markdown = visaRelationshipMarkdown(snapshot.manifest,
        snapshot.manifest.passports.find((passport) => passport.code === code)!,
        snapshot.manifest.destinations.find((item) => item.code === destination)!, status, evidence);
      expect(markdown).toContain(evidence.allowedStays[0].label);
      const current = evidence.policies.find((policy) => policy.status === status && policy.id.startsWith("pass419-"))!;
      for (const step of current.application?.steps ?? []) expect(markdown).toContain(step);
    }
  });
});
