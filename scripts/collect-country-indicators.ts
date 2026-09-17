import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { indicatorCandidateSchema, parseIndicatorCsv } from "../src/lib/country-indicator-schema";

// Bounded offline pilot. This writes a candidate, never production or KV.
const mapping: Record<string, string> = { PT: "PRT", DE: "DEU", FR: "FRA", IE: "IRL", CA: "CAN", US: "USA", SG: "SGP", AE: "ARE", HK: "HKG", IN: "IND", GB: "GBR" };
const undpUrl = "https://hdr.undp.org/sites/default/files/2025_HDR/HDR25_Composite_indices_complete_time_series.csv";
const wbUrl = `https://api.worldbank.org/v2/country/${Object.keys(mapping).join(";")}/indicator/SP.DYN.LE00.IN?format=json&date=2020:2026&per_page=1000`;
async function read(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
  return response.text();
}
const [csv, json] = await Promise.all([read(undpUrl), read(wbUrl)]);
const undp = parseIndicatorCsv(csv);
const columns = undp[0];
for (const key of ["iso3", "country", "hdi_2023"]) if (!columns.includes(key)) throw new Error(`Missing UNDP column ${key}`);
const wb = JSON.parse(json) as [{ pages: number; total: number; lastupdated: string }, Array<{ country: { id: string; value: string }; countryiso3code: string; date: string; value: number | null }>];
if (wb[0]?.pages !== 1 || wb[1]?.length !== wb[0].total) throw new Error("Incomplete World Bank response; do not publish partial retrieval.");
const observations = Object.entries(mapping).flatMap(([code, iso3]) => {
  const rows = undp.slice(1).filter((row) => row[columns.indexOf("iso3")] === iso3);
  if (rows.length !== 1) throw new Error(`Ambiguous UNDP mapping: ${code}`);
  const hdi = rows[0][columns.indexOf("hdi_2023")];
  const life = wb[1].filter((row) => row.country.id === code && row.value !== null).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!hdi || !life || life.countryiso3code !== iso3) throw new Error(`Pilot source gap: ${code}; record an explicit outcome instead of replacing production.`);
  const geographicScope = code === "HK" ? "Hong Kong SAR statistical economy, not mainland China" : "Publisher-reported national statistical geography; not every overseas territory or citizen abroad";
  return [
    { code, providerEntityCode: iso3, providerEntityName: rows[0][columns.indexOf("country")], geographicScope, metric: "hdi", sourceId: "undp-hdr2025", period: "2023", value: Number(hdi), availability: "available" },
    { code, providerEntityCode: iso3, providerEntityName: life.country.value, geographicScope, metric: "life_expectancy", sourceId: "wb-life", period: life.date, value: life.value, availability: "available" },
  ];
});
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
const candidate = indicatorCandidateSchema.parse({
  schemaVersion: 1, researcher: "root", retrievedAt: new Date().toISOString().slice(0, 10),
  sources: [
    { id: "undp-hdr2025", publisher: "UNDP", attribution: "UNDP Human Development Report 2025, composite indices time series. Selected observations; display rounded to three decimals. No endorsement implied.", title: "Human Development Index", url: "https://hdr.undp.org/data-center/documentation-and-downloads", dataUrl: undpUrl, licenceUrl: "https://hdr.undp.org/terms-use", licence: "CC BY 3.0 IGO", edition: "Human Development Report 2025", sourceSha256: hash(csv) },
    { id: "wb-life", publisher: "World Bank", attribution: "World Bank: World Development Indicators, SP.DYN.LE00.IN; UN World Population Prospects, national statistical offices and Eurostat. Selected observations; display rounded to one decimal. No endorsement implied.", title: "Life expectancy at birth, total", url: "https://data.worldbank.org/indicator/SP.DYN.LE00.IN", dataUrl: wbUrl, licenceUrl: "https://data.worldbank.org/summary-terms-of-use", licence: "CC BY 4.0 with World Bank additional terms", edition: `World Development Indicators, updated ${wb[0].lastupdated}`, sourceSha256: hash(json) },
  ], observations,
});
await writeFile(new URL("../research/country-profiles/indicators-pilot.candidate.json", import.meta.url), `${JSON.stringify(candidate, null, 2)}\n`);
console.log(`Candidate only: ${observations.length} observations across ${Object.keys(mapping).length} mappings. Independent review required.`);
