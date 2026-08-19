import type { APIRoute } from "astro";
import { getDataContext } from "@/lib/data";
import { getPassportCollection, passportsInCollection } from "@/lib/geography";
import { markdownResponse } from "@/lib/markdown";
import { rankingMarkdown } from "@/lib/markdown-content";

export const GET: APIRoute = async ({ locals, params }) => {
  const collection = getPassportCollection(params.collection);
  if (!collection) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  const { manifest } = await getDataContext(locals);
  const passports = passportsInCollection(manifest.passports, collection);
  return markdownResponse(
    rankingMarkdown(manifest, collection.heading, collection.description, passports, true),
    `/${collection.slug}`,
  );
};
