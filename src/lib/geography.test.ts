import { describe, expect, it } from "vitest";
import { comparisonHref, flagEmojiFor, getFriendlyComparison, getPopularComparison } from "./geography";

describe("country flags", () => {
  it("creates regional-indicator flags and maps the French West Indies aggregate to France", () => {
    expect(flagEmojiFor("SG")).toBe("🇸🇬");
    expect(flagEmojiFor("FW")).toBe("🇫🇷");
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

  it("resolves legacy slugs to the current canonical comparison", () => {
    expect(getPopularComparison("us-vs-uk")?.slug).toBe("united-states-vs-united-kingdom-passport");
  });
});
