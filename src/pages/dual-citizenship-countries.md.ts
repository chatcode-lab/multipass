import type { APIRoute } from "astro";
import { CITIZENSHIP_POLICIES, CITIZENSHIP_POLICY_STATUS_META } from "@/data/citizenship-policies";
import { absoluteUrl, escapeMarkdown, markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = () => {
  const groups = (["generally_restricted", "conditional", "generally_allowed"] as const).map((status) => {
    const policies = CITIZENSHIP_POLICIES.filter((policy) => policy.status === status).map((policy) => `### ${escapeMarkdown(policy.country)}

**${escapeMarkdown(policy.headline)}**

${escapeMarkdown(policy.summary)}

${policy.practicalNotes.map((note) => `- ${escapeMarkdown(note)}`).join("\n")}

Official sources:
${policy.sources.map((source) => `- [${escapeMarkdown(source.publisher)} — ${escapeMarkdown(source.label)}](${source.url})`).join("\n")}

Reviewed ${policy.reviewedAt}.`).join("\n\n");
    return `## ${CITIZENSHIP_POLICY_STATUS_META[status].label}\n\n${policies}`;
  }).join("\n\n");

  return markdownResponse(`# Dual citizenship countries and passport compatibility

A combined passport score is a hypothetical mobility calculation. Citizenship retention depends on every country's law and may change with birth, descent, naturalisation, age, residence, marriage or an exception.

This first release contains ${CITIZENSHIP_POLICIES.length} official-source country reviews. Unreviewed countries are not assumed to permit or prohibit multiple citizenship.

${groups}

## Use with the calculator

MultiPass Rank displays non-blocking cautions for reviewed conditional or generally restricted countries in a combined set. The calculation always remains available.

- [Build a passport combination](${absoluteUrl("/compare")})
- [Read how many passports one person can have](${absoluteUrl("/how-many-passports-can-you-have")})
- [Read the dual-passport mobility guide](${absoluteUrl("/dual-passport")})`, "/dual-citizenship-countries");
};
