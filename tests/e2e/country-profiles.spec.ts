import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("all pilot topics have matching HTML, Markdown, API, canonical and sitemap content", async ({ request }) => {
  const sitemap = await (await request.get("/sitemaps/core.xml")).text();
  let topicCount = 0;
  for (const code of ["PT", "DE", "FR", "IE", "CA", "US", "SG", "AE", "HK", "IN", "GB"]) {
    const api = await request.get(`/api/v1/country-profiles/${code}`);
    expect(api.ok()).toBe(true);
    const profile = await api.json();
    expect(profile.indicators.observations).toHaveLength(2);
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
      expect(body).toContain('pa-WucFieMfo1ohS1GhviZuL.js');
      expect(sitemap).toContain(`<loc>${topic.url}</loc>`);
      const md = await request.get(`${path}.md`);
      const negotiated = await request.get(path, { headers: { Accept: "text/markdown" } });
      expect(negotiated.headers()["content-type"]).toContain("text/markdown");
      expect(negotiated.headers().vary.toLowerCase()).toContain("accept");
      expect(negotiated.headers().link).toContain(`${topic.url}>; rel="canonical"`);
      expect(await negotiated.text()).toBe(await md.text());
      const markdown = await md.text();
      for (const fact of topic.facts) expect(markdown).toContain(fact.text);
    }
  }
  expect(topicCount).toBe(13);
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
  for (const path of ["/passport/afghanistan/taxes", "/passport/singapore/living", "/passport/nonesuch/citizenship", "/passport/united-kingdom/citizenship.md"]) {
    expect((await request.get(path)).status()).toBe(404);
  }
  const alias = await request.get("/passport/usa/taxes", { maxRedirects: 0 });
  expect(alias.status()).toBe(308);
  expect(alias.headers().location).toBe("/passport/united-states/taxes");
  const mdAlias = await request.get("/passport/usa/taxes.md", { maxRedirects: 0 });
  expect(mdAlias.status()).toBe(308);
  expect(mdAlias.headers().location).toBe("/passport/united-states/taxes.md");
  const uncollected = await (await request.get("/api/v1/country-profiles/AF")).json();
  expect(uncollected.topics).toEqual([]);
  expect(uncollected.coverage.citizenship).toBe("not_collected");
});

test("country pages remain readable and source-linked at narrow mobile widths", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ["/passport/singapore/citizenship", "/passport/united-states/taxes", "/passport/hong-kong-sar-china/citizenship"]) {
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
});
