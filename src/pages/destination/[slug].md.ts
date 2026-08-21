import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { markdownResponse } from "@/lib/markdown";
import type { AccessStatus } from "@/lib/types";
import { destinationSlug, officialSourcesForPolicies, policiesForDestination, resolveDestinationBySlug } from "@/lib/visa-evidence";
import { destinationVisaMarkdown } from "@/lib/visa-markdown";

export const GET: APIRoute = async ({ locals, params }) => {
  const { manifest } = await getDataContext(locals);
  const destination = resolveDestinationBySlug(params.slug, manifest);
  if (!destination) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  if (params.slug !== destinationSlug(destination)) {
    return new Response(null, {
      status: 308,
      headers: { Location: `/destination/${destinationSlug(destination)}.md`, "Cache-Control": "public, max-age=3600" },
    });
  }
  const details = await getPassportAccessBatch(locals, manifest.passports.map((passport) => passport.code), manifest.version);
  const rows = manifest.passports.map((passport) => ({
    passport,
    status: details[passport.code]?.statuses[destination.code] ?? "unknown" as AccessStatus,
  }));
  const policies = policiesForDestination(destination.code);
  return markdownResponse(
    destinationVisaMarkdown(manifest, destination, rows, policies, officialSourcesForPolicies(policies)),
    `/destination/${destinationSlug(destination)}`,
  );
};
