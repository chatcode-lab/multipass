import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { PASSPORT_COLLECTIONS, POPULAR_COMPARISONS } from "@/lib/geography";
import { destinationSlug, evidenceRelationshipPairs, visaRelationshipHref } from "@/lib/visa-evidence";

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
  const details = await getPassportAccessBatch(locals, manifest.passports.map((passport) => passport.code), manifest.version);
  const staticPaths = [
    "",
    "rank",
    "destinations",
    "status",
    "compare",
    "dual-passport",
    "best-passport-combination",
    "how-many-passports-to-cover-the-world",
    "how-many-passports-can-you-have",
    "evisa-vs-eta",
    "methodology",
    "data-license",
    "ai",
  ];
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
    ...manifest.destinations.map((destination) => ({
      loc: `https://multipassrank.com/destination/${destinationSlug(destination)}`,
      priority: "0.7",
    })),
    ...evidenceRelationshipPairs(manifest).flatMap(({ passport, destination, status }) =>
      details[passport.code]?.statuses[destination.code] === status
        ? [{ loc: `https://multipassrank.com${visaRelationshipHref(passport, destination, status)}`, priority: "0.6" }]
        : [],
    ),
  ];
  const lastModified = manifest.checkedAt.slice(0, 10) > "2026-08-20"
    ? manifest.checkedAt.slice(0, 10)
    : "2026-08-20";
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
