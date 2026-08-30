import type { APIRoute } from "astro";
import {
  CITIZENSHIP_ACQUISITION_ROUTES,
  CITIZENSHIP_ROUTE_TYPE_LABELS,
  type CitizenshipAcquisitionRouteType,
} from "@/data/citizenship-acquisition";
import { absoluteUrl, escapeMarkdown, markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = () => {
  const routeTypes: CitizenshipAcquisitionRouteType[] = ["descent", "naturalisation", "marriage", "restoration"];
  const sections = routeTypes.flatMap((type) => {
    const routes = CITIZENSHIP_ACQUISITION_ROUTES.filter((route) => route.type === type);
    if (!routes.length) return [];
    return [`## ${CITIZENSHIP_ROUTE_TYPE_LABELS[type]}

${routes.map((route) => `### ${escapeMarkdown(route.country)} — ${escapeMarkdown(route.title)}

${escapeMarkdown(route.summary)}

${route.requirements.map((requirement) => `- ${escapeMarkdown(requirement)}`).join("\n")}
${route.residenceRequirement ? `\n**Residence:** ${escapeMarkdown(route.residenceRequirement)}\n` : ""}${route.languageRequirement ? `\n**Language:** ${escapeMarkdown(route.languageRequirement)}\n` : ""}${route.transitionNote ? `\n**Current-law note:** ${escapeMarkdown(route.transitionNote)}\n` : ""}
Official sources:
${route.sources.map((source) => `- [${escapeMarkdown(source.publisher)} — ${escapeMarkdown(source.label)}](${source.url})`).join("\n")}

Reviewed ${route.reviewedAt}.`).join("\n\n")}`];
  }).join("\n\n");

  return markdownResponse(`# Citizenship by descent and naturalisation requirements

This official-source dataset currently contains ${CITIZENSHIP_ACQUISITION_ROUTES.length} reviewed routes. A listed route is not a personal eligibility decision: family records, dates, residence, language, conduct, filing rules, and nationality retention still control.

${sections}

## Continue the research

- [Review dual-citizenship compatibility](${absoluteUrl("/dual-citizenship-countries")})
- [Build a passport combination](${absoluteUrl("/compare")})
- [Read the methodology](${absoluteUrl("/methodology")})`, "/citizenship-by-descent");
};

