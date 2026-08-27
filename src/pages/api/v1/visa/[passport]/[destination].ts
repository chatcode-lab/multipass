import type { APIRoute } from "astro";
import { getDataContext, getPassportAccess } from "@/lib/data";
import { getVisaRelationshipEvidence } from "@/lib/visa-evidence";

export const GET: APIRoute = async ({ locals, params }) => {
  const passportCode = params.passport?.toUpperCase() ?? "";
  const destinationCode = params.destination?.toUpperCase() ?? "";
  const { manifest, source } = await getDataContext(locals);
  const passport = manifest.passports.find(({ code }) => code === passportCode);
  const destination = manifest.destinations.find(({ code }) => code === destinationCode);
  if (!passport || !destination) {
    return Response.json({ error: "Passport or destination not found" }, { status: 404 });
  }

  const access = await getPassportAccess(locals, passportCode, manifest.version);
  if (!access) return Response.json({ error: "Passport data unavailable" }, { status: 503 });
  const status = access.statuses[destinationCode] ?? "unknown";
  const evidence = getVisaRelationshipEvidence(passportCode, destinationCode, status);

  return Response.json({
    schemaVersion: 1,
    source,
    checkedAt: manifest.checkedAt,
    passport: { code: passport.code, name: passport.name, slug: passport.slug },
    destination: { code: destination.code, name: destination.name },
    status,
    evidenceLevel: evidence.evidenceLevel,
    allowedStays: evidence.allowedStays,
    policies: evidence.policies.map((policy) => ({
      id: policy.id,
      title: policy.title,
      summary: policy.summary,
      status: policy.status,
      announcedOn: policy.announcedOn,
      effectiveFrom: policy.effectiveFrom,
      effectiveTo: policy.effectiveTo,
      conditions: policy.conditions,
      sourceIds: policy.sourceIds,
      application: policy.application,
    })),
    conditional: evidence.conditional,
    sources: evidence.sources,
  }, {
    headers: {
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
