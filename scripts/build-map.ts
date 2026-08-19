import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import { readFile, writeFile } from "node:fs/promises";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryObject, Topology } from "topojson-specification";
import type { Region } from "../src/lib/types";

interface Snapshot {
  manifest: {
    passports: Array<{ code: string; name: string; region: Region }>;
  };
}

interface CountryProperties {
  name: string;
}

const atlasSource = new URL("../node_modules/world-atlas/countries-110m.json", import.meta.url);
const snapshotSource = new URL("../src/data/fallback.json", import.meta.url);
const output = new URL("../src/data/world-map.ts", import.meta.url);
const topology = JSON.parse(await readFile(atlasSource, "utf8")) as Topology<{ countries: GeometryObject }>;
const snapshot = JSON.parse(await readFile(snapshotSource, "utf8")) as Snapshot;
const countries = feature(topology, topology.objects.countries) as FeatureCollection<Geometry, CountryProperties>;
const projection = geoNaturalEarth1().fitExtent([[4, 4], [956, 496]], countries);
const path = geoPath(projection).digits(1);
const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

const ATLAS_NAMES: Record<string, string> = {
  AG: "Antigua and Barb.",
  BA: "Bosnia and Herz.",
  CD: "Dem. Rep. Congo",
  CF: "Central African Rep.",
  CG: "Congo",
  CV: "Cabo Verde",
  DO: "Dominican Rep.",
  GQ: "Eq. Guinea",
  LC: "Saint Lucia",
  MH: "Marshall Is.",
  MK: "Macedonia",
  PS: "Palestine",
  RU: "Russia",
  SB: "Solomon Is.",
  SS: "S. Sudan",
  TR: "Turkey",
  US: "United States of America",
  VA: "Vatican",
  VC: "St. Vin. and Gren.",
};

const FALLBACK_COORDINATES: Record<string, [number, number]> = {
  AD: [1.6, 42.5],
  AG: [-61.8, 17.1],
  BB: [-59.5, 13.2],
  BH: [50.55, 26.07],
  BN: [114.94, 4.9],
  CV: [-23.6, 15.1],
  DM: [-61.37, 15.4],
  FM: [158.2, 6.9],
  FR: [2.2, 46.2],
  GD: [-61.68, 12.1],
  HK: [114.17, 22.32],
  KI: [-157.36, 1.87],
  KN: [-62.78, 17.3],
  LC: [-60.98, 13.9],
  LI: [9.55, 47.16],
  KM: [43.3, -11.7],
  MC: [7.42, 43.74],
  MH: [171.18, 7.1],
  MO: [113.54, 22.2],
  MT: [14.37, 35.94],
  MU: [57.55, -20.2],
  MV: [73.22, 3.2],
  NR: [166.93, -0.52],
  PW: [134.58, 7.5],
  RU: [37.62, 55.75],
  SC: [55.45, -4.62],
  SG: [103.82, 1.35],
  SM: [12.45, 43.94],
  ST: [6.73, 0.34],
  TO: [-175.2, -21.2],
  TV: [179.2, -8.5],
  VA: [12.45, 41.9],
  VC: [-61.2, 13.25],
  WS: [-172.1, -13.8],
};

const REGION_VIEW_BOXES: Record<Region, string> = {
  AFRICA: "258 135 566 267",
  AMERICAS: "-146 52 795 375",
  ASIA: "480 70 435 205",
  CARIBBEAN: "185 160 244 115",
  EUROPE: "400 42 233 110",
  "MIDDLE EAST": "490 115 233 110",
  OCEANIA: "610 210 435 205",
};

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function featureCollection(features: Feature<Geometry, CountryProperties>[]): FeatureCollection<Geometry, CountryProperties> {
  return { type: "FeatureCollection", features };
}

const atlasByName = new Map(countries.features.map((country) => [normalizeName(country.properties.name), country]));
const passportFeatures = new Map<string, Feature<Geometry, CountryProperties>>();
const missingCountries: string[] = [];
for (const passport of snapshot.manifest.passports) {
  const candidates = [ATLAS_NAMES[passport.code], passport.name, displayNames.of(passport.code)].filter(
    (name): name is string => Boolean(name),
  );
  const country = candidates.map((name) => atlasByName.get(normalizeName(name))).find(Boolean);
  if (country) passportFeatures.set(passport.code, country);
  else if (!FALLBACK_COORDINATES[passport.code]) missingCountries.push(`${passport.code} ${passport.name}`);
}
if (missingCountries.length) throw new Error(`No map geometry or coordinates for: ${missingCountries.join(", ")}`);

const regionMaps: Record<string, { viewBox: string; path: string; markerRadius: number }> = {};
const regions = [...new Set(snapshot.manifest.passports.map((passport) => passport.region))];
for (const region of regions) {
  const regionalPassports = snapshot.manifest.passports.filter((passport) => passport.region === region);
  const contextFeatures = regionalPassports.flatMap((passport) => {
    const country = passportFeatures.get(passport.code);
    return country ? [country] : [];
  });
  const viewBox = REGION_VIEW_BOXES[region];
  const width = Number(viewBox.split(" ")[2]);
  regionMaps[region] = {
    viewBox,
    path: path(featureCollection(contextFeatures)) ?? "",
    markerRadius: Number(Math.max(2.2, width * 0.012).toFixed(1)),
  };
}

const countryMaps: Record<string, { path: string; marker: [number, number] }> = {};
for (const passport of snapshot.manifest.passports) {
  const country = passportFeatures.get(passport.code);
  const coordinate = FALLBACK_COORDINATES[passport.code] ?? (country ? geoCentroid(country) : undefined);
  const marker = coordinate ? projection(coordinate) : null;
  if (!marker) throw new Error(`Could not project a marker for ${passport.code}`);
  if (passport.region === "OCEANIA" && marker[0] < 200) marker[0] += 960;
  countryMaps[passport.code] = {
    path: country ? path(country) ?? "" : "",
    marker: marker.map((value) => Number(value.toFixed(1))) as [number, number],
  };
}

await writeFile(
  output,
  `// Generated from Natural Earth via world-atlas (public domain). Regenerate with npm run assets:map.\nexport interface RegionMapShape { viewBox: string; path: string; markerRadius: number }\nexport interface CountryMapShape { path: string; marker: [number, number] }\nexport const REGION_MAPS: Readonly<Record<string, RegionMapShape>> = ${JSON.stringify(regionMaps)};\nexport const COUNTRY_MAPS: Readonly<Record<string, CountryMapShape>> = ${JSON.stringify(countryMaps)};\n`,
  "utf8",
);

console.log(`Generated ${output.pathname} with ${regions.length} regions and ${Object.keys(countryMaps).length} countries`);
console.log(Object.entries(regionMaps).map(([region, map]) => `${region}: ${map.viewBox}`).join("\n"));
