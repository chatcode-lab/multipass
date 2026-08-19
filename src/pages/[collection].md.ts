import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { getPassportCollection, getPopularComparison, passportsInCollection } from "@/lib/geography";
import { markdownResponse } from "@/lib/markdown";
import { comparisonMarkdown, rankingMarkdown } from "@/lib/markdown-content";
import { comparePassportSets } from "@/lib/passport";

export const GET: APIRoute = async ({ locals, params }) => {
  const collection = getPassportCollection(params.collection);
  const comparison = getPopularComparison(params.collection);
  if (!collection && !comparison) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  if (comparison && params.collection !== comparison.slug) {
    return new Response(null, {
      status: 308,
      headers: {
        Location: `/${comparison.slug}.md`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
  const { manifest } = await getDataContext(locals);
  if (collection) {
    const passports = passportsInCollection(manifest.passports, collection);
    return markdownResponse(
      rankingMarkdown(manifest, collection.heading, collection.description, passports, true),
      `/${collection.slug}`,
    );
  }
  const sets = comparison!.sets.map((codes) => ({ codes: [...codes] }));
  const details = await getPassportAccessBatch(locals, sets.flatMap((set) => set.codes), manifest.version);
  const result = comparePassportSets(sets, manifest, details);
  return markdownResponse(comparisonMarkdown(result, comparison!.heading), `/${comparison!.slug}`);
};
