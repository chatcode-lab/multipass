import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import {
  coreSitemapUrls,
  relationshipSitemapUrls,
  renderSitemapUrlSet,
  sitemapLastModified,
  sitemapRegionSlug,
} from "@/lib/sitemap";
import { REGIONS, type Region } from "@/lib/types";

function regionForGroup(group: string | undefined): Region | undefined {
  if (!group?.startsWith("relationships-")) return undefined;
  const slug = group.slice("relationships-".length);
  return REGIONS.find((region) => sitemapRegionSlug(region) === slug);
}

export const GET: APIRoute = async ({ locals, params }) => {
  const { manifest } = await getDataContext(locals);
  const lastModified = sitemapLastModified(manifest);
  let urls;

  if (params.group === "core") {
    urls = coreSitemapUrls(manifest);
  } else {
    const region = regionForGroup(params.group);
    if (!region) return new Response("Sitemap not found", { status: 404 });
    const details = await getPassportAccessBatch(
      locals,
      manifest.passports.map((passport) => passport.code),
      manifest.version,
    );
    urls = relationshipSitemapUrls(manifest, details, region);
  }

  return new Response(renderSitemapUrlSet(urls, lastModified), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
