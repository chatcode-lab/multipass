import { readFile, writeFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";

interface Snapshot {
  manifest: {
    passports: Array<{ code: string }>;
  };
}

interface DecodedPng {
  width: number;
  height: number;
  pixels: Uint8Array;
  colorType: number;
  palette: Uint8Array;
  transparency?: Uint8Array;
}

const source = new URL("../src/data/fallback.json", import.meta.url);
const output = new URL("../src/data/passport-colors.ts", import.meta.url);
const snapshot = JSON.parse(await readFile(source, "utf8")) as Snapshot;

function paeth(left: number, above: number, upperLeft: number): number {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function decodeIndexedPng(buffer: Uint8Array): DecodedPng {
  const signature = Buffer.from(buffer.subarray(0, 8)).toString("hex");
  if (signature !== "89504e470d0a1a0a") throw new Error("Not a PNG image");

  let width = 0;
  let height = 0;
  let colorType = 0;
  let palette = new Uint8Array();
  let transparency: Uint8Array | undefined;
  const imageChunks: Uint8Array[] = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = Buffer.from(buffer.subarray(offset, offset + 4)).readUInt32BE();
    const type = Buffer.from(buffer.subarray(offset + 4, offset + 8)).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = Buffer.from(data.subarray(0, 4)).readUInt32BE();
      height = Buffer.from(data.subarray(4, 8)).readUInt32BE();
      colorType = data[9];
      if (data[8] !== 8 || ![0, 2, 3, 4, 6].includes(colorType) || data[12] !== 0) {
        throw new Error("Expected an 8-bit, non-interlaced PNG");
      }
    } else if (type === "PLTE") {
      palette = new Uint8Array(data);
    } else if (type === "tRNS") {
      transparency = new Uint8Array(data);
    } else if (type === "IDAT") {
      imageChunks.push(data);
    }
    offset += length + 12;
    if (type === "IEND") break;
  }

  const compressed = Buffer.concat(imageChunks.map((chunk) => Buffer.from(chunk)));
  const scanlines = inflateSync(compressed);
  const bytesPerPixel = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[colorType];
  const rowLength = width * bytesPerPixel;
  const pixels = new Uint8Array(rowLength * height);
  let inputOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = scanlines[inputOffset++];
    for (let x = 0; x < rowLength; x += 1) {
      const raw = scanlines[inputOffset++];
      const position = y * rowLength + x;
      const left = x >= bytesPerPixel ? pixels[position - bytesPerPixel] : 0;
      const above = y > 0 ? pixels[position - rowLength] : 0;
      const upperLeft = x >= bytesPerPixel && y > 0 ? pixels[position - rowLength - bytesPerPixel] : 0;
      if (filter === 0) pixels[position] = raw;
      else if (filter === 1) pixels[position] = (raw + left) & 0xff;
      else if (filter === 2) pixels[position] = (raw + above) & 0xff;
      else if (filter === 3) pixels[position] = (raw + Math.floor((left + above) / 2)) & 0xff;
      else if (filter === 4) pixels[position] = (raw + paeth(left, above, upperLeft)) & 0xff;
      else throw new Error(`Unsupported PNG filter ${filter}`);
    }
  }

  return { width, height, pixels, colorType, palette, transparency };
}

function dominantCoverColor(png: DecodedPng): string {
  const buckets = new Map<string, { count: number; red: number; green: number; blue: number }>();
  const xInset = Math.round(png.width * 0.08);
  const yInset = Math.round(png.height * 0.06);
  for (let y = yInset; y < png.height - yInset; y += 1) {
    for (let x = xInset; x < png.width - xInset; x += 1) {
      let red: number;
      let green: number;
      let blue: number;
      let alpha = 255;
      if (png.colorType === 3) {
        const paletteIndex = png.pixels[y * png.width + x];
        alpha = png.transparency?.[paletteIndex] ?? 255;
        red = png.palette[paletteIndex * 3];
        green = png.palette[paletteIndex * 3 + 1];
        blue = png.palette[paletteIndex * 3 + 2];
      } else {
        const channels = ({ 0: 1, 2: 3, 4: 2, 6: 4 } as Record<number, number>)[png.colorType];
        const position = (y * png.width + x) * channels;
        if (png.colorType === 0 || png.colorType === 4) {
          red = green = blue = png.pixels[position];
          if (png.colorType === 4) alpha = png.pixels[position + 1];
        } else {
          red = png.pixels[position];
          green = png.pixels[position + 1];
          blue = png.pixels[position + 2];
          if (png.colorType === 6) alpha = png.pixels[position + 3];
        }
      }
      if (alpha < 180) continue;
      const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      if (luminance < 10 || luminance > 150) continue;
      const key = `${red >> 4},${green >> 4},${blue >> 4}`;
      const bucket = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };
      bucket.count += 1;
      bucket.red += red;
      bucket.green += green;
      bucket.blue += blue;
      buckets.set(key, bucket);
    }
  }
  const dominant = [...buckets.values()].sort((first, second) => second.count - first.count)[0];
  if (!dominant) return "#293633";
  const channels = [dominant.red, dominant.green, dominant.blue].map((channel) =>
    Math.round(channel / dominant.count),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

const colors: Record<string, string> = {};
const codes = snapshot.manifest.passports.map((passport) => passport.code.toLowerCase());
for (let offset = 0; offset < codes.length; offset += 12) {
  const batch = codes.slice(offset, offset + 12);
  await Promise.all(batch.map(async (code) => {
    const url = `https://img.passportindex.org/countries/thum/${code}.png`;
    const response = await fetch(url, {
      headers: {
        Referer: "https://www.passportindex.org/",
        "User-Agent": "Mozilla/5.0 (compatible; MultipassRankAssetSync/1.0)",
      },
    });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    colors[code.toUpperCase()] = dominantCoverColor(decodeIndexedPng(new Uint8Array(await response.arrayBuffer())));
  }));
}

const orderedColors = Object.fromEntries(Object.entries(colors).sort(([first], [second]) => first.localeCompare(second)));
await writeFile(
  output,
  `// Generated from Passport Index country thumbnails. Regenerate with npm run assets:passports.\nexport const PASSPORT_COLORS: Readonly<Record<string, string>> = ${JSON.stringify(orderedColors, null, 2)};\n`,
  "utf8",
);

console.log(`Generated ${output.pathname} with ${Object.keys(orderedColors).length} passport colors`);
