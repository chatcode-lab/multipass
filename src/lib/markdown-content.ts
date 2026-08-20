import { collectionForRegion, comparisonHref, formatRegion, rankHref, relatedPassports, UNTRACKED_DESTINATIONS } from "./geography";
import { absoluteUrl, escapeMarkdown } from "./markdown";
import { denseRankByScore, STATUS_META } from "./passport";
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

export function customRankingMarkdown(manifest: SnapshotManifest, result: ComparisonResult | null): string {
  const scenarios = result?.scenarios ?? [];
  const combinedScenarios = scenarios.filter((scenario) => scenario.codes.length > 1);
  const customRanks = denseRankByScore([
    ...manifest.passports.map((passport) => passport.mobilityScore),
    ...combinedScenarios.map((scenario) => scenario.mobilityScore),
  ]);
  const featuredSingletons = new Map<string, number[]>();
  scenarios.forEach((scenario, index) => {
    if (scenario.codes.length !== 1) return;
    const code = scenario.codes[0];
    featuredSingletons.set(code, [...(featuredSingletons.get(code) ?? []), index + 1]);
  });
  const rows = [
    ...manifest.passports.map((passport) => ({
      rank: customRanks.get(passport.mobilityScore) ?? passport.rank,
      score: passport.mobilityScore,
      name: passport.name,
      entry: `[${escapeMarkdown(passport.name)}](${absoluteUrl(`/passport/${passport.slug}`)})`,
      type: featuredSingletons.has(passport.code)
        ? `Selected ${featuredSingletons.get(passport.code)!.map((index) => `set ${index}`).join(", ")}`
        : "Passport",
    })),
    ...scenarios.flatMap((scenario, index) => scenario.codes.length > 1 ? [{
      rank: customRanks.get(scenario.mobilityScore) ?? scenario.rankEquivalent,
      score: scenario.mobilityScore,
      name: scenario.name,
      entry: `**${escapeMarkdown(scenario.name)}** (${scenario.codes.join(" + ")})`,
      type: `Combined set ${index + 1}`,
    }] : []),
  ].sort((first, second) => first.rank - second.rank || second.score - first.score || first.name.localeCompare(second.name));
  const scenarioSummary = scenarios.map((scenario, index) =>
    `- **Set ${index + 1}: ${escapeMarkdown(scenario.name)}** — custom rank #${customRanks.get(scenario.mobilityScore) ?? scenario.rankEquivalent}, mobility score ${scenario.mobilityScore}`,
  ).join("\n");
  const sets = scenarios.map((scenario) => scenario.codes);
  return `# ${scenarios.length ? "Custom passport and combination ranking" : "Combined passport ranking"}

${scenarios.length
    ? "Selected passports and combined passport sets are placed alongside the global single-passport ranking by mobility score. Ranks are recalculated within this custom list, ties share a position, and combined positions are not official passport ranks."
    : "Create a custom ranking that places one or more individual or combined passport sets alongside the global passport ranking."}

Data checked ${checkedDate(manifest)}.

${scenarioSummary ? `## Selected sets\n\n${scenarioSummary}\n\n` : ""}| Rank | Passport or set | Mobility score | Type |
| ---: | --- | ---: | --- |
${rows.map((row) => `| ${row.rank} | ${row.entry} | ${row.score} | ${row.type} |`).join("\n")}

## Useful links

${sets.length ? `- [Compare these sets destination by destination](${absoluteUrl(comparisonHref(sets))})\n` : ""}- [Build a custom ranking](${absoluteUrl("/rank")})
- [Global passport ranking](${absoluteUrl("/")})
- [Methodology](${absoluteUrl("/methodology")})`;
}

export function destinationsMarkdown(manifest: SnapshotManifest): string {
  const groups = REGIONS.map((region) => {
    const rows = manifest.destinations
      .filter((destination) => destination.region === region)
      .map((destination) => `- ${escapeMarkdown(destination.name)} (${destination.code})`);
    return `## ${formatRegion(region)}\n\n${rows.join("\n")}`;
  });
  const untracked = UNTRACKED_DESTINATIONS.map((destination) =>
    `- ${escapeMarkdown(destination.name)} (${destination.code})`,
  ).join("\n");
  return `# Passport access destination directory

All ${manifest.destinations.length} countries and territories tracked by MultiPass Rank, grouped by region. This is the destination catalog used by passport access pages and comparison tables; it is different from the passport issuer list.

Data checked ${checkedDate(manifest)}.

${groups.join("\n\n")}

## Not tracked separately

The following concise list covers recognized areas absent from the upstream destination model. They do not affect scores or comparisons; remote uninhabited areas are intentionally omitted.

${untracked}

Reference registry: [United Nations M49 country or area codes](https://unstats.un.org/unsd/methodology/m49/).

[View the passport ranking](${absoluteUrl("/")})`;
}

export function passportMarkdown(
  manifest: SnapshotManifest,
  passport: PassportSummary,
  detail: PassportAccess,
): string {
  const regionalPassports = manifest.passports.filter((entry) => entry.region === passport.region);
  const regionalRank = regionalPassports.findIndex((entry) => entry.code === passport.code) + 1;
  const regionCollection = collectionForRegion(passport.region);
  const comparisonLinks = relatedPassports(passport, manifest.passports).map((other) =>
    `- [Compare ${passport.name} and ${other.name}](${absoluteUrl(comparisonHref([[passport.code], [other.code]]))})`,
  );
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
[Place the ${passport.name} passport in the global ranking](${absoluteUrl(`/rank?set=${passport.code}`)})

## Related rankings and comparisons

${regionCollection ? `- [See the ${regionCollection.heading}](${absoluteUrl(`/${regionCollection.slug}`)})\n` : ""}${comparisonLinks.join("\n")}

${groups.join("\n\n")}`;
}

export function comparisonMarkdown(result: ComparisonResult, title = "Passport comparison"): string {
  const scenarioSummary = result.scenarios.map((scenario) =>
    `- **${escapeMarkdown(scenario.name)}:** rank equivalent #${scenario.rankEquivalent}, mobility score ${scenario.mobilityScore}`,
  );
  const sections = REGIONS.map((region) => {
    const rows = result.rows.filter((row) => row.destination.region === region).map((row) => {
      const cells = row.cells.map((cell, index) => {
        const scenario = result.scenarios[index];
        const attribution = scenario && scenario.codes.length > 1 && cell.via.length < scenario.codes.length
          ? ` ${cell.via.join("/")}`
          : "";
        return escapeMarkdown(`${STATUS_META[cell.status].label}${attribution}`);
      });
      return `| ${escapeMarkdown(row.destination.name)} | ${cells.join(" | ")} |`;
    });
    const headers = result.scenarios.map((scenario) => escapeMarkdown(scenario.name));
    return `## ${formatRegion(region)}\n\n| Destination | ${headers.join(" | ")} |\n| --- | ${headers.map(() => "---").join(" | ")} |\n${rows.join("\n")}`;
  });
  return `# ${title}

${scenarioSummary.join("\n")}

Data checked ${new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(result.checkedAt))}.

## Access legend

- **Home:** right of entry as a citizen.
- **Visa-free:** no visa required before travel.
- **ETA:** advance electronic permission for visa-exempt travel.
- **VOA:** visa available at the border or airport.
- **eVisa:** a visa applied for and issued electronically before travel.
- **Visa:** a traditional visa is required before travel.

[Learn how an eVisa differs from an ETA](${absoluteUrl("/evisa-vs-eta")}).

${sections.join("\n\n")}

[Place these options in the global ranking](${absoluteUrl(rankHref(result.scenarios.map((scenario) => scenario.codes)))})
[Build another passport comparison](${absoluteUrl("/compare")})`;
}
