import type { APIRoute } from "astro";
import { agentGuideMarkdown } from "@/lib/ai-guide";

export const GET: APIRoute = async () => new Response(`${agentGuideMarkdown().trim()}\n`, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800",
    Link: "<https://multipassrank.com/ai>; rel=\"canonical\"",
  },
});
