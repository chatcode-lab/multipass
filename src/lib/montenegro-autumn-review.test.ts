import { afterEach, describe, expect, it, vi } from "vitest";
import fallback from "@/data/fallback.json";
import archive from "@/data/reviewed-visa-evidence.json";
import { OFFICIAL_VISA_SOURCES, REVIEWED_POLICY_REFRESHES, VISA_POLICY_EVIDENCE } from "@/data/visa-evidence";
import { buildEvidenceCompletionSummary } from "./evidence-status";
import { applyAccessOverrides } from "./passport";
import type { AccessStatus, DataSnapshot } from "./types";
import { getVisaRelationshipEvidence, policiesForDestination } from "./visa-evidence";
import { visaRelationshipMarkdown } from "./visa-markdown";
import { relationshipSitemapUrls } from "./sitemap";

const snapshot = fallback as DataSnapshot;
const waivers = ["BY", "RU", "SA", "TR"];
const refreshes = [
  "pass414-me-kazakhstan-prior-visa-from-october-2",
  "montenegro-belarus-russia-temporary-30-days",
  "montenegro-saudi-turkiye-temporary-30-days",
  "montenegro-belarus-russia-saudi-turkiye-advance-visa-from-november-2026",
];
const scope = (policy: {
  status: string; destinationCodes: readonly string[]; passportCodes?: readonly string[];
  excludedPassportCodes?: readonly string[]; effectiveFrom?: string; effectiveTo?: string;
}) => ({
  status: policy.status,
  destinations: [...policy.destinationCodes].sort(),
  passports: [...(policy.passportCodes ?? [])].sort(),
  exclusions: [...(policy.excludedPassportCodes ?? [])].sort(),
  from: policy.effectiveFrom,
  to: policy.effectiveTo,
});

afterEach(() => vi.useRealTimers());

describe("Montenegro's independently reviewed autumn transitions", () => {
  it("preserves every refreshed scope and the Kazakhstan archive chain", () => {
    for (const previousId of refreshes) {
      const previous = archive.policies.find(({ id }) => id === previousId)!;
      const current = VISA_POLICY_EVIDENCE.find(({ id }) => id === REVIEWED_POLICY_REFRESHES[previousId])!;
      expect(current).toBeDefined();
      expect(scope(current)).toEqual(scope(previous));
      expect(policiesForDestination("ME").some(({ id }) => id === previousId)).toBe(false);
      expect(current.sourceIds.every((id) => OFFICIAL_VISA_SOURCES.find((source) => source.id === id)?.reviewedAt === "2026-10-20")).toBe(true);
    }
    expect(archive.policies.some(({ id }) => id === "montenegro-kazakhstan-advance-visa-from-october-2026")).toBe(true);
    expect(policiesForDestination("ME").some(({ id }) => id === "montenegro-kazakhstan-advance-visa-from-october-2026")).toBe(false);
  });

  it.each(waivers)("switches %s at UTC midnight and replaces the waiver stay with the qualified visa ceiling", (code) => {
    vi.useFakeTimers();
    for (const [instant, status, days] of [
      ["2026-10-31T23:59:59.999Z", "visa_free", 30],
      ["2026-11-01T00:00:00.000Z", "visa_required", 90],
    ] as const) {
      vi.setSystemTime(new Date(instant));
      const detail = applyAccessOverrides(snapshot.passports[code]);
      expect(detail.statuses.ME).toBe(status);
      const evidence = getVisaRelationshipEvidence(code, "ME", status);
      expect(evidence.supportsCurrentStatus).toBe(true);
      expect(evidence.reviewedAt).toBe("2026-10-20");
      const current = evidence.policies.filter((policy) => policy.status === status
        && (!policy.effectiveFrom || policy.effectiveFrom <= instant.slice(0, 10))
        && (!policy.effectiveTo || policy.effectiveTo >= instant.slice(0, 10)));
      expect(current).toHaveLength(1);
      expect(evidence.allowedStays).toHaveLength(1);
      expect(evidence.allowedStays[0].maxDays).toBe(days);
      if (status === "visa_required") {
        expect(evidence.allowedStays[0]).toMatchObject({ basis: "calendar_period", withinDays: 180 });
        expect(evidence.allowedStays[0].label).toContain("from first entry, subject to the issued visa");
        expect(current[0].conditions?.join(" ")).toContain("not electronic issuance");
      }
    }
  });

  it("keeps Kazakhstan's seasonal endpoint and applies its visa ceiling only afterward", () => {
    const before = getVisaRelationshipEvidence("KZ", "ME", "visa_free", "2026-10-01");
    expect(before.allowedStays).toEqual([expect.objectContaining({ maxDays: 30 })]);
    const after = getVisaRelationshipEvidence("KZ", "ME", "visa_required", "2026-10-02");
    expect(after.supportsCurrentStatus).toBe(true);
    expect(after.policies.filter(({ status }) => status === "visa_required")).toHaveLength(1);
    expect(after.allowedStays).toEqual([expect.objectContaining({ maxDays: 90, withinDays: 180, basis: "calendar_period" })]);
    expect(after.allowedStays[0].notes?.join(" ")).toContain("not visa validity");
    expect(after.policies[0].conditions?.join(" ")).toContain("not a Kazakh passport-only waiver");
  });

  it("limits new stays to five relationships and does not treat Cambodia's expired trial as current", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-20T12:00:00Z"));
    const details = Object.fromEntries(Object.entries(snapshot.passports).map(([code, detail]) => [code, applyAccessOverrides(detail)]));
    expect(buildEvidenceCompletionSummary(snapshot.manifest, details, "2026-10-20"))
      .toMatchObject({ total: 44_974, covered: 40_938, allowedStay: { count: 4_426 }, notCovered: { count: 4_036 } });
    for (const code of ["CN", "HK", "MO"]) {
      expect(details[code].statuses.KH).toBe("unknown");
      expect(getVisaRelationshipEvidence(code, "KH", "unknown").allowedStays).toHaveLength(0);
    }
    for (const code of ["CN", "AZ", "US"]) {
      const status = details[code].statuses.ME;
      expect(getVisaRelationshipEvidence(code, "ME", status).policies.some(({ id }) => id.startsWith("pass418-"))).toBe(false);
    }
  });

  it("exposes each current stay and its official sources in native Markdown", () => {
    for (const code of ["KZ", ...waivers]) {
      const status: AccessStatus = code === "KZ" ? "visa_required" : "visa_free";
      const evidence = getVisaRelationshipEvidence(code, "ME", status, "2026-10-20");
      const markdown = visaRelationshipMarkdown(snapshot.manifest,
        snapshot.manifest.passports.find((passport) => passport.code === code)!,
        snapshot.manifest.destinations.find((destination) => destination.code === "ME")!, status, evidence);
      expect(markdown).toContain(evidence.allowedStays[0].label);
      for (const source of evidence.sources) expect(markdown).toContain(source.url);
    }
  });

  it("archives only Montenegro's Russian waiver while preserving every other nationality", () => {
    const id = "russia-ordinary-passports-visa-free-30-days";
    const original = archive.policies.find((policy) => policy.id === id)!;
    const remaining = VISA_POLICY_EVIDENCE.find((policy) => policy.id === id)!;
    const historical = VISA_POLICY_EVIDENCE.find((policy) => policy.id === `${id}-before-2026-10-31`)!;
    expect(original.passportCodes).toContain("ME");
    expect(remaining.passportCodes).toEqual(original.passportCodes.filter((code) => code !== "ME"));
    expect(remaining.sourceIds).toEqual(original.sourceIds);
    expect(remaining.effectiveTo).toBeUndefined();
    expect(historical).toMatchObject({ passportCodes: ["ME"], effectiveTo: "2026-10-31", sourceIds: original.sourceIds });
    for (const code of ["BW", "LA", "MN", "TH", "PW", "SC"]) {
      expect(getVisaRelationshipEvidence(code, "RU", "visa_free", "2026-11-01").supportsCurrentStatus).toBe(true);
    }
  });

  it("switches the reverse Russian route and canonical sitemap at the separately verified November boundary", () => {
    vi.useFakeTimers();
    for (const [instant, status, suffix] of [
      ["2026-10-31T23:59:59.999Z", "visa_free", "visa-free"],
      ["2026-11-01T00:00:00.000Z", "visa_required", "visa"],
    ] as const) {
      vi.setSystemTime(new Date(instant));
      const details = Object.fromEntries(Object.entries(snapshot.passports).map(([code, detail]) => [code, applyAccessOverrides(detail)]));
      expect(details.ME.statuses.RU).toBe(status);
      const baselineScore = details.ME.mobilityScore;
      for (const stale of ["visa_free", "evisa", "visa_required"] as const) {
        const changed = applyAccessOverrides({ ...snapshot.passports.ME, statuses: { ...snapshot.passports.ME.statuses, RU: stale } });
        expect(changed.statuses.RU).toBe(status);
        expect(changed.mobilityScore).toBe(baselineScore);
        expect(applyAccessOverrides(changed)).toEqual(changed);
      }
      const evidence = getVisaRelationshipEvidence("ME", "RU", status);
      expect(evidence.supportsCurrentStatus).toBe(true);
      expect(getVisaRelationshipEvidence("ME", "RU", status === "visa_free" ? "visa_required" : "visa_free").supportsCurrentStatus).toBe(false);
      if (status === "visa_required") {
        expect(evidence.policies.some(({ id }) => id === "pass418-ru-montenegro-ordinary-visitors-prior-visa-november")).toBe(true);
        expect(evidence.allowedStays).toHaveLength(0);
        expect(evidence.reviewedAt).toBe("2026-10-20");
      }
      const urls = relationshipSitemapUrls(snapshot.manifest, details, "EUROPE").map(({ loc }) => loc);
      expect(urls).toContain(`https://multipassrank.com/montenegro-russian-federation-${suffix}`);
      expect(urls).not.toContain(`https://multipassrank.com/montenegro-russian-federation-${suffix === "visa" ? "visa-free" : "visa"}`);
    }
  });
});
