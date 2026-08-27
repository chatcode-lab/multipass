import { afterEach, describe, expect, it, vi } from "vitest";
import { inspectSource, type OfficialPortalSource } from "./index";

const source: OfficialPortalSource = {
  id: "fixture",
  title: "Fixture official schedule",
  url: "https://government.example/schedule",
  publisher: "Fixture Immigration Authority",
  extractor: "json",
  purpose: "Test the read-only adapter contract.",
  requiredMarkers: ["countryCode"],
  recordsPath: "result.data",
  expectedMinimumRecords: 2,
  enforcement: "required",
};

afterEach(() => vi.unstubAllGlobals());

describe("official source-health adapters", () => {
  it("checks JSON shape, record count, identity markers and hashes", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      result: { data: [{ countryCode: "AA" }, { countryCode: "BB" }] },
    }), { status: 200, headers: { "content-type": "application/json" } })));

    const result = await inspectSource(source);
    expect(result).toMatchObject({ ok: true, healthy: true, recordCount: 2 });
    expect(result.markerMatches.countryCode).toBe(true);
    expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.semanticHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("fails health without turning a response into visa evidence", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      result: { data: [{ other: "AA" }] },
    }), { status: 200, headers: { "content-type": "application/json" } })));

    const result = await inspectSource(source);
    expect(result.ok).toBe(true);
    expect(result.healthy).toBe(false);
    expect(result.markerMatches.countryCode).toBe(false);
  });
});
