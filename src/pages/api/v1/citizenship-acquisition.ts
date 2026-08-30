import type { APIRoute } from "astro";
import { CITIZENSHIP_ACQUISITION_ROUTES, CITIZENSHIP_ROUTE_TYPE_LABELS } from "@/data/citizenship-acquisition";

export const GET: APIRoute = () => Response.json({
  reviewedAt: "2026-08-30",
  scope: "Official-source summaries of selected citizenship acquisition routes. A route record does not establish individual eligibility or compatibility with another nationality.",
  routeTypes: CITIZENSHIP_ROUTE_TYPE_LABELS,
  routes: CITIZENSHIP_ACQUISITION_ROUTES,
}, {
  headers: {
    "Cache-Control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800",
    "X-Content-Type-Options": "nosniff",
  },
});

