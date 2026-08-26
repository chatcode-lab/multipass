import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import fallbackSnapshot from "../src/data/fallback.json";
import fallbackInsights from "../src/data/combination-insights.json";
import type { CombinationInsights, DataSnapshot, PublishedDataSnapshot } from "../src/lib/types";

const snapshot = fallbackSnapshot as DataSnapshot;
const insights = fallbackInsights as CombinationInsights;
const outputPath = resolve(process.argv[2] ?? ".wrangler/passport-bootstrap.json");
const currentOutputPath = resolve(dirname(outputPath), "passport-current.json");
const prefix = `snapshot:${snapshot.manifest.version}`;
const entries = [
  { key: `${prefix}:manifest`, value: JSON.stringify(snapshot.manifest) },
  { key: `${prefix}:combination-insights`, value: JSON.stringify(insights) },
  ...Object.values(snapshot.passports).map((passport) => ({
    key: `${prefix}:passport:${passport.code}`,
    value: JSON.stringify(passport),
  })),
];

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(entries), "utf8");
await writeFile(currentOutputPath, JSON.stringify({
  ...snapshot,
  combinationInsights: insights,
} satisfies PublishedDataSnapshot), "utf8");
process.stdout.write(
  `Wrote ${entries.length} staged KV entries to ${outputPath} and the single-read snapshot to ${currentOutputPath}\n`,
);
