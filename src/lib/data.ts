import fallbackSnapshot from "@/data/fallback.json";
import fallbackCombinationInsights from "@/data/combination-insights.json";
import { VERIFIED_ACCESS_OVERRIDES } from "@/data/access-overrides";
import { env } from "cloudflare:workers";
import { applyVerifiedAccessOverrides, reconcileManifestPassportDetails } from "./passport";
import type { CombinationInsights, DataSnapshot, PassportAccess, SnapshotManifest } from "./types";

interface SnapshotPointer {
  current: string;
  previous?: string;
}

export interface DataContext {
  manifest: SnapshotManifest;
  source: "live" | "fallback";
}

const fallback = fallbackSnapshot as DataSnapshot;
const fallbackInsights = fallbackCombinationInsights as CombinationInsights;

function passportDataKv(): KVNamespace | undefined {
  return env.PASSPORT_DATA;
}

async function reconcileLiveManifest(
  kv: KVNamespace,
  version: string,
  manifest: SnapshotManifest,
): Promise<SnapshotManifest> {
  const affectedCodes = [...new Set(VERIFIED_ACCESS_OVERRIDES.map(({ passportCode }) => passportCode))];
  if (!affectedCodes.length) return manifest;
  const keys = affectedCodes.map((code) => `snapshot:${version}:passport:${code}`);
  const values = await kv.get<PassportAccess>(keys, "json");
  const corrected = Object.fromEntries(affectedCodes.flatMap((code) => {
    const detail = values.get(`snapshot:${version}:passport:${code}`);
    return detail ? [[code, applyVerifiedAccessOverrides(detail)] as const] : [];
  }));
  return reconcileManifestPassportDetails(manifest, corrected);
}

export async function getDataContext(locals: App.Locals): Promise<DataContext> {
  void locals;
  const kv = passportDataKv();
  if (kv) {
    const pointer = await kv.get<SnapshotPointer>("snapshot:pointer", "json");
    if (pointer?.current) {
      const manifest = await kv.get<SnapshotManifest>(`snapshot:${pointer.current}:manifest`, "json");
      if (manifest) return { manifest: await reconcileLiveManifest(kv, pointer.current, manifest), source: "live" };
    }
  }

  return { manifest: fallback.manifest, source: "fallback" };
}

export async function getPassportAccess(
  locals: App.Locals,
  code: string,
  version?: string,
): Promise<PassportAccess | null> {
  const normalizedCode = code.toUpperCase();
  void locals;
  const kv = passportDataKv();
  if (kv) {
    let snapshotVersion = version;
    if (!snapshotVersion) {
      const pointer = await kv.get<SnapshotPointer>("snapshot:pointer", "json");
      snapshotVersion = pointer?.current;
    }
    if (snapshotVersion) {
      const detail = await kv.get<PassportAccess>(
        `snapshot:${snapshotVersion}:passport:${normalizedCode}`,
        "json",
      );
      if (detail) return applyVerifiedAccessOverrides(detail);
    }
  }

  return fallback.passports[normalizedCode] ?? null;
}

export async function getPassportAccessBatch(
  locals: App.Locals,
  codes: string[],
  version?: string,
): Promise<Record<string, PassportAccess>> {
  const uniqueCodes = [...new Set(codes.map((code) => code.toUpperCase()))];
  void locals;
  const kv = passportDataKv();
  if (kv) {
    let snapshotVersion = version;
    if (!snapshotVersion) {
      const pointer = await kv.get<SnapshotPointer>("snapshot:pointer", "json");
      snapshotVersion = pointer?.current;
    }
    if (snapshotVersion) {
      const chunks = Array.from({ length: Math.ceil(uniqueCodes.length / 100) }, (_, index) =>
        uniqueCodes.slice(index * 100, (index + 1) * 100),
      );
      const maps = await Promise.all(chunks.map((chunk) =>
        kv.get<PassportAccess>(chunk.map((code) => `snapshot:${snapshotVersion}:passport:${code}`), "json"),
      ));
      const liveEntries = uniqueCodes.map((code) => {
        const key = `snapshot:${snapshotVersion}:passport:${code}`;
        const rawDetail = maps.find((map) => map.has(key))?.get(key) ?? fallback.passports[code];
        const detail = rawDetail ? applyVerifiedAccessOverrides(rawDetail) : undefined;
        return [code, detail] as const;
      });
      return Object.fromEntries(liveEntries.filter((entry): entry is [string, PassportAccess] => Boolean(entry[1])));
    }
  }
  const entries = await Promise.all(
    uniqueCodes.map(async (code) => [code, await getPassportAccess(locals, code, version)] as const),
  );
  return Object.fromEntries(entries.filter((entry): entry is [string, PassportAccess] => Boolean(entry[1])));
}

export async function getCombinationInsights(
  locals: App.Locals,
  version?: string,
): Promise<CombinationInsights> {
  void locals;
  const kv = passportDataKv();
  if (kv) {
    let snapshotVersion = version;
    if (!snapshotVersion) {
      const pointer = await kv.get<SnapshotPointer>("snapshot:pointer", "json");
      snapshotVersion = pointer?.current;
    }
    if (snapshotVersion) {
      const insights = await kv.get<CombinationInsights>(
        `snapshot:${snapshotVersion}:combination-insights`,
        "json",
      );
      if (insights) return insights;
    }
  }
  return fallbackInsights;
}
