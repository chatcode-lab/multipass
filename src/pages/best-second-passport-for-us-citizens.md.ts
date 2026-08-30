import type { APIRoute } from "astro";
import { CITIZENSHIP_POLICY_BY_CODE, CITIZENSHIP_POLICY_STATUS_META } from "@/data/citizenship-policies";
import { rankSecondPassportCandidates } from "@/lib/combination-insights";
import { getDataContext, getPassportAccessBatch } from "@/lib/data";
import { comparisonHref, rankHref } from "@/lib/geography";
import { absoluteUrl, escapeMarkdown, markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = async ({ locals }) => {
  const { manifest } = await getDataContext(locals);
  const details = await getPassportAccessBatch(locals, manifest.passports.map((passport) => passport.code), manifest.version);
  const candidates = rankSecondPassportCandidates("US", manifest, details).slice(0, 10);
  const passportByCode = new Map(manifest.passports.map((passport) => [passport.code, passport]));
  const destinationByCode = new Map(manifest.destinations.map((destination) => [destination.code, destination]));
  const checkedDate = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(manifest.checkedAt));
  const rows = candidates.map((candidate, index) => {
    const passport = passportByCode.get(candidate.code)!;
    const policy = CITIZENSHIP_POLICY_BY_CODE.get(candidate.code);
    return `| ${index + 1} | [${escapeMarkdown(passport.name)}](${absoluteUrl(`/passport/${passport.slug}`)}) | +${candidate.marginalEasyDestinations} | ${candidate.combinedAccessibleDestinations} | ${policy ? CITIZENSHIP_POLICY_STATUS_META[policy.status].shortLabel : "Not reviewed"} |`;
  }).join("\n");
  const gains = candidates.map((candidate) => {
    const passport = passportByCode.get(candidate.code)!;
    const destinations = candidate.gainedDestinationCodes.map((code) => destinationByCode.get(code)?.name ?? code).join(" · ");
    return `### ${escapeMarkdown(passport.name)}

New easy-access destinations: ${destinations || "None"}.

- [View combined rank](${absoluteUrl(rankHref([["US", candidate.code]]))})
- [Compare the passports](${absoluteUrl(comparisonHref([["US"], [candidate.code]]))})`;
  }).join("\n\n");

  return markdownResponse(`# Best second passport for US citizens by travel access

Every other passport was tested with the United States passport. The result optimizes only short-visit access; it does not measure acquisition eligibility, cost, residence, tax, military obligations, or whether the citizenships can legally be retained together.

Data checked ${checkedDate}. Easy access means citizenship, visa-free entry, ETA, or visa on arrival.

| Rank | Second passport | Marginal gain | Combined access | Multiple-citizenship policy |
| ---: | --- | ---: | ---: | --- |
${rows}

## Destination gains

${gains}

## Important legal distinction

This is not a general answer to “the best dual citizenship for US citizens.” It optimizes short-visit access only.

- [Review citizenship by descent and naturalisation routes](${absoluteUrl("/citizenship-by-descent")})
- [Review multiple-citizenship compatibility](${absoluteUrl("/dual-citizenship-countries")})
- [See the unrestricted best passport pair](${absoluteUrl("/best-passport-combination")})
- [Read the scoring method](${absoluteUrl("/methodology")})`, "/best-second-passport-for-us-citizens");
};
