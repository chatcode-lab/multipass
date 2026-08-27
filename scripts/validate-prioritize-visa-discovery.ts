/**
 * Validates quarantined non-official discovery clues and prints only official
 * verification targets. It is intentionally incompatible with candidate
 * promotion: it does not emit policies, statuses, conflicts, or evidence.
 */
import { readdir, readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { z } from "zod";
import fallbackSnapshot from "../src/data/fallback.json" with { type: "json" };
import type { DataSnapshot } from "../src/lib/types";
import { getVisaRelationshipEvidence } from "../src/lib/visa-evidence";

const discoveryRoot = resolve("research/visa-discovery");
const code = z.string().regex(/^[A-Z]{2}$/);
const date = z.iso.date();
const httpUrl = z.url().refine((value) => /^https?:$/.test(new URL(value).protocol), "URL must use HTTP or HTTPS");
const httpsUrl = z.url().refine((value) => new URL(value).protocol === "https:", "Official verification target must use HTTPS");

const sourceSchema = z.strictObject({
  url: httpUrl,
  kind: z.enum(["commercial-catalog", "search-result", "traveller-report", "media", "academic", "other-unverified"]),
  observedAt: date,
  note: z.string().min(1),
});
const targetSchema = z.strictObject({
  url: httpsUrl,
  authorityType: z.enum([
    "law-or-gazette",
    "immigration-authority",
    "foreign-ministry",
    "official-mission",
    "official-portal",
    "passport-authority",
    "treaty-register",
  ]),
  verificationQuestion: z.string().min(1),
});
const clueSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  passportCode: code,
  destinationCode: code,
  reportedClaim: z.string().min(1),
  reportedStay: z.strictObject({
    label: z.string().min(1),
    reportedDays: z.number().int().positive().optional(),
  }).optional(),
  triage: z.strictObject({
    expectedResearchValue: z.enum(["low", "medium", "high"]),
    rationale: z.string().min(1),
  }),
  discoverySources: z.array(sourceSchema).min(1),
  officialVerificationTargets: z.array(targetSchema).min(1),
});
const catalogSchema = z.strictObject({
  schemaVersion: z.literal("visa-discovery-clue/v1"),
  catalogId: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  discoveredAt: date,
  quarantine: z.strictObject({
    classification: z.literal("non-official-discovery-only"),
    productionImport: z.literal("forbidden"),
    verificationState: z.literal("unverified"),
  }),
  clues: z.array(clueSchema).min(1),
});

type Clue = z.infer<typeof clueSchema>;
type Catalog = z.infer<typeof catalogSchema>;

const valueScore = { low: 15, medium: 40, high: 65 } as const;
const authorityScore = {
  "law-or-gazette": 20,
  "immigration-authority": 18,
  "foreign-ministry": 16,
  "passport-authority": 16,
  "treaty-register": 15,
  "official-mission": 12,
  "official-portal": 10,
} as const;

function isWithinDiscoveryRoot(filePath: string) {
  const pathFromRoot = relative(discoveryRoot, resolve(filePath));
  return pathFromRoot && !pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== "..";
}

async function findClueFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) return findClueFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".clue.json") ? [entryPath] : [];
  }));
  return files.flat();
}

function priorityFor(clue: Clue, exactEvidenceMissing: boolean) {
  const strongestAuthority = Math.max(...clue.officialVerificationTargets.map((target) => authorityScore[target.authorityType]));
  const independentLeadKinds = new Set(clue.discoverySources.map((source) => source.kind)).size;
  return Math.min(100, valueScore[clue.triage.expectedResearchValue]
    + strongestAuthority
    + Math.min(10, independentLeadKinds * 5)
    + (exactEvidenceMissing ? 15 : 0));
}

function assertCatalogIntegrity(catalog: Catalog, filePath: string, passportCodes: Set<string>, destinationCodes: Set<string>) {
  const clueIds = new Set<string>();
  for (const clue of catalog.clues) {
    if (clueIds.has(clue.id)) throw new Error(`${filePath}: repeated clue ID ${clue.id}`);
    clueIds.add(clue.id);
    if (!passportCodes.has(clue.passportCode)) throw new Error(`${filePath}: unknown passport code ${clue.passportCode}`);
    if (!destinationCodes.has(clue.destinationCode)) throw new Error(`${filePath}: unknown destination code ${clue.destinationCode}`);
    const discoveryHosts = new Set(clue.discoverySources.map((source) => new URL(source.url).hostname));
    if (clue.officialVerificationTargets.some((target) => discoveryHosts.has(new URL(target.url).hostname))) {
      throw new Error(`${filePath}: clue ${clue.id} reuses a discovery host as an official target`);
    }
  }
}

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const requestedFiles = args.filter((arg) => arg !== "--json");
const files = requestedFiles.length
  ? requestedFiles.map((filePath) => resolve(filePath))
  : await findClueFiles(discoveryRoot);

if (!files.length) throw new Error("No *.clue.json files found. Supply a quarantined clue path or add one under research/visa-discovery.");
for (const filePath of files) {
  if (!isWithinDiscoveryRoot(filePath)) throw new Error(`Discovery clues must remain under research/visa-discovery: ${filePath}`);
}

const snapshot = fallbackSnapshot as DataSnapshot;
const passportCodes = new Set(snapshot.manifest.passports.map(({ code: value }) => value));
const destinationCodes = new Set(snapshot.manifest.destinations.map(({ code: value }) => value));
const catalogs = await Promise.all(files.map(async (filePath) => {
  const catalog = catalogSchema.parse(JSON.parse(await readFile(filePath, "utf8")));
  assertCatalogIntegrity(catalog, filePath, passportCodes, destinationCodes);
  return { filePath, catalog };
}));

const prioritized = catalogs.flatMap(({ filePath, catalog }) => catalog.clues.map((clue) => {
  const currentStatus = snapshot.passports[clue.passportCode]?.statuses[clue.destinationCode] ?? "unknown";
  const evidenceLevel = getVisaRelationshipEvidence(clue.passportCode, clue.destinationCode, currentStatus).evidenceLevel;
  return {
    catalogId: catalog.catalogId,
    clueId: clue.id,
    pair: `${clue.passportCode}->${clue.destinationCode}`,
    currentStatus,
    evidenceLevel,
    reportedStay: clue.reportedStay,
    priority: priorityFor(clue, evidenceLevel !== "exact"),
    triage: clue.triage.expectedResearchValue,
    officialTargets: clue.officialVerificationTargets.map((target) => ({
      host: new URL(target.url).hostname,
      url: target.url,
      authorityType: target.authorityType,
      verificationQuestion: target.verificationQuestion,
    })),
    file: relative(process.cwd(), filePath),
  };
})).sort((left, right) => right.priority - left.priority || left.pair.localeCompare(right.pair));

if (jsonOutput) {
  process.stdout.write(`${JSON.stringify({
    quarantine: "non-official-discovery-only; production import forbidden; no pair is verified",
    catalogs: catalogs.length,
    clues: prioritized,
  }, null, 2)}\n`);
} else {
  process.stdout.write("Quarantined discovery report — no clue is evidence or a verified status.\n");
  process.stdout.write("Only replay the listed official HTTPS targets before creating a separate evidence candidate.\n\n");
  process.stdout.write("| Priority | Pair | Evidence | Official verification target | Question |\n| --- | --- | --- | --- | --- |\n");
  for (const item of prioritized) {
    for (const target of item.officialTargets) {
      process.stdout.write(`| ${item.priority} (${item.triage}) | ${item.pair} | ${item.currentStatus}; ${item.evidenceLevel} | ${target.authorityType}: ${target.url} | ${target.verificationQuestion.replaceAll("|", "\\|")} |\n`);
    }
  }
  process.stdout.write(`\nValidated ${catalogs.length} quarantined catalog(s), ${prioritized.length} clue(s). No production evidence was written, imported, or verified.\n`);
}
