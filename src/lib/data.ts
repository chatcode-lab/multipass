import fallbackSnapshot from "@/data/fallback.json";
import fallbackCombinationInsights from "@/data/combination-insights.json";
import { env } from "cloudflare:workers";
import { applyAccessOverrides, reconcileManifestPassportDetails } from "./passport";
import type {
  CombinationInsights,
  DataSnapshot,
  PassportAccess,
  PublishedDataSnapshot,
} from "./types";

export interface DataContext {
  manifest: PublishedDataSnapshot["manifest"];
  source: "live" | "fallback";
}

const LIVE_SNAPSHOT_KEY = "snapshot:current";
const LIVE_SNAPSHOT_CACHE_MS = 5 * 60 * 1_000;
const LIVE_SNAPSHOT_EDGE_CACHE_SECONDS = 60 * 60;
const LIVE_SNAPSHOT_EDGE_CACHE_URL = "https://multipassrank.com/__internal/passport-data-snapshot";
const fallbackSource = {
  ...(fallbackSnapshot as DataSnapshot),
  combinationInsights: fallbackCombinationInsights as CombinationInsights,
};

let fallbackCache: {
  asOf: string;
  value: PublishedDataSnapshot;
} | undefined;

let liveSnapshotCache: {
  expiresAt: number;
  value: Promise<PublishedDataSnapshot | null>;
} | undefined;

function passportDataKv(): KVNamespace | undefined {
  return env.PASSPORT_DATA;
}

function reconcileSnapshot(snapshot: PublishedDataSnapshot): PublishedDataSnapshot {
  const passports = Object.fromEntries(
    Object.entries(snapshot.passports).map(([code, detail]) => [code, applyAccessOverrides(detail)]),
  );
  return {
    ...snapshot,
    manifest: reconcileManifestPassportDetails(snapshot.manifest, passports),
    passports,
  };
}

function getFallbackSnapshot(): PublishedDataSnapshot {
  // Cloudflare Workers can freeze `Date` outside a request. Applying
  // effective-date overrides at module initialization therefore risks
  // retaining the raw snapshot for policies that are already in force. Build
  // the corrected fallback lazily, then reuse it for the rest of the day.
  const asOf = new Date().toISOString().slice(0, 10);
  if (!fallbackCache || fallbackCache.asOf !== asOf) {
    fallbackCache = { asOf, value: reconcileSnapshot(fallbackSource) };
  }
  return fallbackCache.value;
}

function edgeCache(): Cache | undefined {
  return typeof caches === "undefined"
    ? undefined
    : (caches as CacheStorage & { default: Cache }).default;
}

async function readPublishedSnapshot(kv: KVNamespace): Promise<PublishedDataSnapshot | null> {
  const cache = edgeCache();
  const cacheKey = new Request(LIVE_SNAPSHOT_EDGE_CACHE_URL);

  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) return await cached.json<PublishedDataSnapshot>();
    } catch (error) {
      console.error("Unable to read the passport snapshot from edge cache", error);
    }
  }

  const snapshot = await kv.get<PublishedDataSnapshot>(LIVE_SNAPSHOT_KEY, "json");
  if (snapshot && cache) {
    try {
      await cache.put(
        cacheKey,
        new Response(JSON.stringify(snapshot), {
          headers: {
            "Cache-Control": `public, max-age=${LIVE_SNAPSHOT_EDGE_CACHE_SECONDS}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        }),
      );
    } catch (error) {
      console.error("Unable to write the passport snapshot to edge cache", error);
    }
  }
  return snapshot;
}

async function getLiveSnapshot(): Promise<PublishedDataSnapshot | null> {
  const kv = passportDataKv();
  if (!kv) return null;

  const now = Date.now();
  if (liveSnapshotCache && liveSnapshotCache.expiresAt > now) return liveSnapshotCache.value;

  const value = readPublishedSnapshot(kv)
    .then((snapshot) => snapshot ? reconcileSnapshot(snapshot) : null);
  liveSnapshotCache = { expiresAt: now + LIVE_SNAPSHOT_CACHE_MS, value };

  try {
    return await value;
  } catch (error) {
    // Do not pin a transient KV failure for five minutes. Callers still receive
    // the bundled snapshot for this request and may retry on the next one.
    liveSnapshotCache = undefined;
    console.error("Unable to read the published passport snapshot", error);
    return null;
  }
}

async function getSnapshot(): Promise<{ snapshot: PublishedDataSnapshot; source: DataContext["source"] }> {
  const live = await getLiveSnapshot();
  return live ? { snapshot: live, source: "live" } : { snapshot: getFallbackSnapshot(), source: "fallback" };
}

export async function getDataContext(_locals: App.Locals): Promise<DataContext> {
  const { snapshot, source } = await getSnapshot();
  return { manifest: snapshot.manifest, source };
}

export async function getPassportAccess(
  _locals: App.Locals,
  code: string,
  _version?: string,
): Promise<PassportAccess | null> {
  const { snapshot } = await getSnapshot();
  return snapshot.passports[code.toUpperCase()] ?? null;
}

export async function getPassportAccessBatch(
  _locals: App.Locals,
  codes: string[],
  _version?: string,
): Promise<Record<string, PassportAccess>> {
  const { snapshot } = await getSnapshot();
  return Object.fromEntries(
    [...new Set(codes.map((code) => code.toUpperCase()))].flatMap((code) => {
      const detail = snapshot.passports[code];
      return detail ? [[code, detail] as const] : [];
    }),
  );
}

export async function getCombinationInsights(
  _locals: App.Locals,
  _version?: string,
): Promise<CombinationInsights> {
  const { snapshot } = await getSnapshot();
  return snapshot.combinationInsights;
}
