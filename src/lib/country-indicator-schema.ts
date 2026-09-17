import { z } from "zod";

export const indicatorCandidateSchema = z.object({
  schemaVersion: z.literal(1), researcher: z.string().min(1), retrievedAt: z.iso.date(),
  sources: z.array(z.object({
    id: z.string(), publisher: z.string(), attribution: z.string(), title: z.string(),
    url: z.url(), dataUrl: z.url(), licenceUrl: z.url(), licence: z.string(), edition: z.string(),
    sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
  }).strict()).min(1),
  observations: z.array(z.object({
    code: z.string().regex(/^[A-Z]{2}$/), providerEntityCode: z.string().regex(/^[A-Z]{3}$/),
    providerEntityName: z.string(), geographicScope: z.string(),
    metric: z.enum(["hdi", "life_expectancy"]), sourceId: z.string(),
    period: z.string().regex(/^\d{4}$/), value: z.number().nullable(),
    availability: z.enum(["available", "not_reported", "scope_mismatch"]),
    unavailableReason: z.string().optional(),
  }).strict()).min(1),
}).strict().superRefine((data, ctx) => {
  const identities = data.observations.map((entry) => `${entry.code}/${entry.metric}`);
  const sources = new Set(data.sources.map((source) => source.id));
  if (new Set(identities).size !== identities.length || sources.size !== data.sources.length) ctx.addIssue({ code: "custom", message: "Duplicate indicator or source." });
  for (const row of data.observations) {
    if (!sources.has(row.sourceId)) ctx.addIssue({ code: "custom", message: "Missing indicator source." });
    if (row.availability !== "available") {
      if (row.value !== null || !row.unavailableReason) ctx.addIssue({ code: "custom", message: "Missing values require a null and reason." });
    } else if (row.value === null || row.value < 0 || row.value > (row.metric === "hdi" ? 1 : 130)) {
      ctx.addIssue({ code: "custom", message: "Invalid indicator value." });
    }
  }
});

export type IndicatorCandidate = z.infer<typeof indicatorCandidateSchema>;

/** RFC-style quoted fields, including commas/newlines and escaped quotes. */
export function parseIndicatorCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && input[index + 1] === "\n") index += 1;
      row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  row.push(cell); if (row.some(Boolean)) rows.push(row);
  if (rows.some((entry) => entry.length !== rows[0].length)) throw new Error("Inconsistent CSV column count");
  return rows;
}
