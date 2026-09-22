import { afterEach, describe, expect, it, vi } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import reviewedEvidence from "@/data/reviewed-visa-evidence.json";
import { REVIEWED_POLICY_REFRESHES, VISA_POLICY_EVIDENCE } from "@/data/visa-evidence";
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

describe("autumn 2026 seasonal visa boundaries", () => {
  it("preserves old evidence artifacts but shows one reviewed same-scope timeline record", () => {
    for (const [previousId, replacementId] of Object.entries(REVIEWED_POLICY_REFRESHES)) {
      const previous = reviewedEvidence.policies.find(({ id }) => id === previousId)!;
      const replacement = VISA_POLICY_EVIDENCE.find(({ id }) => id === replacementId)!;
      expect(previous).toBeDefined();
      expect(VISA_POLICY_EVIDENCE.some(({ id }) => id === previousId)).toBe(false);
      expect(replacement).toMatchObject({
        status: previous.status,
        passportCodes: previous.passportCodes,
        destinationCodes: previous.destinationCodes,
        effectiveFrom: previous.effectiveFrom,
      });
      expect(replacement.effectiveTo).toBe(previous.effectiveTo);
      expect(replacement.sourceIds).not.toEqual(previous.sourceIds);
      for (const id of previous.sourceIds) {
        expect(reviewedEvidence.sources.find((source) => source.id === id)?.reviewedAt).toMatch(/^2026-08-/);
      }
    }
  });

  it.each(["BH", "OM", "SA"])("applies Bosnia's documented %s post-season visa baseline, not before", (code) => {
    expect(normalized(code, "BA", "visa_free", "2026-09-30"))
      .toMatchObject({ mobilityScore: 1, statuses: { BA: "visa_free" } });
    expect(getVisaRelationshipEvidence(code, "BA", "visa_free", "2026-09-30").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence(code, "BA", "visa_required", "2026-09-30").supportsCurrentStatus).toBe(false);
    expect(normalized(code, "BA", "visa_free", "2026-10-01"))
      .toMatchObject({ mobilityScore: 0, statuses: { BA: "visa_required" } });
    expect(getVisaRelationshipEvidence(code, "BA", "visa_required", "2026-10-01").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence(code, "BA", "visa_free", "2026-10-01").supportsCurrentStatus).toBe(false);
    expect(normalized("QA", "BA", "visa_free", "2026-10-01").statuses.BA).toBe("visa_free");
  });

  it.each(["CN", "HK", "MO"])("stops scoring the %s Cambodia trial after its inclusive endpoint", (code) => {
    expect(normalized(code, "KH", "visa_free", "2026-10-15"))
      .toMatchObject({ mobilityScore: 1, statuses: { KH: "visa_free" } });
    expect(getVisaRelationshipEvidence(code, "KH", "visa_free", "2026-10-15").supportsCurrentStatus).toBe(true);

    for (const staleStatus of ["visa_free", "visa_required", "evisa"] as const) {
      expect(normalized(code, "KH", staleStatus, "2026-10-16"))
        .toMatchObject({ mobilityScore: 0, statuses: { [code]: "citizenship", KH: "unknown" } });
    }
    const afterExpiry = getVisaRelationshipEvidence(code, "KH", "unknown", "2026-10-16");
    expect(afterExpiry.supportsCurrentStatus).toBe(false);
    expect(afterExpiry.allowedStays).toHaveLength(0);
  });

  it("keeps Montenegro's explicit Kazakhstan successor rather than guessing from expiry", () => {
    expect(normalized("KZ", "ME", "visa_free", "2026-10-01"))
      .toMatchObject({ mobilityScore: 1, statuses: { ME: "visa_free" } });
    expect(getVisaRelationshipEvidence("KZ", "ME", "visa_free", "2026-10-01").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KZ", "ME", "visa_required", "2026-10-01").supportsCurrentStatus).toBe(false);
    expect(normalized("KZ", "ME", "visa_free", "2026-10-02"))
      .toMatchObject({ mobilityScore: 0, statuses: { ME: "visa_required" } });
    expect(getVisaRelationshipEvidence("KZ", "ME", "visa_required", "2026-10-02").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("KZ", "ME", "visa_free", "2026-10-02").supportsCurrentStatus).toBe(false);
  });

  it("uses UTC midnight for the Cambodia transition without affecting neighbouring cohorts", () => {
    vi.useFakeTimers();
    const detail = { code: "CN", name: "China", mobilityScore: 1, statuses: { CN: "citizenship" as const, KH: "visa_free" as const } };
    vi.setSystemTime(new Date("2026-10-15T23:59:59.999Z"));
    expect(applyAccessOverrides(detail).statuses.KH).toBe("visa_free");
    vi.setSystemTime(new Date("2026-10-16T00:00:00.000Z"));
    expect(applyAccessOverrides(detail).statuses.KH).toBe("unknown");
    expect(normalized("SG", "KH", "visa_free", "2026-10-16").statuses.KH).toBe("visa_free");
    expect(normalized("MW", "KH", "evisa", "2026-10-16").statuses.KH).toBe("evisa");
    const partial = { code: "CN", name: "China", mobilityScore: 0, statuses: { CN: "citizenship" as const } };
    expect(applyAccessOverrides(partial)).toBe(partial);
  });
});
