import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import fallbackSnapshot from "../src/data/fallback.json";
import fallbackInsights from "../src/data/combination-insights.json";
import type { CombinationInsights, DataSnapshot } from "../src/lib/types";

const snapshot = fallbackSnapshot as DataSnapshot;
const insights = fallbackInsights as CombinationInsights;
const outputPath = resolve(process.argv[2] ?? ".wrangler/passport-bootstrap.json");
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
process.stdout.write(`Wrote ${entries.length} KV entries for ${snapshot.manifest.version} to ${outputPath}\n`);
