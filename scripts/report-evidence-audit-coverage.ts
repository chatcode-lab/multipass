import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import fallbackSnapshot from "../src/data/fallback.json" with { type: "json" };
import { applyAccessOverrides } from "../src/lib/passport";
import { getVisaRelationshipEvidence } from "../src/lib/visa-evidence";
import type { DataSnapshot } from "../src/lib/types";

interface CandidateBatch {
  policies?: Array<{
    passportCodes?: string[];
    destinationCodes?: string[];
    excludedPassportCodes?: string[];
  }>;
  conflicts?: Array<{ passportCode: string; destinationCode: string }>;
  unresolved?: Array<{ passportCode: string; destinationCode: string }>;
}

const snapshot = fallbackSnapshot as DataSnapshot;
const details = Object.fromEntries(
  Object.entries(snapshot.passports).map(([code, detail]) => [code, applyAccessOverrides(detail)]),
);
const candidateDirectory = resolve("research/visa-evidence");
const candidateFiles = (await readdir(candidateDirectory))
  .filter((file) => file.endsWith(".candidate.json"))
  .sort();
const auditedPairs = new Set<string>();

for (const file of candidateFiles) {
  const batch = JSON.parse(await readFile(resolve(candidateDirectory, file), "utf8")) as CandidateBatch;
  for (const item of batch.unresolved ?? []) {
    auditedPairs.add(`${item.passportCode}:${item.destinationCode}`);
  }
  for (const item of batch.conflicts ?? []) {
    auditedPairs.add(`${item.passportCode}:${item.destinationCode}`);
  }
  for (const policy of batch.policies ?? []) {
    const excluded = new Set(policy.excludedPassportCodes ?? []);
    for (const passportCode of policy.passportCodes ?? []) {
      if (excluded.has(passportCode)) continue;
      for (const destinationCode of policy.destinationCodes ?? []) {
        auditedPairs.add(`${passportCode}:${destinationCode}`);
      }
    }
  }
}

const pendingPairs: string[] = [];
let verified = 0;
for (const passport of snapshot.manifest.passports) {
  for (const destination of snapshot.manifest.destinations) {
    if (passport.code === destination.code) continue;
    const status = details[passport.code]?.statuses[destination.code];
    if (status && getVisaRelationshipEvidence(passport.code, destination.code, status).supportsCurrentStatus) {
      verified += 1;
    } else {
      pendingPairs.push(`${passport.code}:${destination.code}`);
    }
  }
}

const auditedPending = pendingPairs.filter((pair) => auditedPairs.has(pair));
const unauditedPending = pendingPairs.filter((pair) => !auditedPairs.has(pair));
const total = verified + pendingPairs.length;
const report = {
  asOf: new Date().toISOString().slice(0, 10),
  candidateFiles: candidateFiles.length,
  total,
  verified,
  pending: pendingPairs.length,
  auditedPending: auditedPending.length,
  unauditedPending: unauditedPending.length,
  auditCoveragePercent: pendingPairs.length
    ? Number(((auditedPending.length / pendingPairs.length) * 100).toFixed(1))
    : 100,
  unauditedPairs: unauditedPending,
};

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write(
    `Current evidence: ${verified}/${total} relationships verified.\n`
    + `Pending audit coverage: ${auditedPending.length}/${pendingPairs.length} relationships (${report.auditCoveragePercent}%).\n`
    + `Candidate files scanned: ${candidateFiles.length}; unaudited pending relationships: ${unauditedPending.length}.\n`,
  );
  if (unauditedPending.length) process.stdout.write(`${unauditedPending.join("\n")}\n`);
}

if (process.argv.includes("--fail-on-gaps") && unauditedPending.length) process.exitCode = 1;
