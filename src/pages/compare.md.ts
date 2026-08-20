import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { getFriendlyComparison, POPULAR_COMPARISONS } from "@/lib/geography";
import { absoluteUrl, markdownResponse } from "@/lib/markdown";
import { comparisonMarkdown } from "@/lib/markdown-content";
import { comparePassportSets, parsePassportSets } from "@/lib/passport";

export const GET: APIRoute = async ({ locals, url }) => {
  const { manifest } = await getDataContext(locals);
  const sets = parsePassportSets(url.searchParams.getAll("set"), new Set(manifest.passports.map((passport) => passport.code)));
  const friendlyComparison = getFriendlyComparison(sets.map((set) => set.codes));
  if (url.searchParams.has("set") && friendlyComparison) {
    return new Response(null, {
      status: 308,
      headers: {
        Location: `/${friendlyComparison.slug}.md`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
  if (!sets.length) {
    const popular = POPULAR_COMPARISONS.map((comparison) =>
      `- [${comparison.heading}](${absoluteUrl(`/${comparison.slug}`)})`,
    ).join("\n");
    return markdownResponse(`# Compare passports and combined access

Build up to five passport sets. The interactive editor supports five passports per set, while direct research URLs and the JSON API accept up to ten. MultiPass Rank keeps the easiest entry status available for every destination and calculates a rank equivalent for combinations.

## Popular comparisons

${popular}

[Open the interactive comparison tool](${absoluteUrl("/compare")})`, "/compare");
  }
  const details = await getPassportAccessBatch(locals, sets.flatMap((set) => set.codes), manifest.version);
  const result = comparePassportSets(sets, manifest, details);
  return markdownResponse(comparisonMarkdown(result), "/compare", true);
};
