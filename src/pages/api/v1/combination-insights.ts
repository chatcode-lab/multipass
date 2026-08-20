import type { APIRoute } from "astro";
import { getCombinationInsights, getDataContext } from "@/lib/data";

export const GET: APIRoute = async ({ locals }) => {
  const { manifest } = await getDataContext(locals);
  const insights = await getCombinationInsights(locals, manifest.version);
  return Response.json(insights, {
    headers: {
      "Cache-Control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
