import { describe, expect, it } from "vitest";
import fallback from "../data/fallback.json";
import { POPULAR_COMPARISONS } from "./geography";
import { comparisonPageTitle, destinationPageTitle, MAX_PAGE_TITLE_LENGTH, passportPageTitle, relationshipPageTitle } from "./seo-titles";
import type { AccessStatus, DataSnapshot } from "./types";

const snapshot = fallback as DataSnapshot;

describe("SEO page titles", () => {
  it("keeps every passport and destination title within Bing's recommended limit", () => {
    for (const passport of snapshot.manifest.passports) {
      expect(passportPageTitle(passport).length, passport.name).toBeLessThanOrEqual(MAX_PAGE_TITLE_LENGTH);
    }
    for (const destination of snapshot.manifest.destinations) {
      expect(destinationPageTitle(destination).length, destination.name).toBeLessThanOrEqual(MAX_PAGE_TITLE_LENGTH);
    }
  });

  it("keeps every generated relationship title within the same limit", () => {
    for (const passport of snapshot.manifest.passports) {
      for (const destination of snapshot.manifest.destinations) {
        const status = snapshot.passports[passport.code]?.statuses[destination.code] as AccessStatus | undefined;
        if (!status || status === "citizenship") continue;
        expect(
          relationshipPageTitle(passport, destination, status).length,
          `${passport.name} to ${destination.name}`,
        ).toBeLessThanOrEqual(MAX_PAGE_TITLE_LENGTH);
      }
    }
  });

  it("keeps every curated comparison title within the same limit", () => {
    for (const comparison of POPULAR_COMPARISONS) {
      expect(comparisonPageTitle(comparison.shortTitle).length, comparison.slug).toBeLessThanOrEqual(MAX_PAGE_TITLE_LENGTH);
    }
  });

  it("retains both place names and the access category on sampled long relationships", () => {
    const passport = snapshot.manifest.passports.find(({ code }) => code === "CF")!;
    const destination = snapshot.manifest.destinations.find(({ code }) => code === "AG")!;
    const title = relationshipPageTitle(passport, destination, "evisa");

    expect(title).toContain("Central African Republic");
    expect(title).toContain("Antigua and Barbuda");
    expect(title).toContain("eVisa");
  });
});
