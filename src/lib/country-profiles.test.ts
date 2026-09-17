import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import topicsArtifact from "../data/country-profiles.json";
import indicatorsArtifact from "../data/country-indicators.json";
import { countryProfileCandidateSchema, countryProfileReviewSchema } from "./country-profile-schema";
import type { CountryProfileBatch } from "./country-profile-schema";
import { compileCountryProfileBatches } from "./country-profile-catalog";
import expansions from "../data/country-profile-expansions.json";
import cohort from "../../research/country-profiles/top20-cohort-2026-09-17.json";
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
      ["top20-indicators-2026-09-17", indicatorsArtifact, indicatorCandidateSchema],
    ] as const) {
      const raw = readFileSync(`research/country-profiles/${name}.candidate.json`, "utf8");
      const candidate = schema.parse(JSON.parse(raw));
      const review = countryProfileReviewSchema.parse(JSON.parse(readFileSync(`research/country-profiles/${name}.review.json`, "utf8")));
      expect(review.reviewer).not.toBe(candidate.researcher);
      expect(review.candidateSha256).toBe(createHash("sha256").update(raw).digest("hex"));
      expect(artifact).toEqual({ ...candidate, review });
      expect(review.reviewedAt >= candidate.retrievedAt && review.recheckBy > review.reviewedAt).toBe(true);
    }
    for (const batch of expansions as CountryProfileBatch[]) {
      expect(batch.id).toMatch(/^[a-z0-9-]+$/);
      const raw = readFileSync(`research/country-profiles/${batch.id}.candidate.json`, "utf8");
      const candidate = countryProfileCandidateSchema.parse(JSON.parse(raw));
      const review = countryProfileReviewSchema.parse(JSON.parse(readFileSync(`research/country-profiles/${batch.id}.review.json`, "utf8")));
      expect(review.reviewer).not.toBe(candidate.researcher);
      expect(review.candidateSha256).toBe(createHash("sha256").update(raw).digest("hex"));
      expect(batch).toEqual({ ...candidate, review, id: batch.id });
      expect(review.reviewedAt >= candidate.retrievedAt && review.recheckBy > review.reviewedAt).toBe(true);
    }
  });

  it("retains each batch review and rejects duplicate topics or conflicting sources", () => {
    const pilot = topicsArtifact as CountryProfileBatch;
    const extra: CountryProfileBatch = {
      ...pilot, id: "test-expansion", topics: [{ ...pilot.topics[0], code: "GB", topic: "citizenship" }],
      review: { ...pilot.review, reviewedAt: "2026-09-18", candidateSha256: "a".repeat(64) },
    };
    const catalog = compileCountryProfileBatches([pilot, extra]);
    expect(catalog.topics[0].review.reviewedAt).toBe("2026-09-17");
    expect(catalog.topics.at(-1)?.review.reviewedAt).toBe("2026-09-18");
    expect(() => compileCountryProfileBatches([pilot, pilot])).toThrow("Duplicate country topic");
    expect(() => compileCountryProfileBatches([pilot, { ...extra, sources: [{ ...pilot.sources[0], url: "https://example.gov/changed" }] }])).toThrow("Conflicting country-profile source ID");
    expect(countryProfileJson("AF", "afghanistan").review).toBeNull();
    expect(countryProfileJson("SG", "singapore").topics.every((topic) => topic.review.candidateSha256)).toBe(true);
  });

  it("retains the pilot and publishes only approved expansion topics", () => {
    expect(topicsArtifact.topics.filter((topic) => topic.topic === "citizenship").map((topic) => topic.code).sort())
      .toEqual(["AE", "CA", "DE", "FR", "HK", "IE", "IN", "PT", "SG", "US"]);
    expect(topicsArtifact.topics.filter((topic) => topic.topic === "taxes").map((topic) => topic.code).sort()).toEqual(["GB", "SG", "US"]);
    const approved = ([topicsArtifact, ...expansions] as CountryProfileBatch[]).flatMap((batch) => batch.topics);
    expect(COUNTRY_TOPICS.map(({ review: _review, ...topic }) => topic)).toEqual(approved);
    for (const topic of topicsArtifact.topics) expect(countryTopic(topic.code, topic.topic)).toMatchObject(topic);
    expect(countryTopic("SG", "living")).toBeUndefined();
    const missing = countryProfileJson("AF", "afghanistan");
    expect(missing.topics).toEqual([]);
    expect(missing.coverage).toEqual({ citizenship: "not_collected", taxes: "not_collected" });
    expect(missing.indicators.coverage).toBe("not_collected");
    expect(missing.indicators.review).toBeNull();
    expect(missing.indicators.observations).toEqual([]);
    expect(countryProfileJson("MC", "monaco").indicators.review).toEqual(indicatorsArtifact.review);
  });

  it("covers both reviewed topics for every tied top-20 passport without dropping India", () => {
    expect(cohort.passports).toHaveLength(47);
    for (const passport of cohort.passports) {
      expect(countryProfileJson(passport.code, passport.slug).topics.map((topic) => topic.topic).sort())
        .toEqual(["citizenship", "taxes"]);
    }
    expect(countryTopic("IN", "citizenship")).toBeDefined();
    expect(COUNTRY_TOPICS.length).toBeGreaterThanOrEqual(95);
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

  it("reuses reviewed route records without resetting unreviewed legacy dates", () => {
    const migrated = CITIZENSHIP_ACQUISITION_ROUTES.filter((route) => route.structuredRequirements);
    expect(migrated.length).toBeGreaterThanOrEqual(6);
    expect(migrated.some((route) => route.id === "spain-residence-2026")).toBe(true);
    for (const route of migrated) {
      const topic = COUNTRY_TOPICS.find((entry) => entry.routeId === route.id)!;
      expect(route.structuredRequirements).toEqual(topic.facts);
      expect(route.reviewedAt).toBe(topic.review.reviewedAt);
    }
    expect(CITIZENSHIP_ACQUISITION_ROUTES.find((route) => route.id === "italy-descent-2026")?.reviewedAt).toBe("2026-08-30");
  });

  it("preserves new residence reforms, split language levels and future commencement", () => {
    const sweden = countryTopic("SE", "citizenship")!;
    expect(sweden.facts.find((fact) => fact.id === "residence"))
      .toMatchObject({ effectiveFrom: "2026-06-06", constraint: { value: 8 } });
    expect(sweden.facts.find((fact) => fact.id === "language-receptive")?.language)
      .toEqual({ framework: "CEFR", level: "B1", skills: ["reading", "listening"] });
    expect(sweden.facts.find((fact) => fact.id === "language-productive")?.language)
      .toEqual({ framework: "CEFR", level: "A2", skills: ["speaking", "writing"] });
    const nzPresence = countryTopic("NZ", "citizenship")?.facts.find((fact) => fact.id === "presence");
    expect(nzPresence?.constraint).toMatchObject({ value: 1350, basis: "physical_presence", withinYears: 5 });
    expect(nzPresence?.text).toContain("240 days in each");
    expect(countryTopic("NZ", "citizenship")?.facts.find((fact) => fact.id === "language")?.language).toBeUndefined();
    expect(countryTopic("IT", "taxes")?.facts.find((fact) => fact.id === "future-consolidation")?.text)
      .toContain("applies from 1 January 2027");
    expect(countryTopic("ES", "citizenship")?.facts.find((fact) => fact.id === "multiple")?.text)
      .toContain("French exception does not reduce the residence period");
  });

  it("keeps statutory minimums, assessment policies and language skills distinct", () => {
    const japan = countryTopic("JP", "citizenship")!;
    expect(japan.facts.find((fact) => fact.id === "residence")?.constraint?.value).toBe(5);
    const policy = japan.facts.find((fact) => fact.id === "integration-period")!;
    expect(policy.effectiveFrom).toBe("2026-04-01");
    expect(policy.text).toContain("ten years");
    expect(policy.text).toContain("not an amendment");
    expect(policy.constraint).toBeUndefined();
    expect(japan.facts.find((fact) => fact.id === "language")?.language).toBeUndefined();
    const swiss = countryTopic("CH", "citizenship")!;
    expect(swiss.facts.find((fact) => fact.id === "language-oral")?.language)
      .toEqual({ framework: "CEFR", level: "B1", skills: ["oral communication"] });
    expect(swiss.facts.find((fact) => fact.id === "language-written")?.language)
      .toEqual({ framework: "CEFR", level: "A2", skills: ["written communication"] });
    const reform = countryTopic("CH", "taxes")?.facts.find((fact) => fact.id === "household-transition");
    expect(reform?.text).toContain("2032");
    expect(reform?.text).toContain("not be treated as a current replacement");
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
    expect(cohort.passports).toHaveLength(47);
    expect(indicatorsArtifact.observations).toHaveLength(96);
    expect([...new Set(indicatorsArtifact.observations.map((row) => row.code))].sort()).toEqual([...cohort.passports.map((row) => row.code), "IN"].sort());
    for (const { code } of [...cohort.passports, { code: "IN" }]) {
      expect(countryIndicators(code).map((row) => row.metric).sort()).toEqual(["hdi", "life_expectancy"]);
    }
    for (const row of indicatorsArtifact.observations.filter((row) => row.availability === "available")) expect(row.period).toBe(row.metric === "hdi" ? "2023" : "2024");
    expect(indicatorsArtifact.observations.filter((row) => row.availability === "available")).toHaveLength(95);
    expect(countryIndicators("MC").find((row) => row.metric === "hdi")).toMatchObject({ value: null, period: null, availability: "not_reported", providerEntityCode: "MCO" });
    expect(countryIndicatorsMarkdown("MC")).toContain("Not reported");
    expect(countryIndicatorsMarkdown("MC")).not.toContain("year null");
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
    candidate.observations[1].period = null;
    expect(indicatorCandidateSchema.safeParse(candidate).success).toBe(false);
  });

  it("parses quoted country names, quotes and line breaks without shifting columns", () => {
    expect(parseIndicatorCsv('code,name,value\r\nHKG,"Hong Kong, China (SAR)",0.955\r\n'))
      .toEqual([["code", "name", "value"], ["HKG", "Hong Kong, China (SAR)", "0.955"]]);
    expect(parseIndicatorCsv('a,b\nx,"quote ""value""\nnext"')).toEqual([["a", "b"], ["x", 'quote "value"\nnext']]);
    expect(() => parseIndicatorCsv('a,b\nx,"bad')).toThrow();
    expect(() => parseIndicatorCsv("a,b\nx")).toThrow();
  });
});
