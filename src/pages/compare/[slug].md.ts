import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { getPopularComparison } from "@/lib/geography";
import { markdownResponse } from "@/lib/markdown";
import { comparisonMarkdown } from "@/lib/markdown-content";
import { comparePassportSets } from "@/lib/passport";

export const GET: APIRoute = async ({ locals, params }) => {
  const comparison = getPopularComparison(params.slug);
  if (!comparison) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  const { manifest } = await getDataContext(locals);
  const sets = comparison.sets.map((codes) => ({ codes: [...codes] }));
  const details = await getPassportAccessBatch(locals, sets.flatMap((set) => set.codes), manifest.version);
  const result = comparePassportSets(sets, manifest, details);
  return markdownResponse(comparisonMarkdown(result, comparison.heading), `/compare/${comparison.slug}`);
};
