import type { APIRoute } from "astro";
import { CITIZENSHIP_POLICY_BY_CODE, CITIZENSHIP_POLICY_STATUS_META } from "@/data/citizenship-policies";
import { CITIZENSHIP_ACQUISITION_ROUTES_BY_COUNTRY } from "@/data/citizenship-acquisition";
import { rankSecondPassportCandidates } from "@/lib/combination-insights";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { comparisonHref, improveHref, PASSPORT_COLLECTIONS, rankHref } from "@/lib/geography";
import { absoluteUrl, escapeMarkdown, markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = async ({ locals }) => {
  const { manifest } = await getDataContext(locals);
  const details = await getPassportAccessBatch(locals, manifest.passports.map((passport) => passport.code), manifest.version);
  const candidates = rankSecondPassportCandidates("US", manifest, details).slice(0, 10);
  const passportByCode = new Map(manifest.passports.map((passport) => [passport.code, passport]));
  const destinationByCode = new Map(manifest.destinations.map((destination) => [destination.code, destination]));
  const euCodes = new Set(PASSPORT_COLLECTIONS.find((collection) => collection.slug === "european-union")?.codes ?? []);
  const euCandidates = rankSecondPassportCandidates("US", manifest, details)
    .filter((candidate) => euCodes.has(candidate.code) && CITIZENSHIP_ACQUISITION_ROUTES_BY_COUNTRY.has(candidate.code))
    .slice(0, 6);
  const checkedDate = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(manifest.checkedAt));
  const rows = candidates.map((candidate, index) => {
    const passport = passportByCode.get(candidate.code)!;
    const policy = CITIZENSHIP_POLICY_BY_CODE.get(candidate.code);
    const routes = CITIZENSHIP_ACQUISITION_ROUTES_BY_COUNTRY.get(candidate.code) ?? [];
    const routeLabel = routes.some((route) => route.type === "exceptional") ? "Exceptional nomination only" : routes.length ? "Reviewed route available" : policy ? CITIZENSHIP_POLICY_STATUS_META[policy.status].shortLabel : "Not reviewed";
    return `| ${index + 1} | [${escapeMarkdown(passport.name)}](${absoluteUrl(`/passport/${passport.slug}`)}) | +${candidate.marginalEasyDestinations} | ${candidate.combinedAccessibleDestinations} | ${routeLabel} |`;
  }).join("\n");
  const gains = candidates.map((candidate) => {
    const passport = passportByCode.get(candidate.code)!;
    const destinations = candidate.gainedDestinationCodes.map((code) => destinationByCode.get(code)?.name ?? code).join(" · ");
    return `### ${escapeMarkdown(passport.name)}

New easy-access destinations: ${destinations || "None"}.

- [View combined rank](${absoluteUrl(rankHref([["US", candidate.code]]))})
- [Compare the passports](${absoluteUrl(comparisonHref([["US"], [candidate.code]]))})
- [See the incremental gain](${absoluteUrl(improveHref([["US"], [candidate.code]]))})`;
  }).join("\n\n");
  const euRows = euCandidates.map((candidate) => {
    const passport = passportByCode.get(candidate.code)!;
    const routes = CITIZENSHIP_ACQUISITION_ROUTES_BY_COUNTRY.get(candidate.code)!;
    return `| ${escapeMarkdown(passport.name)} | +${candidate.marginalEasyDestinations} | ${routes.map((route) => `[${escapeMarkdown(route.title)}](${absoluteUrl(`/citizenship-by-descent#${route.id}`)})`).join("; ")} |`;
  }).join("\n");

  return markdownResponse(`# Best second passport for US citizens by travel access

Every other passport was tested with the United States passport. The numerical winner optimizes only short-visit access; it does not establish that the passport is obtainable.

**Important correction:** the United Arab Emirates is the mathematical travel-access winner, but the [official UAE framework](https://u.ae/en/information-and-services/passports-and-traveling/emirati-nationality) describes citizenship only through exceptional government nomination for narrow categories. It is not a conventional second-passport application route for US citizens.

Data checked ${checkedDate}. Easy access means citizenship, visa-free entry, ETA, or visa on arrival.

| Rank | Second passport | Marginal gain | Combined access | Acquisition / compatibility context |
| ---: | --- | ---: | ---: | --- |
${rows}

## EU routes may be strategically more useful

Nationality of an EU member state also brings EU citizenship rights to live, work, and study across the Union. Those rights are not counted by the tourist-access score. The following high-gain EU candidates have at least one official-source acquisition route in the reviewed dataset; personal eligibility is not assumed.

| EU passport | Travel gain with US | Reviewed route |
| --- | ---: | --- |
${euRows}

- [European Commission: EU citizenship rights](https://ec.europa.eu/justice/citizenship/index_en.html)
- [Build an incremental sequence from the US passport](${absoluteUrl("/improve?set=US")})

## Destination gains

${gains}

## Important legal distinction

This is not a general answer to “the best dual citizenship for US citizens.” It optimizes short-visit access only.

- [Review citizenship by descent and naturalisation routes](${absoluteUrl("/citizenship-by-descent")})
- [Review multiple-citizenship compatibility](${absoluteUrl("/dual-citizenship-countries")})
- [See the unrestricted best passport pair](${absoluteUrl("/best-passport-combination")})
- [Read the scoring method](${absoluteUrl("/methodology")})`, "/best-second-passport-for-us-citizens");
};
