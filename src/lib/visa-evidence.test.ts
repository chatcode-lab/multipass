import { describe, expect, it } from "vitest";
import fallbackSnapshot from "@/data/fallback.json";
import { ANGOLA_TOURIST_VISA_EXEMPT_CODES, OFFICIAL_VISA_SOURCES } from "@/data/visa-evidence";
import type { DataSnapshot } from "./types";
import {
  destinationSlug,
  evidenceRelationshipPairs,
  getVisaRelationshipEvidence,
  resolveVisaRelationshipSlug,
  visaRelationshipHref,
} from "./visa-evidence";

const snapshot = fallbackSnapshot as DataSnapshot;

describe("visa relationship URLs", () => {
  it("resolves readable passport, destination, and requested-status slugs", () => {
    const resolved = resolveVisaRelationshipSlug("belgium-congo-evisa", snapshot.manifest);
    expect(resolved).toMatchObject({
      passport: { code: "BE" },
      destination: { code: "CD" },
      requestedStatus: "evisa",
    });
    expect(visaRelationshipHref(resolved!.passport, resolved!.destination, resolved!.requestedStatus))
      .toBe("/belgium-congo-evisa");
  });

  it("still resolves a recognized but outdated status for canonical redirecting", () => {
    expect(resolveVisaRelationshipSlug("belgium-chad-evisa", snapshot.manifest)).toMatchObject({
      passport: { code: "BE" },
      destination: { code: "TD" },
      requestedStatus: "evisa",
    });
  });

  it("keeps destination and passport–destination slugs unique across the catalog", () => {
    const destinationSlugs = snapshot.manifest.destinations.map(destinationSlug);
    expect(new Set(destinationSlugs).size).toBe(snapshot.manifest.destinations.length);

    const pairSlugs = snapshot.manifest.passports.flatMap((passport) =>
      snapshot.manifest.destinations.map((destination) => `${passport.slug}-${destinationSlug(destination)}`),
    );
    expect(new Set(pairSlugs).size).toBe(snapshot.manifest.passports.length * snapshot.manifest.destinations.length);
  });
});

describe("official visa evidence", () => {
  it("supports the seeded policy examples without claiming unsupported pairs", () => {
    expect(getVisaRelationshipEvidence("BE", "AO", "visa_free").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "KE", "eta").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "CD", "evisa").supportsCurrentStatus).toBe(true);
    expect(getVisaRelationshipEvidence("BE", "TD", "visa_required").supportsCurrentStatus).toBe(false);
    expect(getVisaRelationshipEvidence("BI", "CD", "visa_free").policies).toHaveLength(0);
  });

  it("keeps all 98 nationalities and expands the 96 represented passport issuers", () => {
    expect(ANGOLA_TOURIST_VISA_EXEMPT_CODES).toHaveLength(98);
    const angolaPairs = evidenceRelationshipPairs(snapshot.manifest)
      .filter(({ destination, status }) => destination.code === "AO" && status === "visa_free");
    expect(angolaPairs).toHaveLength(96);
    expect(snapshot.manifest.passports.some(({ code }) => code === "CK" || code === "NU")).toBe(false);
  });

  it("contains only direct HTTPS official-source URLs", () => {
    const officialHosts = new Set([
      "governo.gov.ao",
      "www.president.go.ke",
      "immigration.go.ke",
      "evisa.gouv.cd",
      "eur-lex.europa.eu",
    ]);
    for (const source of OFFICIAL_VISA_SOURCES) {
      const url = new URL(source.url);
      expect(url.protocol, source.id).toBe("https:");
      expect(officialHosts.has(url.hostname), source.id).toBe(true);
      expect(source.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
