import { describe, expect, it } from "vitest";
import { acceptsMarkdown, appendVary, estimateMarkdownTokens, markdownPathFor } from "./markdown-negotiation";

describe("Markdown content negotiation", () => {
  it("recognizes an explicit Markdown media range without treating wildcards as a request", () => {
    expect(acceptsMarkdown("text/markdown")).toBe(true);
    expect(acceptsMarkdown("text/html, text/markdown;q=0.8")).toBe(true);
    expect(acceptsMarkdown("TEXT/MARKDOWN; charset=utf-8")).toBe(true);
    expect(acceptsMarkdown("text/markdown;q=0")).toBe(false);
    expect(acceptsMarkdown("text/html, */*;q=0.8")).toBe(false);
    expect(acceptsMarkdown(null)).toBe(false);
  });

  it("maps supported HTML routes to their existing native Markdown endpoints", () => {
    expect(markdownPathFor("/")).toBe("/index.md");
    expect(markdownPathFor("/passport/portugal")).toBe("/passport/portugal.md");
    expect(markdownPathFor("/destination/kenya/")).toBe("/destination/kenya.md");
    expect(markdownPathFor("/compare/us-vs-uk")).toBe("/compare/us-vs-uk.md");
    expect(markdownPathFor("/belgium-kenya-eta")).toBe("/belgium-kenya-eta.md");
    expect(markdownPathFor("/best-passport-combination")).toBe("/best-passport-combination.md");
  });

  it("leaves HTML-only, API, asset, sitemap, and explicit Markdown routes alone", () => {
    for (const path of [
      "/status",
      "/evidence-status",
      "/index",
      "/404",
      "/api/v1/manifest",
      "/sitemaps/core.xml",
      "/robots.txt",
      "/og-image.svg",
      "/passport/portugal.md",
    ]) {
      expect(markdownPathFor(path), path).toBeUndefined();
    }
  });

  it("adds one Accept variance and supplies a positive advisory token estimate", () => {
    expect(appendVary(null, "Accept")).toBe("Accept");
    expect(appendVary("Accept-Encoding", "Accept")).toBe("Accept-Encoding, Accept");
    expect(appendVary("accept", "Accept")).toBe("accept");
    expect(estimateMarkdownTokens("# A useful Markdown response")).toBeGreaterThan(0);
  });
});
