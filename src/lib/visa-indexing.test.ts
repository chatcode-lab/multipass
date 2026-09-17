import { describe, expect, it } from "vitest";
import fallback from "@/data/fallback.json";
import { getVisaRelationshipEvidence, visaRelationshipHref } from "./visa-evidence";
import { applyAccessOverrides } from "./passport";
import { indexableRelationshipPairs, relationshipIsIndexable } from "./visa-indexing";
import { visaRelationshipMarkdown } from "./visa-markdown";
import { REGIONS, type DataSnapshot } from "./types";

const asOf = "2026-09-16";
const snapshot = fallback as DataSnapshot;
const details = Object.fromEntries(Object.entries(snapshot.passports)
  .map(([code, detail]) => [code, applyAccessOverrides(detail)]));
const conditional = getVisaRelationshipEvidence("DZ", "TR", "unknown", asOf);

describe("relationship search eligibility", () => {
  it("indexes exact evidence without changing its verification state", () => {
    const evidence = getVisaRelationshipEvidence("BE", "AO", "visa_free", asOf);
    expect(relationshipIsIndexable(evidence, asOf)).toBe(true);
    expect(evidence.evidenceLevel).toBe("exact");
  });

  it("indexes a sourced conditional explanation without turning it into exact evidence", () => {
    expect(relationshipIsIndexable(conditional, asOf)).toBe(true);
    expect(conditional.evidenceLevel).toBe("conditional");
    expect(conditional.supportsCurrentStatus).toBe(false);
    expect(details.DZ.statuses.TR).toBe("unknown");
  });

  it("allows a reviewed correction while keeping the replacement category unresolved", () => {
    const evidence = getVisaRelationshipEvidence("XK", "AZ", "unknown", asOf);
    expect(relationshipIsIndexable(evidence, asOf)).toBe(true);
    expect(evidence.supportsCurrentStatus).toBe(false);
    expect(evidence.evidenceLevel).toBe("rejected");
    expect(relationshipIsIndexable(evidence, "2026-11-26")).toBe(false);
    expect(relationshipIsIndexable({ ...evidence, sources: [] }, asOf)).toBe(false);
    expect(relationshipIsIndexable({
      ...evidence, reviewedUnknown: { ...evidence.reviewedUnknown!, reviewedAt: "", recheckBy: "unknown" },
    }, asOf)).toBe(false);
  });

  it("keeps a bare imported classification excluded", () => {
    const evidence = getVisaRelationshipEvidence("BE", "AF", "visa_required", asOf);
    expect(relationshipIsIndexable(evidence, asOf)).toBe(false);
  });

  it("rejects incomplete citations, empty explanations, and future or expired conditions", () => {
    const evidence = { ...conditional, reviewedUnknown: undefined };
    expect(relationshipIsIndexable({ ...evidence, sources: [] }, asOf)).toBe(false);
    for (const change of [
      { summary: " " }, { conditions: [] }, { conditions: [" "] },
      { sourceIds: ["missing-source"] }, { possibleStatuses: [] },
      { effectiveFrom: "2026-09-17" }, { effectiveTo: "2026-09-15" },
    ]) {
      expect(relationshipIsIndexable({
        ...evidence, conditional: evidence.conditional.map((item) => ({ ...item, ...change })),
      }, asOf)).toBe(false);
    }
    expect(relationshipIsIndexable({
      ...evidence, sources: evidence.sources.map((source) => ({ ...source, reviewedAt: "2026-09-17" })),
    }, asOf)).toBe(false);
  });

  // This exhaustively checks the catalog twice; shared CI runners can exceed
  // Vitest's five-second default even when every eligibility assertion passes.
  it("uses the same eligibility rule for every sitemap cell without inflating exact coverage", () => {
    const paths = new Set(REGIONS.flatMap((region) => indexableRelationshipPairs(snapshot.manifest, details, region, asOf))
      .map(({ passport, destination, status }) => visaRelationshipHref(passport, destination, status)));
    let exact = 0;
    let additional = 0;
    for (const passport of snapshot.manifest.passports) {
      for (const destination of snapshot.manifest.destinations) {
        const status = details[passport.code].statuses[destination.code];
        if (status === "citizenship") continue;
        const evidence = getVisaRelationshipEvidence(passport.code, destination.code, status, asOf);
        const indexable = relationshipIsIndexable(evidence, asOf);
        expect(paths.has(visaRelationshipHref(passport, destination, status)), `${passport.code}:${destination.code}`)
          .toBe(indexable);
        if (evidence.supportsCurrentStatus) exact += 1;
        else if (indexable) additional += 1;
      }
    }
    expect(exact).toBe(40_941);
    expect(additional).toBe(1_142);
  }, 20_000);

  it("gives conditional Markdown a neutral heading, qualified label, and direct citations", () => {
    const passport = snapshot.manifest.passports.find(({ code }) => code === "DZ")!;
    const destination = snapshot.manifest.destinations.find(({ code }) => code === "TR")!;
    const markdown = visaRelationshipMarkdown(snapshot.manifest, passport, destination, "unknown", conditional);
    expect(markdown).toContain("# Algeria passport to Türkiye: Visa requirements");
    expect(markdown).toContain("not a verified passport-wide entry rule");
    expect(markdown).toContain(conditional.sources[0].url);
    expect(markdown).toContain(conditional.reviewedUnknown!.reason);
    expect(markdown).not.toContain("Current access classification:");
  });
});
