import { afterEach, describe, expect, it, vi } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import reviewedEvidence from "@/data/reviewed-visa-evidence.json";
import { VISA_POLICY_EVIDENCE } from "@/data/visa-evidence";
import { applyAccessOverrides, calculateMobilityScore, reconcileManifestPassportDetails } from "./passport";
import { getVisaRelationshipEvidence } from "./visa-evidence";
import type { AccessStatus, DataSnapshot, PassportAccess } from "./types";

const snapshot = fallbackSnapshot as DataSnapshot;

afterEach(() => vi.useRealTimers());

function normalized(code: string, destination: string, status: AccessStatus, asOf: string): PassportAccess {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${asOf}T12:00:00Z`));
  const statuses = { [code]: "citizenship" as const, [destination]: status };
  return applyAccessOverrides({ code, name: code, statuses, mobilityScore: calculateMobilityScore(statuses) });
}

describe("reviewed September 2026 live/fallback drift", () => {
  it.each(["NI", "SB"])("dates the %s Hong Kong successor without overlapping categories", (code) => {
    expect(getVisaRelationshipEvidence(code, "HK", "visa_required", "2026-08-25").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence(code, "HK", "visa_free", "2026-08-25").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence(code, "HK", "visa_required", "2026-08-26").supportsCurrentStatus).toBe(false);
    const current = getVisaRelationshipEvidence(code, "HK", "visa_free", "2026-08-26");
    expect(current.supportsCurrentStatus).toBe(true);
    expect(current.allowedStays).toEqual(expect.arrayContaining([expect.objectContaining({ maxDays: 30, basis: "per_visit" })]));
    expect(normalized(code, "HK", "visa_required", "2026-08-25").statuses.HK).toBe("visa_required");
    expect(normalized(code, "HK", "visa_required", "2026-08-26")).toMatchObject({ mobilityScore: 1, statuses: { HK: "visa_free" } });
  });

  it("bounds the Brazilian French Guiana waiver and stay by its actual trial dates", () => {
    expect(getVisaRelationshipEvidence("BR", "GF", "visa_required", "2026-07-30").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BR", "GF", "visa_free", "2026-07-30").supportsCurrentStatus).toBe(false);
    for (const date of ["2026-07-31", "2027-01-31"]) {
      expect(getVisaRelationshipEvidence("BR", "GF", "visa_required", date).supportsCurrentStatus).toBe(false);
      const current = getVisaRelationshipEvidence("BR", "GF", "visa_free", date);
      expect(current.supportsCurrentStatus).toBe(true);
      expect(current.allowedStays).toEqual(expect.arrayContaining([expect.objectContaining({ maxDays: 30, withinDays: 180 })]));
      expect(normalized("BR", "GF", "visa_required", date)).toMatchObject({ mobilityScore: 1, statuses: { GF: "visa_free" } });
    }
    for (const status of ["visa_free", "visa_required", "unknown"] as const) {
      const expired = getVisaRelationshipEvidence("BR", "GF", status, "2027-02-01");
      expect(expired.supportsCurrentStatus).toBe(false);
      expect(expired.allowedStays).toHaveLength(0);
    }
  });

  it.each(["visa_free", "visa_required"] as const)("removes stale %s access from scoring after the trial", (status) => {
    expect(normalized("BR", "GF", status, "2027-02-01"))
      .toMatchObject({ mobilityScore: 0, statuses: { BR: "citizenship", GF: "unknown" } });
  });

  it("does not expand partial catalogs or alter neighbouring nationality cohorts", () => {
    const detail = { code: "BR", name: "Brazil", mobilityScore: 0, statuses: { BR: "citizenship" as const } };
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-02-01T12:00:00Z"));
    expect(applyAccessOverrides(detail)).toBe(detail);
    expect(normalized("AF", "HK", "visa_required", "2026-09-22").statuses.HK).toBe("visa_required");
    expect(normalized("GE", "GF", "visa_required", "2026-09-22").statuses.GF).toBe("visa_required");
    expect(getVisaRelationshipEvidence("GE", "GF", "visa_required", "2026-09-22").supportsCurrentStatus).toBe(true);
  });

  it("preserves the approved historical artifact and its sources when slicing Brazil out", () => {
    const id = "french-guiana-ordinary-passport-advance-visa-complement";
    const original = reviewedEvidence.policies.find((policy) => policy.id === id)!;
    const remaining = VISA_POLICY_EVIDENCE.find((policy) => policy.id === id)!;
    const historical = VISA_POLICY_EVIDENCE.find((policy) => policy.id === `${id}-before-2026-07-30`)!;
    expect(original.passportCodes).toContain("BR");
    expect(remaining.passportCodes).toEqual(original.passportCodes.filter((code) => code !== "BR"));
    expect(remaining.sourceIds).toEqual(original.sourceIds);
    expect(historical).toMatchObject({ passportCodes: ["BR"], effectiveTo: "2026-07-30", sourceIds: original.sourceIds, conditions: original.conditions });
  });

  it("ships consistent corrected fallback scores without restamping the upstream snapshot", () => {
    for (const [code, destination] of [["NI", "HK"], ["SB", "HK"], ["BR", "GF"]]) {
      const detail = snapshot.passports[code];
      expect(detail.statuses[destination]).toBe("visa_free");
      expect(detail.mobilityScore).toBe(calculateMobilityScore(detail.statuses));
      expect(snapshot.manifest.passports.find((passport) => passport.code === code)?.mobilityScore).toBe(detail.mobilityScore);
    }
    expect(reconcileManifestPassportDetails(snapshot.manifest, snapshot.passports)).toEqual(snapshot.manifest);
  });
});
