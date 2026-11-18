import { describe, expect, it } from "vitest";
import archive from "@/data/reviewed-visa-evidence.json";
import fallbackSnapshot from "@/data/fallback.json";
import { applyAccessOverrides, calculateMobilityScore } from "./passport";
import type { DataSnapshot } from "./types";
import { getVisaRelationshipEvidence, policiesForDestination } from "./visa-evidence";

const snapshot = fallbackSnapshot as DataSnapshot;
const asOf = "2026-11-18";
const newPolicy = "pass420-sb-colombia-palestine-tourist-evisa";
const previousColombia = "colombian-ordinary-passport-solomon-islands-consular-visitor-visa-2026";
const previousPalestine = "palestinian-ordinary-passport-2026-advance-visa-cohort";

describe("Solomon Islands ordinary tourist eVisa verification", () => {
  it.each(["CO", "PS"])("normalizes %s without altering its score or assuming a permitted stay", (code) => {
    const bundled = snapshot.passports[code];
    expect(bundled.statuses.SB).toBe("visa_required");
    const statuses = { [code]: bundled.statuses[code], SB: bundled.statuses.SB };
    const detail = { ...bundled, statuses, mobilityScore: calculateMobilityScore(statuses) };
    const adjusted = applyAccessOverrides(detail);
    expect(adjusted.statuses).toEqual({ ...detail.statuses, SB: "evisa" });
    expect(adjusted.mobilityScore).toBe(detail.mobilityScore);
    expect(applyAccessOverrides(adjusted)).toBe(adjusted);

    const evidence = getVisaRelationshipEvidence(code, "SB", "evisa", asOf);
    expect(evidence).toMatchObject({ evidenceLevel: "exact", reviewedAt: asOf, allowedStays: [] });
    const policy = evidence.policies.find((item) => item.id === newPolicy);
    expect(policy?.application?.steps).toHaveLength(3);
    expect(policy?.effectiveFrom).toBeUndefined();
    expect(policy?.effectiveTo).toBeUndefined();
    expect(getVisaRelationshipEvidence(code, "SB", "visa_required", asOf).supportsCurrentStatus).toBe(false);
  });

  it("keeps the prior full records in the archive and limits the replacement to Solomon Islands", () => {
    for (const id of [previousColombia, previousPalestine]) {
      expect(archive.policies.find((item) => item.id === id)?.destinationCodes).toContain("SB");
      expect(policiesForDestination("SB").some((item) => item.id === id)).toBe(false);
    }
    expect(getVisaRelationshipEvidence("PS", "TD", "visa_required", asOf).policies.some((item) => item.id === previousPalestine)).toBe(true);
    expect(getVisaRelationshipEvidence("CL", "SB", "evisa", asOf).policies.some((item) => item.id === newPolicy)).toBe(false);
  });
});
