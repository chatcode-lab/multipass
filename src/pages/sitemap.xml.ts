import type { APIRoute } from "astro";
import { getDataContext } from "@/lib/data";
import { renderSitemapIndex, sitemapIndexEntries } from "@/lib/sitemap";

export const GET: APIRoute = async ({ locals }) => {
  const { manifest } = await getDataContext(locals);
  return new Response(renderSitemapIndex(sitemapIndexEntries(manifest)), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
