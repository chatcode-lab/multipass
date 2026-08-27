/**
 * Read-only official-source health monitoring.
 *
 * This utility does not classify passports, submit forms, retain cookies, or
 * mutate evidence. It only fetches public registry URLs and emits JSON to
 * stdout so research can decide whether a source is replayable.
 */
import { createHash } from "node:crypto";

export type ExtractorKind = "html-text" | "json" | "binary";

export interface OfficialPortalSource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  extractor: ExtractorKind;
  /** A short reason why the URL is in scope. It is not evidence itself. */
  purpose: string;
  /** Required public wording that signals the expected service, not a status rule. */
  requiredMarkers?: readonly string[];
  /** Hash of normalized extracted public wording; update only after review. */
  expectedSemanticHash?: string;
  expectedContentHash?: string;
  recordsPath?: string;
  expectedMinimumRecords?: number;
  /** Observe flaky/blocked sources without making the scheduled monitor fail. */
  enforcement: "required" | "observe";
}

export interface SourceHealthResult {
  id: string;
  url: string;
  checkedAt: string;
  ok: boolean;
  status: number | null;
  finalUrl: string | null;
  contentType: string | null;
  contentLength: number | null;
  contentHash: string | null;
  semanticHash: string | null;
  recordCount: number | null;
  extractor: ExtractorKind;
  excerpt: string | null;
  error: string | null;
  markerMatches: Record<string, boolean>;
  healthy: boolean;
}

/**
 * Registry entries are deliberately source-level only. Adding a portal here
 * neither endorses its content nor creates visa evidence.
 */
export const OFFICIAL_PORTAL_REGISTRY: readonly OfficialPortalSource[] = [
  {
    id: "kuwait-moi-arrival-nationalities",
    title: "Kuwait visa-on-arrival nationality dataset",
    url: "https://kuwaitvisa.moi.gov.kw/kuwaitVisa/portal/getVisaOnArrivalCountries",
    publisher: "Kuwait Ministry of Interior",
    extractor: "json",
    purpose: "Monitor the public positive visa-on-arrival nationality schedule and its shape.",
    requiredMarkers: ["visaOnArrival", "OcrCode"],
    recordsPath: "result.data",
    expectedMinimumRecords: 50,
    expectedContentHash: "9ffbda090dd2804cac648d7e7d27a9cbd40b2479d2e4892d3f593e914bd51030",
    enforcement: "required",
  },
  {
    id: "saudi-tourism-country-groups",
    title: "Visit Saudi live nationality groups",
    url: "https://www.visitsaudi.com/bin/api/v1/geo/countries?locale=en",
    publisher: "Saudi Tourism Authority",
    extractor: "json",
    purpose: "Monitor the public nationality-to-route-group schedule and flag policy drift for review.",
    requiredMarkers: ["countryName", "visaGroup"],
    recordsPath: "response",
    expectedMinimumRecords: 190,
    expectedContentHash: "859a12905943f42d8665152cf48da2edfa01c94cc8025e02ce66d7d4b32209ee",
    enforcement: "required",
  },
  {
    id: "north-macedonia-mfa-visa-checker",
    title: "Do you need a visa?",
    url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
    publisher: "Ministry of Foreign Affairs of North Macedonia",
    extractor: "html-text",
    purpose: "Monitor public checker reachability before attempting a replay.",
    enforcement: "observe",
  },
  {
    id: "djibouti-evisa-applicant",
    title: "Djibouti eVisa applicant service",
    url: "https://www.evisa.gouv.dj/applicant-api/",
    publisher: "Djibouti E-Government",
    extractor: "html-text",
    purpose: "Monitor public frontend health; no application requests are made.",
    requiredMarkers: ["Evisa"],
    expectedSemanticHash: "61cb6027bd31cb4daeff36bcdd2a9badfaf3cd9a4910209dba220e8af0ada31a",
    enforcement: "required",
  },
  {
    id: "south-sudan-evisa",
    title: "eVisa South Sudan",
    url: "https://www.evisa.gov.ss/",
    publisher: "South Sudan Ministry of Interior",
    extractor: "html-text",
    purpose: "Monitor public landing page and delivery-workflow wording.",
    requiredMarkers: ["Republic of South Sudan", "Ministry of Interior"],
    expectedSemanticHash: "634d565ba2976509889c3c14a548f0c034721f52970ae5f8ff665619a487076d",
    enforcement: "required",
  },
];

const MAX_BODY_BYTES = 1_000_000;
const EXCERPT_LENGTH = 240;

function extract(body: string, kind: ExtractorKind): string | null {
  if (kind === "binary") return null;
  if (kind === "json") {
    try {
      return JSON.stringify(JSON.parse(body)).slice(0, EXCERPT_LENGTH);
    } catch {
      return body.replace(/\s+/g, " ").trim().slice(0, EXCERPT_LENGTH);
    }
  }
  return body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, EXCERPT_LENGTH);
}

function recordCountAtPath(body: string, path: string | undefined): number | null {
  if (!path) return null;
  try {
    let value: unknown = JSON.parse(body);
    for (const segment of path.split(".")) {
      if (!value || typeof value !== "object") return null;
      value = (value as Record<string, unknown>)[segment];
    }
    return Array.isArray(value) ? value.length : null;
  } catch {
    return null;
  }
}

export async function inspectSource(
  source: OfficialPortalSource,
  timeoutMs = 20_000,
): Promise<SourceHealthResult> {
  const checkedAt = new Date().toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "multipass-source-health/1.0 (read-only)" },
    });
    const raw = await response.arrayBuffer();
    const bytes = Buffer.from(raw).subarray(0, MAX_BODY_BYTES);
    const body = bytes.toString("utf8");
    const excerpt = extract(body, source.extractor);
    const contentHash = createHash("sha256").update(bytes).digest("hex");
    const semanticHash = excerpt ? createHash("sha256").update(excerpt).digest("hex") : null;
    const recordCount = recordCountAtPath(body, source.recordsPath);
    const markerMatches = Object.fromEntries((source.requiredMarkers ?? []).map((marker) => [
      marker,
      body.toLocaleLowerCase().includes(marker.toLocaleLowerCase()),
    ]));
    const healthy = response.ok
      && Object.values(markerMatches).every(Boolean)
      && (!source.expectedMinimumRecords || (recordCount !== null && recordCount >= source.expectedMinimumRecords))
      && (!source.expectedContentHash || source.expectedContentHash === contentHash)
      && (!source.expectedSemanticHash || source.expectedSemanticHash === semanticHash);
    return {
      id: source.id,
      url: source.url,
      checkedAt,
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      contentLength: Number(response.headers.get("content-length")) || raw.byteLength,
      contentHash,
      semanticHash,
      recordCount,
      extractor: source.extractor,
      excerpt,
      error: null,
      markerMatches,
      healthy,
    };
  } catch (error) {
    return {
      id: source.id,
      url: source.url,
      checkedAt,
      ok: false,
      status: null,
      finalUrl: null,
      contentType: null,
      contentLength: null,
      contentHash: null,
      semanticHash: null,
      recordCount: null,
      extractor: source.extractor,
      excerpt: null,
      error: error instanceof Error ? error.message : String(error),
      markerMatches: Object.fromEntries((source.requiredMarkers ?? []).map((marker) => [marker, false])),
      healthy: false,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function runSourceHealth(
  registry: readonly OfficialPortalSource[] = OFFICIAL_PORTAL_REGISTRY,
  timeoutMs?: number,
): Promise<{ generatedAt: string; sources: SourceHealthResult[] }> {
  return {
    generatedAt: new Date().toISOString(),
    sources: await Promise.all(registry.map((source) => inspectSource(source, timeoutMs))),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const id = process.argv.find((argument) => argument.startsWith("--id="))?.slice(5);
  const timeoutArgument = process.argv.find((argument) => argument.startsWith("--timeout-ms="))?.slice(13);
  const timeoutMs = timeoutArgument ? Number(timeoutArgument) : undefined;
  const registry = id
    ? OFFICIAL_PORTAL_REGISTRY.filter((source) => source.id === id)
    : OFFICIAL_PORTAL_REGISTRY;
  if (id && registry.length === 0) throw new Error(`Unknown source-health registry id: ${id}`);
  const report = await runSourceHealth(registry, timeoutMs);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (process.argv.includes("--fail-on-regression")) {
    const regressions = report.sources.filter((result) =>
      registry.find(({ id: registryId }) => registryId === result.id)?.enforcement === "required"
      && !result.healthy);
    if (regressions.length) {
      process.stderr.write(`Required official sources unhealthy: ${regressions.map(({ id: sourceId }) => sourceId).join(", ")}\n`);
      process.exitCode = 1;
    }
  }
}
