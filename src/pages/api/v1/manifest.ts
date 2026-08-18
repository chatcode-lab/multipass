import type { APIRoute } from "astro";
import { getDataContext } from "@/lib/data";

export const GET: APIRoute = async ({ locals }) => {
  const context = await getDataContext(locals);
  return Response.json(context, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

