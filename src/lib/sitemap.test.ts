import { describe, expect, it } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import { applyAccessOverrides } from "./passport";
import {
  coreSitemapUrls,
  relationshipSitemapUrls,
  renderSitemapIndex,
  renderSitemapUrlSet,
  sitemapIndexEntries,
} from "./sitemap";
import { REGIONS, type DataSnapshot } from "./types";

const snapshot = fallbackSnapshot as DataSnapshot;
const details = Object.fromEntries(
  Object.entries(snapshot.passports).map(([code, detail]) => [code, applyAccessOverrides(detail)]),
);

describe("sitemaps", () => {
  it("keeps the submitted URL as an index of one core and seven regional relationship shards", () => {
    const entries = sitemapIndexEntries(snapshot.manifest);
    const xml = renderSitemapIndex(entries);

    expect(entries).toHaveLength(1 + REGIONS.length);
    expect(entries[0].loc).toBe("https://multipassrank.com/sitemaps/core.xml");
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("relationships-middle-east.xml");
  });

  it("publishes every canonical page once without query or markdown variants", () => {
    const groups = [
      coreSitemapUrls(snapshot.manifest),
      ...REGIONS.map((region) => relationshipSitemapUrls(snapshot.manifest, details, region)),
    ];
    const urls = groups.flat().map(({ loc }) => loc);

    expect(urls).toHaveLength(41_264);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url.startsWith("https://multipassrank.com/") && !url.includes("?") && !url.endsWith(".md")))
      .toBe(true);
    expect(Math.max(...groups.map((group) => group.length))).toBeLessThan(50_000);
  });

  it("escapes sitemap values as XML", () => {
    const xml = renderSitemapUrlSet([
      { loc: "https://multipassrank.com/example?a=1&b=2", priority: "0.7" },
    ], "2026-08-28");

    expect(xml).toContain("a=1&amp;b=2");
  });
});
