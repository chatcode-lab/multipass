import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { indicatorCandidateSchema, parseIndicatorCsv } from "../src/lib/country-indicator-schema";

// Bounded offline collection. This writes a candidate, never production or KV.
const args = process.argv.slice(2);
const mode = args.find((arg) => ["--top20", "--top40"].includes(arg));
if (args.some((arg) => arg !== mode && !/^--output=[a-z0-9-]+$/.test(arg)) || args.filter((arg) => arg.startsWith("--output=")).length > 1) throw new Error("Usage: tsx scripts/collect-country-indicators.ts [--top20|--top40] [--output=unique-candidate-id]");
const retrievedAt = new Date().toISOString().slice(0, 10);
const outputId = args.find((arg) => arg.startsWith("--output="))?.slice(9)
  ?? `${mode === "--top40" ? "ranks21-40" : mode ? "top20" : "pilot"}-indicators-${retrievedAt}`;
const pilotMapping: Record<string, string> = { PT: "PRT", DE: "DEU", FR: "FRA", IE: "IRL", CA: "CAN", US: "USA", SG: "SGP", AE: "ARE", HK: "HKG", IN: "IND", GB: "GBR" };
const top20Mapping: Record<string, string> = {
  ...pilotMapping, JP: "JPN", CH: "CHE", IT: "ITA", KR: "KOR", FI: "FIN", ES: "ESP", SE: "SWE", BE: "BEL", LU: "LUX", NO: "NOR", MT: "MLT", NL: "NLD", NZ: "NZL", AT: "AUT", DK: "DNK", GR: "GRC", MY: "MYS", AU: "AUS", LT: "LTU", SK: "SVK", CZ: "CZE", EE: "EST", HU: "HUN", IS: "ISL", LV: "LVA", PL: "POL", LI: "LIE", SI: "SVN", HR: "HRV", MC: "MCO", CY: "CYP", RO: "ROU", CL: "CHL", AR: "ARG", BG: "BGR", AD: "AND", BR: "BRA",
};
const top40Mapping: Record<string, string> = {
  ...top20Mapping, SM: "SMR", BB: "BRB", BN: "BRN", IL: "ISR", BS: "BHS", MX: "MEX", VC: "VCT", UY: "URY", KN: "KNA", AG: "ATG", CR: "CRI", VA: "VAT", SC: "SYC", MU: "MUS", PA: "PAN", PY: "PRY", PE: "PER", LC: "LCA", GD: "GRD", TT: "TTO", MO: "MAC", UA: "UKR", DM: "DMA", TW: "TWN", SB: "SLB",
};
const mapping = mode === "--top40" ? top40Mapping : mode ? top20Mapping : pilotMapping;
if (mode) {
  const cohort = JSON.parse(await readFile(new URL("../research/country-profiles/top20-cohort-2026-09-17.json", import.meta.url), "utf8")) as { passports: { code: string }[] };
  if (mode === "--top40") {
    const next = JSON.parse(await readFile(new URL("../research/country-profiles/ranks21-40-cohort-2026-09-22.json", import.meta.url), "utf8")) as typeof cohort;
    cohort.passports.push(...next.passports);
  }
  if (cohort.passports.some(({ code }) => !mapping[code])) throw new Error("Frozen cohort mapping is incomplete.");
  if (Object.keys(mapping).some((code) => code !== "IN" && !cohort.passports.some((row) => row.code === code))) throw new Error("Unexpected geography outside the cohort and retained pilot.");
}
const undpUrl = "https://hdr.undp.org/sites/default/files/2025_HDR/HDR25_Composite_indices_complete_time_series.csv";
// The complete registry distinguishes a genuine unmapped geography from a
// partial/error response. Never substitute China or Italy for TW or VA.
const registryUrl = "https://api.worldbank.org/v2/country/all?format=json&per_page=400";
const wbUrl = mode === "--top40"
  ? "https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json&date=2020:2026&per_page=20000"
  : `https://api.worldbank.org/v2/country/${Object.keys(mapping).join(";")}/indicator/SP.DYN.LE00.IN?format=json&date=2020:2026&per_page=1000`;
async function read(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
const [csvBytes, jsonBytes, registryBytes] = await Promise.all([read(undpUrl), read(wbUrl), read(registryUrl)]);
// The HDR CSV contains Windows-1252 bytes. Hash the original payload, not
// response.text()'s lossy UTF-8 replacement characters. JSON is strict UTF-8.
const csv = new TextDecoder("windows-1252", { fatal: true }).decode(csvBytes);
const json = new TextDecoder("utf-8", { fatal: true }).decode(jsonBytes);
const registryJson = new TextDecoder("utf-8", { fatal: true }).decode(registryBytes);
const registry = JSON.parse(registryJson) as [{ pages: number; total: number }, Array<{ id: string; iso2Code: string; name: string; region: { id: string; value: string } }>];
if (registry[0]?.pages !== 1 || registry[1]?.length !== registry[0].total) throw new Error("Incomplete World Bank geography registry.");
const undp = parseIndicatorCsv(csv);
const columns = undp[0];
for (const key of ["iso3", "country", "hdi_2023"]) if (!columns.includes(key)) throw new Error(`Missing UNDP column ${key}`);
const wb = JSON.parse(json) as [{ pages: number; total: number; lastupdated: string }, Array<{ country: { id: string; value: string }; countryiso3code: string; date: string; value: number | null }>];
if (wb[0]?.pages !== 1 || wb[1]?.length !== wb[0].total) throw new Error("Incomplete World Bank response; do not publish partial retrieval.");
const observations = Object.entries(mapping).flatMap(([code, iso3]) => {
  const rows = undp.slice(1).filter((row) => row[columns.indexOf("iso3")] === iso3);
  if (rows.length > 1) throw new Error(`Ambiguous UNDP mapping: ${code}`);
  const hdi = rows[0]?.[columns.indexOf("hdi_2023")];
  const entities = registry[1].filter((row) => row.iso2Code === code);
  if (entities.length > 1 || entities.some((row) => row.id !== iso3 || row.region.value === "Aggregates")) throw new Error(`Ambiguous or aggregate geography: ${code}`);
  if (!entities.length && !["TW", "VA"].includes(code)) throw new Error(`Unexpected absent World Bank geography: ${code}`);
  const lifeRows = wb[1].filter((row) => row.country.id === code);
  if (lifeRows.some((row) => row.countryiso3code !== iso3) || (!entities.length && lifeRows.length)) throw new Error(`Mismatched World Bank entity: ${code}`);
  if (entities.length && !lifeRows.length) throw new Error(`Unexpected missing series for listed World Bank entity: ${code}`);
  if (new Set(lifeRows.map((row) => row.date)).size !== lifeRows.length) throw new Error(`Duplicate World Bank periods: ${code}`);
  const life = lifeRows.filter((row) => row.value !== null).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!mode && (!hdi || !life)) throw new Error(`Pilot source gap: ${code}; record an explicit outcome instead of replacing production.`);
  const hdiAvailable = Boolean(hdi && hdi !== ".." && hdi !== "NA");
  const geographicScope = code === "HK" ? "Hong Kong SAR statistical economy, not mainland China"
    : code === "MO" ? "Macao SAR statistical economy, not mainland China or Hong Kong"
      : !entities.length ? "Requested catalog geography has no entry in the checked World Bank registry; no parent-country or regional substitute"
        : "Publisher-reported national statistical geography; not every overseas territory or citizen abroad";
  const entityName = entities[0]?.name ?? `${code === "TW" ? "Taiwan" : "Vatican City"} (requested geography; not listed by World Bank)`;
  return [
    { code, providerEntityCode: iso3, providerEntityName: rows[0]?.[columns.indexOf("country")] ?? (code === "TW" ? "Taiwan (requested geography)" : code === "VA" ? "Vatican City (requested geography)" : entityName), geographicScope: !entities.length ? "Requested catalog geography; no parent-country or regional substitute" : geographicScope, metric: "hdi", sourceId: "undp-hdr2025", period: hdiAvailable ? "2023" : null, value: hdiAvailable ? Number(hdi) : null, availability: hdiAvailable ? "available" : "not_reported", ...(hdiAvailable ? {} : { unavailableReason: `UNDP's HDR 2025 time-series file does not report a 2023 HDI value for ${iso3}. No neighboring-country or regional value is substituted.` }) },
    { code, providerEntityCode: iso3, providerEntityName: entityName, geographicScope, metric: "life_expectancy", sourceId: "wb-life", period: life?.date ?? null, value: life?.value ?? null, availability: life ? "available" : "not_reported", ...(life ? {} : { unavailableReason: !entities.length ? `The complete checked World Bank geography registry contains no ${iso3} entity, and SP.DYN.LE00.IN has no separate observation for it in the 2020–2026 response. This is a limitation of this source, not proof that no national statistics exist.` : "World Bank SP.DYN.LE00.IN has no non-null observation for this statistical geography in the checked 2020–2026 window." }) },
  ];
});
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const candidate = indicatorCandidateSchema.parse({
  schemaVersion: 1, researcher: "/root", retrievedAt,
  sources: [
    { id: "undp-hdr2025", publisher: "UNDP", attribution: "UNDP Human Development Report 2025, composite indices time series. Selected observations; display rounded to three decimals. No endorsement implied.", title: "Human Development Index", url: "https://hdr.undp.org/data-center/documentation-and-downloads", dataUrl: undpUrl, licenceUrl: "https://hdr.undp.org/terms-use", licence: "CC BY 3.0 IGO", edition: "Human Development Report 2025", sourceSha256: hash(csvBytes), dataEncoding: "windows-1252" },
    { id: "wb-life", publisher: "World Bank", attribution: "World Bank: World Development Indicators, SP.DYN.LE00.IN; UN World Population Prospects, national statistical offices and Eurostat. Selected observations; display rounded to one decimal. No endorsement implied.", title: "Life expectancy at birth, total", url: "https://data.worldbank.org/indicator/SP.DYN.LE00.IN", dataUrl: wbUrl, licenceUrl: "https://data.worldbank.org/summary-terms-of-use", licence: "CC BY 4.0 with World Bank additional terms", edition: `World Development Indicators, updated ${wb[0].lastupdated}`, sourceSha256: hash(jsonBytes), dataEncoding: "utf-8", geographyUrl: registryUrl, geographySha256: hash(registryBytes) },
  ], observations,
});
// Approved candidate bytes are immutable audit evidence. A retry needs an
// explicitly new output ID rather than overwriting an existing reviewed file.
await writeFile(new URL(`../research/country-profiles/${outputId}.candidate.json`, import.meta.url), `${JSON.stringify(candidate, null, 2)}\n`, { flag: "wx" });
console.log(`Candidate only: ${observations.length} observations across ${Object.keys(mapping).length} mappings. Independent review required.`);
