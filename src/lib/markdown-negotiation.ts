const ROOT_HTML_WITHOUT_MARKDOWN = new Set([
  "404",
  "evidence-status",
  "index",
  "status",
]);

function cleanPathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

export function acceptsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  return accept.split(",").some((range) => {
    const [mediaType, ...parameters] = range.split(";").map((part) => part.trim().toLowerCase());
    if (mediaType !== "text/markdown") return false;
    const qualityParameter = parameters.find((parameter) => parameter.startsWith("q="));
    if (!qualityParameter) return true;
    const quality = Number(qualityParameter.slice(2));
    return Number.isFinite(quality) && quality > 0;
  });
}

/**
 * Return the existing native Markdown route for an HTML pathname. Root-level
 * dynamic pages share [collection].md.ts, while the few HTML-only routes are
 * explicitly excluded so negotiation never turns a valid page into a 404.
 */
export function markdownPathFor(pathname: string): string | undefined {
  const clean = cleanPathname(pathname);
  if (clean === "/") return "/index.md";
  if (clean.endsWith(".md") || clean.includes(".")) return undefined;

  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 1) {
    return ROOT_HTML_WITHOUT_MARKDOWN.has(parts[0]) ? undefined : `/${parts[0]}.md`;
  }
  if (parts.length === 2 && ["compare", "destination", "passport"].includes(parts[0])) {
    return `/${parts[0]}/${parts[1]}.md`;
  }
  if (parts.length === 3 && parts[0] === "passport" && ["citizenship", "taxes"].includes(parts[2])) {
    return `${clean}.md`;
  }
  return undefined;
}

export function appendVary(existing: string | null, value: string): string {
  const values = (existing ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
  if (!values.some((entry) => entry.toLowerCase() === value.toLowerCase())) values.push(value);
  return values.join(", ");
}

export function estimateMarkdownTokens(markdown: string): number {
  // A lightweight UTF-8 estimate is sufficient for the advisory response
  // header and avoids shipping a model-specific tokenizer to the Worker.
  return Math.max(1, Math.ceil(new TextEncoder().encode(markdown).byteLength / 4));
}
