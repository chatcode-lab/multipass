import fallbackSnapshot from "../src/data/fallback.json" with { type: "json" };
import queue from "../research/visa-evidence/queue.json" with { type: "json" };
import type { AccessStatus, DataSnapshot } from "../src/lib/types";

const snapshot = fallbackSnapshot as DataSnapshot;
const batchId = process.argv[2];
if (!batchId) throw new Error("Usage: npm run evidence:packet -- <batch-id>");

const batch = queue.batches.find((entry) => entry.id === batchId);
if (!batch) throw new Error(`Unknown evidence batch: ${batchId}`);

const passportCodes = batch.passportCodes.includes("*")
  ? snapshot.manifest.passports.map(({ code }) => code)
  : batch.passportCodes;
const destinationCodes = batch.destinationCodes.includes("*")
  ? snapshot.manifest.destinations.map(({ code }) => code)
  : batch.destinationCodes;
const passportNames = new Map(snapshot.manifest.passports.map(({ code, name }) => [code, name]));
const destinationNames = new Map(snapshot.manifest.destinations.map(({ code, name }) => [code, name]));

const hypotheses = passportCodes.flatMap((passportCode) => destinationCodes.flatMap((destinationCode) => {
  const status = snapshot.passports[passportCode]?.statuses[destinationCode] as AccessStatus | undefined;
  return status ? [{
    passportCode,
    passportName: passportNames.get(passportCode),
    destinationCode,
    destinationName: destinationNames.get(destinationCode),
    snapshotStatus: status,
  }] : [];
}));

process.stdout.write(`${JSON.stringify({
  warning: "Every snapshot status is an unverified hypothesis. Return not established rather than guessing.",
  batch,
  snapshot: {
    version: snapshot.manifest.version,
    checkedAt: snapshot.manifest.checkedAt,
  },
  hypotheses,
}, null, 2)}\n`);
