import type { APIRoute } from "astro";
import { getDataContext } from "@/lib/data";
import { resolvePassportBySlug } from "@/lib/visa-evidence";
import { markdownResponse } from "@/lib/markdown";
import { countryTopic, countryTopicHref, countryTopicMarkdown } from "@/lib/country-profiles";

export const GET: APIRoute = async ({ locals, params }) => {
  const { manifest } = await getDataContext(locals);
  const passport = resolvePassportBySlug(params.slug, manifest);
  const topic = passport && countryTopic(passport.code, params.topic);
  if (!passport || !topic) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8", "X-Robots-Tag": "noindex" } });
  const canonical = countryTopicHref(passport.slug, topic.topic);
  if (params.slug !== passport.slug) return new Response(null, { status: 308, headers: { Location: `${canonical}.md` } });
  return markdownResponse(countryTopicMarkdown(topic, passport.slug), canonical);
};
