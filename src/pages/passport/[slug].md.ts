import type { APIRoute } from "astro";
import { getDataContext, getPassportAccess } from "@/lib/data";
import { markdownResponse } from "@/lib/markdown";
import { passportMarkdown } from "@/lib/markdown-content";

export const GET: APIRoute = async ({ locals, params }) => {
  const { manifest } = await getDataContext(locals);
  const passport = manifest.passports.find((entry) => entry.slug === params.slug);
  if (!passport) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  const detail = await getPassportAccess(locals, passport.code, manifest.version);
  if (!detail) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  return markdownResponse(passportMarkdown(manifest, passport, detail), `/passport/${passport.slug}`);
};
