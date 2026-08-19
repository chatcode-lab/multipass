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
  const body = `${rankingMarkdown(
    manifest,
    "Passport combination calculator and global passport ranking",
    `Calculate combined passport power and compare the strength of ${manifest.passports.length} passports across ${manifest.destinations.length} destinations.`,
    manifest.passports,
  )}\n\n## Regional and language rankings\n\n${collections}`;
  return markdownResponse(body, "/");
};
