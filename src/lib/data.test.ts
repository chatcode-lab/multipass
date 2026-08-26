import { beforeAll, describe, expect, it, vi } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import fallbackCombinationInsights from "@/data/combination-insights.json";
import type { CombinationInsights, DataSnapshot, PublishedDataSnapshot } from "./types";

const { kvGet } = vi.hoisted(() => ({ kvGet: vi.fn() }));

vi.mock("cloudflare:workers", () => ({
  env: {
    PASSPORT_DATA: { get: kvGet },
  },
}));

const data = await import("./data");
const locals = {} as App.Locals;

beforeAll(() => {
  kvGet.mockResolvedValue({
    ...(fallbackSnapshot as DataSnapshot),
    combinationInsights: fallbackCombinationInsights as CombinationInsights,
  } satisfies PublishedDataSnapshot);
});

describe("published passport snapshot access", () => {
  it("serves manifest, passport, batch, and insights from one cached KV read", async () => {
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
  });
});
