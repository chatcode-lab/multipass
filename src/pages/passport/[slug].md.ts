import type { APIRoute } from "astro";
import { getDataContext, getPassportAccess } from "@/lib/data";
import { markdownResponse } from "@/lib/markdown";
import { passportMarkdown } from "@/lib/markdown-content";
import { resolvePassportBySlug } from "@/lib/visa-evidence";

export const GET: APIRoute = async ({ locals, params }) => {
  const { manifest } = await getDataContext(locals);
  const passport = resolvePassportBySlug(params.slug, manifest);
  if (!passport) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  if (params.slug !== passport.slug) {
    return new Response(null, {
      status: 308,
      headers: { Location: `/passport/${passport.slug}.md`, "Cache-Control": "public, max-age=3600" },
    });
  }
  const detail = await getPassportAccess(locals, passport.code, manifest.version);
  if (!detail) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  return markdownResponse(passportMarkdown(manifest, passport, detail), `/passport/${passport.slug}`);
};
