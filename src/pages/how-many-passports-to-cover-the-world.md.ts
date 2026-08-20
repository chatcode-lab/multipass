import type { APIRoute } from "astro";
import { getCombinationInsights, getDataContext } from "@/lib/data";
import { markdownResponse } from "@/lib/markdown";
import { worldCoverageMarkdown } from "@/lib/research-content";

export const GET: APIRoute = async ({ locals }) => {
  const { manifest } = await getDataContext(locals);
  const insights = await getCombinationInsights(locals, manifest.version);
  return markdownResponse(
    worldCoverageMarkdown(manifest, insights),
    "/how-many-passports-to-cover-the-world",
  );
};
