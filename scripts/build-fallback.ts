import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  buildDestinationCatalog,
  buildPassportSummaries,
  normalizeCode,
  normalizePassportDetail,
} from "../src/lib/passport";
import type {
  DataSnapshot,
  PassportAccess,
  SourceCountry,
  SourcePassportDetail,
} from "../src/lib/types";

const API_ROOT = "https://api.henleypassportindex.com/api/v3";
const outputPath = resolve("src/data/fallback.json");

async function fetchJson<T>(url: string, attempts = 3): Promise<T> {
  let latestError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: "application/json", "user-agent": "multipassrank-sync/1.0" },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return (await response.json()) as T;
    } catch (error) {
      latestError = error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 750));
    }
  }
  throw latestError;
}

async function main(): Promise<void> {
  const response = await fetchJson<{ countries: SourceCountry[] }>(`${API_ROOT}/countries`);
  const countries = response.countries;
  const destinations = buildDestinationCatalog(countries);
  const issuers = countries.filter((country) => country.has_data).map((country) => normalizeCode(country.code));
  const passports: Record<string, PassportAccess> = {};

  for (let offset = 0; offset < issuers.length; offset += 5) {
    const batch = issuers.slice(offset, offset + 5);
    const details = await Promise.all(
      batch.map((code) => fetchJson<SourcePassportDetail>(`${API_ROOT}/visa-single/${code}`)),
    );
    for (const detail of details) {
      const normalized = normalizePassportDetail(detail, destinations);
      passports[normalized.code] = normalized;
    }
    process.stdout.write(`\rNormalized ${Math.min(offset + batch.length, issuers.length)}/${issuers.length} passports`);
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }

  const now = new Date().toISOString();
  const snapshot: DataSnapshot = {
    manifest: {
      schemaVersion: 1,
      version: `fallback-${now.replace(/[:.]/g, "-")}`,
      checkedAt: now,
      publishedAt: now,
      destinations,
      passports: buildPassportSummaries(countries, passports),
    },
    passports,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot)}\n`, "utf8");
  process.stdout.write(`\nWrote ${outputPath}\n`);
}

await main();
