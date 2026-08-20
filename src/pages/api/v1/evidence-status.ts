import type { APIRoute } from "astro";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { buildEvidenceStatusRegion } from "@/lib/evidence-status";
import { REGIONS, type Region } from "@/lib/types";

export const GET: APIRoute = async ({ locals, url }) => {
  const requestedRegion = (url.searchParams.get("region") ?? "EUROPE").toUpperCase();
  if (!REGIONS.includes(requestedRegion as Region)) {
    return Response.json(
      { error: `Unknown region. Use one of: ${REGIONS.join(", ")}.` },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  }

  const { manifest } = await getDataContext(locals);
  const details = await getPassportAccessBatch(
    locals,
    manifest.passports.map(({ code }) => code),
    manifest.version,
  );
  const matrix = buildEvidenceStatusRegion(manifest, details, requestedRegion as Region);

  return Response.json(matrix, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
};
