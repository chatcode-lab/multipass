export const REGIONS = [
  "AFRICA",
  "AMERICAS",
  "CARIBBEAN",
  "ASIA",
  "EUROPE",
  "MIDDLE EAST",
  "OCEANIA",
] as const;

export type Region = (typeof REGIONS)[number];

export const ACCESS_STATUSES = [
  "citizenship",
  "visa_free",
  "eta",
  "visa_on_arrival",
  "evisa",
  "visa_required",
  "entry_restricted",
  "unknown",
] as const;

export type AccessStatus = (typeof ACCESS_STATUSES)[number];

export interface Destination {
  code: string;
  name: string;
  region: Region;
}

export interface PassportSummary {
  code: string;
  name: string;
  slug: string;
  region: Region;
  mobilityScore: number;
  rank: number;
}

export interface PassportAccess {
  code: string;
  name: string;
  statuses: Record<string, AccessStatus>;
  mobilityScore: number;
}

export interface SnapshotManifest {
  schemaVersion: 1;
  version: string;
  checkedAt: string;
  publishedAt: string;
  destinations: Destination[];
  passports: PassportSummary[];
}

export interface DataSnapshot {
  manifest: SnapshotManifest;
  passports: Record<string, PassportAccess>;
}

export interface PublishedDataSnapshot extends DataSnapshot {
  combinationInsights: CombinationInsights;
}

export interface PassportSet {
  codes: string[];
}

export interface StatusCount {
  status: AccessStatus;
  count: number;
}

export interface ScenarioSummary {
  id: string;
  codes: string[];
  name: string;
  mobilityScore: number;
  rankEquivalent: number;
  statusCounts: Record<AccessStatus, number>;
}

export interface ComparisonCell {
  status: AccessStatus;
  via: string[];
}

export interface ComparisonRow {
  destination: Destination;
  cells: ComparisonCell[];
  isEqual: boolean;
}

export interface ComparisonResult {
  scenarios: ScenarioSummary[];
  rows: ComparisonRow[];
  checkedAt: string;
}

export interface ImprovementStage {
  id: string;
  addedCodes: string[];
  cumulativeCodes: string[];
  name: string;
  cumulativeAccessibleDestinations: number;
  mobilityScore: number;
  rankEquivalent: number;
  marginalEasyDestinations: number;
  gainedDestinationCodes: string[];
}

export interface ImprovementCell extends ComparisonCell {
  improved: boolean;
  scoreGain: boolean;
}

export interface ImprovementRow {
  destination: Destination;
  cells: ImprovementCell[];
  hasImprovement: boolean;
  hasScoreGain: boolean;
}

export interface ImprovementResult {
  stages: ImprovementStage[];
  rows: ImprovementRow[];
  checkedAt: string;
}

export interface CombinationCoverage {
  codes: string[];
  accessibleDestinations: number;
  mobilityScore: number;
  uncoveredDestinationCodes: string[];
}

export interface CombinationInsights {
  schemaVersion: 1;
  snapshotVersion: string;
  checkedAt: string;
  destinationCount: number;
  bestPairs: CombinationCoverage[];
  bestPairTieCount: number;
  bestTriples: CombinationCoverage[];
  bestTripleTieCount: number;
  minimumCover: {
    size: number;
    codes: string[];
    requiredCodes: string[];
    accessibleDestinations: number;
    marginalGains: Array<{ code: string; addedDestinations: number; cumulativeDestinations: number }>;
  };
}

export interface SourceCountry {
  code: string;
  country: string;
  has_data: boolean;
  region: string;
}

export interface SourceDestination {
  code: string;
  name: string;
}

export interface SourcePassportDetail {
  code: string;
  country: string;
  visa_free_access: SourceDestination[];
  electronic_travel_authorisation: SourceDestination[];
  visa_on_arrival: SourceDestination[];
  visa_online: SourceDestination[];
  visa_required: SourceDestination[];
}
