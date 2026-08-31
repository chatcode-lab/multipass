import type { APIRoute } from "astro";
import { CITIZENSHIP_POLICIES, CITIZENSHIP_POLICY_STATUS_META } from "@/data/citizenship-policies";

export const GET: APIRoute = () => Response.json({
  reviewedAt: "2026-08-31",
  scope: "Official-source, country-level multiple-citizenship policy summaries. Personal facts and the laws of every country in a combination still control.",
  statuses: CITIZENSHIP_POLICY_STATUS_META,
  policies: CITIZENSHIP_POLICIES,
}, {
  headers: {
    "Cache-Control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800",
    "X-Content-Type-Options": "nosniff",
  },
});
