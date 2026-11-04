import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { markdownResponse, markdownWithCredit } from "./markdown";
import { estimateMarkdownTokens } from "./markdown-negotiation";
import { SITE_CREDIT_MARKDOWN, SITE_CREDIT_TEXT } from "./site-credit";

describe("shared project credit", () => {
  it("uses the requested text and a normal Markdown link", () => {
    expect(SITE_CREDIT_TEXT).toBe("Built using chatcode.dev – remote shell for AI agents");
    expect(SITE_CREDIT_MARKDOWN).toBe("Built using [chatcode.dev](https://chatcode.dev) – remote shell for AI agents");
  });

  it("ends the document with one separated credit, including when formatted twice", () => {
    const body = markdownWithCredit("\n# Example\n\nContent.\n");
    expect(body).toBe(`# Example\n\nContent.\n\n---\n\n${SITE_CREDIT_MARKDOWN}\n`);
    expect(markdownWithCredit(body)).toBe(body);
    expect(markdownWithCredit("# Not found").endsWith(`${SITE_CREDIT_MARKDOWN}\n`)).toBe(true);
  });

  it("counts the final response body and preserves canonical, cache and indexing headers", async () => {
    const response = markdownResponse("# Example", "/example", true);
    const body = await response.text();
    expect(body).toBe(markdownWithCredit("# Example"));
    expect(response.headers.get("X-Markdown-Tokens")).toBe(String(estimateMarkdownTokens(body)));
    expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
    expect(response.headers.get("Link")).toBe('<https://multipassrank.com/example>; rel="canonical"');
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, follow");
    expect(markdownResponse("# Indexable", "/").headers.has("X-Robots-Tag")).toBe(false);
  });

  it("keeps the static discovery file's credit in sync", () => {
    const llms = readFileSync(new URL("../../public/llms.txt", import.meta.url), "utf8");
    expect(llms.trimEnd().endsWith(SITE_CREDIT_MARKDOWN)).toBe(true);
    expect(llms.split(SITE_CREDIT_MARKDOWN)).toHaveLength(2);
  });
});
