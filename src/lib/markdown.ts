import { estimateMarkdownTokens } from "./markdown-negotiation";
import { SITE_CREDIT_MARKDOWN } from "./site-credit";

const SITE_ORIGIN = "https://multipassrank.com";

export function escapeMarkdown(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export function markdownWithCredit(markdown: string): string {
  const content = markdown.trim();
  return content.endsWith(SITE_CREDIT_MARKDOWN)
    ? `${content}\n`
    : `${content}\n\n---\n\n${SITE_CREDIT_MARKDOWN}\n`;
}

export function markdownResponse(markdown: string, canonicalPath: string, noindex = false): Response {
  const body = markdownWithCredit(markdown);
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      Link: `<${new URL(canonicalPath, SITE_ORIGIN)}>; rel="canonical"`,
      "X-Markdown-Tokens": String(estimateMarkdownTokens(body)),
      ...(noindex ? { "X-Robots-Tag": "noindex, follow" } : {}),
    },
  });
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}
