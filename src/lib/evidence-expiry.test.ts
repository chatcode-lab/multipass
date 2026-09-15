import { describe, expect, it } from "vitest";
import type { VisaPolicyEvidence } from "../data/visa-evidence";
import { evidenceExpiryQueue } from "../../scripts/report-evidence-expiries";

const policy: VisaPolicyEvidence = {
  id: "fixture-waiver",
  title: "Fixture temporary waiver",
  summary: "Test fixture, not published evidence.",
  destinationCodes: ["RU"],
  passportCodes: ["CN"],
  status: "visa_free",
  sourceIds: [],
  effectiveTo: "2026-09-14",
};

describe("offline evidence expiry queue", () => {
  it("keeps the last day valid and flags expiry on the following UTC date", () => {
    expect(evidenceExpiryQueue([policy], "2026-09-14")[0])
      .toMatchObject({ state: "ends_today", daysUntilExpiry: 0 });
    expect(evidenceExpiryQueue([policy], "2026-09-15")[0])
      .toMatchObject({ state: "expired", daysUntilExpiry: -1 });
  });

  it("includes both window boundaries and excludes undated and distant history", () => {
    const rows = evidenceExpiryQueue([
      { ...policy, id: "before", effectiveTo: "2026-08-16" },
      { ...policy, id: "after", effectiveTo: "2026-10-15" },
      { ...policy, id: "old", effectiveTo: "2026-08-15" },
      { ...policy, id: "future", effectiveTo: "2026-10-16" },
      { ...policy, id: "undated", effectiveTo: undefined },
    ], "2026-09-15", 30);
    expect(rows.map(({ policyId }) => policyId)).toEqual(["before", "after"]);
    expect(rows[1])
      .toMatchObject({ state: "ending_soon", daysUntilExpiry: 30 });
  });

  it("preserves exclusions and does not suppress historical policies or invent successors", () => {
    const input = { ...policy, excludedPassportCodes: ["HK"] };
    const before = JSON.stringify(input);
    expect(evidenceExpiryQueue([input], "2026-09-15")[0].excludedPassportCodes).toEqual(["HK"]);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("rejects invalid dates and windows instead of silently shifting the review day", () => {
    for (const asOf of ["2026-02-30", "2026-09-31", "not-a-date", "2026-9-15"]) {
      expect(() => evidenceExpiryQueue([], asOf)).toThrow(/real date/);
    }
    for (const days of [-1, 1.5, 367, NaN]) {
      expect(() => evidenceExpiryQueue([], "2026-09-15", days)).toThrow(/integer/);
    }
    expect(evidenceExpiryQueue([policy], "2026-09-14", 0)).toHaveLength(1);
    expect(evidenceExpiryQueue([policy], "2026-09-15", 0)).toHaveLength(0);
  });
});
