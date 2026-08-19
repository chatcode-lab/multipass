import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage renders a searchable passport ranking", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Passport ranks");
  await expect(page.getByRole("list", { name: "Global passport ranking" })).toBeVisible();
  await page.getByPlaceholder("Search passports").fill("Brazil");
  await expect(page.getByRole("listitem").filter({ hasText: "Brazil" })).toBeVisible();
});

test("a shared comparison renders scenarios and difference controls", async ({ page }) => {
  await page.goto("/compare?set=BR&set=US");
  await expect(page.getByText("Brazil", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("United States", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Differences only")).toBeVisible();
  await expect(page.locator("table.comparison-table")).toBeVisible();
  const tableViewport = await page.locator(".comparison-table-wrap").evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(tableViewport.scrollHeight - tableViewport.clientHeight).toBeLessThanOrEqual(1);
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

test("destination and Markdown directories are directly accessible", async ({ page, request }) => {
  await page.goto("/destinations");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Every destination");
  const frenchWestIndies = page.locator("li").filter({ hasText: "French West Indies" });
  await expect(frenchWestIndies.locator(".fi-fr")).toBeVisible();

  const markdown = await request.get("/passport/singapore.md");
  expect(markdown.ok()).toBe(true);
  expect(markdown.headers()["content-type"]).toContain("text/markdown");
  expect(await markdown.text()).toContain("# Singapore passport rank and visa access");
});

test("regional rankings and indexed comparisons render useful content", async ({ page }) => {
  await page.goto("/europe");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("European passport ranking");
  await expect(page.getByRole("list", { name: "European passport ranking" })).toBeVisible();

  await page.goto("/compare/us-vs-uk");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("US vs UK");
  await expect(page.locator("table.comparison-table")).toBeVisible();
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
