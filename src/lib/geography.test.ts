import { describe, expect, it } from "vitest";
import {
  comparisonHref,
  flagEmojiFor,
  getFriendlyComparison,
  getPassportCollection,
  getPopularComparison,
  rankHref,
  UNTRACKED_DESTINATIONS,
} from "./geography";

describe("country flags", () => {
  it("creates regional-indicator flags and maps the French West Indies aggregate to France", () => {
    expect(flagEmojiFor("SG")).toBe("🇸🇬");
    expect(flagEmojiFor("FW")).toBe("🇫🇷");
  });
});

describe("language passport collections", () => {
  it("defines Arabic, French, and Portuguese groups with explicit administrative-language edge cases", () => {
    const arabic = getPassportCollection("arabic")?.codes;
    const french = getPassportCollection("french")?.codes;
    const portuguese = getPassportCollection("portuguese")?.codes;

    expect(arabic).toHaveLength(25);
    expect(arabic).toEqual(expect.arrayContaining(["IL", "ML", "PS", "TD"]));
    expect(french).toHaveLength(29);
    expect(french).toEqual(expect.arrayContaining(["BF", "ML", "NE", "VU"]));
    expect(portuguese).toHaveLength(10);
    expect(portuguese).toEqual(expect.arrayContaining(["BR", "GQ", "MO", "PT"]));
  });
});

describe("comparison URLs", () => {
  it("matches curated comparisons in either order", () => {
    expect(getFriendlyComparison([["US"], ["PT"]])?.slug).toBe("portugal-vs-united-states-passport");
    expect(getFriendlyComparison([["pt"], ["us"]])?.slug).toBe("portugal-vs-united-states-passport");
  });

  it("keeps arbitrary and combined comparisons on the query route", () => {
    expect(comparisonHref([["DE"], ["JP"]])).toBe("/compare?set=DE&set=JP");
    expect(comparisonHref([["US", "CA"], ["PT"]])).toBe("/compare?set=US%2CCA&set=PT");
  });

  it("builds custom ranking URLs with the same set convention", () => {
    expect(rankHref([["US", "CA"], ["PT"]])).toBe("/rank?set=US%2CCA&set=PT");
    expect(rankHref([])).toBe("/rank");
  });

  it("resolves legacy slugs to the current canonical comparison", () => {
    expect(getPopularComparison("us-vs-uk")?.slug).toBe("united-states-vs-united-kingdom-passport");
  });
});

describe("destination coverage disclosure", () => {
  it("keeps a concise, unique registry of relevant areas outside the upstream model", () => {
    expect(UNTRACKED_DESTINATIONS).toHaveLength(15);
    expect(new Set(UNTRACKED_DESTINATIONS.map(({ code }) => code)).size).toBe(UNTRACKED_DESTINATIONS.length);
    expect(UNTRACKED_DESTINATIONS.map(({ code }) => code)).toEqual(expect.arrayContaining(["AX", "GG", "IM", "JE", "SX", "WF"]));
  });
});
