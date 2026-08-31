import { PASSPORT_COLLECTIONS, POPULAR_COMPARISONS } from "./geography";
import type { PassportAccess, Region, SnapshotManifest } from "./types";
import { REGIONS } from "./types";
import { destinationSlug, evidenceRelationshipPairs, visaRelationshipHref } from "./visa-evidence";

export const SITEMAP_ORIGIN = "https://multipassrank.com";

export interface SitemapUrl {
  loc: string;
  priority: string;
}

export interface SitemapIndexEntry {
  loc: string;
  lastModified: string;
}

const STATIC_PATHS = [
  "",
  "rank",
  "destinations",
  "status",
  "compare",
  "improve",
  "dual-passport",
  "dual-citizenship-countries",
  "citizenship-by-descent",
  "best-passport-combination",
  "best-second-passport-for-us-citizens",
  "how-many-passports-to-cover-the-world",
  "how-many-passports-can-you-have",
  "evisa-vs-eta",
  "methodology",
  "data-license",
  "ai",
] as const;

export function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] ?? character);
}

export function sitemapLastModified(manifest: SnapshotManifest): string {
  const checkedAt = manifest.checkedAt.slice(0, 10);
  return checkedAt > "2026-08-31" ? checkedAt : "2026-08-31";
}

export function sitemapRegionSlug(region: Region): string {
  return region.toLowerCase().replaceAll(" ", "-");
}

export function sitemapIndexEntries(manifest: SnapshotManifest): SitemapIndexEntry[] {
  const lastModified = sitemapLastModified(manifest);
  return [
    { loc: `${SITEMAP_ORIGIN}/sitemaps/core.xml`, lastModified },
    ...REGIONS.map((region) => ({
      loc: `${SITEMAP_ORIGIN}/sitemaps/relationships-${sitemapRegionSlug(region)}.xml`,
      lastModified,
    })),
  ];
}

function uniqueUrls(urls: SitemapUrl[]): SitemapUrl[] {
  return [...urls.reduce((byLocation, entry) => {
    const existing = byLocation.get(entry.loc);
    if (!existing || Number(entry.priority) > Number(existing.priority)) byLocation.set(entry.loc, entry);
    return byLocation;
  }, new Map<string, SitemapUrl>()).values()];
}

export function coreSitemapUrls(manifest: SnapshotManifest): SitemapUrl[] {
  return uniqueUrls([
    ...STATIC_PATHS.map((path) => ({ loc: `${SITEMAP_ORIGIN}/${path}`, priority: path ? "0.7" : "1.0" })),
    ...PASSPORT_COLLECTIONS.map((collection) => ({
      loc: `${SITEMAP_ORIGIN}/${collection.slug}`,
      priority: "0.8",
    })),
    ...POPULAR_COMPARISONS.map((comparison) => ({
      loc: `${SITEMAP_ORIGIN}/${comparison.slug}`,
      priority: "0.7",
    })),
    ...manifest.passports.map((passport) => ({
      loc: `${SITEMAP_ORIGIN}/passport/${passport.slug}`,
      priority: "0.8",
    })),
    ...manifest.destinations.map((destination) => ({
      loc: `${SITEMAP_ORIGIN}/destination/${destinationSlug(destination)}`,
      priority: "0.7",
    })),
  ]);
}

export function relationshipSitemapUrls(
  manifest: SnapshotManifest,
  details: Record<string, PassportAccess>,
  passportRegion: Region,
): SitemapUrl[] {
  return uniqueUrls(evidenceRelationshipPairs(manifest).flatMap(({ passport, destination, status }) =>
    status !== "citizenship"
      && passport.region === passportRegion
      && details[passport.code]?.statuses[destination.code] === status
      ? [{ loc: `${SITEMAP_ORIGIN}${visaRelationshipHref(passport, destination, status)}`, priority: "0.6" }]
      : [],
  ));
}

export function renderSitemapIndex(entries: readonly SitemapIndexEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(({ loc, lastModified }) =>
      `  <sitemap><loc>${escapeXml(loc)}</loc><lastmod>${lastModified}</lastmod></sitemap>`)
    .join("\n")}\n</sitemapindex>\n`;
}

export function renderSitemapUrlSet(urls: readonly SitemapUrl[], lastModified: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(({ loc, priority }) =>
      `  <url><loc>${escapeXml(loc)}</loc><lastmod>${lastModified}</lastmod><priority>${priority}</priority></url>`)
    .join("\n")}\n</urlset>\n`;
}
