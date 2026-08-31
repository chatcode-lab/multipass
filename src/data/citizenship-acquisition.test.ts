import { describe, expect, it } from "vitest";
import { CITIZENSHIP_ACQUISITION_ROUTES, CITIZENSHIP_ACQUISITION_ROUTES_BY_COUNTRY } from "./citizenship-acquisition";
import { CITIZENSHIP_POLICY_BY_CODE } from "./citizenship-policies";

describe("citizenship acquisition routes", () => {
  it("keeps every reviewed route uniquely addressable and sourced", () => {
    const ids = CITIZENSHIP_ACQUISITION_ROUTES.map((route) => route.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(CITIZENSHIP_ACQUISITION_ROUTES).toHaveLength(12);
    for (const route of CITIZENSHIP_ACQUISITION_ROUTES) {
      expect(route.requirements.length).toBeGreaterThan(0);
      expect(route.sources.length).toBeGreaterThan(0);
      expect(route.sources.every((source) => source.url.startsWith("https://"))).toBe(true);
      expect(CITIZENSHIP_POLICY_BY_CODE.has(route.countryCode)).toBe(true);
    }
  });

  it("does not present exceptional nomination as an ordinary application route", () => {
    const emirates = CITIZENSHIP_ACQUISITION_ROUTES.find((route) => route.countryCode === "AE");
    expect(emirates).toMatchObject({ type: "exceptional" });
    expect(emirates?.summary).toContain("not an ordinary citizenship application route");
  });

  it("indexes every route under its country code", () => {
    const indexed = [...CITIZENSHIP_ACQUISITION_ROUTES_BY_COUNTRY.values()].flat();
    expect(indexed).toHaveLength(CITIZENSHIP_ACQUISITION_ROUTES.length);
    expect(new Set(indexed.map((route) => route.id))).toEqual(
      new Set(CITIZENSHIP_ACQUISITION_ROUTES.map((route) => route.id)),
    );
  });
});
