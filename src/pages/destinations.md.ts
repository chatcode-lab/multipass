import type { APIRoute } from "astro";
import { getDataContext } from "@/lib/data";
import { markdownResponse } from "@/lib/markdown";
import { destinationsMarkdown } from "@/lib/markdown-content";

export const GET: APIRoute = async ({ locals }) => {
  const { manifest } = await getDataContext(locals);
  return markdownResponse(destinationsMarkdown(manifest), "/destinations");
};
