import { afterEach, describe, expect, it, vi } from "vitest";
import { applyAccessOverrides, calculateMobilityScore } from "./passport";
import type { AccessStatus } from "./types";
import { getVisaRelationshipEvidence } from "./visa-evidence";

afterEach(() => vi.useRealTimers());

const cases = [
  ["CO", "IL", "visa_required", "eta", "2026-08-31", "2026-09-01", "Up to 90 days within 12 months, subject to admission"],
  ["IL", "CO", "evisa", "visa_free", "2026-09-03", "2026-09-04", "Short stay under 90 days; extension only if permitted"],
] as const;

describe("Colombia–Israel short-stay visa exemption", () => {
  it.each(cases)("gives %s to %s its own commencement, category and stay", (code, destination, old, current, lastOldDay, effectiveFrom, label) => {
    expect(getVisaRelationshipEvidence(code, destination, old, lastOldDay).supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence(code, destination, current, lastOldDay).supportsCurrentStatus).toBe(false);
    const evidence = getVisaRelationshipEvidence(code, destination, current, effectiveFrom);
    expect(evidence.supportsCurrentStatus).toBe(true);
    expect(evidence.policies).toEqual(expect.arrayContaining([
      expect.objectContaining({ status: old, effectiveTo: lastOldDay }),
      expect.objectContaining({ status: current, effectiveFrom }),
    ]));
    expect(evidence.allowedStays).toHaveLength(1);
    expect(evidence.allowedStays[0].label).toBe(label);
    expect(evidence.allowedStays[0].withinDays).toBeUndefined();
    expect(getVisaRelationshipEvidence(code, destination, old, effectiveFrom).supportsCurrentStatus).toBe(false);

    const statuses: Record<string, AccessStatus> = { [code]: "citizenship", [destination]: old };
    const detail = { code, name: code, statuses, mobilityScore: calculateMobilityScore(statuses) };
    vi.useFakeTimers();
    vi.setSystemTime(new Date(lastOldDay));
    expect(applyAccessOverrides(detail)).toBe(detail);
    vi.setSystemTime(new Date(effectiveFrom));
    expect(applyAccessOverrides(detail)).toMatchObject({ statuses: { [destination]: current }, mobilityScore: 1 });
    vi.setSystemTime(new Date("2026-11-18"));
    const liveCategory = code === "CO" ? "visa_free" : "evisa";
    expect(applyAccessOverrides({ ...detail, statuses: { ...statuses, [destination]: liveCategory } }).statuses[destination]).toBe(current);
  });

  it("leaves neighbouring visa cohorts current", () => {
    expect(getVisaRelationshipEvidence("MD", "IL", "visa_required", "2026-11-18").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("MY", "CO", "evisa", "2026-11-18").supportsCurrentStatus).toBe(true);
  });
});
