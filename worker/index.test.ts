import { afterEach, describe, expect, it, vi } from "vitest";
import { runSyncBatch } from "./index";
import type { SourceCountry } from "../src/lib/types";

class MemoryKV {
  values = new Map<string, string>();
  async get<T>(key: string | string[], type?: string): Promise<T | string | Map<string, T | null> | null> {
    if (Array.isArray(key)) {
      return new Map(key.map((entry) => {
        const value = this.values.get(entry);
        return [entry, value === undefined ? null : type === "json" ? JSON.parse(value) as T : value as T];
      }));
    }
    const value = this.values.get(key);
    if (value === undefined) return null;
    return type === "json" ? (JSON.parse(value) as T) : value;
  }
  async put(key: string, value: string): Promise<void> { this.values.set(key, value); }
  async delete(key: string): Promise<void> { this.values.delete(key); }
}

function codeAt(index: number): string {
  return `${String.fromCharCode(65 + Math.floor(index / 26))}${String.fromCharCode(65 + (index % 26))}`;
}

function fixtureCountries(): SourceCountry[] {
  return Array.from({ length: 227 }, (_, index) => ({
    code: codeAt(index),
    country: `Country ${codeAt(index)}`,
    has_data: index < 199,
    region: ["AFRICA", "AMERICAS", "CARIBBEAN", "ASIA", "EUROPE", "MIDDLE EAST", "OCEANIA"][index % 7],
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe("sync worker", () => {
  it("publishes a completed staged snapshot by changing the pointer last", async () => {
    const kv = new MemoryKV();
    const countries = fixtureCountries();
    const finalCode = codeAt(198);
    const version = "test-version";
    await kv.put("sync:state", JSON.stringify({
      version,
      startedAt: "2026-01-01T00:00:00.000Z",
      countries,
      destinations: countries.map((country) => ({ code: country.code, name: country.country, region: country.region })),
      issuerCodes: countries.slice(0, 199).map((country) => country.code),
      nextIndex: 198,
      scores: Object.fromEntries(countries.slice(0, 198).map((country) => [country.code, 0])),
      cleanupIndex: 0,
    }));
    for (const country of countries.slice(0, 198)) {
      await kv.put(`snapshot:${version}:passport:${country.code}`, JSON.stringify({
        code: country.code,
        name: country.country,
        mobilityScore: 226,
        statuses: Object.fromEntries(countries.map((destination) => [
          destination.code,
          destination.code === country.code ? "citizenship" : "visa_free",
        ])),
      }));
    }
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      code: finalCode,
      country: `Country ${finalCode}`,
      visa_free_access: [],
      electronic_travel_authorisation: [],
      visa_on_arrival: [],
      visa_online: [],
      visa_required: countries.filter((country) => country.code !== finalCode).map((country) => ({ code: country.code, name: country.country })),
    }), { status: 200 })));

    const result = await runSyncBatch({
      PASSPORT_DATA: kv as unknown as KVNamespace,
      SYNC_TOKEN: "secret",
      SOURCE_API_ROOT: "https://example.test",
      SYNC_BATCH_SIZE: "1",
    });

    expect(result.published).toBe(true);
    expect(JSON.parse(kv.values.get("snapshot:pointer") ?? "{}").current).toBe(version);
    expect(kv.values.has(`snapshot:${version}:manifest`)).toBe(true);
    expect(kv.values.has(`snapshot:${version}:combination-insights`)).toBe(true);
    expect(kv.values.has("sync:state")).toBe(false);
  });
});
