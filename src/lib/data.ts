import fallbackSnapshot from "@/data/fallback.json";
import { env } from "cloudflare:workers";
import type { DataSnapshot, PassportAccess, SnapshotManifest } from "./types";

interface SnapshotPointer {
  current: string;
  previous?: string;
}

export interface DataContext {
  manifest: SnapshotManifest;
  source: "live" | "fallback";
}

const fallback = fallbackSnapshot as DataSnapshot;

function passportDataKv(): KVNamespace | undefined {
  return env.PASSPORT_DATA;
}

export async function getDataContext(locals: App.Locals): Promise<DataContext> {
  void locals;
  const kv = passportDataKv();
  if (kv) {
    const pointer = await kv.get<SnapshotPointer>("snapshot:pointer", "json");
    if (pointer?.current) {
      const manifest = await kv.get<SnapshotManifest>(`snapshot:${pointer.current}:manifest`, "json");
      if (manifest) return { manifest, source: "live" };
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
      if (detail) return detail;
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
  const entries = await Promise.all(
    uniqueCodes.map(async (code) => [code, await getPassportAccess(locals, code, version)] as const),
  );
  return Object.fromEntries(entries.filter((entry): entry is [string, PassportAccess] => Boolean(entry[1])));
}
