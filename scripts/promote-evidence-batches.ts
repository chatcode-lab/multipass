import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

interface CandidateSource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  jurisdiction: string;
  kind: string;
  language: string;
  reviewedAt: string;
  officialityEvidence: string;
  supportingExcerpt: string;
}

interface CandidatePolicy {
  id: string;
  confidence: string;
  [key: string]: unknown;
}

interface CandidateBatch {
  batchId: string;
  sources: CandidateSource[];
  policies: CandidatePolicy[];
}

const candidatePaths = process.argv.slice(2);
if (!candidatePaths.length) {
  throw new Error("Usage: npm run evidence:promote -- <reviewed-candidate.json> [...]");
}

const canonicalSource = await readFile(resolve("src/data/visa-evidence.ts"), "utf8");
const sourceSection = canonicalSource
  .split("export const OFFICIAL_VISA_SOURCES")[1]
  ?.split("const EU_EEA_SWISS_FREE_MOVEMENT_POLICIES")[0] ?? "";
const existingSourceIds = new Set(
  [...sourceSection.matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]),
);

const batches = await Promise.all(candidatePaths.map(async (candidatePath) =>
  JSON.parse(await readFile(resolve(candidatePath), "utf8")) as CandidateBatch));
const sources = new Map<string, Omit<CandidateSource, "officialityEvidence" | "supportingExcerpt">>();
const policies = new Map<string, Record<string, unknown>>();

for (const batch of batches) {
  for (const candidateSource of batch.sources) {
    const source = Object.fromEntries(Object.entries(candidateSource).filter(([key]) =>
      key !== "officialityEvidence" && key !== "supportingExcerpt")) as Omit<CandidateSource, "officialityEvidence" | "supportingExcerpt">;
    if (existingSourceIds.has(source.id)) continue;
    const previous = sources.get(source.id);
    if (previous && JSON.stringify(previous) !== JSON.stringify(source)) {
      throw new Error(`Source ${source.id} differs between selected candidates`);
    }
    sources.set(source.id, source);
  }
  for (const candidatePolicy of batch.policies) {
    const policy = Object.fromEntries(Object.entries(candidatePolicy).filter(([key]) =>
      key !== "confidence"));
    if (policies.has(candidatePolicy.id)) throw new Error(`Duplicate promoted policy ${candidatePolicy.id}`);
    policies.set(candidatePolicy.id, policy);
  }
}

const artifact = {
  batchIds: batches.map(({ batchId }) => batchId),
  sources: [...sources.values()],
  policies: [...policies.values()],
};

await writeFile(
  resolve("src/data/reviewed-visa-evidence.json"),
  `${JSON.stringify(artifact, null, 2)}\n`,
  "utf8",
);

process.stdout.write(`Promoted ${artifact.batchIds.length} batches: ${artifact.sources.length} sources, ${artifact.policies.length} policies.\n`);
