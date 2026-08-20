import type { APIRoute } from "astro";
import { getDataContext } from "@/lib/data";
import { absoluteUrl, markdownResponse } from "@/lib/markdown";
import { rankingMarkdown } from "@/lib/markdown-content";
import { PASSPORT_COLLECTIONS } from "@/lib/geography";

export const GET: APIRoute = async ({ locals }) => {
  const { manifest } = await getDataContext(locals);
  const collections = PASSPORT_COLLECTIONS.map((collection) =>
    `- [${collection.heading}](${absoluteUrl(`/${collection.slug}`)})`,
  ).join("\n");
  const rankedCodes = new Set(manifest.passports.map((passport) => passport.code));
  const unranked = manifest.destinations
    .filter((destination) => !rankedCodes.has(destination.code))
    .map((destination) => `- ${destination.name} (${destination.code}) — tracked destination, no separate passport rank`)
    .join("\n");
  const body = `${rankingMarkdown(
    manifest,
    "Passport combination calculator and global passport ranking",
    `Calculate combined passport power and compare the strength of ${manifest.passports.length} passports across ${manifest.destinations.length} destinations.`,
    manifest.passports,
  )}\n\n## Passport combination research\n\n- [Best two- and three-passport combinations](${absoluteUrl("/best-passport-combination")})\n- [Exact minimum set for all tracked destinations](${absoluteUrl("/how-many-passports-to-cover-the-world")})\n- [How many passports one person can have](${absoluteUrl("/how-many-passports-can-you-have")})\n\n## Destinations without a separate passport rank\n\n${unranked}\n\n## Regional and language rankings\n\n${collections}`;
  return markdownResponse(body, "/");
};
