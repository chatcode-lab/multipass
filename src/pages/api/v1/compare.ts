import type { APIRoute } from "astro";
import { z } from "zod";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { comparePassportSets, normalizeCode } from "@/lib/passport";

const requestSchema = z.object({
  sets: z.array(z.array(z.string().trim().min(2).max(3)).min(1).max(5)).min(1).max(5),
});

export const POST: APIRoute = async ({ locals, request }) => {
  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 4_096) {
      return Response.json({ error: "Request body is too large" }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Choose up to five sets of five passports" }, { status: 400 });

  const { manifest } = await getDataContext(locals);
  const validCodes = new Set(manifest.passports.map((passport) => passport.code));
  const sets = parsed.data.sets.map((codes) => ({ codes: [...new Set(codes.map(normalizeCode))] }));
  if (sets.some((set) => set.codes.some((code) => !validCodes.has(code)))) {
    return Response.json({ error: "One or more passport codes are invalid" }, { status: 400 });
  }

  const details = await getPassportAccessBatch(locals, sets.flatMap((set) => set.codes), manifest.version);
  try {
    const result = comparePassportSets(sets, manifest, details);
    return Response.json(result, {
      headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Comparison failed" }, { status: 422 });
  }
};
