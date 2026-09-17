import type { APIRoute } from "astro";
import { getDataContext } from "@/lib/data";
import { countryProfileJson, PROFILE_CACHE_CONTROL } from "@/lib/country-profiles";

export const GET: APIRoute = async ({ locals, params }) => {
  const { manifest } = await getDataContext(locals);
  const code = params.code?.toUpperCase();
  const passport = manifest.passports.find((entry) => entry.code === code);
  if (!passport) return Response.json({ error: "Unknown passport code" }, { status: 404 });
  if (params.code !== code) return new Response(null, { status: 308, headers: { Location: `/api/v1/country-profiles/${code}` } });
  return Response.json(countryProfileJson(passport.code, passport.slug), { headers: { "Cache-Control": PROFILE_CACHE_CONTROL } });
};
