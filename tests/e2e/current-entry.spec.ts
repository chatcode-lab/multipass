import { expect, test } from "@playwright/test";

test("Thailand's adopted visitor partition exposes the correct current stay in every format", async ({ page, request }) => {
  for (const [code, slug, status, suffix, days] of [
    ["NL", "netherlands", "visa_free", "visa-free", 30],
    ["MX", "mexico", "evisa", "evisa", 60],
    ["ET", "ethiopia", "evisa", "evisa", 60],
    ["AZ", "azerbaijan", "visa_on_arrival", "visa-on-arrival", 15],
    ["SC", "seychelles", "visa_free", "visa-free", 15],
    ["TL", "timor-leste", "visa_free", "visa-free", 30],
    ["CL", "chile", "visa_free", "visa-free", 90],
    ["KR", "south-korea", "visa_free", "visa-free", 90],
  ] as const) {
    const response = await request.get(`/api/v1/visa/${code}/TH`);
    expect(response.status()).toBe(200);
    const api = await response.json();
    expect(api).toMatchObject({ status, evidenceLevel: "exact", supportsCurrentStatus: true, reviewedAt: "2026-11-02" });
    expect(api.allowedStays).toHaveLength(1);
    expect(api.allowedStays[0]).toMatchObject({ maxDays: days, basis: "per_entry" });
    const path = `/${slug}-thailand-${suffix}`;
    const markdown = await (await request.get(`${path}.md`)).text();
    const negotiated = await request.get(path, { headers: { Accept: "text/markdown" } });
    expect(negotiated.headers()["content-type"]).toContain("text/markdown");
    expect(await negotiated.text()).toBe(markdown);
    expect(markdown).toContain(api.allowedStays[0].label);
    const policy = api.policies.find((item: { id: string; status: string }) => item.id.startsWith("pass419-thailand-") && item.status === status);
    expect(policy).toBeDefined();
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow,max-image-preview:large");
      await expect(page.locator(".visa-relation-hero .allowed-stay-summary strong")).toHaveText(api.allowedStays[0].label);
      await expect(page.getByRole("heading", { name: policy.title, exact: true })).toHaveCount(1);
      for (const condition of policy.conditions) {
        await expect(page.locator("#official-evidence")).toContainText(condition);
        expect(markdown).toContain(condition);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    }
  }
  for (const [old, current] of [
    ["/mexico-thailand-visa-free", "/mexico-thailand-evisa"],
    ["/azerbaijan-thailand-evisa", "/azerbaijan-thailand-visa-on-arrival"],
    ["/ethiopia-thailand-visa-on-arrival", "/ethiopia-thailand-evisa"],
  ]) {
    const response = await request.get(old, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers().location, "https://multipassrank.com").pathname).toBe(current);
  }
});

test("Taiwan's Anguilla route has one refreshed policy and a stay distinct from visa validity", async ({ page, request }) => {
  const api = await (await request.get("/api/v1/visa/TW/AI")).json();
  expect(api).toMatchObject({ status: "evisa", evidenceLevel: "exact", reviewedAt: "2026-11-02" });
  expect(api.policies).toHaveLength(1);
  expect(api.allowedStays).toEqual([expect.objectContaining({ maxDays: 90, basis: "per_visit" })]);
  const path = "/taiwan-chinese-taipei-anguilla-evisa";
  const old = await request.get("/taiwan-chinese-taipei-anguilla-visa-free", { maxRedirects: 0 });
  expect(old.status()).toBe(308);
  expect(new URL(old.headers().location, "https://multipassrank.com").pathname).toBe(path);
  const markdown = await (await request.get(`${path}.md`)).text();
  expect(await (await request.get(path, { headers: { Accept: "text/markdown" } })).text()).toBe(markdown);
  for (const step of api.policies[0].application.steps) expect(markdown).toContain(step);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(path);
    await expect(page.locator(".visa-relation-hero .allowed-stay-summary strong")).toHaveText("Up to 90 consecutive days per visit");
    await expect(page.locator(".visa-relation-hero .allowed-stay-summary")).toContainText("not the deadline for first use");
    await expect(page.getByRole("heading", { name: api.policies[0].title, exact: true })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  }
});
