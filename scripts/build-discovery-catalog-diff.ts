/**
 * Compares a non-official catalog with the canonical snapshot and exact
 * official-evidence layer. Output is research triage only and cannot be
 * promoted. It intentionally performs no writes.
 */
import fallbackSnapshot from "../src/data/fallback.json" with { type: "json" };
import { getVisaRelationshipEvidence, officialSourcesForPolicies, policiesForDestination } from "../src/lib/visa-evidence";
import type { AccessStatus, DataSnapshot } from "../src/lib/types";

const DEFAULT_CATALOG_URL = "https://raw.githubusercontent.com/imorte/passport-index-data/main/passport-index.json";
const STATUS_MAP: Record<string, Exclude<AccessStatus, "citizenship" | "unknown">> = {
  "visa free": "visa_free",
  eta: "eta",
  "visa on arrival": "visa_on_arrival",
  "e-visa": "evisa",
  "visa required": "visa_required",
  "no admission": "entry_restricted",
};

interface CatalogCell {
  status?: string;
  days?: number;
}

type Catalog = Record<string, Record<string, CatalogCell>>;

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const limitArgument = args.find((argument) => argument.startsWith("--limit="));
const catalogArgument = args.find((argument) => argument.startsWith("--catalog-url="));
const limit = limitArgument ? Number(limitArgument.slice(8)) : 100;
const catalogUrl = catalogArgument?.slice(14) ?? DEFAULT_CATALOG_URL;
if (!Number.isInteger(limit) || limit < 1 || limit > 5_000) throw new Error("--limit must be an integer from 1 to 5000");
if (new URL(catalogUrl).protocol !== "https:") throw new Error("Discovery catalog must use HTTPS");

const response = await fetch(catalogUrl, {
  headers: { "User-Agent": "multipass-discovery/1.0 (non-official research triage)" },
});
if (!response.ok) throw new Error(`Discovery catalog returned HTTP ${response.status}`);
const catalog = await response.json() as Catalog;
const snapshot = fallbackSnapshot as DataSnapshot;
const passportByCode = new Map(snapshot.manifest.passports.map((passport) => [passport.code, passport]));
const destinationByCode = new Map(snapshot.manifest.destinations.map((destination) => [destination.code, destination]));

const pendingByDestination = new Map<string, number>();
const candidates = [] as Array<{
  passportCode: string;
  passportName: string;
  destinationCode: string;
  destinationName: string;
  currentStatus: AccessStatus;
  catalogStatus: string;
  catalogNormalizedStatus?: Exclude<AccessStatus, "citizenship" | "unknown">;
  catalogStayDays?: number;
  disagreesWithSnapshot: boolean;
  officialTargets: Array<{ title: string; url: string; reviewedAt: string }>;
  officialSearchQueries: string[];
  priority: number;
}>;

for (const [passportCode, destinations] of Object.entries(catalog)) {
  const passport = passportByCode.get(passportCode);
  if (!passport) continue;
  for (const [destinationCode, catalogCell] of Object.entries(destinations)) {
    if (passportCode === destinationCode || !catalogCell.status) continue;
    const destination = destinationByCode.get(destinationCode);
    if (!destination) continue;
    const currentStatus = snapshot.passports[passportCode]?.statuses[destinationCode] ?? "unknown";
    const evidence = getVisaRelationshipEvidence(passportCode, destinationCode, currentStatus);
    if (evidence.supportsCurrentStatus) continue;
    pendingByDestination.set(destinationCode, (pendingByDestination.get(destinationCode) ?? 0) + 1);
    const catalogNormalizedStatus = STATUS_MAP[catalogCell.status.toLowerCase()];
    const officialTargets = officialSourcesForPolicies(policiesForDestination(destinationCode))
      .sort((first, second) => second.reviewedAt.localeCompare(first.reviewedAt))
      .slice(0, 4)
      .map(({ title, url, reviewedAt }) => ({ title, url, reviewedAt }));
    const disagreesWithSnapshot = Boolean(catalogNormalizedStatus && catalogNormalizedStatus !== currentStatus);
    candidates.push({
      passportCode,
      passportName: passport.name,
      destinationCode,
      destinationName: destination.name,
      currentStatus,
      catalogStatus: catalogCell.status,
      catalogNormalizedStatus,
      catalogStayDays: Number.isInteger(catalogCell.days) ? catalogCell.days : undefined,
      disagreesWithSnapshot,
      officialTargets,
      officialSearchQueries: [
        `site:gov ${destination.name} visa requirements ${passport.name} ordinary passport`,
        `site:mfa.gov ${destination.name} visa ${passport.name}`,
        `site:immigration.gov ${destination.name} visitor visa nationality list`,
      ],
      priority: 0,
    });
  }
}

for (const candidate of candidates) {
  const destinationLeverage = Math.min(30, Math.round((pendingByDestination.get(candidate.destinationCode) ?? 0) / 7));
  candidate.priority = 35
    + destinationLeverage
    + (candidate.disagreesWithSnapshot ? 20 : 0)
    + (candidate.catalogStayDays ? 10 : 0)
    + (candidate.officialTargets.length ? 5 : 0);
}

const prioritized = candidates
  .sort((first, second) => second.priority - first.priority
    || first.destinationCode.localeCompare(second.destinationCode)
    || first.passportCode.localeCompare(second.passportCode))
  .slice(0, limit);

const report = {
  schemaVersion: "visa-discovery-diff/v1",
  quarantine: {
    classification: "non-official-discovery-only",
    productionImport: "forbidden",
    verificationState: "unverified",
    warning: "Catalog claims and stay days are leads only. Replay a current official target before creating a separate evidence candidate.",
  },
  catalog: { url: catalogUrl, retrievedAt: new Date().toISOString() },
  comparablePendingPairs: candidates.length,
  emitted: prioritized.length,
  candidates: prioritized,
};

if (jsonOutput) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write("Non-official catalog discrepancy queue — no row is evidence or verified.\n\n");
  process.stdout.write("| Priority | Pair | Current | Catalog clue | Stay clue | Official targets |\n| ---: | --- | --- | --- | ---: | ---: |\n");
  for (const item of prioritized) {
    process.stdout.write(`| ${item.priority} | ${item.passportCode}→${item.destinationCode} | ${item.currentStatus} | ${item.catalogStatus}${item.disagreesWithSnapshot ? " ⚠" : ""} | ${item.catalogStayDays ?? "—"} | ${item.officialTargets.length} |\n`);
  }
  process.stdout.write(`\nCompared ${candidates.length} catalog-covered pairs lacking exact canonical evidence; emitted ${prioritized.length}.\n`);
}
