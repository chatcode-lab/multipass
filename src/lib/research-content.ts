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
  const additionalCount = cover.size - cover.requiredCodes.length;

  return `# How many passports cover every tracked destination?

**${cover.size} passports** are necessary and sufficient to give easy access to all ${insights.destinationCount} destinations in MultiPass Rank's ${checked} snapshot. One exact minimum set is **${fullNames.join(" + ")}**.

[Place the complete ${cover.size}-passport set in the global ranking](${absoluteUrl(rankHref([cover.codes]))}) · [Open its destination access table](${absoluteUrl(comparisonHref([cover.codes]))})

## One minimum set, ordered by marginal coverage

| Step | Passport | New destinations | Cumulative |
| ---: | --- | ---: | ---: |
${rows}

The order above is only an explanatory ordering: at each step, the passport that adds the most still-uncovered destinations within this minimum set appears next.

## Why fewer than ${cover.size} cannot work

${cover.requiredCodes.length} passports are forced: ${required}. In this snapshot, each of those destinations has no easy-access route from any other tracked passport, although travellers may still have an eVisa or traditional-visa route.

After adding those forced passports, the solver removes passport coverage sets that are strict subsets of another candidate and runs an exact branch-and-bound search. It proves that no ${additionalCount - 1} additional passports cover the remainder; ${additionalCount} do. The forced passports plus those ${additionalCount} additional passports give the exact minimum of ${cover.size}.

## What “cover every destination” means

Coverage includes citizenship, visa-free access, ETA, and visa on arrival. eVisa and traditional visa access are excluded because both require visa approval before departure. The displayed score for a complete set is ${insights.destinationCount - 1}, since MultiPass Rank subtracts one home destination for score compatibility.

This is a mathematical set-cover experiment, not a citizenship plan. It ignores acquisition, dual-nationality restrictions, tax and military obligations, residence rights, cost, ethics, and practicality. The minimum solution is not necessarily unique; the page reports one reproducible exact solution.

[See the best practical-size pair and triple](${absoluteUrl("/best-passport-combination")}) · [Read the scoring methodology](${absoluteUrl("/methodology")})`;
}

export function howManyPassportsCanYouHaveMarkdown(): string {
  return `# How many passports can one person have?

There is **no universal numerical limit**. Nationality is determined by each country under its own law, so the real limit is whether every country involved allows the person to acquire and retain its nationality at the same time.

We could not find an authoritative global registry or independently verified world record for the most simultaneous citizenships. Online claims of six, seven, or eight should therefore be described as claims—not records.

## Passport books are not citizenships

A citizenship is a legal bond with a country. A passport is a travel document issued as evidence of nationality. Someone can be a citizen without holding a current passport, while one country can issue more than one valid passport booklet to the same citizen in special circumstances. The United Kingdom's official passport guidance says it may issue more than two additional passports case by case.

That makes “How many passports?” ambiguous. This article counts **simultaneous nationalities**, then separately notes whether current passport documents were shown.

## A well-known public example: four

Associated Press reports that Telegram founder Pavel Durov, who was born in Russia, also holds citizenship in France, the United Arab Emirates, and Saint Kitts and Nevis. That makes four publicly reported citizenships. It is a recognizable, attributable example—not evidence of a world record.

## A photographed community case: five in a parent, seven possible for a child

In a photographed PassportPorn post, a parent described the mother as holding United States and Taiwanese passports and the father as holding German, Swiss, French, Mexican, and Argentine nationalities. The post says their daughter then held United States, German, French, and Swiss nationalities and was eligible for additional family routes.

The careful headline is **four then held, seven described as potentially eligible**. The image and family account are useful community documentation, but they do not prove seven simultaneous current passports or provide independent government verification.

A later community thread explicitly asked for photographic proof of six or more citizenships. Its replies contain anecdotes and estimates, not a defensible global statistic. A separate photographed post demonstrates five current passports, but public proof becomes thin before a credible six-plus “record” emerges.

## Can you have three, four, or more citizenships?

Potentially, yes. The United States Department of State explicitly says a person may hold more than two nationalities. But every other country in the combination must be checked separately. A country may allow multiple nationality generally, allow it only when acquired automatically at birth, require permission to retain it, or cause nationality loss after a voluntary naturalisation elsewhere.

The Council of Europe's nationality convention captures the underlying rule: each state determines who its nationals are. There is no single international office that approves a third or fourth citizenship.

## Why very large combinations stay rare

- Several independent routes—birthplace, parents, ancestry, adoption, marriage, residence, restoration, or exceptional grants—must align.
- Each nationality has its own retention, renunciation, registration, and transmission rules.
- Obligations can include using that country's passport at its border, tax compliance, military service, or reduced consular help while inside another country of nationality.
- Passport renewals, names, civil-status records, and document expiry create administrative work even when the citizenship itself continues.

More is not automatically better. MultiPass Rank's exhaustive travel experiment finds that the best pair and triple already cover most tracked destinations, while its purely mathematical all-destination solution requires a large passport set and ignores whether that set could legally or practically be held.

[See the best two- and three-passport combinations](${absoluteUrl("/best-passport-combination")}) · [See the mathematical minimum for all tracked destinations](${absoluteUrl("/how-many-passports-to-cover-the-world")})

## References

- [European Convention on Nationality](https://rm.coe.int/168045c943)
- [U.S. Department of State: Dual Nationality](https://travel.state.gov/en/international-travel/planning/personal-needs/dual-nationality.html)
- [UK Passport Office: Additional passports](https://www.gov.uk/government/publications/additional-passports/additional-passports-accessible)
- [Associated Press profile of Pavel Durov](https://apnews.com/article/7f1fdf61104de4bb7ed846b05e5561a2)
- [PassportPorn: daughter eligible for seven nationalities/passports](https://www.reddit.com/r/PassportPorn/comments/1kw1ob2/our_daughter_is_eligible_for_7/)
- [PassportPorn: request for photographic proof of six or more](https://www.reddit.com/r/PassportPorn/comments/1swt55n/does_anyone_here_have_6_citizenships_with_picture/)
- [PassportPorn: photographed five-passport case](https://www.reddit.com/r/PassportPorn/comments/1vrgqvl/quintuple_citizen_five_passport_club/)

This is a general research review, not citizenship or legal advice. Verify the current law of every country involved before relying on a multiple-nationality claim.`;
}
