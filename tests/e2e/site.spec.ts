import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage renders a searchable passport ranking", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Passport ranks");
  await expect(page.getByRole("list", { name: "Global passport ranking" })).toBeVisible();
  await expect(page.locator(".site-header .brand > span:last-child")).toBeVisible();
  const pageWidth = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(pageWidth.document - pageWidth.viewport).toBeLessThanOrEqual(1);
  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 620) {
    await expect(page.locator(".site-header .brand em")).toHaveCSS("display", "block");
    const regionFilter = await page.getByLabel("Filter ranking by region").boundingBox();
    const resultCount = await page.locator("[data-ranking-count]").boundingBox();
    expect(regionFilter).not.toBeNull();
    expect(resultCount).not.toBeNull();
    const regionCenter = regionFilter!.y + regionFilter!.height / 2;
    const countCenter = resultCount!.y + resultCount!.height / 2;
    expect(Math.abs(regionCenter - countCenter)).toBeLessThanOrEqual(1);
  }
  await page.getByPlaceholder("Search passports").fill("Brazil");
  await expect(page.getByRole("listitem").filter({ hasText: "Brazil" })).toBeVisible();
});

test("homepage calculator works without a framework-hydrated island", async ({ page }) => {
  await page.goto("/");
  const builder = page.locator("[data-passport-builder]");
  await expect(builder.locator("astro-island")).toHaveCount(0);
  const input = builder.getByRole("combobox");
  await input.fill("Portugal");
  await builder.getByRole("option", { name: /Portugal/ }).click();
  await input.fill("Brazil");
  await builder.getByRole("option", { name: /Brazil/ }).click();
  await expect(builder.locator("input[name='set']")).toHaveValue("PT,BR");
  await expect(builder.getByRole("button", { name: "See access" })).toBeEnabled();
});

test("a shared comparison renders scenarios and difference controls", async ({ page }) => {
  await page.goto("/compare?set=BR&set=US");
  await expect(page.getByText("Brazil", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("United States", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Differences only")).toBeVisible();
  await expect(page.locator("table.comparison-table")).toBeVisible();
  await page.getByLabel("Filter comparison destinations by region").selectOption("EUROPE");
  await expect(page.locator(".comparison-table__region")).toHaveCount(1);
  await expect(page.locator(".comparison-table__region")).toContainText("Europe");
  await expect(page.getByRole("heading", { name: "What the labels mean" })).toBeVisible();
  await expect(page.getByRole("link", { name: "eVisa vs ETA explained" })).toBeVisible();
  const tableViewport = await page.locator(".comparison-table-wrap").evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(tableViewport.scrollHeight - tableViewport.clientHeight).toBeLessThanOrEqual(1);
  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 620) {
    expect(tableViewport.scrollWidth - tableViewport.clientWidth).toBeLessThanOrEqual(1);
    const firstResult = await page.locator(".comparison-table tbody tr:not(.comparison-table__region) td").first().boundingBox();
    const copyLink = await page.getByRole("button", { name: "Copy link" }).boundingBox();
    expect(firstResult).not.toBeNull();
    expect(copyLink).not.toBeNull();
    expect(firstResult!.x).toBeGreaterThanOrEqual(0);
    expect(firstResult!.x + firstResult!.width).toBeLessThanOrEqual(viewport.width);
    expect(copyLink!.x + copyLink!.width).toBeLessThanOrEqual(viewport.width);
  }
});

test("country access can be narrowed to one destination region", async ({ page }) => {
  await page.goto("/passport/spain");
  const statusFilter = page.getByLabel("Filter by access type");
  const regionFilter = page.getByLabel("Filter destinations by region");
  await regionFilter.scrollIntoViewIfNeeded();
  await expect.poll(() => regionFilter.evaluate((element) => {
    const island = element.closest("astro-island");
    return Boolean(island && !island.hasAttribute("ssr"));
  })).toBe(true);
  await expect(statusFilter.locator("option", { hasText: "Easy access" })).toHaveCount(1);
  await expect(statusFilter.locator("option", { hasText: "Citizenship" })).toHaveCount(0);
  await expect(statusFilter.locator("option", { hasText: "Unknown" })).toHaveCount(0);
  await statusFilter.selectOption("easy");
  await expect(page.locator(".access-row")).not.toHaveCount(0);
  await expect(page.locator(".access-row .status-pill--citizenship, .access-row .status-pill--visa_required, .access-row .status-pill--unknown")).toHaveCount(0);
  await regionFilter.selectOption("EUROPE");
  await expect(page.locator(".region-group")).toHaveCount(1);
  await expect(page.locator(".region-group").getByRole("heading")).toHaveText("Europe");
  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 620) {
    const controls = await page.locator(".access-list__filters").boundingBox();
    expect(controls).not.toBeNull();
    expect(controls!.x).toBeGreaterThanOrEqual(0);
    expect(controls!.x + controls!.width).toBeLessThanOrEqual(viewport.width);
    const pageWidth = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(pageWidth.document - pageWidth.viewport).toBeLessThanOrEqual(1);
  }
});

test("ranking rows support a five-passport comparison selection mode", async ({ page }) => {
  await page.goto("/");
  const explorer = page.locator("[data-ranking-explorer]");
  const selectPassport = async (name: string) => {
    const row = explorer.locator("[data-passport-row]").filter({ hasText: name }).first();
    const button = row.locator("[data-ranking-select]");
    await expect(button).toHaveAttribute("aria-label", `Add ${name} to comparison`);
    const viewport = page.viewportSize();
    if (viewport && viewport.width > 620) await row.hover();
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  };

  await selectPassport("Singapore");
  await expect(explorer.locator("[data-ranking-compare-bar]")).toBeVisible();
  await expect(explorer.getByRole("button", { name: "Select one more" })).toBeDisabled();
  await explorer.getByRole("button", { name: "Cancel" }).click();
  await expect(explorer.locator("[data-ranking-compare-bar]")).toBeHidden();

  for (const name of ["Singapore", "Japan", "South Korea", "United Arab Emirates", "Denmark"]) {
    await selectPassport(name);
  }
  await expect(explorer.locator("[data-ranking-selected-count]")).toHaveText("5");
  await expect(explorer.getByRole("button", { name: "Add Brazil to comparison" })).toBeDisabled();
  await explorer.getByRole("button", { name: "Compare 5" }).click();
  await expect(page).toHaveURL(/\/compare\?set=SG&set=JP&set=KR&set=AE&set=DK$/);
  await expect(page.locator(".scenario-card")).toHaveCount(5);
});

test("combined passport artwork stays clear of its result text", async ({ page }) => {
  await page.goto("/compare?set=SE,JP,AE,KR&set=DK,SE");
  const card = page.locator(".scenario-card").first();
  const cover = await card.locator(".passport-stack").boundingBox();
  const content = await card.locator(".scenario-card__content").boundingBox();
  expect(cover).not.toBeNull();
  expect(content).not.toBeNull();
  expect(cover!.x + cover!.width).toBeLessThan(content!.x);
});

test("long passport names wrap inside their covers", async ({ page }) => {
  await page.goto("/compare?set=PT,IL,RU&set=US");
  const label = page.locator(".scenario-card").first().locator(".passport-cover__country").filter({ hasText: "Russian Federation" });
  await expect(label).toHaveText("Russian Federation");
  const layout = await label.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    whiteSpace: getComputedStyle(element).whiteSpace,
  }));
  expect(layout.whiteSpace).toBe("normal");
  expect(layout.scrollHeight).toBeLessThanOrEqual(layout.clientHeight);
});

test("country maps show the correct region and a visible location marker", async ({ page }) => {
  await page.goto("/passport/germany");
  await expect(page.locator(".region-map svg")).toHaveAttribute("viewBox", "400 42 233 110");
  await expect(page.locator(".region-map__country")).toBeVisible();
  await expect(page.locator(".region-map__marker")).toBeVisible();
  await expect(page.locator(".region-map figcaption")).toContainText("Germany in Europe");

  await page.goto("/passport/singapore");
  await expect(page.locator(".region-map svg")).toHaveAttribute("viewBox", "480 70 435 205");
  await expect(page.locator(".region-map__marker")).toHaveAttribute("cx", "757.1");
  await expect(page.locator(".region-map figcaption")).toContainText("Singapore in Asia");
});

test("destination and Markdown directories are directly accessible", async ({ page, request }) => {
  await page.goto("/destinations");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Every destination");
  const frenchWestIndies = page.locator("li").filter({ hasText: "French West Indies" });
  await expect(frenchWestIndies.locator(".country-flag")).toHaveText("🇫🇷");

  const markdown = await request.get("/passport/singapore.md");
  expect(markdown.ok()).toBe(true);
  expect(markdown.headers()["content-type"]).toContain("text/markdown");
  expect(await markdown.text()).toContain("# Singapore passport rank and visa access");
});

test("regional, language, and indexed comparison pages render useful content", async ({ page, request }) => {
  await page.goto("/europe");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("European passport ranking");
  await expect(page.getByRole("list", { name: "European passport ranking" })).toBeVisible();

  for (const [slug, heading] of [
    ["arabic", "Arabic-speaking country passports"],
    ["french", "French-speaking country passports"],
    ["portuguese", "Portuguese-speaking country passports"],
  ]) {
    await page.goto(`/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.getByRole("list", { name: heading })).toBeVisible();
    const markdown = await request.get(`/${slug}.md`);
    expect(markdown.ok()).toBe(true);
    expect(await markdown.text()).toContain(`# ${heading}`);
  }

  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("<loc>https://multipassrank.com/arabic</loc>");
  expect(await sitemap.text()).toContain("<loc>https://multipassrank.com/french</loc>");
  expect(await sitemap.text()).toContain("<loc>https://multipassrank.com/portuguese</loc>");

  await page.goto("/compare/us-vs-uk");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("US vs UK");
  await expect(page.locator("table.comparison-table")).toBeVisible();
  await expect(page).toHaveURL(/\/united-states-vs-united-kingdom-passport$/);
});

test("curated query comparisons become readable URLs with Markdown alternatives", async ({ page, request }) => {
  await page.goto("/compare?set=US&set=PT");
  await expect(page).toHaveURL(/\/portugal-vs-united-states-passport$/);
  await expect(page.locator("table.comparison-table")).toBeVisible();

  const markdown = await request.get("/portugal-vs-united-states-passport.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("# Portugal vs United States passport comparison");
});

test("AI instructions expose URL, Markdown, and API conventions", async ({ page, request }) => {
  await page.goto("/ai");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AI companion");
  await expect(page.getByText("POST /api/v1/compare", { exact: true })).toBeVisible();

  const llms = await request.get("/llms.txt");
  expect(llms.ok()).toBe(true);
  expect(llms.headers()["content-type"]).toContain("text/plain");
  expect(await llms.text()).toContain("Build comparison URLs");
});

test("eVisa and ETA guide is indexable and available as Markdown", async ({ page, request }) => {
  await page.goto("/evisa-vs-eta");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("eVisa vs ETA: what is the difference?");
  await expect(page.getByRole("heading", { name: "How MultiPass Rank treats them" })).toBeVisible();

  const markdown = await request.get("/evisa-vs-eta.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("# eVisa vs ETA: what is the difference?");

  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("<loc>https://multipassrank.com/evisa-vs-eta</loc>");
});

test("key pages have no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("unknown passports return a real 404", async ({ page }) => {
  const response = await page.goto("/passport/not-a-country");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("That route went somewhere else.")).toBeVisible();
});
