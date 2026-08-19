import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { POPULAR_COMPARISONS } from "@/lib/geography";
import { absoluteUrl, markdownResponse } from "@/lib/markdown";
import { comparisonMarkdown } from "@/lib/markdown-content";
import { comparePassportSets, parsePassportSets } from "@/lib/passport";

export const GET: APIRoute = async ({ locals, url }) => {
  const { manifest } = await getDataContext(locals);
  const sets = parsePassportSets(url.searchParams.getAll("set"), new Set(manifest.passports.map((passport) => passport.code)));
  if (!sets.length) {
    const popular = POPULAR_COMPARISONS.map((comparison) =>
      `- [${comparison.heading}](${absoluteUrl(`/compare/${comparison.slug}`)})`,
    ).join("\n");
    return markdownResponse(`# Compare passports and combined access

Build up to five passport sets, with up to five passports in each set. Multipass Rank keeps the easiest entry status available for every destination and calculates a rank equivalent for combinations.

## Popular comparisons

${popular}

[Open the interactive comparison tool](${absoluteUrl("/compare")})`, "/compare");
  }
  const details = await getPassportAccessBatch(locals, sets.flatMap((set) => set.codes), manifest.version);
  const result = comparePassportSets(sets, manifest, details);
  return markdownResponse(comparisonMarkdown(result), "/compare", true);
};
