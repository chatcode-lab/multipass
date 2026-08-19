const SITE_ORIGIN = "https://multipassrank.com";

export function escapeMarkdown(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export function markdownResponse(markdown: string, canonicalPath: string, noindex = false): Response {
  return new Response(`${markdown.trim()}\n`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      Link: `<${new URL(canonicalPath, SITE_ORIGIN)}>; rel="canonical"`,
      ...(noindex ? { "X-Robots-Tag": "noindex, follow" } : {}),
    },
  });
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}
