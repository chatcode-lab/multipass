import artifact from "../data/country-indicators.json";
import type { IndicatorCandidate } from "./country-indicator-schema";

export const INDICATOR_DEFINITIONS = {
  hdi: { label: "Human Development Index", unit: "0–1", precision: 3, description: "UNDP's development measure; not a passport or relocation score." },
  life_expectancy: { label: "Life expectancy at birth", unit: "years", precision: 1, description: "Population-level period estimate; not an individual prediction or healthcare-access rating." },
} as const;
export const INDICATOR_REVIEW = artifact.review;
export const INDICATOR_SOURCES = artifact.sources as IndicatorCandidate["sources"];
export const INDICATOR_OBSERVATIONS = artifact.observations as IndicatorCandidate["observations"];
export const INDICATOR_SCOPE = "These describe the publisher's statistical geography, not benefits acquired by holding its passport. Values from different years are not a like-for-like ranking. No combined quality-of-life score is calculated.";

export function countryIndicators(code: string) {
  return INDICATOR_OBSERVATIONS.filter((row) => row.code === code).map((row) => ({
    ...row, definition: INDICATOR_DEFINITIONS[row.metric],
    source: INDICATOR_SOURCES.find((source) => source.id === row.sourceId)!,
  }));
}

export function indicatorDisplay(row: ReturnType<typeof countryIndicators>[number]): string {
  return row.availability === "available" && row.value !== null ? row.value.toFixed(row.definition.precision) : "Not reported";
}

export function countryIndicatorsMarkdown(code: string): string {
  const rows = countryIndicators(code);
  if (!rows.length) return "";
  const sections = rows.map((row) => {
    const period = row.period ? ` ${row.definition.unit} · observation year ${row.period}` : "";
    return `### ${row.definition.label}\n\n${indicatorDisplay(row)}${period}. ${row.definition.description}\n\nGeography: ${row.providerEntityName} (${row.providerEntityCode}); ${row.geographicScope}. ${row.unavailableReason ?? ""}\n\n[${row.source.publisher}: ${row.source.title}](${row.source.url}) — ${row.source.edition}. [Data](${row.source.dataUrl}). [${row.source.licence}](${row.source.licenceUrl}). ${row.source.attribution}`;
  });
  return `## Living in this country: selected indicators\n\n${INDICATOR_SCOPE}\n\n${sections.join("\n\n")}\n\nSources reviewed ${INDICATOR_REVIEW.reviewedAt}. Review due ${INDICATOR_REVIEW.recheckBy}.\n\n`;
}
