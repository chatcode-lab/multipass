import { beforeEach, describe, expect, it, vi } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import fallbackCombinationInsights from "@/data/combination-insights.json";
import type { CombinationInsights, DataSnapshot, PublishedDataSnapshot } from "./types";

const { cacheMatch, cachePut, kvGet } = vi.hoisted(() => ({
  cacheMatch: vi.fn(),
  cachePut: vi.fn(),
  kvGet: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  env: {
    PASSPORT_DATA: { get: kvGet },
  },
}));

const locals = {} as App.Locals;
const publishedSnapshot = {
  ...(fallbackSnapshot as DataSnapshot),
  combinationInsights: fallbackCombinationInsights as CombinationInsights,
} satisfies PublishedDataSnapshot;

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("caches", { default: { match: cacheMatch, put: cachePut } });
  cacheMatch.mockReset().mockResolvedValue(undefined);
  cachePut.mockReset().mockResolvedValue(undefined);
  kvGet.mockReset().mockResolvedValue(publishedSnapshot);
});

describe("published passport snapshot access", () => {
  it("serves manifest, passport, batch, and insights from one cached KV read", async () => {
    const data = await import("./data");
    const context = await data.getDataContext(locals);
    const passport = await data.getPassportAccess(locals, "US", context.manifest.version);
    const batch = await data.getPassportAccessBatch(locals, ["US", "CA", "US"], context.manifest.version);
    const insights = await data.getCombinationInsights(locals, context.manifest.version);

    expect(context.source).toBe("live");
    expect(passport?.code).toBe("US");
    expect(Object.keys(batch)).toEqual(["US", "CA"]);
    expect(insights.snapshotVersion).toBe(context.manifest.version);
    expect(kvGet).toHaveBeenCalledTimes(1);
    expect(kvGet).toHaveBeenCalledWith("snapshot:current", "json");
    expect(cacheMatch).toHaveBeenCalledTimes(1);
    expect(cachePut).toHaveBeenCalledTimes(1);
  }, 15_000);

  it("uses the edge cache without billing a KV read in a new isolate", async () => {
    cacheMatch.mockImplementation(async () =>
      new Response(JSON.stringify(publishedSnapshot), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    const data = await import("./data");

    const context = await data.getDataContext(locals);
    const passport = await data.getPassportAccess(locals, "US", context.manifest.version);

    expect(context.source).toBe("live");
    expect(passport?.code).toBe("US");
    expect(cacheMatch).toHaveBeenCalledTimes(1);
    expect(kvGet).not.toHaveBeenCalled();
    expect(cachePut).not.toHaveBeenCalled();
  }, 15_000);

  it("applies effective-date overrides when falling back from KV", async () => {
    kvGet.mockResolvedValue(null);
    const data = await import("./data");

    const context = await data.getDataContext(locals);
    const batch = await data.getPassportAccessBatch(locals, ["MY", "CM"], context.manifest.version);

    expect(context.source).toBe("fallback");
    expect(batch.MY.statuses.AO).toBe("visa_on_arrival");
    expect(batch.CM.statuses.CV).toBe("visa_on_arrival");
  }, 15_000);
});
