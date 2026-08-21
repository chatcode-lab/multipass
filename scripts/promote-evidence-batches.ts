import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { relative, resolve, sep } from "node:path";

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

interface ReviewedArtifact {
  batchIds: string[];
  sources: Array<Omit<CandidateSource, "officialityEvidence" | "supportingExcerpt">>;
  policies: Array<Record<string, unknown> & { id: string }>;
}

const args = process.argv.slice(2);
const append = args.includes("--append");
const replace = args.includes("--replace");
if (append && replace) throw new Error("Choose either --append or --replace");
const candidatePaths = args.filter((arg) => arg !== "--append" && arg !== "--replace");
if (!candidatePaths.length) {
  throw new Error("Usage: npm run evidence:promote -- [--append|--replace] <reviewed-candidate.json> [...]");
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
const artifactPath = resolve("src/data/reviewed-visa-evidence.json");
const existingArtifact = append || replace
  ? JSON.parse(await readFile(artifactPath, "utf8")) as ReviewedArtifact
  : { batchIds: [], sources: [], policies: [] };
let committedArtifact: ReviewedArtifact | undefined;

if (replace) {
  const run = promisify(execFile);
  const { stdout: committedArtifactSource } = await run(
    "git",
    ["show", "HEAD:src/data/reviewed-visa-evidence.json"],
    { maxBuffer: 20 * 1024 * 1024 },
  );
  committedArtifact = JSON.parse(committedArtifactSource) as ReviewedArtifact;
  for (let index = 0; index < candidatePaths.length; index += 1) {
    const candidatePath = candidatePaths[index];
    const batch = batches[index];
    const repositoryPath = relative(process.cwd(), resolve(candidatePath)).split(sep).join("/");
    const { stdout } = await run("git", ["show", `HEAD:${repositoryPath}`], { maxBuffer: 10 * 1024 * 1024 });
    const previous = JSON.parse(stdout) as CandidateBatch;
    if (previous.batchId !== batch.batchId) {
      throw new Error(`Replacement batch mismatch: ${previous.batchId} != ${batch.batchId}`);
    }
    if (!existingArtifact.batchIds.includes(previous.batchId)) {
      throw new Error(`Cannot replace unpromoted batch ${previous.batchId}`);
    }

    const previousPolicyIds = new Set(previous.policies.map(({ id }) => id));
    existingArtifact.batchIds = existingArtifact.batchIds.filter((id) => id !== previous.batchId);
    existingArtifact.policies = existingArtifact.policies.filter(({ id }) => !previousPolicyIds.has(id));

    const retainedSourceIds = new Set(existingArtifact.policies.flatMap(({ sourceIds }) =>
      Array.isArray(sourceIds) ? sourceIds.filter((id): id is string => typeof id === "string") : []));
    const previousSourceIds = new Set(previous.sources.map(({ id }) => id));
    existingArtifact.sources = existingArtifact.sources.filter(({ id }) =>
      !previousSourceIds.has(id) || retainedSourceIds.has(id));
  }
}

const batchIds = new Set(existingArtifact.batchIds);
const reviewedSourceIds = new Set(existingArtifact.sources.map((source) => source.id));
const sources = new Map(existingArtifact.sources.map((source) => [source.id, source]));
const policies = new Map(existingArtifact.policies.map((policy) => [policy.id, policy]));

for (const batch of batches) {
  if (batchIds.has(batch.batchId)) throw new Error(`Duplicate promoted batch ${batch.batchId}`);
  batchIds.add(batch.batchId);
  for (const candidateSource of batch.sources) {
    const source = Object.fromEntries(Object.entries(candidateSource).filter(([key]) =>
      key !== "officialityEvidence" && key !== "supportingExcerpt")) as Omit<CandidateSource, "officialityEvidence" | "supportingExcerpt">;
    if (existingSourceIds.has(source.id) || reviewedSourceIds.has(source.id)) continue;
    const previous = sources.get(source.id);
    if (previous && JSON.stringify(previous) !== JSON.stringify(source)) {
      throw new Error(`Source ${source.id} differs between selected candidates`);
    }
    sources.set(source.id, source);
  }
  for (const candidatePolicy of batch.policies) {
    const policy = Object.fromEntries(Object.entries(candidatePolicy).filter(([key]) =>
      key !== "confidence")) as Record<string, unknown> & { id: string };
    if (policies.has(candidatePolicy.id)) throw new Error(`Duplicate promoted policy ${candidatePolicy.id}`);
    policies.set(candidatePolicy.id, policy);
  }
}

const preserveCommittedOrder = <T extends string | { id: string }>(
  items: T[],
  committedItems: T[],
): T[] => {
  const key = (item: T) => typeof item === "string" ? item : item.id;
  const order = new Map(committedItems.map((item, index) => [key(item), index]));
  return items
    .map((item, index) => ({ item, index, committedIndex: order.get(key(item)) }))
    .sort((left, right) => {
      if (left.committedIndex !== undefined && right.committedIndex !== undefined) {
        return left.committedIndex - right.committedIndex;
      }
      if (left.committedIndex !== undefined) return -1;
      if (right.committedIndex !== undefined) return 1;
      return left.index - right.index;
    })
    .map(({ item }) => item);
};

const artifact = {
  batchIds: [...batchIds],
  sources: [...sources.values()],
  policies: [...policies.values()],
};

if (committedArtifact) {
  artifact.batchIds = preserveCommittedOrder(artifact.batchIds, committedArtifact.batchIds);
  artifact.sources = preserveCommittedOrder(artifact.sources, committedArtifact.sources);
  artifact.policies = preserveCommittedOrder(artifact.policies, committedArtifact.policies);
}

await writeFile(
  artifactPath,
  `${JSON.stringify(artifact, null, 2)}\n`,
  "utf8",
);

const action = append ? "Appended" : replace ? "Replaced" : "Promoted";
process.stdout.write(`${action} ${batches.length} batches; canonical totals: ${artifact.batchIds.length} batches, ${artifact.sources.length} sources, ${artifact.policies.length} policies.\n`);
