import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { indicatorCandidateSchema, parseIndicatorCsv } from "../src/lib/country-indicator-schema";

// Bounded offline collection. This writes a candidate, never production or KV.
const mode = process.argv[2];
if (mode && mode !== "--top20") throw new Error("Usage: tsx scripts/collect-country-indicators.ts [--top20]");
const pilotMapping: Record<string, string> = { PT: "PRT", DE: "DEU", FR: "FRA", IE: "IRL", CA: "CAN", US: "USA", SG: "SGP", AE: "ARE", HK: "HKG", IN: "IND", GB: "GBR" };
const top20Mapping: Record<string, string> = {
  ...pilotMapping, JP: "JPN", CH: "CHE", IT: "ITA", KR: "KOR", FI: "FIN", ES: "ESP", SE: "SWE", BE: "BEL", LU: "LUX", NO: "NOR", MT: "MLT", NL: "NLD", NZ: "NZL", AT: "AUT", DK: "DNK", GR: "GRC", MY: "MYS", AU: "AUS", LT: "LTU", SK: "SVK", CZ: "CZE", EE: "EST", HU: "HUN", IS: "ISL", LV: "LVA", PL: "POL", LI: "LIE", SI: "SVN", HR: "HRV", MC: "MCO", CY: "CYP", RO: "ROU", CL: "CHL", AR: "ARG", BG: "BGR", AD: "AND", BR: "BRA",
};
const mapping = mode ? top20Mapping : pilotMapping;
if (mode) {
  const cohort = JSON.parse(await readFile(new URL("../research/country-profiles/top20-cohort-2026-09-17.json", import.meta.url), "utf8")) as { passports: { code: string }[] };
  if (cohort.passports.some(({ code }) => !mapping[code])) throw new Error("Top-20 cohort mapping is incomplete.");
  if (Object.keys(mapping).some((code) => code !== "IN" && !cohort.passports.some((row) => row.code === code))) throw new Error("Unexpected geography outside the cohort and retained pilot.");
}
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
  if (rows.length > 1) throw new Error(`Ambiguous UNDP mapping: ${code}`);
  const hdi = rows[0]?.[columns.indexOf("hdi_2023")];
  const lifeRows = wb[1].filter((row) => row.country.id === code);
  if (!lifeRows.length || lifeRows.some((row) => row.countryiso3code !== iso3)) throw new Error(`Missing or mismatched World Bank entity: ${code}`);
  const life = lifeRows.filter((row) => row.value !== null).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!mode && (!hdi || !life)) throw new Error(`Pilot source gap: ${code}; record an explicit outcome instead of replacing production.`);
  const hdiAvailable = Boolean(hdi && hdi !== ".." && hdi !== "NA");
  const geographicScope = code === "HK" ? "Hong Kong SAR statistical economy, not mainland China" : "Publisher-reported national statistical geography; not every overseas territory or citizen abroad";
  return [
    { code, providerEntityCode: iso3, providerEntityName: rows[0]?.[columns.indexOf("country")] ?? lifeRows[0].country.value, geographicScope, metric: "hdi", sourceId: "undp-hdr2025", period: hdiAvailable ? "2023" : null, value: hdiAvailable ? Number(hdi) : null, availability: hdiAvailable ? "available" : "not_reported", ...(hdiAvailable ? {} : { unavailableReason: `UNDP's HDR 2025 time-series file does not report a 2023 HDI value for ${iso3}. No neighboring-country or regional value is substituted.` }) },
    { code, providerEntityCode: iso3, providerEntityName: lifeRows[0].country.value, geographicScope, metric: "life_expectancy", sourceId: "wb-life", period: life?.date ?? null, value: life?.value ?? null, availability: life ? "available" : "not_reported", ...(life ? {} : { unavailableReason: "World Bank SP.DYN.LE00.IN has no non-null observation for this statistical geography in the checked 2020–2026 window." }) },
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
await writeFile(new URL(`../research/country-profiles/${mode ? "top20-indicators-2026-09-17" : "indicators-pilot"}.candidate.json`, import.meta.url), `${JSON.stringify(candidate, null, 2)}\n`);
console.log(`Candidate only: ${observations.length} observations across ${Object.keys(mapping).length} mappings. Independent review required.`);
