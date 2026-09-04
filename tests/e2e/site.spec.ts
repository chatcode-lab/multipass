import AxeBuilder from "@axe-core/playwright";
import { expect, test, type APIRequestContext } from "@playwright/test";

async function sitemapIndexLocations(request: APIRequestContext): Promise<string[]> {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  expect(xml).toContain("<sitemapindex");
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

async function sitemapGroupText(request: APIRequestContext, filename: string): Promise<string> {
  const location = (await sitemapIndexLocations(request)).find((entry) => entry.endsWith(`/sitemaps/${filename}`));
  expect(location).toBeDefined();
  const response = await request.get(new URL(location!).pathname);
  expect(response.ok()).toBe(true);
  return response.text();
}

async function indexedSitemapTexts(request: APIRequestContext): Promise<string[]> {
  const locations = await sitemapIndexLocations(request);
  return Promise.all(locations.map(async (location) => {
    const response = await request.get(new URL(location).pathname);
    expect(response.ok()).toBe(true);
    return response.text();
  }));
}

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

test("generated document titles stay within the search-engine length recommendation", async ({ page }) => {
  const samples = [
    "/passport/st-vincent-and-the-grenadines",
    "/destination/bonaire-st-eustatius-and-saba",
    "/central-african-republic-antigua-and-barbuda-evisa",
    "/improve",
  ];

  for (const path of samples) {
    await page.goto(path);
    const title = await page.title();
    expect(title.length, `${path}: ${title}`).toBeLessThanOrEqual(70);
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

test("inline article links keep readable spacing and the footer groups its navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".calculator-explainer p")).toContainText(
    "scores. See how the ranking works, or explore the exact best pairs and triples",
  );
  const footer = page.locator(".site-footer");
  await expect(footer.locator(".site-footer__credits")).toHaveAttribute(
    "aria-label",
    "Built using chatcode.dev in partnership with Settlers Club",
  );
  await expect(footer.getByRole("link", { name: "Settlers Club" })).toBeVisible();
  const articleColumn = footer.locator(".site-footer__column").filter({ hasText: "Articles" });
  await expect(articleColumn.getByRole("link")).toHaveCount(8);
  await expect(articleColumn.getByRole("link", { name: "Dual-citizenship countries" })).toBeVisible();
  await expect(articleColumn.getByRole("link", { name: "Best passport combinations" })).toBeVisible();
  await expect(articleColumn.getByRole("link", { name: "Citizenship by descent" })).toBeVisible();
  await expect(articleColumn.getByRole("link", { name: "Best second passport for US citizens" })).toBeVisible();

  await page.goto("/data-license");
  await expect(page.locator(".prose p").filter({ hasText: "original evidence metadata" })).toContainText(
    "under the Creative Commons Attribution 4.0 International license",
  );
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
    expect(rankingLink!.y).toBeLessThan(differences!.y);
  }
});

test("Improve Passport measures ordered cumulative gains for passport sets", async ({ page, request }) => {
  await page.goto("/improve?set=US&set=IT&set=IE,PT");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("what every added passport actually gains");
  await expect(page.locator(".improvement-stage")).toHaveCount(3);
  await expect(page.locator(".improvement-stage").nth(0)).toContainText("base score");
  await expect(page.locator(".improvement-stage").nth(1)).toContainText("new destinations");
  await expect(page.getByRole("checkbox", { name: "New access only" })).toBeChecked();
  await expect(page.locator(".improvement-cell--gain").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Compare stages" })).toHaveAttribute(
    "href",
    "/compare?set=US&set=US%2CIT&set=US%2CIT%2CIE%2CPT",
  );
  await expect(page.getByRole("link", { name: "Rank final set" })).toHaveAttribute(
    "href",
    "/rank?set=US%2CIT%2CIE%2CPT",
  );
  await page.getByLabel("Filter improvement destinations by region").selectOption("AFRICA");
  await expect(page.locator(".comparison-table__region")).toHaveCount(1);
  await expect(page.locator(".comparison-table__region")).toContainText("Africa");

  const markdown = await request.get("/improve.md?set=US&set=IT&set=IE,PT");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("Stage 3: Ireland + Portugal");

  const api = await request.post("/api/v1/improve", { data: { sets: [["US"], ["IT"], ["IE", "PT"]] } });
  expect(api.ok()).toBe(true);
  const result = await api.json();
  expect(result.stages).toHaveLength(3);
  expect(result.stages[2].cumulativeCodes).toEqual(["US", "IT", "IE", "PT"]);
  expect(result.stages[2].marginalEasyDestinations).toBeGreaterThanOrEqual(0);
});

test("comparison attribution is compact and only shown for a useful subset", async ({ page, request }) => {
  await page.goto("/compare?set=PT,RU,IL&set=SG");
  const israel = page.locator(".comparison-table tbody tr:not(.comparison-table__region)").filter({ hasText: "Israel" });
  const unitedArabEmirates = page.locator(".comparison-table tbody tr:not(.comparison-table__region)").filter({ hasText: "United Arab Emirates" });
  const israelAttribution = israel.locator("td").first().locator(".status-pill small");
  await expect(israelAttribution).toHaveText("IL");
  await expect(israelAttribution).not.toContainText("via");
  await expect(israel.locator("td").first().locator(".status-pill")).toHaveCSS("align-items", "center");
  await expect(israel.locator("td").first().locator(".status-pill__text")).toHaveCSS("align-items", "baseline");
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
  await expect(statusFilter.locator("option", { hasText: "Unknown" })).toHaveCount(1);
  await statusFilter.selectOption("unknown");
  await expect(page.locator(".access-row")).toHaveCount(1);
  await expect(page.locator(".access-row")).toHaveAttribute("href", "/spain-iran-status-unknown");
  await statusFilter.selectOption("easy");
  await expect(page.locator(".access-row")).not.toHaveCount(0);
  await expect(page.locator(".access-row .status-pill--citizenship, .access-row .status-pill--visa_required, .access-row .status-pill--unknown")).toHaveCount(0);
  await regionFilter.selectOption("EUROPE");
  await expect(page.locator(".region-group")).toHaveCount(1);
  await expect(page.locator(".region-group").getByRole("heading")).toHaveText("Europe");
  const firstAccessRow = page.locator(".access-row:visible").first();
  await expect(firstAccessRow).toHaveAttribute("href", /-(visa-free|eta|visa-on-arrival|evisa|visa)$/);
  expect(await firstAccessRow.evaluate((element) => element.tagName)).toBe("A");
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
  await page.evaluate(() => document.fonts.ready);
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
  await expect(page.locator("[data-combination-row] .ranking-row__rank small")).toHaveCount(0);
});

test("custom ranking preserves and reuses passport sets", async ({ page, request }) => {
  await page.goto("/rank?set=US,CA&set=PT");
  await expect(page.locator(".rank-set-summary")).toContainText("United States + Canada");
  await expect(page.locator("[data-combination-row]")).toHaveCount(1);
  await expect(page.locator("[data-passport-row][data-set='PT']")).toHaveClass(/is-featured/);
  await expect(page.getByRole("link", { name: "View comparison" })).toHaveAttribute("href", "/compare?set=US%2CCA&set=PT");
  await expect(page.locator("#ranking > .table-view-actions")).toBeVisible();
  await expect(page.locator(".page-intro .table-view-actions")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copy link" }).locator("svg:visible")).toHaveCount(1);
  const rankActions = await page.locator("#ranking > .table-view-actions").boundingBox();
  const rankSearch = await page.locator("[data-ranking-search]").boundingBox();
  expect(rankActions).not.toBeNull();
  expect(rankSearch).not.toBeNull();
  expect(rankActions!.y).toBeLessThan(rankSearch!.y);

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
    const scoreBounds = await combination.locator(".ranking-row__score strong").boundingBox();
    const rankBounds = await combination.locator(".ranking-row__rank").boundingBox();
    const selectBounds = await combination.locator("[data-ranking-select]").boundingBox();
    expect(scoreBounds).not.toBeNull();
    expect(rankBounds).not.toBeNull();
    expect(selectBounds).not.toBeNull();
    const selectCenter = selectBounds!.y + selectBounds!.height / 2;
    const scoreCenterOffset = scoreBounds!.y + scoreBounds!.height / 2 - selectCenter;
    const rankCenterOffset = rankBounds!.y + rankBounds!.height / 2 - selectCenter;
    expect(scoreCenterOffset).toBeGreaterThanOrEqual(1);
    expect(scoreCenterOffset).toBeLessThanOrEqual(3);
    expect(rankCenterOffset).toBeGreaterThanOrEqual(1);
    expect(rankCenterOffset).toBeLessThanOrEqual(3);
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
  await expect(page.locator("[data-combination-row] .ranking-row__rank")).toHaveText("#2");
  await expect(page.locator("[data-passport-row][data-set='SG'] .ranking-row__rank")).toHaveText("#1");
});

test("combined passport artwork stays clear of its result text", async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await page.goto("/compare?set=SE,JP,AE,KR&set=DK,SE");
  const card = page.locator(".scenario-card").first();
  const cover = await card.locator(".passport-stack").boundingBox();
  const content = await card.locator(".scenario-card__content").boundingBox();
  expect(cover).not.toBeNull();
  expect(content).not.toBeNull();
  expect(cover!.y + cover!.height).toBeLessThan(content!.y);
  expect(content!.width).toBeGreaterThan(cover!.width);
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

  const coreSitemap = await sitemapGroupText(request, "core.xml");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/arabic</loc>");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/french</loc>");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/portuguese</loc>");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/rank</loc>");

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

  await page.goto("/compare?set=SG&set=US");
  await expect(page).toHaveURL(/\/united-states-vs-singapore-passport$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("United States vs Singapore passport comparison");
  await expect(page.getByText(/easier result in \d+ destinations/)).toBeVisible();

  const newComparisonMarkdown = await request.get("/hong-kong-vs-china-passport.md");
  expect(newComparisonMarkdown.ok()).toBe(true);
  expect(await newComparisonMarkdown.text()).toContain("# Hong Kong vs China passport comparison");

  await page.goto("/compare?set=US&set=DE");
  await expect(page).toHaveURL(/\/germany-vs-united-states-passport$/);

  const demandComparisonMarkdown = await request.get("/india-vs-united-states-passport.md");
  expect(demandComparisonMarkdown.ok()).toBe(true);
  expect(await demandComparisonMarkdown.text()).toContain("# India vs United States passport comparison");

  const coreSitemap = await sitemapGroupText(request, "core.xml");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/united-states-vs-singapore-passport</loc>");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/hong-kong-vs-china-passport</loc>");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/germany-vs-united-states-passport</loc>");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/india-vs-united-states-passport</loc>");
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
  const llmsBody = await llms.text();
  expect(llmsBody).toContain("Build comparison URLs");
  expect(llmsBody).toContain("Build incremental improvement URLs");
});

test("eVisa and ETA guide is indexable and available as Markdown", async ({ page, request }) => {
  await page.goto("/evisa-vs-eta");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("eVisa vs ETA: what is the difference?");
  await expect(page.getByRole("heading", { name: "How MultiPass Rank treats them" })).toBeVisible();

  const markdown = await request.get("/evisa-vs-eta.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("# eVisa vs ETA: what is the difference?");

  const coreSitemap = await sitemapGroupText(request, "core.xml");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/evisa-vs-eta</loc>");
});

test("combination research publishes exact results, reproducible links, and Markdown", async ({ page, request }) => {
  const insightsResponse = await request.get("/api/v1/combination-insights");
  expect(insightsResponse.ok()).toBe(true);
  const insights = await insightsResponse.json();
  const manifestResponse = await request.get("/api/v1/manifest");
  expect(manifestResponse.ok()).toBe(true);
  const { manifest } = await manifestResponse.json();
  const nameByCode = new Map(manifest.passports.map((passport: { code: string; name: string }) => [passport.code, passport.name]));
  const scenarioName = (codes: string[]) => codes.map((code) => nameByCode.get(code) ?? code).join(" + ");
  const bestPairName = scenarioName(insights.bestPairs[0].codes);
  const bestTripleName = scenarioName(insights.bestTriples[0].codes);

  await page.goto("/best-passport-combination");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Best passport combination in 2026.");
  await expect(page.locator(".research-result-card").first()).toContainText(bestPairName);
  await expect(page.locator(".research-result-card").first()).toContainText(String(insights.bestPairs[0].accessibleDestinations));
  await expect(page.locator(".research-result-card").nth(1)).toContainText(bestTripleName);
  await expect(page.getByRole("link", { name: "View combined rank" }).first()).toHaveAttribute(
    "href",
    `/rank?${new URLSearchParams({ set: insights.bestPairs[0].codes.join(",") })}`,
  );
  const articleSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.flatMap((script) => {
      const records = JSON.parse(script.textContent ?? "[]");
      return (Array.isArray(records) ? records : [records]).filter((record) => record?.["@type"] === "Article");
    }),
  );
  expect(articleSchema[0].author.name).toBe("MultiPass Rank");

  const markdown = await request.get("/best-passport-combination.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain(`**${bestPairName}**`);

  await page.goto("/how-many-passports-to-cover-the-world");
  await expect(page.locator(".research-hero__answer strong")).toHaveText(String(insights.minimumCover.size));
  await expect(page.locator(".coverage-sequence > li")).toHaveCount(insights.minimumCover.size);
  const fullSetHref = await page.getByRole("link", { name: "Place the full set in the ranking" }).getAttribute("href");
  expect(fullSetHref).not.toBeNull();
  const fullSetCodes = new URL(fullSetHref!, "https://multipassrank.com").searchParams.get("set")?.split(",") ?? [];
  expect(fullSetCodes).toHaveLength(insights.minimumCover.size);
  expect(new Set(fullSetCodes).size).toBe(insights.minimumCover.size);
  const pageWidth = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(pageWidth.document - pageWidth.viewport).toBeLessThanOrEqual(1);

  const fullSetRanking = await request.get(fullSetHref!);
  expect(fullSetRanking.ok()).toBe(true);
  expect(await fullSetRanking.text()).toContain("passport rank equivalent | MultiPass Rank");

  const worldMarkdown = await request.get("/how-many-passports-to-cover-the-world.md");
  expect(worldMarkdown.ok()).toBe(true);
  expect(await worldMarkdown.text()).toContain(`**${insights.minimumCover.size} passports** are necessary and sufficient`);

  expect(fullSetCodes).toEqual(insights.minimumCover.codes);

  const xml = await sitemapGroupText(request, "core.xml");
  expect(xml).toContain("<loc>https://multipassrank.com/best-passport-combination</loc>");
  expect(xml).toContain("<loc>https://multipassrank.com/how-many-passports-to-cover-the-world</loc>");
});

test("the US second-passport article separates theoretical gain from obtainable routes", async ({ page, request }) => {
  await page.goto("/best-second-passport-for-us-citizens");
  await expect(page.locator(".research-result-card").first()).toContainText("not a conventional second-passport option");
  await expect(page.locator(".research-result-card").first().getByRole("link", { name: "official UAE source" })).toHaveAttribute(
    "href",
    "https://u.ae/en/information-and-services/passports-and-traveling/emirati-nationality",
  );
  await expect(page.getByRole("heading", { name: "For many Americans, an eligible EU route is the strategic question." })).toBeVisible();
  await expect(page.locator(".eu-second-passport-grid > article")).toHaveCount(6);
  await expect(page.getByRole("link", { name: "See incremental gains" })).toHaveAttribute("href", "/improve?set=US&set=AE");

  const markdown = await request.get("/best-second-passport-for-us-citizens.md");
  expect(markdown.ok()).toBe(true);
  const body = await markdown.text();
  expect(body).toContain("**Important correction:** the United Arab Emirates is the mathematical travel-access winner");
  expect(body).toContain("## EU routes may be strategically more useful");
});

test("multiple-passport records review separates law, documents, and anecdotes", async ({ page, request }) => {
  await page.goto("/how-many-passports-can-you-have");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How many passports can one person have?");
  await expect(page.locator(".research-hero__answer")).toContainText("No");
  await expect(page.getByRole("heading", { name: "Pavel Durov" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No defensible public record emerged." })).toBeVisible();
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.flatMap((script) => {
      const value = JSON.parse(script.textContent ?? "[]");
      return Array.isArray(value) ? value : [value];
    }),
  );
  expect(schemas.find((record) => record?.["@type"] === "Article")?.author?.name).toBe("MultiPass Rank");
  expect(schemas.find((record) => record?.["@type"] === "FAQPage")?.mainEntity).toHaveLength(4);

  const markdown = await request.get("/how-many-passports-can-you-have.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("There is **no universal numerical limit**");

  const coreSitemap = await sitemapGroupText(request, "core.xml");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/how-many-passports-can-you-have</loc>");
});

test("citizenship compatibility is source-backed, machine-readable, and non-blocking", async ({ page, request }) => {
  await page.goto("/dual-citizenship-countries");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("citizenships actually be held together");
  await expect(page.locator(".citizenship-policy-list > article")).toHaveCount(20);
  await expect(page.locator("#india")).toContainText("does not allow Indian and foreign citizenship");
  await expect(page.locator("#india").getByRole("link", { name: /Ministry of Home Affairs/ })).toBeVisible();

  const markdown = await request.get("/dual-citizenship-countries.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("# Dual citizenship countries and passport compatibility");

  const api = await request.get("/api/v1/citizenship-policies");
  expect(api.ok()).toBe(true);
  const policies = await api.json();
  expect(policies.policies).toHaveLength(20);
  expect(policies.policies.find((policy: { code: string }) => policy.code === "IN")?.status).toBe("generally_restricted");
  expect(policies.policies.find((policy: { code: string }) => policy.code === "AE")?.status).toBe("conditional");

  const acquisition = await request.get("/api/v1/citizenship-acquisition");
  expect(acquisition.ok()).toBe(true);
  const acquisitionData = await acquisition.json();
  expect(acquisitionData.routes.find((route: { countryCode: string }) => route.countryCode === "AE")?.type).toBe("exceptional");

  await page.goto("/rank?set=IN,PT");
  await expect(page.locator(".citizenship-notice")).toContainText("Set 1 · India");
  await expect(page.locator("[data-combination-row]")).toBeVisible();

  const rankMarkdown = await request.get("/rank.md?set=IN,PT");
  expect(await rankMarkdown.text()).toContain("Citizenship compatibility notes");

  const coreSitemap = await sitemapGroupText(request, "core.xml");
  expect(coreSitemap).toContain("<loc>https://multipassrank.com/dual-citizenship-countries</loc>");
});

test("dataset pages declare creator and license metadata", async ({ page }) => {
  for (const path of ["/destinations", "/passport/belgium", "/destination/angola", "/dual-citizenship-countries"]) {
    await page.goto(path);
    const datasets = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
      scripts.flatMap((script) => {
        const value = JSON.parse(script.textContent ?? "null");
        const records = Array.isArray(value) ? value : [value];
        return records.filter((record) => record?.["@type"] === "Dataset");
      }),
    );
    expect(datasets, path).not.toHaveLength(0);
    for (const dataset of datasets) {
      expect(dataset.creator?.name, path).toBe("MultiPass Rank");
      expect(dataset.license?.url, path).toBe("https://multipassrank.com/data-license");
    }
  }
});

test("destination and relationship pages expose official evidence and Markdown", async ({ page, request }) => {
  await page.goto("/destination/angola");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Angola visa requirements");
  await expect(page.getByRole("heading", { name: "Official evidence timeline" })).toBeVisible();
  await expect(page.getByText("98 passport nationalities covered")).toBeVisible();
  await expect(page.getByRole("link", { name: /Belgium.*Visa-free/ })).toHaveAttribute("href", "/belgium-angola-visa-free");

  const destinationMarkdown = await request.get("/destination/angola.md");
  expect(destinationMarkdown.ok()).toBe(true);
  expect(await destinationMarkdown.text()).toContain("# Angola visa requirements by passport");

  await page.goto("/belgium-angola-visa-free");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Belgium to Angola");
  await expect(page.getByText("Official evidence collected", { exact: true })).toBeVisible();
  await expect(page.locator('a[href^="https://governo.gov.ao/"]').first()).toHaveAttribute("href", /governo\.gov\.ao/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^index,/);

  const relationshipMarkdown = await request.get("/belgium-angola-visa-free.md");
  expect(relationshipMarkdown.ok()).toBe(true);
  expect(await relationshipMarkdown.text()).toContain("# Belgium passport to Angola: Visa-free");

  await page.goto("/destination/hong-kong-sar-china");
  await expect(page.getByRole("heading", { name: "Official evidence timeline" })).toBeVisible();
  await expect(page.getByText("Hong Kong publishes visa-free periods for ordinary visitors")).toBeVisible();
  await expect(page.getByText("Pre-arrival registration became mandatory for Indian visitors")).toBeVisible();

  await page.goto("/india-hong-kong-sar-china-eta");
  await expect(page.getByText("Official evidence collected", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Register on the official Hong Kong government portal/ })).toHaveAttribute("href", /gov\.hk/);
});

test("relationship URLs redirect stale statuses and keep incomplete evidence out of search", async ({ page, request }) => {
  await page.goto("/belgium-afghanistan-evisa");
  await expect(page).toHaveURL(/\/belgium-afghanistan-visa$/);
  await expect(page.getByText("Official-source review pending", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  const markdown = await request.get("/belgium-afghanistan-visa.md", { maxRedirects: 0 });
  expect(markdown.ok()).toBe(true);
  expect(markdown.headers()["x-robots-tag"]).toContain("noindex");

  const sitemapTexts = await indexedSitemapTexts(request);
  const xml = sitemapTexts.join("\n");
  const sitemapLocations = sitemapTexts.flatMap((text) =>
    [...text.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
  expect(new Set(sitemapLocations).size).toBe(sitemapLocations.length);
  for (const text of sitemapTexts) {
    expect([...text.matchAll(/<url>/g)].length).toBeLessThanOrEqual(50_000);
    expect(new TextEncoder().encode(text).length).toBeLessThanOrEqual(50 * 1024 * 1024);
  }
  expect(xml).toContain("<loc>https://multipassrank.com/destination/angola</loc>");
  expect(xml).toContain("<loc>https://multipassrank.com/belgium-angola-visa-free</loc>");
  expect(xml).not.toContain("<loc>https://multipassrank.com/belgium-afghanistan-visa</loc>");

  const rejected = await request.get("/kosovo-azerbaijan-evisa", { maxRedirects: 0 });
  expect(rejected.status()).toBe(308);
  expect(rejected.headers().location).toBe("/kosovo-azerbaijan-status-unknown");

  await page.goto("/kosovo-azerbaijan-status-unknown");
  await expect(page.getByText("Imported classification rejected", { exact: true })).toBeVisible();
  await expect(page.getByText(/No single replacement category is established/)).toBeVisible();
  await expect(page.locator('a[href="https://www.evisa.gov.az/en/countries"]')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(xml).not.toContain("<loc>https://multipassrank.com/kosovo-azerbaijan-status-unknown</loc>");
});

test("entry restrictions have a canonical evidence page and stale-status redirect", async ({ page, request }) => {
  const legacy = await request.get("/israel-maldives-visa", { maxRedirects: 0 });
  expect(legacy.status()).toBe(308);
  expect(legacy.headers().location).toBe("/israel-maldives-entry-restricted");

  await page.goto("/israel-maldives-entry-restricted");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Israel to Maldives");
  await expect(page.getByText("Entry restricted", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Official evidence collected", { exact: true })).toBeVisible();

  const markdown = await request.get("/israel-maldives-entry-restricted.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("# Israel passport to Maldives: Entry restricted");

  const relationshipSitemap = await sitemapGroupText(request, "relationships-middle-east.xml");
  expect(relationshipSitemap).toContain("<loc>https://multipassrank.com/israel-maldives-entry-restricted</loc>");
});

test("corrected Saint Martin URLs retain St. Maarten compatibility redirects", async ({ page, request }) => {
  await page.goto("/destination/st-maarten");
  await expect(page).toHaveURL(/\/destination\/saint-martin-french-part$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Saint Martin (French part) visa requirements");

  const destinationMarkdown = await request.get("/destination/st-maarten.md", { maxRedirects: 0 });
  expect(destinationMarkdown.status()).toBe(308);
  expect(destinationMarkdown.headers().location).toBe("/destination/saint-martin-french-part.md");

  const relationship = await request.get("/belgium-st-maarten-visa-free", { maxRedirects: 0 });
  expect(relationship.status()).toBe(308);
  expect(relationship.headers().location).toBe("/belgium-saint-martin-french-part-visa-free");
});

test("citizenship cells use passport pages instead of duplicate relationship URLs", async ({ page, request }) => {
  await page.goto("/destination/estonia");
  await expect(page.getByRole("link", { name: /Estonia.*Citizenship/ }))
    .toHaveAttribute("href", "/passport/estonia");

  await page.goto("/passport/estonia");
  await expect(page.getByRole("link", { name: "Estonia passport to Estonia: Citizenship" }))
    .toHaveAttribute("href", "/passport/estonia");

  const legacyHtml = await request.get("/estonia-estonia-citizenship", { maxRedirects: 0 });
  expect(legacyHtml.status()).toBe(308);
  expect(legacyHtml.headers().location).toBe("/passport/estonia");

  const legacyMarkdown = await request.get("/estonia-estonia-citizenship.md", { maxRedirects: 0 });
  expect(legacyMarkdown.status()).toBe(308);
  expect(legacyMarkdown.headers().location).toBe("/passport/estonia.md");
});

test("passport and comparison status cells link to relationship evidence", async ({ page }) => {
  await page.goto("/passport/belgium");
  await expect(page.getByRole("link", { name: "Belgium passport to Angola: Visa-free" }))
    .toHaveAttribute("href", "/belgium-angola-visa-free");

  await page.goto("/compare?set=BE&set=AF");
  const angolaRow = page.locator(".comparison-table tbody tr:not(.comparison-table__region)").filter({ hasText: "Angola" });
  const statusCell = angolaRow.locator("td").first();
  const statusLink = statusCell.getByRole("link", { name: "Belgium passport to Angola: Visa-free" });
  await expect(statusLink)
    .toHaveAttribute("href", "/belgium-angola-visa-free");
  await expect(angolaRow.getByRole("link", { name: "Angola", exact: true })).toHaveAttribute("href", "/destination/angola");
  const cellTarget = await statusCell.evaluate((cell) => {
    const link = cell.querySelector("a");
    const pseudo = link ? getComputedStyle(link, "::after") : null;
    return { position: getComputedStyle(cell).position, inset: pseudo?.inset, content: pseudo?.content };
  });
  expect(cellTarget.position).toBe("relative");
  expect(cellTarget.inset).toBe("0px");
  expect(cellTarget.content).not.toBe("none");

  await page.goto("/compare?set=PT,RU,IL&set=AF");
  const tiedAngolaCell = page.locator(".comparison-table tbody tr:not(.comparison-table__region)")
    .filter({ hasText: "Angola" })
    .locator("td")
    .first();
  await expect(tiedAngolaCell.getByRole("link", { name: /3 passports tie, open destination overview/ }))
    .toHaveAttribute("href", "/destination/angola#passports=PT,RU,IL");
});

test("destination passport filters support controls, query parameters, and tie-link hashes", async ({ page }) => {
  await page.goto("/destination/angola");
  const directory = page.locator("[data-destination-passport-access]");
  const rows = directory.locator("[data-destination-passport-row]:visible");
  await expect(rows).toHaveCount(199);

  await page.getByPlaceholder("Search passport countries").fill("Belgium");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Belgium");
  await page.getByPlaceholder("Search passport countries").fill("");
  await page.getByLabel("Filter passport countries by region").selectOption("EUROPE");
  await expect(rows).not.toHaveCount(0);
  await expect.poll(() => rows.evaluateAll((entries) => entries.every((entry) => entry.dataset.region === "EUROPE"))).toBe(true);
  await page.getByLabel("Filter passport countries by access type").selectOption("visa_free");
  await expect(rows).not.toHaveCount(0);
  await expect.poll(() => rows.evaluateAll((entries) => entries.every((entry) => entry.dataset.status === "visa_free"))).toBe(true);

  await page.goto("/destination/angola?passports=BE,US#passport-access");
  await expect(rows).toHaveCount(2);
  await expect(page.getByText("2 passports selected", { exact: true })).toBeVisible();

  await page.goto("/destination/angola#passports=PT,RU,IL");
  await expect(rows).toHaveCount(3);
  await expect(page.getByText("3 passports selected", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#passports=PT,RU,IL$/);
  await page.getByRole("button", { name: "Show all passports" }).click();
  await expect(rows).toHaveCount(199);
  await expect(page).toHaveURL(/#passport-access$/);
});

test("public evidence matrix audits every passport against a destination region", async ({ page, request }) => {
  const legacy = await request.get("/evidence-status?region=EUROPE&state=pending", { maxRedirects: 0 });
  expect(legacy.status()).toBe(301);
  expect(legacy.headers().location).toMatch(/\/status\?region=EUROPE&state=pending$/);

  const response = await page.goto("/status?region=EUROPE");
  expect(response?.headers()["x-robots-tag"]).toBeUndefined();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow,max-image-preview:large");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Evidence coverage matrix.");
  await expect(page.locator(".evidence-matrix-table")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(".evidence-completion")).toContainText("Exact verification");
  await expect(page.locator(".evidence-completion")).toContainText("officially characterized");
  await expect(page.locator(".evidence-completion")).toContainText("structured allowed-stay rule");
  await expect(page.locator(".evidence-completion")).toContainText("No exact match");
  await expect(page.locator(".evidence-completion")).toContainText("Stale");
  await expect(page.locator(".evidence-completion")).toContainText("Old");
  await expect(page.locator(".evidence-completion")).toContainText("Fresh");
  await expect(page.getByRole("button", { name: "Refresh status" })).toBeVisible();
  await expect(page.locator(".evidence-matrix-table tbody tr")).toHaveCount(199);
  await expect(page.locator(".evidence-status-summary")).toContainText("199 passports × 52 destinations");

  await page.getByPlaceholder("Filter passports").fill("Japan");
  await page.getByPlaceholder("Filter destinations").fill("Germany");
  await expect(page.locator(".evidence-matrix-table tbody tr")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Japan JP · Asia/ })).toHaveAttribute("href", "/passport/japan");
  await expect(page.getByRole("link", { name: /Germany DE/ })).toHaveAttribute("href", "/destination/germany");
  const germanyCell = page.getByRole("link", { name: /Japan to Germany: Visa-free; verified 20 August 2026/ });
  await expect(germanyCell)
    .toHaveAttribute("href", "/japan-germany-visa-free");
  await expect(germanyCell).toContainText("✓ 20 Aug");
  await expect(germanyCell).toHaveClass(/evidence-cell--fresh/);

  const api = await request.get("/api/v1/evidence-status?region=EUROPE");
  expect(api.ok()).toBe(true);
  expect(api.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  const matrix = await api.json();
  expect(matrix.summary.total).toBe(199 * 52);
  expect(matrix.summary.verified).toBeGreaterThan(0);
  expect(matrix.summary.pending).toBeGreaterThan(0);
  expect(matrix.overall.total).toBe(44_974);
  expect(matrix.overall.covered).toBe(
    matrix.overall.fresh.count + matrix.overall.old.count + matrix.overall.stale.count,
  );
  expect(matrix.overall.total).toBe(
    matrix.overall.covered + matrix.overall.notCovered.count,
  );

  const sitemapText = await sitemapGroupText(request, "core.xml");
  expect(sitemapText).not.toContain("evidence-status");
  expect(sitemapText).toContain("https://multipassrank.com/status");
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
  const returnLink = page.getByRole("link", { name: "Return to the ranking" });
  await expect(returnLink).toBeVisible();
  await expect(returnLink).toHaveCSS("color", "rgb(255, 253, 248)");
  await expect(returnLink).toHaveCSS("-webkit-text-fill-color", "rgb(255, 253, 248)");
});
