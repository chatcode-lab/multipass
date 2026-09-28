import {
  CITIZENSHIP_POLICIES,
  CITIZENSHIP_POLICY_BY_CODE,
  type CitizenshipPolicy,
} from "@/data/citizenship-policies";

export const CITIZENSHIP_ENFORCEMENT_SCOPE = "This guide documents reviewed citizenship rules, not how often authorities detect another nationality or enforce a rule. We do not have comparable enforcement statistics and do not rank countries by enforcement. A lack of reported cases is not evidence that a combination is permitted. Check the rules for acquisition, retention, nationality choice, and any required procedure separately, using the official sources for each country.";

export interface CitizenshipCombinationNotice {
  setIndex: number;
  setCodes: string[];
  policy: CitizenshipPolicy;
  severity: "caution" | "warning";
}

export function citizenshipPolicyFor(code: string): CitizenshipPolicy | undefined {
  return CITIZENSHIP_POLICY_BY_CODE.get(code.toUpperCase());
}

export function citizenshipPolicyAnchor(policy: Pick<CitizenshipPolicy, "country">): string {
  return policy.country.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function citizenshipCombinationNotices(sets: readonly (readonly string[])[]): CitizenshipCombinationNotice[] {
  return sets.flatMap((setCodes, setIndex) => {
    if (setCodes.length < 2) return [];
    return setCodes.flatMap((code) => {
      const policy = citizenshipPolicyFor(code);
      if (!policy || policy.status === "generally_allowed") return [];
      return [{
        setIndex,
        setCodes: [...setCodes],
        policy,
        severity: policy.status === "generally_restricted" ? "warning" as const : "caution" as const,
      }];
    });
  });
}

export function citizenshipCombinationNoticesMarkdown(sets: readonly (readonly string[])[]): string {
  const notices = citizenshipCombinationNotices(sets);
  if (!notices.length) return "";
  return `## Citizenship compatibility notes\n\n${notices.map(({ setIndex, policy }) =>
    `- **Set ${setIndex + 1} — ${policy.country}:** ${policy.headline} ${policy.summary} [Official source](${policy.sources[0]?.url})`,
  ).join("\n")}\n\nThese notices are informational and do not block the mobility calculation. Eligibility and nationality retention depend on personal facts and current law. [Review the citizenship compatibility guide](https://multipassrank.com/dual-citizenship-countries).`;
}

export function reviewedCitizenshipPolicies(): readonly CitizenshipPolicy[] {
  return CITIZENSHIP_POLICIES;
}
