import type { APIRoute } from "astro";
import { getDataContext, getPassportAccess, getPassportAccessBatch } from "@/lib/data";
import { getPassportCollection, getPopularComparison, passportsInCollection } from "@/lib/geography";
import { markdownResponse } from "@/lib/markdown";
import { comparisonMarkdown, rankingMarkdown } from "@/lib/markdown-content";
import { comparePassportSets } from "@/lib/passport";
import type { AccessStatus } from "@/lib/types";
import { getVisaRelationshipEvidence, resolveVisaRelationshipSlug, visaRelationshipSlug } from "@/lib/visa-evidence";
import { visaRelationshipMarkdown } from "@/lib/visa-markdown";

export const GET: APIRoute = async ({ locals, params }) => {
  const collection = getPassportCollection(params.collection);
  const comparison = getPopularComparison(params.collection);
  if (comparison && params.collection !== comparison.slug) {
    return new Response(null, {
      status: 308,
      headers: {
        Location: `/${comparison.slug}.md`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
  const { manifest } = await getDataContext(locals);
  if (!collection && !comparison) {
    const relationship = resolveVisaRelationshipSlug(params.collection, manifest);
    if (!relationship) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
    const detail = await getPassportAccess(locals, relationship.passport.code, manifest.version);
    if (!detail) return new Response("# Not found\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
    const status = detail.statuses[relationship.destination.code] ?? "unknown" as AccessStatus;
    if (status === "citizenship") {
      return new Response(null, {
        status: 308,
        headers: { Location: `/passport/${relationship.passport.slug}.md`, "Cache-Control": "public, max-age=3600" },
      });
    }
    const canonicalSlug = visaRelationshipSlug(relationship.passport, relationship.destination, status);
    if (params.collection !== canonicalSlug) {
      return new Response(null, { status: 308, headers: { Location: `/${canonicalSlug}.md`, "Cache-Control": "public, max-age=3600" } });
    }
    const evidence = getVisaRelationshipEvidence(relationship.passport.code, relationship.destination.code, status);
    return markdownResponse(
      visaRelationshipMarkdown(manifest, relationship.passport, relationship.destination, status, evidence),
      `/${canonicalSlug}`,
      !evidence.supportsCurrentStatus,
    );
  }
  if (collection) {
    const passports = passportsInCollection(manifest.passports, collection);
    return markdownResponse(
      rankingMarkdown(manifest, collection.heading, collection.description, passports, true),
      `/${collection.slug}`,
    );
  }
  const sets = comparison!.sets.map((codes) => ({ codes: [...codes] }));
  const details = await getPassportAccessBatch(locals, sets.flatMap((set) => set.codes), manifest.version);
  const result = comparePassportSets(sets, manifest, details);
  return markdownResponse(comparisonMarkdown(result, comparison!.heading), `/${comparison!.slug}`);
};
