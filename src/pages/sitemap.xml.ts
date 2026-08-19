import type { APIRoute } from "astro";
import { getDataContext } from "@/lib/data";
import { PASSPORT_COLLECTIONS, POPULAR_COMPARISONS } from "@/lib/geography";

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] ?? character);
}

export const GET: APIRoute = async ({ locals }) => {
  const { manifest } = await getDataContext(locals);
  const staticPaths = ["", "destinations", "compare", "dual-passport", "evisa-vs-eta", "methodology", "ai"];
  const urls = [
    ...staticPaths.map((path) => ({ loc: `https://multipassrank.com/${path}`, priority: path ? "0.7" : "1.0" })),
    ...PASSPORT_COLLECTIONS.map((collection) => ({
      loc: `https://multipassrank.com/${collection.slug}`,
      priority: "0.8",
    })),
    ...POPULAR_COMPARISONS.map((comparison) => ({
      loc: `https://multipassrank.com/${comparison.slug}`,
      priority: "0.7",
    })),
    ...manifest.passports.map((passport) => ({
      loc: `https://multipassrank.com/passport/${passport.slug}`,
      priority: "0.8",
    })),
  ];
  const lastModified = manifest.checkedAt.slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      ({ loc, priority }) =>
        `  <url><loc>${escapeXml(loc)}</loc><lastmod>${lastModified}</lastmod><priority>${priority}</priority></url>`,
    )
    .join("\n")}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
