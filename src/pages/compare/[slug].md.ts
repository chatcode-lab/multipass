import type { APIRoute } from "astro";
import { getPopularComparison } from "@/lib/geography";

export const GET: APIRoute = async ({ params, url }) => {
  const comparison = getPopularComparison(params.slug);
  if (!comparison) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  return new Response(null, {
    status: 308,
    headers: {
      Location: new URL(`/${comparison.slug}.md`, url).toString(),
      "Cache-Control": "public, max-age=3600",
    },
  });
};
