import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { comparisonHref, improveHref, rankHref } from "@/lib/geography";
import { absoluteUrl, escapeMarkdown, markdownResponse } from "@/lib/markdown";
import { improvePassportSets, parsePassportSets } from "@/lib/passport";

export const GET: APIRoute = async ({ locals, url }) => {
  const { manifest } = await getDataContext(locals);
  const sets = parsePassportSets(url.searchParams.getAll("set"), new Set(manifest.passports.map((passport) => passport.code)));
  if (!sets.length) {
    return markdownResponse(`# Improve Passport

Build an ordered sequence of up to five passport sets. The first set is the baseline; each later set is measured against the cumulative access of every preceding set.

- Example: \`${absoluteUrl("/improve?set=US&set=IT&set=IE,PT")}\`
- Markdown result: \`${absoluteUrl("/improve.md?set=US&set=IT&set=IE,PT")}\`
- Each passport can appear once, with up to ten passports across the full sequence.

[Open the interactive Improve Passport tool](${absoluteUrl("/improve")})`, "/improve");
  }

  const codes = sets.flatMap((set) => set.codes);
  if (new Set(codes).size !== codes.length || codes.length > 10) {
    return markdownResponse("# Invalid improvement sequence\n\nEach passport may appear once, with ten passports maximum.", "/improve", true);
  }
  const details = await getPassportAccessBatch(locals, codes, manifest.version);
  const result = improvePassportSets(sets, manifest, details);
  const destinationByCode = new Map(manifest.destinations.map((destination) => [destination.code, destination]));
  const stages = result.stages.map((stage, index) => {
    const gains = stage.gainedDestinationCodes.map((code) => destinationByCode.get(code)?.name ?? code);
    return `## Stage ${index + 1}: ${escapeMarkdown(stage.name)}

- Added set: ${stage.addedCodes.join(", ")}
- Cumulative set: ${stage.cumulativeCodes.join(", ")}
- Cumulative mobility score: **${stage.mobilityScore}**
- Rank equivalent: **#${stage.rankEquivalent}**
- ${index === 0 ? "Baseline easy-access destinations" : "New easy-access destinations"}: **${stage.marginalEasyDestinations}**
${index > 0 ? `- Gains: ${gains.map(escapeMarkdown).join(" · ") || "None"}` : ""}`;
  }).join("\n\n");
  const cumulativeSets = result.stages.map((stage) => stage.cumulativeCodes);
  const finalSet = result.stages.at(-1)?.cumulativeCodes ?? [];

  return markdownResponse(`# Improve Passport: incremental combination result

Order matters. Each stage is measured against the combined easy access accumulated before it. Data checked ${new Date(result.checkedAt).toISOString().slice(0, 10)}.

${stages}

## Related views

- [Open this interactive sequence](${absoluteUrl(improveHref(sets.map((set) => set.codes)))})
- [Compare the cumulative stages](${absoluteUrl(comparisonHref(cumulativeSets))})
- [Place the final combination in the global ranking](${absoluteUrl(rankHref([finalSet]))})
- [Read the scoring methodology](${absoluteUrl("/methodology")})`, "/improve", true);
};
