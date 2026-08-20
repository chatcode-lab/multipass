import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { customRankingMarkdown } from "@/lib/markdown-content";
import { markdownResponse } from "@/lib/markdown";
import { comparePassportSets, parsePassportSets } from "@/lib/passport";

export const GET: APIRoute = async ({ locals, url }) => {
  const { manifest } = await getDataContext(locals);
  const sets = parsePassportSets(url.searchParams.getAll("set"), new Set(manifest.passports.map((passport) => passport.code)));
  if (!sets.length) return markdownResponse(customRankingMarkdown(manifest, null), "/rank");
  const details = await getPassportAccessBatch(locals, sets.flatMap((set) => set.codes), manifest.version);
  const result = comparePassportSets(sets, manifest, details);
  return markdownResponse(customRankingMarkdown(manifest, result), "/rank", true);
};
