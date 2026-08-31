import type { APIRoute } from "astro";
import { z } from "zod";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import {
  improvePassportSets,
  MAX_IMPROVEMENT_PASSPORTS,
  MAX_PASSPORTS_PER_SET,
  MAX_PASSPORT_SETS,
  normalizeCode,
} from "@/lib/passport";

const requestSchema = z.object({
  sets: z.array(
    z.array(z.string().trim().min(2).max(3)).min(1).max(MAX_PASSPORTS_PER_SET),
  ).min(1).max(MAX_PASSPORT_SETS),
});

export const POST: APIRoute = async ({ locals, request }) => {
  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 4_096) return Response.json({ error: "Request body is too large" }, { status: 413 });
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Choose up to five ordered sets" }, { status: 400 });
  }

  const { manifest } = await getDataContext(locals);
  const validCodes = new Set(manifest.passports.map((passport) => passport.code));
  const sets = parsed.data.sets.map((codes) => ({ codes: [...new Set(codes.map(normalizeCode))] }));
  const allCodes = sets.flatMap((set) => set.codes);
  if (allCodes.length > MAX_IMPROVEMENT_PASSPORTS) {
    return Response.json({ error: `Choose no more than ${MAX_IMPROVEMENT_PASSPORTS} passports in total` }, { status: 400 });
  }
  if (new Set(allCodes).size !== allCodes.length) {
    return Response.json({ error: "Each passport can appear only once" }, { status: 400 });
  }
  if (allCodes.some((code) => !validCodes.has(code))) {
    return Response.json({ error: "One or more passport codes are invalid" }, { status: 400 });
  }

  const details = await getPassportAccessBatch(locals, allCodes, manifest.version);
  try {
    return Response.json(improvePassportSets(sets, manifest, details), {
      headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Improvement sequence failed" }, { status: 422 });
  }
};
