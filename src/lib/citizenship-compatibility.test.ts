import { describe, expect, it } from "vitest";
import {
  citizenshipCombinationNotices,
  citizenshipCombinationNoticesMarkdown,
  citizenshipPolicyFor,
} from "./citizenship-compatibility";

describe("citizenship compatibility", () => {
  it("does not warn for single passports or reviewed generally permissive combinations", () => {
    expect(citizenshipCombinationNotices([["IN"]])).toEqual([]);
    expect(citizenshipCombinationNotices([["US", "PT"]])).toEqual([]);
  });

  it("adds non-blocking country-specific notices for restricted and conditional policies", () => {
    const notices = citizenshipCombinationNotices([["IN", "PT"], ["JP", "US"]]);

    expect(notices).toHaveLength(2);
    expect(notices[0]).toMatchObject({ setIndex: 0, severity: "warning", policy: { code: "IN" } });
    expect(notices[1]).toMatchObject({ setIndex: 1, severity: "caution", policy: { code: "JP" } });
  });

  it("keeps reviewed sources and Markdown available to agents", () => {
    expect(citizenshipPolicyFor("cn")?.sources[0]?.url).toMatch(/^https:\/\//);
    const markdown = citizenshipCombinationNoticesMarkdown([["CN", "US"]]);
    expect(markdown).toContain("Citizenship compatibility notes");
    expect(markdown).toContain("do not block the mobility calculation");
    expect(markdown).toContain("Official source");
  });
});
