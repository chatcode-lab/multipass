import fallbackSnapshot from "../src/data/fallback.json" with { type: "json" };
import { getVisaRelationshipEvidence } from "../src/lib/visa-evidence";
import type { DataSnapshot } from "../src/lib/types";

const PRIORITY_DESTINATION_RESEARCH_CODES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO",
  "SK", "SI", "ES", "SE", "CH", "GB", "US", "CA", "AU", "NZ", "JP", "KR", "SG",
  "HK", "IL", "TW",
] as const;

const snapshot = fallbackSnapshot as DataSnapshot;
const includeAllDestinations = process.argv.includes("--all");
const onlyIncomplete = process.argv.includes("--incomplete");
const summaryOnly = process.argv.includes("--summary");
const passportCodes = snapshot.manifest.passports.map(({ code }) => code);
const destinationByCode = new Map(snapshot.manifest.destinations.map((destination) => [destination.code, destination]));
const destinationCodes = includeAllDestinations
  ? snapshot.manifest.destinations.map(({ code }) => code)
  : [...PRIORITY_DESTINATION_RESEARCH_CODES];

const rows = destinationCodes.map((destinationCode) => {
  const destination = destinationByCode.get(destinationCode);
  const scopedPassports = passportCodes.filter((passportCode) => passportCode !== destinationCode);
  const supported = scopedPassports.filter((passportCode) => {
    const status = snapshot.passports[passportCode]?.statuses[destinationCode];
    return status ? getVisaRelationshipEvidence(passportCode, destinationCode, status).supportsCurrentStatus : false;
  }).length;
  return {
    code: destinationCode,
    destination: destination?.name ?? destinationCode,
    region: destination?.region ?? "UNKNOWN",
    supported,
    total: scopedPassports.length,
    percent: Number(((supported / scopedPassports.length) * 100).toFixed(1)),
  };
});

const displayedRows = onlyIncomplete ? rows.filter(({ supported, total }) => supported < total) : rows;
if (!summaryOnly) console.table(displayedRows);
const supported = rows.reduce((sum, row) => sum + row.supported, 0);
const total = rows.reduce((sum, row) => sum + row.total, 0);
const destinationsWithMajorityCoverage = rows.filter(({ percent }) => percent >= 50).length;
const destinationsWithBroadCoverage = rows.filter(({ percent }) => percent >= 80).length;

process.stdout.write(
  `${includeAllDestinations ? "All-destination" : "Priority-destination"} current-status evidence: ${supported}/${total} relationships (${((supported / total) * 100).toFixed(1)}%).\n`
  + `Destinations at 50%+: ${destinationsWithMajorityCoverage}/${rows.length}; at 80%+: ${destinationsWithBroadCoverage}/${rows.length}.\n`,
);

if (includeAllDestinations) {
  const regionRows = [...new Set(rows.map(({ region }) => region))].map((region) => {
    const regionDestinations = rows.filter((row) => row.region === region);
    const regionSupported = regionDestinations.reduce((sum, row) => sum + row.supported, 0);
    const regionTotal = regionDestinations.reduce((sum, row) => sum + row.total, 0);
    return {
      region,
      destinations: regionDestinations.length,
      supported: regionSupported,
      total: regionTotal,
      percent: Number(((regionSupported / regionTotal) * 100).toFixed(1)),
    };
  });
  console.table(regionRows);
}
