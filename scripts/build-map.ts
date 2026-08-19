import { geoNaturalEarth1, geoPath } from "d3-geo";
import { readFile, writeFile } from "node:fs/promises";
import { feature } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";

const source = new URL("../node_modules/world-atlas/land-110m.json", import.meta.url);
const output = new URL("../src/data/world-map.ts", import.meta.url);
const topology = JSON.parse(await readFile(source, "utf8")) as Topology<{ land: GeometryObject }>;
const land = feature(topology, topology.objects.land);
const projection = geoNaturalEarth1().fitExtent([[4, 4], [956, 496]], land);
const path = geoPath(projection).digits(1)(land);

if (!path) throw new Error("Natural Earth map path could not be generated");

await writeFile(
  output,
  `// Generated from Natural Earth via world-atlas (public domain).\nexport const WORLD_LAND_PATH = ${JSON.stringify(path)};\n`,
  "utf8",
);

console.log(`Generated ${output.pathname} (${path.length} path characters)`);
