import { expect, test } from "@playwright/test";
import type { SnapshotManifest } from "../../src/lib/types";

test("regional HTML, Markdown and passport summaries give ties the same rank", async ({ page, request }) => {
  const { manifest } = await (await request.get("/api/v1/manifest")).json() as { manifest: SnapshotManifest };
  const passports = manifest.passports.filter(({ region }) => region === "CARIBBEAN");
  const scores = [...new Set(passports.map(({ mobilityScore }) => mobilityScore))].sort((a, b) => b - a);
  const tied = passports.filter((passport) => passports.some((other) => other.code !== passport.code && other.mobilityScore === passport.mobilityScore));
  expect(tied.length).toBeGreaterThanOrEqual(2);
  await page.goto("/caribbean");
  const markdown = await (await request.get("/caribbean.md")).text();
  for (const passport of tied.slice(0, 2)) {
    const rank = scores.indexOf(passport.mobilityScore) + 1;
    const row = page.locator(`[data-passport-row][data-code="${passport.code.toLowerCase()}"]`);
    expect(await row.locator(".ranking-row__rank").evaluate((element) => element.firstChild?.textContent?.trim())).toBe(`#${rank}`);
    expect(markdown).toContain(`| ${rank} | [${passport.name}]`);
    const detail = await (await request.get(`/passport/${passport.slug}.md`)).text();
    expect(detail).toContain(`**#${rank} among ${passports.length} Caribbean passports**`);
  }
});

test("passport search landing pages expose the list directly on narrow screens", async ({ page, request }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/passport/barbados");
    await expect(page).toHaveTitle(/Barbados Passport Ranking & Visa-Free Countries/);
    const listLink = page.getByRole("link", { name: "View visa-free countries", exact: true });
    await expect(listLink).toHaveAttribute("href", "#passport-access");
    await listLink.click();
    await expect(page.locator("#passport-access")).toBeInViewport();
    await expect(page.getByRole("heading", { name: "Visa-free countries and entry requirements" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  }
  const markdown = await request.get("/passport/singapore", { headers: { Accept: "text/markdown" } });
  expect(markdown.headers()["content-type"]).toContain("text/markdown");
  expect(await markdown.text()).toContain("https://multipassrank.com/singapore-vietnam-visa-free");
});

test("enforcement search intent has an honest, matching HTML and Markdown scope", async ({ page, request }) => {
  await page.goto("/dual-citizenship-countries");
  await expect(page.getByRole("heading", { name: "Dual citizenship: legal rules versus enforcement" })).toBeVisible();
  const scope = await page.locator(".citizenship-enforcement p").innerText();
  expect(scope).toContain("do not have comparable enforcement statistics");
  const markdown = await (await request.get("/dual-citizenship-countries.md")).text();
  expect(markdown).toContain(scope);
});

test("reviewed stay limits retain scope and caveats on narrow relationship pages", async ({ page, request }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [slug, labels] of [
      ["singapore-vietnam-visa-free", ["Up to 30 days per visit"]],
      ["kazakhstan-vietnam-visa-free", ["Up to 30 days per visit", "Kazakhstan: no more than 90 days in each 180-day period"]],
      ["indonesia-bermuda-visa-free", ["Six months or 180 days, whichever is greater, within any 12-month period"]],
    ] as const) {
      await page.goto(`/${slug}`);
      const summary = page.locator(".visa-relation-hero .allowed-stay-summary");
      await expect(summary.locator("strong")).toHaveText([...labels]);
      await expect(summary.getByRole("link", { name: "official conditions below" })).toHaveAttribute("href", "#official-evidence");
      if (slug.startsWith("indonesia")) await expect(summary).toContainText("operational advisory");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
      const markdown = await (await request.get(`/${slug}.md`)).text();
      for (const label of labels) expect(markdown).toContain(label);
      expect(markdown.indexOf("## Allowed stay")).toBeLessThan(markdown.indexOf("## Evidence timeline"));
      if (slug.startsWith("indonesia")) expect(markdown).toContain("operational advisory");
    }
  }
});

test("Vietnam unilateral waivers expose corrected re-entry conditions in every format", async ({ page, request }) => {
  for (const [code, slug, label, end] of [
    ["GB", "united-kingdom", "45 days from the date of entry", "2028-03-14"],
    ["BE", "belgium", "45 days from the date of entry for tourism", "2028-08-14"],
  ]) {
    const api = await request.get(`/api/v1/visa/${code}/VN`);
    expect(api.status()).toBe(200);
    const evidence = await api.json();
    expect(evidence).toMatchObject({ status: "visa_free", evidenceLevel: "exact", supportsCurrentStatus: true, reviewedAt: "2026-09-29" });
    expect(evidence.allowedStays).toHaveLength(1);
    expect(evidence.allowedStays[0]).toMatchObject({ label, maxDays: 45, basis: "per_entry" });
    const policy = evidence.policies.find((item: { id: string }) => item.id.startsWith("pass417-"));
    expect(policy.effectiveTo).toBe(end);
    expect(policy.conditions.join(" ")).not.toContain("at least 30 days outside");

    const path = `/${slug}-vietnam-visa-free`;
    const markdown = await (await request.get(`${path}.md`)).text();
    const negotiated = await request.get(path, { headers: { Accept: "text/markdown" } });
    expect(negotiated.headers()["content-type"]).toContain("text/markdown");
    expect(await negotiated.text()).toBe(markdown);
    expect(markdown).toContain(label);
    expect(markdown).not.toContain("at least 30 days outside");

    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow,max-image-preview:large");
      await expect(page.locator(".visa-relation-hero .allowed-stay-summary strong")).toHaveText(label);
      const timeline = page.locator("#official-evidence");
      await expect(timeline).not.toContainText("at least 30 days outside");
      for (const condition of policy.conditions) {
        await expect(timeline).toContainText(condition);
        expect(markdown).toContain(condition);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    }
  }
  await page.goto("/destination/vietnam");
  await expect(page.locator(".evidence-timeline")).not.toContainText("at least 30 days outside");
  await expect(page.getByRole("heading", { name: "Vietnam: Resolution 44 twelve-country 45-day waiver", exact: true })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Vietnam: Resolution 229 twelve-country 45-day tourism waiver", exact: true })).toHaveCount(1);
});

test("changed Bermuda categories redirect and appear only under current canonical sitemap URLs", async ({ request }) => {
  const paths = [
    ["botswana", "visa-free", "visa", "africa"],
    ["nauru", "visa-free", "visa", "oceania"],
    ["nicaragua", "visa-free", "visa", "americas"],
    ["palestinian-territory", "visa-free", "visa", "middle-east"],
    ["st-lucia", "visa-free", "visa", "caribbean"],
    ["indonesia", "visa", "visa-free", "asia"],
    ["taiwan-chinese-taipei", "visa", "visa-free", "asia"],
  ];
  const sitemaps = new Map<string, string>();
  for (const [passport, before, after, region] of paths) {
    const oldPath = `/${passport}-bermuda-${before}`;
    const newPath = `/${passport}-bermuda-${after}`;
    const response = await request.get(oldPath, { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(new URL(response.headers().location, "https://multipassrank.com").pathname).toBe(newPath);
    const canonical = await request.get(newPath);
    expect(canonical.status()).toBe(200);
    expect(await canonical.text()).toContain(`href="https://multipassrank.com${newPath}"`);
    if (!sitemaps.has(region)) sitemaps.set(region, await (await request.get(`/sitemaps/relationships-${region}.xml`)).text());
    expect(sitemaps.get(region)).toContain(`<loc>https://multipassrank.com${newPath}</loc>`);
    expect(sitemaps.get(region)).not.toContain(`<loc>https://multipassrank.com${oldPath}</loc>`);
  }
});
