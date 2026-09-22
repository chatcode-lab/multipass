import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import cohort from "../../research/country-profiles/top20-cohort-2026-09-17.json" with { type: "json" };
import nextCohort from "../../research/country-profiles/ranks21-40-cohort-2026-09-22.json" with { type: "json" };
import pilot from "../../src/data/country-profiles.json" with { type: "json" };
import expansions from "../../src/data/country-profile-expansions.json" with { type: "json" };
import type { CountryProfileBatch } from "../../src/lib/country-profile-schema";
import { compileCountryProfileBatches } from "../../src/lib/country-profile-catalog";

const approvedTopics = compileCountryProfileBatches([pilot, ...expansions] as CountryProfileBatch[]).topics;
const passports = [...cohort.passports, ...nextCohort.passports];

test("all approved topics and top-40 indicators have matching public representations", async ({ request }) => {
  test.setTimeout(120_000);
  const sitemap = await (await request.get("/sitemaps/core.xml")).text();
  let topicCount = 0;
  for (const code of [...passports.map((passport) => passport.code), "IN"]) {
    const api = await request.get(`/api/v1/country-profiles/${code}`);
    expect(api.ok()).toBe(true);
    const profile = await api.json();
    expect(profile.indicators.observations).toHaveLength(2);
    expect(profile.topics.map((topic: { topic: string }) => topic.topic).sort()).toEqual(approvedTopics.filter((topic) => topic.code === code).map((topic) => topic.topic).sort());
    if (["MC", "MO", "TW", "VA"].includes(code)) expect(profile.indicators.observations.find((row: { metric: string }) => row.metric === "hdi")).toMatchObject({ value: null, period: null, availability: "not_reported" });
    if (["TW", "VA"].includes(code)) expect(profile.indicators.observations.find((row: { metric: string }) => row.metric === "life_expectancy")).toMatchObject({ value: null, period: null, availability: "not_reported" });
    for (const topic of profile.topics) {
      topicCount += 1;
      const path = new URL(topic.url).pathname;
      const html = await request.get(path);
      const body = await html.text();
      expect(html.ok()).toBe(true);
      expect(body).toContain(`rel="canonical" href="${topic.url}"`);
      expect(body).not.toContain('content="noindex');
      expect(body).toContain(`href="${topic.url}.md"`);
      expect(body).toContain("BreadcrumbList");
      expect(body).toContain(`Sources reviewed <time datetime="${topic.review.reviewedAt}"`);
      expect(body).toContain('pa-WucFieMfo1ohS1GhviZuL.js');
      expect(sitemap).toContain(`<loc>${topic.url}</loc>`);
      const md = await request.get(`${path}.md`);
      const negotiated = await request.get(path, { headers: { Accept: "text/markdown" } });
      expect(negotiated.headers()["content-type"]).toContain("text/markdown");
      expect(negotiated.headers().vary.toLowerCase()).toContain("accept");
      expect(negotiated.headers().link).toContain(`${topic.url}>; rel="canonical"`);
      expect(await negotiated.text()).toBe(await md.text());
      const markdown = await md.text();
      expect(markdown).toContain(topic.scope);
      for (const limit of topic.limits) expect(markdown).toContain(limit);
      for (const fact of topic.facts) {
        expect(markdown).toContain(fact.text);
        expect(markdown).toContain(fact.locator);
      }
    }
  }
  expect(topicCount).toBe(approvedTopics.length);
  const guideHtml = await (await request.get("/citizenship-by-descent")).text();
  const guideMarkdown = await (await request.get("/citizenship-by-descent.md")).text();
  const routes = await (await request.get("/api/v1/citizenship-acquisition")).json();
  for (const route of routes.routes.filter((entry: { scope?: string }) => entry.scope)) {
    expect(guideMarkdown).toContain(route.scope);
  }
  expect(guideHtml).toContain("Selected requirements, not a complete eligibility checklist.");
  expect(guideMarkdown).toContain("Selected requirements, not a complete eligibility checklist.");
});

test("unsupported topics are real 404s and country aliases retain the topic", async ({ request }) => {
  for (const path of ["/passport/afghanistan/taxes", "/passport/singapore/living", "/passport/nonesuch/citizenship", "/passport/india/taxes.md"]) {
    expect((await request.get(path)).status()).toBe(404);
  }
  const alias = await request.get("/passport/usa/taxes", { maxRedirects: 0 });
  expect(alias.status()).toBe(308);
  expect(alias.headers().location).toBe("/passport/united-states/taxes");
  const mdAlias = await request.get("/passport/usa/taxes.md", { maxRedirects: 0 });
  expect(mdAlias.status()).toBe(308);
  expect(mdAlias.headers().location).toBe("/passport/united-states/taxes.md");
  const taiwanAlias = await request.get("/passport/taiwan/citizenship", { maxRedirects: 0 });
  expect(taiwanAlias.status()).toBe(308);
  expect(taiwanAlias.headers().location).toBe("/passport/taiwan-chinese-taipei/citizenship");
  const uncollected = await (await request.get("/api/v1/country-profiles/AF")).json();
  expect(uncollected.topics).toEqual([]);
  expect(uncollected.coverage.citizenship).toBe("not_collected");
  expect(uncollected.review).toBeNull();
  expect(uncollected.indicators).toMatchObject({ coverage: "not_collected", review: null, observations: [] });
});

test("missing Monaco HDI is honest and parent pages expose reviewed topics", async ({ page, request }) => {
  await page.goto("/passport/monaco");
  await expect(page.locator(".country-indicators")).toContainText("Not reported");
  await expect(page.locator(".country-indicators")).not.toContainText("null");
  const markdown = await (await request.get("/passport/monaco.md")).text();
  expect(markdown).toContain("Not reported");
  expect(markdown).not.toContain("year null");
  for (const passport of passports) {
    const topics = approvedTopics.filter((topic) => topic.code === passport.code);
    if (!topics.length) continue;
    const body = await (await request.get(`/passport/${passport.slug}`)).text();
    for (const topic of topics) expect(body).toContain(`href="/passport/${passport.slug}/${topic.topic}"`);
  }
});

test("country pages remain readable and source-linked at narrow mobile widths", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ["/passport/singapore/citizenship", "/passport/united-states/taxes", "/passport/hong-kong-sar-china/citizenship", "/passport/st-vincent-and-the-grenadines/citizenship", "/passport/trinidad-and-tobago/taxes", "/passport/vatican-city/taxes"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator(".topic-citations a").first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
      const boxes = await page.locator(".topic-fact").evaluateAll((elements) => elements.map((el) => ({ scroll: el.scrollWidth, client: el.clientWidth })));
      expect(boxes.every((box) => box.scroll <= box.client + 1)).toBe(true);
    }
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto("/passport/singapore");
  await expect(page.locator('.passport-topic-links a[href="/passport/singapore/citizenship"]')).toBeVisible();
  await page.locator('a[href="#country-indicators-heading"]').click();
  await expect(page.getByRole("heading", { name: "Living in this country" })).toBeVisible();
  await expect(page.locator(".country-indicators")).toContainText("0.946");
  await expect(page.locator(".country-indicators")).toContainText("2024");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  for (const slug of ["vatican-city", "taiwan-chinese-taipei"]) {
    await page.goto(`/passport/${slug}`);
    await expect(page.locator(".country-indicators__value strong")).toHaveText(["Not reported", "Not reported"]);
    await expect(page.locator(".country-indicators")).not.toContainText("null");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  }
});
