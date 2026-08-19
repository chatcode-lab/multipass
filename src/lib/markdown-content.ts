import { formatRegion } from "./geography";
import { absoluteUrl, escapeMarkdown } from "./markdown";
import { STATUS_META } from "./passport";
import { REGIONS, type ComparisonResult, type PassportAccess, type PassportSummary, type SnapshotManifest } from "./types";

function checkedDate(manifest: SnapshotManifest): string {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(manifest.checkedAt),
  );
}

export function rankingMarkdown(
  manifest: SnapshotManifest,
  title: string,
  description: string,
  passports: PassportSummary[],
  scoped = false,
): string {
  const rows = passports.map((passport, index) => scoped
    ? `| ${index + 1} | [${escapeMarkdown(passport.name)}](${absoluteUrl(`/passport/${passport.slug}`)}) | ${passport.rank} | ${passport.mobilityScore} | ${formatRegion(passport.region)} |`
    : `| ${passport.rank} | [${escapeMarkdown(passport.name)}](${absoluteUrl(`/passport/${passport.slug}`)}) | ${passport.mobilityScore} | ${formatRegion(passport.region)} |`,
  );
  return `# ${title}

${description}

Data checked ${checkedDate(manifest)}. The mobility score counts destinations available visa-free, with a visa on arrival, or with an ETA.

${scoped
    ? "| Group rank | Passport | Global rank | Mobility score | Region |\n| ---: | --- | ---: | ---: | --- |"
    : "| Rank | Passport | Mobility score | Region |\n| ---: | --- | ---: | --- |"}
${rows.join("\n")}

## Useful links

- [Compare passports](${absoluteUrl("/compare")})
- [All destinations](${absoluteUrl("/destinations")})
- [Methodology](${absoluteUrl("/methodology")})`;
}

export function destinationsMarkdown(manifest: SnapshotManifest): string {
  const groups = REGIONS.map((region) => {
    const rows = manifest.destinations
      .filter((destination) => destination.region === region)
      .map((destination) => `- ${escapeMarkdown(destination.name)} (${destination.code})`);
    return `## ${formatRegion(region)}\n\n${rows.join("\n")}`;
  });
  return `# Passport access destination directory

All ${manifest.destinations.length} countries and territories tracked by Multipass Rank, grouped by region. This is the destination catalog used by passport access pages and comparison tables; it is different from the passport issuer list.

Data checked ${checkedDate(manifest)}.

${groups.join("\n\n")}

[View the passport ranking](${absoluteUrl("/")})`;
}

export function passportMarkdown(
  manifest: SnapshotManifest,
  passport: PassportSummary,
  detail: PassportAccess,
): string {
  const regionalPassports = manifest.passports.filter((entry) => entry.region === passport.region);
  const regionalRank = regionalPassports.findIndex((entry) => entry.code === passport.code) + 1;
  const statusCounts = Object.values(detail.statuses).reduce<Record<string, number>>((counts, status) => {
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const groups = REGIONS.map((region) => {
    const rows = manifest.destinations
      .filter((destination) => destination.region === region)
      .map((destination) => {
        const status = detail.statuses[destination.code] ?? "unknown";
        return `| ${escapeMarkdown(destination.name)} | ${destination.code} | ${STATUS_META[status].label} |`;
      });
    return `## ${formatRegion(region)}\n\n| Destination | Code | Access |\n| --- | --- | --- |\n${rows.join("\n")}`;
  });
  return `# ${passport.name} passport rank and visa access

The ${passport.name} passport ranks **#${passport.rank} globally** and **#${regionalRank} among ${regionalPassports.length} ${formatRegion(passport.region)} passports**. Its mobility score is **${passport.mobilityScore}**.

Current profile: ${statusCounts.visa_free ?? 0} visa-free, ${statusCounts.visa_on_arrival ?? 0} visa on arrival, ${statusCounts.eta ?? 0} ETA, ${statusCounts.evisa ?? 0} eVisa, and ${statusCounts.visa_required ?? 0} visa-required destinations.

Data checked ${checkedDate(manifest)}. Entry rules can change; verify official requirements before travel.

[Compare the ${passport.name} passport](${absoluteUrl(`/compare?set=${passport.code}`)})

${groups.join("\n\n")}`;
}

export function comparisonMarkdown(result: ComparisonResult, title = "Passport comparison"): string {
  const scenarioSummary = result.scenarios.map((scenario) =>
    `- **${escapeMarkdown(scenario.name)}:** rank equivalent #${scenario.rankEquivalent}, mobility score ${scenario.mobilityScore}`,
  );
  const sections = REGIONS.map((region) => {
    const rows = result.rows.filter((row) => row.destination.region === region).map((row) => {
      const cells = row.cells.map((cell) => {
        const via = cell.via.length ? ` via ${cell.via.join(" / ")}` : "";
        return escapeMarkdown(`${STATUS_META[cell.status].label}${via}`);
      });
      return `| ${escapeMarkdown(row.destination.name)} | ${cells.join(" | ")} |`;
    });
    const headers = result.scenarios.map((scenario) => escapeMarkdown(scenario.name));
    return `## ${formatRegion(region)}\n\n| Destination | ${headers.join(" | ")} |\n| --- | ${headers.map(() => "---").join(" | ")} |\n${rows.join("\n")}`;
  });
  return `# ${title}

${scenarioSummary.join("\n")}

Data checked ${new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(result.checkedAt))}.

${sections.join("\n\n")}

[Build another passport comparison](${absoluteUrl("/compare")})`;
}
