import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import fallbackSnapshot from "../src/data/fallback.json";
import { analyzePassportCombinations } from "../src/lib/combination-insights";
import type { DataSnapshot } from "../src/lib/types";

const snapshot = fallbackSnapshot as DataSnapshot;
const insights = analyzePassportCombinations(snapshot.manifest, snapshot.passports);
const outputPath = resolve("src/data/combination-insights.json");

await writeFile(outputPath, `${JSON.stringify(insights, null, 2)}\n`, "utf8");
process.stdout.write(`Wrote passport combination research for ${insights.checkedAt} to ${outputPath}\n`);
