import {
  buildDestinationCatalog,
  buildPassportSummariesFromScores,
  normalizeCode,
  normalizePassportDetail,
} from "../src/lib/passport";
import { analyzePassportCombinations } from "../src/lib/combination-insights";
import type {
  Destination,
  PassportAccess,
  SnapshotManifest,
  SourceCountry,
  SourcePassportDetail,
} from "../src/lib/types";

interface Env {
  PASSPORT_DATA: KVNamespace;
  SYNC_TOKEN: string;
  SOURCE_API_ROOT: string;
  SYNC_BATCH_SIZE?: string;
}

interface SnapshotPointer {
  current: string;
  previous?: string;
}

interface SyncState {
  version: string;
  startedAt: string;
  countries: SourceCountry[];
  destinations: Destination[];
  issuerCodes: string[];
  nextIndex: number;
  scores: Record<string, number>;
  cleanupVersion?: string;
  cleanupIndex: number;
}

const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 40;

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { ...init, headers });
}

async function fetchJson<T>(url: string, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: "application/json", "user-agent": "multipassrank-sync/1.0" },
      });
      if (!response.ok) throw new Error(`Upstream ${response.status} for ${url}`);
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 600));
    }
  }
  throw lastError;
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let offset = 0; offset < values.length; offset += concurrency) {
    results.push(...(await Promise.all(values.slice(offset, offset + concurrency).map(mapper))));
  }
  return results;
}

async function readSnapshotPassports(
  env: Env,
  version: string,
  codes: string[],
): Promise<Record<string, PassportAccess>> {
  const chunks = Array.from({ length: Math.ceil(codes.length / 100) }, (_, index) =>
    codes.slice(index * 100, (index + 1) * 100),
  );
  const maps = await Promise.all(chunks.map((chunk) =>
    env.PASSPORT_DATA.get<PassportAccess>(
      chunk.map((code) => `snapshot:${version}:passport:${code}`),
      "json",
    ),
  ));
  const entries = codes.map((code) => {
    const key = `snapshot:${version}:passport:${code}`;
    const detail = maps.find((map) => map.has(key))?.get(key);
    if (!detail) throw new Error(`Missing staged passport ${code}`);
    return [code, detail] as const;
  });
  return Object.fromEntries(entries);
}

async function startCycle(env: Env): Promise<SyncState> {
  const payload = await fetchJson<{ countries: SourceCountry[] }>(`${env.SOURCE_API_ROOT}/countries`);
  const destinations = buildDestinationCatalog(payload.countries);
  const issuerCodes = payload.countries
    .filter((country) => country.has_data)
    .map((country) => normalizeCode(country.code))
    .sort();
  if (issuerCodes.length !== 199) throw new Error(`Expected 199 issuers, received ${issuerCodes.length}`);

  const pointer = await env.PASSPORT_DATA.get<SnapshotPointer>("snapshot:pointer", "json");
  const startedAt = new Date().toISOString();
  return {
    version: startedAt.replace(/[:.]/g, "-"),
    startedAt,
    countries: payload.countries,
    destinations,
    issuerCodes,
    nextIndex: 0,
    scores: {},
    cleanupVersion: pointer?.previous,
    cleanupIndex: 0,
  };
}

export async function runSyncBatch(env: Env): Promise<{ published: boolean; processed: number; remaining: number; version: string }> {
  let state = await env.PASSPORT_DATA.get<SyncState>("sync:state", "json");
  if (!state) state = await startCycle(env);

  const requestedSize = Number.parseInt(env.SYNC_BATCH_SIZE ?? `${DEFAULT_BATCH_SIZE}`, 10);
  const batchSize = Math.max(1, Math.min(Number.isFinite(requestedSize) ? requestedSize : DEFAULT_BATCH_SIZE, MAX_BATCH_SIZE));
  const codes = state.issuerCodes.slice(state.nextIndex, state.nextIndex + batchSize);
  const details = await mapWithConcurrency(
    codes,
    5,
    (code) => fetchJson<SourcePassportDetail>(`${env.SOURCE_API_ROOT}/visa-single/${code}`),
  );

  const normalizedDetails = details.map((detail) => normalizePassportDetail(detail, state.destinations));
  await Promise.all(
    normalizedDetails.map((detail) =>
      env.PASSPORT_DATA.put(`snapshot:${state.version}:passport:${detail.code}`, JSON.stringify(detail)),
    ),
  );
  for (const detail of normalizedDetails) state.scores[detail.code] = detail.mobilityScore;
  state.nextIndex += codes.length;

  if (state.cleanupVersion) {
    const cleanupCodes = state.issuerCodes.slice(state.cleanupIndex, state.cleanupIndex + batchSize);
    await Promise.all(
      cleanupCodes.map((code) => env.PASSPORT_DATA.delete(`snapshot:${state.cleanupVersion}:passport:${code}`)),
    );
    state.cleanupIndex += cleanupCodes.length;
    if (state.cleanupIndex >= state.issuerCodes.length) {
      await env.PASSPORT_DATA.delete(`snapshot:${state.cleanupVersion}:manifest`);
      await env.PASSPORT_DATA.delete(`snapshot:${state.cleanupVersion}:combination-insights`);
      state.cleanupVersion = undefined;
    }
  }

  const remaining = state.issuerCodes.length - state.nextIndex;
  if (remaining > 0) {
    await env.PASSPORT_DATA.put("sync:state", JSON.stringify(state));
    return { published: false, processed: codes.length, remaining, version: state.version };
  }

  const now = new Date().toISOString();
  const manifest: SnapshotManifest = {
    schemaVersion: 1,
    version: state.version,
    checkedAt: now,
    publishedAt: now,
    destinations: state.destinations,
    passports: buildPassportSummariesFromScores(state.countries, state.scores),
  };
  const completedBatch = Object.fromEntries(normalizedDetails.map((detail) => [detail.code, detail]));
  const snapshotPassports = {
    ...await readSnapshotPassports(
      env,
      state.version,
      state.issuerCodes.filter((code) => !completedBatch[code]),
    ),
    ...completedBatch,
  };
  const combinationInsights = analyzePassportCombinations(manifest, snapshotPassports);
  const previousPointer = await env.PASSPORT_DATA.get<SnapshotPointer>("snapshot:pointer", "json");
  await env.PASSPORT_DATA.put(
    `snapshot:${state.version}:combination-insights`,
    JSON.stringify(combinationInsights),
  );
  await env.PASSPORT_DATA.put(`snapshot:${state.version}:manifest`, JSON.stringify(manifest));
  await env.PASSPORT_DATA.put(
    "snapshot:pointer",
    JSON.stringify({ current: state.version, previous: previousPointer?.current } satisfies SnapshotPointer),
  );
  await env.PASSPORT_DATA.delete("sync:state");
  return { published: true, processed: codes.length, remaining: 0, version: state.version };
}

async function health(env: Env): Promise<Response> {
  const [pointer, state] = await Promise.all([
    env.PASSPORT_DATA.get<SnapshotPointer>("snapshot:pointer", "json"),
    env.PASSPORT_DATA.get<SyncState>("sync:state", "json"),
  ]);
  const manifest = pointer?.current
    ? await env.PASSPORT_DATA.get<SnapshotManifest>(`snapshot:${pointer.current}:manifest`, "json")
    : null;
  return json(
    {
      ok: Boolean(manifest),
      snapshot: manifest ? { version: manifest.version, checkedAt: manifest.checkedAt, passports: manifest.passports.length } : null,
      sync: state ? { version: state.version, completed: state.nextIndex, total: state.issuerCodes.length } : null,
    },
    { status: manifest ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}

function authorized(request: Request, env: Env): boolean {
  const header = request.headers.get("authorization");
  return Boolean(env.SYNC_TOKEN && header === `Bearer ${env.SYNC_TOKEN}`);
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") return health(env);
    if (request.method === "POST" && url.pathname === "/admin/sync") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, { status: 401 });
      try {
        return json(await runSyncBatch(env));
      } catch (error) {
        console.error("Passport sync failed", error);
        return json({ error: "Sync failed; the current snapshot was not changed" }, { status: 502 });
      }
    }
    return json({ error: "Not found" }, { status: 404 });
  },
  async scheduled(_event, env, context): Promise<void> {
    context.waitUntil(
      runSyncBatch(env)
        .then((result) => console.log("Passport sync batch complete", result))
        .catch((error) => console.error("Passport sync batch failed; keeping current snapshot", error)),
    );
  },
} satisfies ExportedHandler<Env>;
