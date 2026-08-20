import { comparisonHref, rankHref } from "./geography";
import { absoluteUrl, escapeMarkdown } from "./markdown";
import type { CombinationInsights, SnapshotManifest } from "./types";

function namesFor(codes: string[], manifest: SnapshotManifest): string[] {
  const names = new Map(manifest.passports.map((passport) => [passport.code, passport.name]));
  return codes.map((code) => names.get(code) ?? code);
}

function destinationNamesFor(codes: string[], manifest: SnapshotManifest): string[] {
  const names = new Map(manifest.destinations.map((destination) => [destination.code, destination.name]));
  return codes.map((code) => names.get(code) ?? code);
}

export function bestPassportCombinationMarkdown(
  manifest: SnapshotManifest,
  insights: CombinationInsights,
): string {
  const pair = insights.bestPairs[0];
  const triple = insights.bestTriples[0];
  const pairNames = namesFor(pair.codes, manifest);
  const tripleNames = namesFor(triple.codes, manifest);
  const pairMissing = destinationNamesFor(pair.uncoveredDestinationCodes, manifest).map(escapeMarkdown).join(", ");
  const tripleMissing = destinationNamesFor(triple.uncoveredDestinationCodes, manifest).map(escapeMarkdown).join(", ");
  const checked = insights.checkedAt.slice(0, 10);
  const pairStanding = insights.bestPairTieCount === 1
    ? "the unique highest-coverage pair"
    : `one of ${insights.bestPairTieCount} highest-coverage pairs`;
  const tripleStanding = insights.bestTripleTieCount === 1
    ? "the unique highest-coverage triple"
    : `one of ${insights.bestTripleTieCount} highest-coverage triples`;

  return `# Best passport combination in 2026: top two- and three-passport sets

Using MultiPass Rank's ${checked} snapshot, **${pairNames.join(" + ")}** is ${pairStanding} and **${tripleNames.join(" + ")}** is ${tripleStanding} among all ${manifest.passports.length} passport issuers.

“Coverage” here means citizenship, visa-free, ETA, or visa-on-arrival access. It does not include eVisas or traditional visas and says nothing about whether the citizenships can legally or realistically be acquired together.

## Best two-passport combination

**${pairNames.join(" + ")}** reaches ${pair.accessibleDestinations} of ${insights.destinationCount} tracked destinations under the easy-access rule. Its displayed combined mobility score is ${pair.mobilityScore}; MultiPass Rank subtracts one home destination so a single passport's score remains comparable.

- [Place ${pairNames.join(" + ")} in the global ranking](${absoluteUrl(rankHref([pair.codes]))})
- [Compare the two passports destination by destination](${absoluteUrl(comparisonHref(pair.codes.map((code) => [code])))})
- [Inspect their combined access table](${absoluteUrl(comparisonHref([pair.codes]))})

Destinations outside the easy-access set: ${pairMissing}.

## Best three-passport combination

Adding ${tripleNames.at(-1)} creates ${insights.bestTripleTieCount === 1 ? "the unique top triple" : "a tied top triple"}: **${tripleNames.join(" + ")}**. It reaches ${triple.accessibleDestinations} destinations, with a combined mobility score of ${triple.mobilityScore}.

- [Place ${tripleNames.join(" + ")} in the global ranking](${absoluteUrl(rankHref([triple.codes]))})
- [Compare all three passports](${absoluteUrl(comparisonHref(triple.codes.map((code) => [code])))})
- [Inspect their combined access table](${absoluteUrl(comparisonHref([triple.codes]))})

Destinations outside the easy-access set: ${tripleMissing}.

## Why this differs from “best citizenship” answers

This experiment optimizes one narrow variable: short-visit entry without prior visa approval. It does not score residence or work rights, taxation, civil liberties, consular protection, acquisition paths, dual-nationality law, or the administrative cost of holding several citizenships.

IMI Daily's Ireland–Chile answer uses a much broader seven-pillar citizenship framework. The PassportPorn discussion likewise mixes visitor access with regional rights and realistic ownership. Those are useful questions, but they are different from this exhaustive mobility calculation.

## Method

Every possible pair (${(manifest.passports.length * (manifest.passports.length - 1)) / 2}) and triple (${(manifest.passports.length * (manifest.passports.length - 1) * (manifest.passports.length - 2)) / 6}) was evaluated against all ${insights.destinationCount} destinations. For each destination, the easiest status available from the passports in the set was retained. Ties were counted rather than broken editorially.

[See the exact minimum set that covers all tracked destinations](${absoluteUrl("/how-many-passports-to-cover-the-world")}) · [Read the scoring methodology](${absoluteUrl("/methodology")})

## References

- [Henley Passport Index scoring explanation](https://www.henleyglobal.com/passport-index/about)
- [IMI Daily: What is the World's Best Citizenship Combo?](https://www.imidaily.com/analysis/what-is-the-worlds-best-citizenship-combo/)
- [PassportPorn community discussion: What's the best combo?](https://www.reddit.com/r/PassportPorn/comments/1qw2oty/whats_the_best_combo/)`;
}

export function worldCoverageMarkdown(
  manifest: SnapshotManifest,
  insights: CombinationInsights,
): string {
  const names = new Map(manifest.passports.map((passport) => [passport.code, passport.name]));
  const cover = insights.minimumCover;
  const checked = insights.checkedAt.slice(0, 10);
  const rows = cover.marginalGains.map((entry, index) =>
    `| ${index + 1} | ${escapeMarkdown(names.get(entry.code) ?? entry.code)} (${entry.code}) | +${entry.addedDestinations} | ${entry.cumulativeDestinations} |`,
  ).join("\n");
  const required = cover.requiredCodes.map((code) => `${names.get(code) ?? code} (${code})`).join(", ");
  const fullNames = cover.codes.map((code) => names.get(code) ?? code);

  return `# How many passports cover every tracked destination?

**Ten passports** are necessary and sufficient to give easy access to all ${insights.destinationCount} destinations in MultiPass Rank's ${checked} snapshot. One exact minimum set is **${fullNames.join(" + ")}**.

[Place the complete ten-passport set in the global ranking](${absoluteUrl(rankHref([cover.codes]))}) · [Open its destination access table](${absoluteUrl(comparisonHref([cover.codes]))})

## One minimum set, ordered by marginal coverage

| Step | Passport | New destinations | Cumulative |
| ---: | --- | ---: | ---: |
${rows}

The order above is only an explanatory ordering: at each step, the passport that adds the most still-uncovered destinations within this minimum set appears next.

## Why fewer than ten cannot work

Three passports are forced: ${required}. In this snapshot, each of those destinations has no easy-access route from any other tracked passport, although travellers may still have an eVisa or traditional-visa route.

After adding those forced passports, the solver removes passport coverage sets that are strict subsets of another candidate and runs an exact branch-and-bound search. It proves that no six additional passports cover the remainder; seven do. Three forced passports plus seven additional passports gives the exact minimum of ten.

## What “cover every destination” means

Coverage includes citizenship, visa-free access, ETA, and visa on arrival. eVisa and traditional visa access are excluded because both require visa approval before departure. The displayed score for a complete set is ${insights.destinationCount - 1}, since MultiPass Rank subtracts one home destination for score compatibility.

This is a mathematical set-cover experiment, not a citizenship plan. It ignores acquisition, dual-nationality restrictions, tax and military obligations, residence rights, cost, ethics, and practicality. The minimum solution is not necessarily unique; the page reports one reproducible exact solution.

[See the best practical-size pair and triple](${absoluteUrl("/best-passport-combination")}) · [Read the scoring methodology](${absoluteUrl("/methodology")})`;
}
