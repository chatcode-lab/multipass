import { expect, test } from "@playwright/test";

test("Tunisia's Ireland visitor guidance distinguishes a fee waiver from admission", async ({ page, request }) => {
  const path = "/tunisia-ireland-visa";
  const api = await (await request.get("/api/v1/visa/TN/IE")).json();
  expect(api).toMatchObject({ status: "visa_required", evidenceLevel: "exact", reviewedAt: "2026-11-24" });
  expect(api.allowedStays).toEqual([expect.objectContaining({ maxDays: 90, basis: "per_visit" })]);
  const step = "If applying from Tunisia, the Honorary Consulate of Ireland in Tunisia";
  await page.goto(path);
  await expect(page.locator(".application-guide")).toContainText(step);
  await expect(page.locator(".visa-relation-hero .allowed-stay-summary")).toContainText("border officer may grant less");
  expect(await (await request.get(path + ".md")).text()).toContain(step);
  const other = await (await request.get("/api/v1/visa/DZ/IE")).json();
  expect(other.policies.map((p: { id: string }) => p.id)).toContain("ireland-listed-ordinary-passport-visa-required");
  expect(JSON.stringify(other)).not.toContain("pass421-ie-");
});

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

test("Solomon Islands shows the verified advance electronic grant without an assumed stay", async ({ page, request }) => {
  for (const [code, slug] of [["CO", "colombia"], ["PS", "palestinian-territory"]]) {
    const path = `/${slug}-solomon-islands-evisa`;
    const apiResponse = await request.get(`/api/v1/visa/${code}/SB`);
    expect(apiResponse.ok()).toBe(true);
    const api = await apiResponse.json();
    expect(api).toMatchObject({ status: "evisa", evidenceLevel: "exact", reviewedAt: "2026-11-18", allowedStays: [] });
    const old = await request.get(`/${slug}-solomon-islands-visa`, { maxRedirects: 0 });
    expect(old.status()).toBe(308);
    expect(new URL(old.headers().location, "https://multipassrank.com").pathname).toBe(path);

    const markdown = await request.get(`${path}.md`);
    expect(markdown.ok()).toBe(true);
    const guide = api.policies.find((item: { id: string }) => item.id === "pass420-sb-colombia-palestine-tourist-evisa").application;
    for (const step of guide.steps) expect(await markdown.text()).toContain(step);
    await page.goto(path);
    await expect(page.locator(".application-guide a")).toHaveAttribute("href", guide.url);
    await expect(page.locator(".visa-relation-hero .allowed-stay-summary")).toHaveCount(0);
  }
});

test("Colombia–Israel distinguishes the mandatory ETA from the reverse visa waiver", async ({ page, request }) => {
  for (const [pair, status, old, current, date, stay] of [
    ["CO/IL", "eta", "/colombia-israel-visa-free", "/colombia-israel-eta", "2026-09-01", "Up to 90 days within 12 months, subject to admission"],
    ["IL/CO", "visa_free", "/israel-colombia-evisa", "/israel-colombia-visa-free", "2026-09-04", "Short stay under 90 days; extension only if permitted"],
  ] as const) {
    const api = await request.get(`/api/v1/visa/${pair}`);
    expect(api.ok()).toBe(true);
    expect(await api.json()).toMatchObject({
      status,
      evidenceLevel: "exact",
      reviewedAt: "2026-11-18",
      policies: expect.arrayContaining([expect.objectContaining({ status, effectiveFrom: date })]),
      allowedStays: [expect.objectContaining({ label: stay })],
    });
    const redirect = await request.get(old, { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(new URL(redirect.headers().location, "https://multipassrank.com").pathname).toBe(current);
    const explicit = await request.get(`${current}.md`);
    const negotiated = await request.get(current, { headers: { Accept: "text/markdown" } });
    expect(negotiated.headers()["content-type"]).toContain("text/markdown");
    expect(await negotiated.text()).toBe(await explicit.text());
    expect(await explicit.text()).toContain(stay);
    await page.goto(current);
    await expect(page.locator(".visa-relation-hero .allowed-stay-summary strong")).toHaveText(stay);
  }
});
