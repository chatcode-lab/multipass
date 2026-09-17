import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import topicsArtifact from "../data/country-profiles.json";
import indicatorsArtifact from "../data/country-indicators.json";
import { countryProfileCandidateSchema, countryProfileReviewSchema } from "./country-profile-schema";
import { indicatorCandidateSchema, parseIndicatorCsv } from "./country-indicator-schema";
import { COUNTRY_TOPICS, countryProfileJson, countryTopic, countryTopicMarkdown, countryTopicSources } from "./country-profiles";
import { countryIndicators, indicatorDisplay, countryIndicatorsMarkdown } from "./country-indicators";
import { CITIZENSHIP_ACQUISITION_ROUTES } from "../data/citizenship-acquisition";
import { markdownPathFor } from "./markdown-negotiation";
import fallback from "../data/fallback.json";
import { coreSitemapUrls } from "./sitemap";
import type { SnapshotManifest } from "./types";

describe("country-profile publication", () => {
  it("publishes only independently reviewed exact candidate bytes", () => {
    for (const [name, artifact, schema] of [
      ["pilot-2026-09-17", topicsArtifact, countryProfileCandidateSchema],
      ["indicators-pilot", indicatorsArtifact, indicatorCandidateSchema],
    ] as const) {
      const raw = readFileSync(`research/country-profiles/${name}.candidate.json`, "utf8");
      const candidate = schema.parse(JSON.parse(raw));
      const review = countryProfileReviewSchema.parse(JSON.parse(readFileSync(`research/country-profiles/${name}.review.json`, "utf8")));
      expect(review.reviewer).not.toBe(candidate.researcher);
      expect(review.candidateSha256).toBe(createHash("sha256").update(raw).digest("hex"));
      expect(artifact).toEqual({ ...candidate, review });
      expect(review.recheckBy > review.reviewedAt).toBe(true);
    }
  });

  it("publishes only the bounded 10 citizenship and 3 tax topics", () => {
    expect(COUNTRY_TOPICS.filter((topic) => topic.topic === "citizenship").map((topic) => topic.code).sort())
      .toEqual(["AE", "CA", "DE", "FR", "HK", "IE", "IN", "PT", "SG", "US"]);
    expect(COUNTRY_TOPICS.filter((topic) => topic.topic === "taxes").map((topic) => topic.code).sort()).toEqual(["GB", "SG", "US"]);
    expect(countryTopic("GB", "citizenship")).toBeUndefined();
    expect(countryTopic("SG", "living")).toBeUndefined();
    const missing = countryProfileJson("AF", "afghanistan");
    expect(missing.topics).toEqual([]);
    expect(missing.coverage).toEqual({ citizenship: "not_collected", taxes: "not_collected" });
    expect(missing.indicators.coverage).toBe("not_collected");
  });

  it("keeps scoped requirements and citations identical in topic JSON and Markdown", () => {
    const urls = coreSitemapUrls(fallback.manifest as SnapshotManifest).map((entry) => entry.loc);
    for (const topic of COUNTRY_TOPICS) {
      const passport = fallback.manifest.passports.find((entry) => entry.code === topic.code)!;
      const markdown = countryTopicMarkdown(topic, passport.slug);
      const json = countryProfileJson(topic.code, passport.slug).topics.find((entry) => entry.topic === topic.topic)!;
      expect(`${topic.title} | MultiPass Rank`.length).toBeLessThanOrEqual(70);
      expect(json.facts).toEqual(topic.facts);
      expect(markdown).toContain(topic.scope);
      for (const fact of topic.facts) { expect(markdown).toContain(fact.text); expect(markdown).toContain(fact.locator); }
      for (const source of countryTopicSources(topic)) expect(markdown).toContain(source.url);
      expect(urls).toContain(json.url);
      expect(urls).not.toContain(`${json.url}.md`);
    }
    expect(urls).not.toContain("https://multipassrank.com/passport/singapore/living");
  });

  it("preserves residence bases, exact language frameworks and unresolved values", () => {
    expect(countryTopic("CA", "citizenship")?.facts.find((fact) => fact.id === "residence")?.constraint)
      .toMatchObject({ value: 1095, unit: "days", basis: "physical_presence", withinYears: 5 });
    expect(countryTopic("SG", "citizenship")?.facts.find((fact) => fact.id === "residence")?.constraint?.basis).toBe("permanent_residence");
    expect(countryTopic("FR", "citizenship")?.facts.find((fact) => fact.id === "language")?.language?.level).toBe("B2");
    expect(countryTopic("CA", "citizenship")?.facts.find((fact) => fact.id === "language")?.language?.framework).toBe("CLB/NCLC");
    expect(countryTopic("PT", "citizenship")?.facts.find((fact) => fact.id === "language")?.state).toBe("not_established");
    expect(countryTopic("HK", "citizenship")?.jurisdiction).toContain("Chinese nationality");
    expect(countryTopic("AE", "citizenship")?.scope).toContain("2021 consolidation");
    const candidate = JSON.parse(readFileSync("research/country-profiles/pilot-2026-09-17.candidate.json", "utf8"));
    candidate.topics[0].facts[0].sourceIds = ["nonexistent"];
    expect(countryProfileCandidateSchema.safeParse(candidate).success).toBe(false);
  });

  it("reuses five approved route records without resetting unreviewed legacy dates", () => {
    const migrated = CITIZENSHIP_ACQUISITION_ROUTES.filter((route) => route.structuredRequirements);
    expect(migrated).toHaveLength(5);
    for (const route of migrated) {
      expect(route.structuredRequirements).toEqual(COUNTRY_TOPICS.find((topic) => topic.routeId === route.id)?.facts);
    }
    expect(CITIZENSHIP_ACQUISITION_ROUTES.find((route) => route.id === "italy-descent-2026")?.reviewedAt).toBe("2026-08-30");
  });

  it("negotiates the exact nested topic routes, not arbitrary descendants", () => {
    expect(markdownPathFor("/passport/singapore/citizenship")).toBe("/passport/singapore/citizenship.md");
    expect(markdownPathFor("/passport/singapore/taxes/")).toBe("/passport/singapore/taxes.md");
    expect(markdownPathFor("/passport/singapore/living")).toBeUndefined();
    expect(markdownPathFor("/passport/singapore/taxes.md")).toBeUndefined();
    expect(markdownPathFor("/api/v1/country-profiles/SG")).toBeUndefined();
  });
});

describe("country indicators", () => {
  it("retains actual observation periods, precision, attribution and geography", () => {
    expect(indicatorsArtifact.observations).toHaveLength(22);
    expect(new Set(indicatorsArtifact.observations.map((row) => row.code)).size).toBe(11);
    for (const row of indicatorsArtifact.observations) expect(row.period).toBe(row.metric === "hdi" ? "2023" : "2024");
    const portugal = countryIndicators("PT");
    expect(indicatorDisplay(portugal[0])).toBe("0.890");
    expect(indicatorDisplay(portugal[1])).toBe("82.4");
    expect(portugal[1].value).toBeCloseTo(82.3829268292683);
    expect(countryIndicators("HK")[0].geographicScope).toContain("not mainland China");
    expect(countryIndicators("MO")).toEqual([]);
    expect(countryIndicatorsMarkdown("PT")).toContain("CC BY 3.0 IGO");
    expect(countryIndicatorsMarkdown("PT")).toContain("observation year 2024");
    const candidate = JSON.parse(readFileSync("research/country-profiles/indicators-pilot.candidate.json", "utf8"));
    candidate.observations[0].availability = "not_reported";
    expect(indicatorCandidateSchema.safeParse(candidate).success).toBe(false);
    candidate.observations[0].value = null;
    candidate.observations[0].unavailableReason = "Provider does not report this entity.";
    expect(indicatorCandidateSchema.safeParse(candidate).success).toBe(true);
  });

  it("parses quoted country names, quotes and line breaks without shifting columns", () => {
    expect(parseIndicatorCsv('code,name,value\r\nHKG,"Hong Kong, China (SAR)",0.955\r\n'))
      .toEqual([["code", "name", "value"], ["HKG", "Hong Kong, China (SAR)", "0.955"]]);
    expect(parseIndicatorCsv('a,b\nx,"quote ""value""\nnext"')).toEqual([["a", "b"], ["x", 'quote "value"\nnext']]);
    expect(() => parseIndicatorCsv('a,b\nx,"bad')).toThrow();
    expect(() => parseIndicatorCsv("a,b\nx")).toThrow();
  });
});
