import type { APIRoute } from "astro";
import { getDataContext, getPassportAccess } from "@/lib/data";

export const GET: APIRoute = async ({ locals, params }) => {
  const code = params.code?.toUpperCase() ?? "";
  const { manifest } = await getDataContext(locals);
  if (!manifest.passports.some((passport) => passport.code === code)) {
    return Response.json({ error: "Passport not found" }, { status: 404 });
  }
  const passport = await getPassportAccess(locals, code, manifest.version);
  if (!passport) return Response.json({ error: "Passport data unavailable" }, { status: 503 });
  return Response.json(passport, {
    headers: {
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

