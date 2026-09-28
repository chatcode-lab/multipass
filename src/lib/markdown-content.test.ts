import { describe, expect, it } from "vitest";
import fallback from "@/data/fallback.json";
import { passportMarkdown, rankingMarkdown } from "./markdown-content";
import { getVisaRelationshipEvidence } from "./visa-evidence";
import { visaRelationshipMarkdown } from "./visa-markdown";
import type { DataSnapshot } from "./types";

const snapshot = fallback as DataSnapshot;

describe("search and agent-facing ranking content", () => {
  it("shares dense regional ranks across tied passports, independent of list order", () => {
    const passports = ["BB", "BS", "JM"].map((code, index) => ({
      ...snapshot.manifest.passports.find((passport) => passport.code === code)!,
      mobilityScore: index < 2 ? 100 : 90,
      rank: index < 2 ? 20 : 21,
    }));
    const manifest = { ...snapshot.manifest, passports };
    const ranking = rankingMarkdown(manifest, "Caribbean passports", "Test cohort", [...passports].reverse(), true);
    for (const [index, passport] of passports.entries()) {
      const regionalRank = index < 2 ? 1 : 2;
      expect(ranking).toContain(`| ${regionalRank} | [${passport.name}]`);
      const markdown = passportMarkdown(manifest, passport, snapshot.passports[passport.code]);
      expect(markdown).toContain(`**#${regionalRank} among 3 Caribbean passports**`);
    }
  });

  it("links passport Markdown destination rows to canonical evidence, not self-pair URLs", () => {
    const passport = snapshot.manifest.passports.find(({ code }) => code === "SG")!;
    const markdown = passportMarkdown(snapshot.manifest, passport, snapshot.passports.SG);
    expect(markdown).toContain("[Vietnam](https://multipassrank.com/singapore-vietnam-visa-free)");
    expect(markdown).toContain("[Singapore](https://multipassrank.com/passport/singapore)");
    expect(markdown).not.toContain("singapore-singapore-citizenship");
  });

  it("puts reviewed allowed stay before the long evidence timeline", () => {
    const passport = snapshot.manifest.passports.find(({ code }) => code === "GB")!;
    const destination = snapshot.manifest.destinations.find(({ code }) => code === "BM")!;
    const evidence = getVisaRelationshipEvidence("GB", "BM", "visa_free", "2026-09-28");
    const markdown = visaRelationshipMarkdown(snapshot.manifest, passport, destination, "visa_free", evidence);
    expect(markdown).toContain("## Allowed stay");
    expect(markdown.indexOf("## Allowed stay")).toBeLessThan(markdown.indexOf("## Evidence timeline"));
    expect(markdown).toContain("not guaranteed admission or extensions");
  });
});
