import type { OfficialVisaSource, VisaPolicyEvidence } from "@/data/visa-evidence";
import { STATUS_META } from "./passport";
import { absoluteUrl, escapeMarkdown } from "./markdown";
import type { AccessStatus, Destination, PassportSummary, SnapshotManifest } from "./types";
import { destinationSlug, visaRelationshipHref, type VisaRelationshipEvidence } from "./visa-evidence";

function readableDate(value: string): string {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

function policyMarkdown(policy: VisaPolicyEvidence, sources: Map<string, OfficialVisaSource>): string {
  const date = policy.effectiveFrom ?? policy.announcedOn;
  const conditions = policy.conditions?.map((condition) => `  - ${escapeMarkdown(condition)}`).join("\n") ?? "";
  const sourceLines = policy.sourceIds.flatMap((sourceId) => {
    const source = sources.get(sourceId);
    return source ? [`  - [${escapeMarkdown(source.publisher)}: ${escapeMarkdown(source.title)}](${source.url})`] : [];
  }).join("\n");
  return `- **${date ? readableDate(date) : "Current official route"} — ${escapeMarkdown(policy.title)}** (${STATUS_META[policy.status].label})
  ${escapeMarkdown(policy.summary)}
${conditions ? `${conditions}\n` : ""}  Official ${policy.sourceIds.length === 1 ? "source" : "sources"}:
${sourceLines}`;
}

export function visaRelationshipMarkdown(
  manifest: SnapshotManifest,
  passport: PassportSummary,
  destination: Destination,
  status: AccessStatus,
  evidence: VisaRelationshipEvidence,
): string {
  const statusMeta = STATUS_META[status];
  const sources = new Map(evidence.sources.map((source) => [source.id, source]));
  const application = evidence.policies.find((policy) => policy.status === status && policy.application)?.application;
  const timeline = evidence.policies.length
    ? evidence.policies.map((policy) => policyMarkdown(policy, sources)).join("\n\n")
    : "No official-source timeline has been completed for this relationship. The page remains excluded from search indexing until review is complete.";
  return `# ${escapeMarkdown(passport.name)} passport to ${escapeMarkdown(destination.name)}: ${statusMeta.label}

Current access classification: **${statusMeta.label}** — ${statusMeta.description}.

Access data checked ${readableDate(manifest.checkedAt.slice(0, 10))}. Evidence status: **${evidence.supportsCurrentStatus ? "official evidence collected" : "official-source review pending"}**.

This page concerns ordinary short visits unless an official source states otherwise. Border authorities retain the final admission decision.

## Evidence timeline

${timeline}

${application ? `## How to apply

${application.processingTime ?? "Follow the current instructions on the official portal."}

${application.steps.map((step, index) => `${index + 1}. ${escapeMarkdown(step)}`).join("\n")}

[${escapeMarkdown(application.label)}](${application.url})

` : ""}## Useful links

- [HTML evidence page](${absoluteUrl(visaRelationshipHref(passport, destination, status))})
- [${escapeMarkdown(passport.name)} passport access](${absoluteUrl(`/passport/${passport.slug}`)})
- [All passport requirements for ${escapeMarkdown(destination.name)}](${absoluteUrl(`/destination/${destinationSlug(destination)}`)})
- [Dataset license](${absoluteUrl("/data-license")})`;
}

export function destinationVisaMarkdown(
  manifest: SnapshotManifest,
  destination: Destination,
  rows: readonly { passport: PassportSummary; status: AccessStatus }[],
  policies: readonly VisaPolicyEvidence[],
  officialSources: readonly OfficialVisaSource[],
): string {
  const sourceMap = new Map(officialSources.map((source) => [source.id, source]));
  const groups = Object.entries(STATUS_META).map(([status, meta]) => {
    const statusRows = rows.filter((row) => row.status === status);
    if (!statusRows.length) return "";
    return `## ${meta.label} (${statusRows.length})

${statusRows.map(({ passport }) => `- [${escapeMarkdown(passport.name)}](${absoluteUrl(visaRelationshipHref(passport, destination, status as AccessStatus))})`).join("\n")}`;
  }).filter(Boolean).join("\n\n");
  const timeline = policies.length
    ? policies.map((policy) => policyMarkdown(policy, sourceMap)).join("\n\n")
    : "Official-source timeline collection has not started for this destination.";
  return `# ${escapeMarkdown(destination.name)} visa requirements by passport

Current entry categories for ${manifest.passports.length} passport nationalities. Access data checked ${readableDate(manifest.checkedAt.slice(0, 10))}.

Each relationship link exposes its current status, evidence history, and official application route where available.

${groups}

## Official evidence timeline

${timeline}

## Useful links

- [HTML destination page](${absoluteUrl(`/destination/${destinationSlug(destination)}`)})
- [All destinations](${absoluteUrl("/destinations")})
- [Dataset license](${absoluteUrl("/data-license")})`;
}
