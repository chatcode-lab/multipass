import type { APIRoute } from "astro";
import { getCombinationInsights, getDataContext } from "@/lib/data";
import { markdownResponse } from "@/lib/markdown";
import { bestPassportCombinationMarkdown } from "@/lib/research-content";

export const GET: APIRoute = async ({ locals }) => {
  const { manifest } = await getDataContext(locals);
  const insights = await getCombinationInsights(locals, manifest.version);
  return markdownResponse(
    bestPassportCombinationMarkdown(manifest, insights),
    "/best-passport-combination",
  );
};
