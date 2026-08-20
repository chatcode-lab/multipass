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
  await expect(page.locator("[data-unranked-section]")).toContainText("American Samoa");
  await page.getByPlaceholder("Search passports").fill("Brazil");
  await expect(page.getByRole("listitem").filter({ hasText: "Brazil" })).toBeVisible();
  if (viewport && viewport.width <= 620) {
    await page.getByPlaceholder("Search passports").fill("The Gambia");
    const name = page.locator("[data-passport-row]:not([hidden]) .ranking-row__passport > span:last-child > strong");
    await expect(name).toHaveText("The Gambia");
    const nameLayout = await name.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      whiteSpace: getComputedStyle(element).whiteSpace,
    }));
    expect(nameLayout.whiteSpace).toBe("normal");
    expect(nameLayout.scrollWidth).toBeLessThanOrEqual(nameLayout.clientWidth);
  }
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
  await expect(builder).toHaveAttribute("action", "/rank");
  await expect(builder.getByRole("button", { name: "See combined rank" })).toBeEnabled();
});

test("a shared comparison renders scenarios and difference controls", async ({ page }) => {
  await page.goto("/compare?set=BR&set=US");
  await expect(page.getByText("Brazil", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("United States", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Differences only")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Differences only" })).toBeChecked();
  await expect(page.locator("table.comparison-table")).toBeVisible();
  await page.getByLabel("Filter comparison destinations by region").selectOption("EUROPE");
  await expect(page.locator(".comparison-table__region")).toHaveCount(1);
  await expect(page.locator(".comparison-table__region")).toContainText("Europe");
  await expect(page.locator("td.comparison-cell--best").first()).toBeVisible();
  await expect(page.locator("td.comparison-cell--worst").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "View ranking" })).toHaveAttribute("href", "/rank?set=BR&set=US");
  await expect(page.locator(".comparison-table .status-pill small")).toHaveCount(0);
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
    const differences = await page.getByText("Differences only", { exact: true }).boundingBox();
    const regionFilter = await page.getByLabel("Filter comparison destinations by region").boundingBox();
    const rankingLink = await page.getByRole("link", { name: "View ranking" }).boundingBox();
    expect(firstResult).not.toBeNull();
    expect(copyLink).not.toBeNull();
    expect(differences).not.toBeNull();
    expect(regionFilter).not.toBeNull();
    expect(rankingLink).not.toBeNull();
    expect(firstResult!.x).toBeGreaterThanOrEqual(0);
    expect(firstResult!.x + firstResult!.width).toBeLessThanOrEqual(viewport.width);
    expect(copyLink!.x + copyLink!.width).toBeLessThanOrEqual(viewport.width);
    expect(Math.abs(differences!.y - regionFilter!.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(rankingLink!.y - copyLink!.y)).toBeLessThanOrEqual(2);
  }
});

test("comparison attribution is compact and only shown for a useful subset", async ({ page, request }) => {
  await page.goto("/compare?set=PT,RU,IL&set=SG");
  const israel = page.locator(".comparison-table tbody tr:not(.comparison-table__region)").filter({ hasText: "Israel" });
  const unitedArabEmirates = page.locator(".comparison-table tbody tr:not(.comparison-table__region)").filter({ hasText: "United Arab Emirates" });
  const israelAttribution = israel.locator("td").first().locator(".status-pill small");
  await expect(israelAttribution).toHaveText("IL");
  await expect(israelAttribution).not.toContainText("via");
  await expect(israel.locator("td").first().locator(".status-pill")).toHaveCSS("align-items", "baseline");
  await expect(unitedArabEmirates.locator("td").first().locator(".status-pill small")).toHaveCount(0);

  const markdown = await request.get("/compare.md?set=PT,RU,IL&set=SG");
  expect(markdown.ok()).toBe(true);
  const markdownBody = await markdown.text();
  expect(markdownBody).not.toContain(" via ");
  expect(markdownBody).toContain("Citizenship IL");
});

test("home and visa-free access are equivalent in comparisons", async ({ page }) => {
  await page.goto("/compare?set=US&set=CA");
  const canada = page.locator(".comparison-table tbody tr:not(.comparison-table__region)").filter({ hasText: "Canada" });
  const unitedStates = page.locator(".comparison-table tbody tr:not(.comparison-table__region)").filter({ hasText: "United States" });
  await expect(page.getByRole("checkbox", { name: "Differences only" })).toBeChecked();
  await expect(canada).toBeHidden();
  await expect(unitedStates).toBeHidden();
  await page.getByText("Differences only", { exact: true }).click();
  await expect(canada.locator("td.comparison-cell--best")).toHaveCount(2);
  await expect(unitedStates.locator("td.comparison-cell--best")).toHaveCount(2);
  await page.getByText("Differences only", { exact: true }).click();
  await expect(canada).toBeHidden();
  await expect(unitedStates).toBeHidden();
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
    await expect(button).toHaveAttribute("aria-label", `Select ${name} for passport tools`);
    const viewport = page.viewportSize();
    if (viewport && viewport.width > 620) await row.hover();
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    return { row, button };
  };

  const rwandaRow = explorer.locator("[data-passport-row]").filter({ hasText: "Rwanda" }).first();
  await rwandaRow.scrollIntoViewIfNeeded();
  await expect(rwandaRow.locator("[data-ranking-select]")).toHaveCSS("transform", "none");
  const beforeSelection = await rwandaRow.evaluate((element) => (element as HTMLElement).offsetTop);
  const { button: rwandaButton } = await selectPassport("Rwanda");
  const afterSelection = await rwandaRow.evaluate((element) => (element as HTMLElement).offsetTop);
  expect(afterSelection).toBe(beforeSelection);
  await expect(explorer.locator("[data-ranking-compare-bar]")).toHaveCSS("position", "fixed");
  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 620) {
    const touchTarget = await rwandaButton.boundingBox();
    expect(touchTarget).not.toBeNull();
    expect(touchTarget!.width).toBeGreaterThanOrEqual(44);
    expect(touchTarget!.height).toBeGreaterThanOrEqual(44);
  }
  await expect(explorer.locator("[data-ranking-compare-bar]")).toBeVisible();
  await expect(explorer.getByRole("button", { name: "Compare 1" })).toBeEnabled();
  await expect(explorer.getByRole("button", { name: "Combine 1" })).toBeEnabled();
  const tanzaniaRow = explorer.locator("[data-passport-row]").filter({ hasText: "Tanzania" }).first();
  await tanzaniaRow.locator(".ranking-row__link").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(tanzaniaRow.locator("[data-ranking-select]")).toHaveAttribute("aria-pressed", "true");
  await explorer.getByRole("button", { name: "Cancel" }).click();
  await expect(explorer.locator("[data-ranking-compare-bar]")).toBeHidden();

  for (const name of ["Singapore", "Japan", "South Korea", "United Arab Emirates", "Denmark"]) {
    await selectPassport(name);
  }
  await expect(explorer.locator("[data-ranking-selected-count]")).toHaveText("5");
  await expect(explorer.getByRole("button", { name: "Select Brazil for passport tools" })).toBeDisabled();
  await explorer.getByRole("button", { name: "Compare 5" }).click();
  await expect(page).toHaveURL(/\/compare\?set=SG&set=JP&set=KR&set=AE&set=DK$/);
  await expect(page.locator(".scenario-card")).toHaveCount(5);
});

test("ranking selections can create a combined rank", async ({ page }) => {
  await page.goto("/");
  const explorer = page.locator("[data-ranking-explorer]");
  for (const name of ["Brazil", "Portugal"]) {
    const row = explorer.locator("[data-passport-row]").filter({ hasText: name }).first();
    const viewport = page.viewportSize();
    if (viewport && viewport.width > 620) await row.hover();
    await row.locator("[data-ranking-select]").click();
  }
  await explorer.getByRole("button", { name: "Combine 2" }).click();
  await expect(page).toHaveURL(/\/rank\?set=BR%2CPT$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Brazil + Portugal");
  await expect(page.locator("[data-combination-row]")).toHaveCount(1);
  await expect(page.locator("[data-combination-row]")).toContainText("equivalent");
});

test("custom ranking preserves and reuses passport sets", async ({ page, request }) => {
  await page.goto("/rank?set=US,CA&set=PT");
  await expect(page.locator(".rank-set-summary")).toContainText("United States + Canada");
  await expect(page.locator("[data-combination-row]")).toHaveCount(1);
  await expect(page.locator("[data-passport-row][data-set='PT']")).toHaveClass(/is-featured/);
  await expect(page.getByRole("link", { name: "Compare destination access" })).toHaveAttribute("href", "/compare?set=US%2CCA&set=PT");

  const ranks = await page.locator(".ranking-table__list > li .ranking-row__rank").allTextContents();
  const numericRanks = ranks.map((rank) => Number(rank.match(/#(\d+)/)?.[1]));
  expect(numericRanks).toEqual([...numericRanks].sort((first, second) => first - second));

  const combination = page.locator("[data-combination-row]");
  const combinationHighlight = await combination.locator(".ranking-row").evaluate((element) => {
    const styles = getComputedStyle(element);
    return { backgroundColor: styles.backgroundColor, boxShadow: styles.boxShadow };
  });
  expect(combinationHighlight.backgroundColor).toBe("rgb(234, 215, 203)");
  expect(combinationHighlight.boxShadow).not.toContain("inset");
  const rankingBounds = await page.locator(".ranking-table").boundingBox();
  const highlightBounds = await combination.locator(".ranking-row").boundingBox();
  expect(rankingBounds).not.toBeNull();
  expect(highlightBounds).not.toBeNull();
  expect(highlightBounds!.x).toBeLessThan(rankingBounds!.x);
  expect(highlightBounds!.x + highlightBounds!.width).toBeGreaterThan(rankingBounds!.x + rankingBounds!.width);
  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 620) {
    await expect(combination).toHaveCSS("content-visibility", "visible");
    expect(highlightBounds!.x).toBeLessThanOrEqual(.5);
    expect(highlightBounds!.x + highlightBounds!.width).toBeGreaterThanOrEqual(viewport.width - .5);
    expect(highlightBounds!.height).toBeLessThanOrEqual(85);
    const equivalentLabel = await combination.locator(".ranking-row__rank small").evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(equivalentLabel.scrollWidth).toBeLessThanOrEqual(equivalentLabel.clientWidth);
    await expect(combination.locator(".ranking-row__passport strong")).toHaveCSS("-webkit-line-clamp", "3");
    const pageWidth = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(pageWidth.document - pageWidth.viewport).toBeLessThanOrEqual(1);
  }
  if (viewport && viewport.width > 620) await combination.hover();
  await combination.locator("[data-ranking-select]").click();
  await expect(page.locator("[data-ranking-selected-count]")).toHaveText("2");
  await page.getByRole("button", { name: "Combine 3" }).click();
  await expect(page).toHaveURL(/\/rank\?set=US%2CCA%2CPT$/);

  const markdown = await request.get("/rank.md?set=US,CA&set=PT");
  expect(markdown.ok()).toBe(true);
  const markdownBody = await markdown.text();
  expect(markdownBody).toContain("# Custom passport and combination ranking");
  expect(markdownBody).toContain("Combined set 1");
  expect(markdownBody).toContain("/compare?set=US%2CCA&set=PT");

  await page.goto("/rank?set=PT,RU,IL&set=SG");
  await expect(page.locator(".ranking-table__list > li.is-featured + li.is-featured .ranking-row")).toHaveCSS("border-top-width", "2px");
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
  await expect(page.getByRole("heading", { name: "Not tracked separately" })).toBeVisible();
  await expect(page.locator(".coverage-disclosure--destinations")).toContainText("Guernsey");
  await expect(page.getByRole("link", { name: "Names and codes follow the UN M49 reference." })).toBeVisible();

  const markdown = await request.get("/passport/singapore.md");
  expect(markdown.ok()).toBe(true);
  expect(markdown.headers()["content-type"]).toContain("text/markdown");
  expect(await markdown.text()).toContain("# Singapore passport rank and visa access");

  const destinationMarkdown = await request.get("/destinations.md");
  expect(await destinationMarkdown.text()).toContain("## Not tracked separately");
  expect(await destinationMarkdown.text()).toContain("Guernsey (GG)");
  const indexMarkdown = await request.get("/index.md");
  expect(await indexMarkdown.text()).toContain("## Destinations without a separate passport rank");
  expect(await indexMarkdown.text()).toContain("American Samoa (AS)");
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
  expect(await sitemap.text()).toContain("<loc>https://multipassrank.com/rank</loc>");

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
  await expect(page.locator("pre").filter({ hasText: "One combined rank" })).toContainText(
    "https://multipassrank.com/rank?set=US,CA",
  );

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
