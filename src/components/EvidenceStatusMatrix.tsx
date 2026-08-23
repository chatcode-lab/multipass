import { RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { EvidenceStatusCell, EvidenceStatusRegion } from "@/lib/evidence-status";
import { formatRegion } from "@/lib/geography";
import { ACCESS_STATUSES, REGIONS, type AccessStatus, type Region } from "@/lib/types";
import "@/styles/evidence-status.css";

type VerificationFilter = "all" | "verified" | "pending";
type EvidenceFreshness = "pending" | "stale" | "aging" | "recent" | "fresh";

interface EvidenceStatusMatrixProps {
  initialRegion: Region;
  initialFilter: VerificationFilter;
  regionCounts: Record<Region, number>;
}

const STATUS_LABELS: Record<AccessStatus, string> = {
  citizenship: "Citizenship",
  visa_free: "Visa-free",
  eta: "ETA",
  visa_on_arrival: "Visa on arrival",
  evisa: "eVisa",
  visa_required: "Visa required",
  unknown: "Unknown",
};

const STATUS_SHORT_LABELS: Record<AccessStatus, string> = {
  citizenship: "Home",
  visa_free: "Free",
  eta: "ETA",
  visa_on_arrival: "VOA",
  evisa: "eVisa",
  visa_required: "Visa",
  unknown: "—",
};

const STATUS_SLUGS: Record<AccessStatus, string> = {
  citizenship: "citizenship",
  visa_free: "visa-free",
  eta: "eta",
  visa_on_arrival: "visa-on-arrival",
  evisa: "evisa",
  visa_required: "visa",
  unknown: "status-unknown",
};

function formatDate(value: string, compact = false): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: compact ? "short" : "long",
    year: compact ? undefined : "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function relationshipHref(
  passport: EvidenceStatusRegion["passports"][number],
  destination: EvidenceStatusRegion["destinations"][number],
  cell: EvidenceStatusCell,
): string {
  const [status] = cell;
  if (status === "citizenship") return `/passport/${passport.slug}`;
  return `/${passport.slug}-${destination.slug}-${STATUS_SLUGS[status]}`;
}

function cellMatchesFilter(cell: EvidenceStatusCell, filter: VerificationFilter): boolean {
  if (filter === "all") return true;
  return filter === "verified" ? cell[1] === 1 : cell[1] === 0;
}

function evidenceFreshness(reviewedAt: string | undefined, asOf: string): EvidenceFreshness {
  if (!reviewedAt) return "pending";
  const millisecondsPerDay = 86_400_000;
  const ageInDays = Math.max(0, Math.floor(
    (Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${reviewedAt}T00:00:00Z`)) / millisecondsPerDay,
  ));
  if (ageInDays <= 30) return "fresh";
  if (ageInDays <= 90) return "recent";
  if (ageInDays <= 180) return "aging";
  return "stale";
}

const FRESHNESS_LABELS: Record<EvidenceFreshness, string> = {
  pending: "not verified",
  stale: "verified more than 180 days ago",
  aging: "verified 91–180 days ago",
  recent: "verified 31–90 days ago",
  fresh: "verified within 30 days",
};

const COMPLETION_BUCKETS = [
  { key: "notCovered", label: "Not covered", detail: "No active matching evidence" },
  { key: "stale", label: "Stale", detail: "Reviewed 181+ days ago" },
  { key: "old", label: "Old", detail: "Reviewed 31–180 days ago" },
  { key: "fresh", label: "Fresh", detail: "Reviewed within 30 days" },
] as const;

export default function EvidenceStatusMatrix({
  initialRegion,
  initialFilter,
  regionCounts,
}: EvidenceStatusMatrixProps) {
  const [region, setRegion] = useState<Region>(initialRegion);
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>(initialFilter);
  const [passportQuery, setPassportQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [matrix, setMatrix] = useState<EvidenceStatusRegion | null>(null);
  const [displayedRegion, setDisplayedRegion] = useState<Region>(initialRegion);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const refresh = requestKey ? `&refresh=${requestKey}` : "";
    fetch(`/api/v1/evidence-status?region=${encodeURIComponent(region)}&schema=2${refresh}`, {
      signal: controller.signal,
      cache: requestKey ? "no-store" : "default",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Evidence API returned ${response.status}`);
        return response.json() as Promise<EvidenceStatusRegion>;
      })
      .then((nextMatrix) => {
        setMatrix(nextMatrix);
        setDisplayedRegion(nextMatrix.region);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Unable to load the evidence matrix");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [region, requestKey]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("region", region);
    if (verificationFilter === "all") url.searchParams.delete("state");
    else url.searchParams.set("state", verificationFilter);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [region, verificationFilter]);

  const visibleDestinationIndexes = useMemo(() => {
    if (!matrix) return [];
    const needle = destinationQuery.trim().toLowerCase();
    return matrix.destinations.flatMap((destination, index) =>
      !needle || destination.name.toLowerCase().includes(needle) || destination.code.toLowerCase().includes(needle)
        ? [index]
        : [],
    );
  }, [destinationQuery, matrix]);

  const visibleRows = useMemo(() => {
    if (!matrix) return [];
    const needle = passportQuery.trim().toLowerCase();
    const rowByCode = new Map(matrix.rows.map((row) => [row.passportCode, row]));
    return matrix.passports.flatMap((passport) => {
      if (needle && !passport.name.toLowerCase().includes(needle) && !passport.code.toLowerCase().includes(needle)) return [];
      const row = rowByCode.get(passport.code);
      if (!row) return [];
      if (verificationFilter !== "all" && !visibleDestinationIndexes.some((index) => cellMatchesFilter(row.cells[index], verificationFilter))) return [];
      return [{ passport, row }];
    });
  }, [matrix, passportQuery, verificationFilter, visibleDestinationIndexes]);

  const visibleSummary = useMemo(() => {
    let verified = 0;
    let pending = 0;
    for (const { row } of visibleRows) {
      for (const index of visibleDestinationIndexes) {
        if (row.cells[index][1]) verified += 1;
        else pending += 1;
      }
    }
    const total = verified + pending;
    return { verified, pending, total, percent: total ? Number(((verified / total) * 100).toFixed(1)) : 0 };
  }, [visibleDestinationIndexes, visibleRows]);

  return (
    <div className="evidence-status-tool">
      {matrix?.overall && (
        <section className="evidence-completion" aria-label="Overall evidence completion">
          <div className="evidence-completion__primary">
            <span>Overall completion</span>
            <strong>{matrix.overall.percent}%</strong>
            <small>{matrix.overall.covered.toLocaleString()} of {matrix.overall.total.toLocaleString()} foreign-access relationships covered</small>
          </div>
          <div className="evidence-completion__buckets">
            {COMPLETION_BUCKETS.map(({ key, label, detail }) => (
              <div className={`evidence-completion__bucket evidence-completion__bucket--${key}`} key={key}>
                <span><i />{label}</span>
                <strong>{matrix.overall[key].percent}%</strong>
                <small>{matrix.overall[key].count.toLocaleString()} · {detail}</small>
              </div>
            ))}
          </div>
          <div
            className="evidence-completion__bar"
            role="img"
            aria-label={`${matrix.overall.fresh.percent}% fresh, ${matrix.overall.old.percent}% old, ${matrix.overall.stale.percent}% stale, ${matrix.overall.notCovered.percent}% not covered`}
          >
            {(["fresh", "old", "stale", "notCovered"] as const).map((key) => (
              <i className={`evidence-completion__bar-segment evidence-completion__bar-segment--${key}`} style={{ width: `${matrix.overall[key].percent}%` }} key={key} />
            ))}
          </div>
          <p>Home/citizenship diagonal cells remain visible in the matrix but are excluded from the completion denominator.</p>
        </section>
      )}

      <nav className="evidence-region-tabs" aria-label="Destination region">
        {REGIONS.map((value) => (
          <button
            type="button"
            className={region === value ? "is-active" : undefined}
            aria-pressed={region === value}
            onClick={() => {
              if (region === value) return;
              setError(null);
              setIsLoading(true);
              setRegion(value);
            }}
            key={value}
          >
            <span>{formatRegion(value)}</span><small>{regionCounts[value]}</small>
          </button>
        ))}
      </nav>

      <div className="evidence-status-toolbar">
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Filter passports</span>
          <input value={passportQuery} onChange={(event) => setPassportQuery(event.target.value)} placeholder="Filter passports" />
        </label>
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Filter destinations</span>
          <input value={destinationQuery} onChange={(event) => setDestinationQuery(event.target.value)} placeholder="Filter destinations" />
        </label>
        <label className="select-field evidence-state-filter">
          <span className="sr-only">Filter by verification status</span>
          <select value={verificationFilter} onChange={(event) => setVerificationFilter(event.target.value as VerificationFilter)}>
            <option value="all">All evidence states</option>
            <option value="pending">Pending only</option>
            <option value="verified">Verified only</option>
          </select>
        </label>
        <button
          className="evidence-status-refresh"
          type="button"
          disabled={isLoading}
          onClick={() => {
            setError(null);
            setIsLoading(true);
            setRequestKey((value) => value + 1);
          }}
        >
          <RefreshCw size={16} aria-hidden="true" />
          {isLoading ? "Refreshing status…" : "Refresh status"}
        </button>
      </div>

      {matrix && isLoading && (
        <p className="evidence-status-refresh-state" role="status">
          Loading {formatRegion(region)} evidence. Showing the previous {formatRegion(displayedRegion)} snapshot until the update is ready.
        </p>
      )}

      {matrix && (
        <div className="evidence-status-summary" aria-live="polite">
          <span><strong>{visibleSummary.percent}%</strong> verified in view</span>
          <span><i className="verification-key verification-key--verified" />{visibleSummary.verified.toLocaleString()} verified</span>
          <span><i className="verification-key verification-key--pending" />{visibleSummary.pending.toLocaleString()} pending</span>
          <span>{visibleRows.length} passports × {visibleDestinationIndexes.length} destinations</span>
          <span>Access checked {formatDate(matrix.checkedAt.slice(0, 10))}</span>
        </div>
      )}

      {error && (
        <div className="evidence-status-error" role="alert">
          <strong>{matrix ? "Latest update unavailable." : "Matrix unavailable."}</strong> {error}
          <button type="button" onClick={() => {
            setError(null);
            setIsLoading(true);
            setRequestKey((value) => value + 1);
          }}>Try again</button>
        </div>
      )}

      {!matrix && !error && <div className="evidence-status-loading" role="status">Loading {formatRegion(region)} evidence…</div>}

      {matrix && !visibleDestinationIndexes.length && <p className="empty-state">No destinations match that filter.</p>}
      {matrix && visibleDestinationIndexes.length > 0 && !visibleRows.length && <p className="empty-state">No passport rows match those filters.</p>}

      {matrix && visibleDestinationIndexes.length > 0 && visibleRows.length > 0 && (
        <div className="evidence-matrix-scroll" tabIndex={0} aria-busy={isLoading} aria-label={`${formatRegion(displayedRegion)} evidence matrix; scroll horizontally to see destinations`}>
          <table className="evidence-matrix-table">
            <thead>
              <tr>
                <th className="evidence-passport-heading" scope="col">
                  <span>Passport</span><small>{visibleRows.length}</small>
                </th>
                {visibleDestinationIndexes.map((index) => {
                  const destination = matrix.destinations[index];
                  return (
                    <th scope="col" title={destination.name} key={destination.code}>
                      <a className="evidence-destination-link" href={`/destination/${destination.slug}`}>
                        <span>{destination.name}</span><strong>{destination.code}</strong>
                      </a>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ passport, row }) => (
                <tr key={passport.code}>
                  <th scope="row">
                    <a className="evidence-passport-link" href={`/passport/${passport.slug}`}>
                      <strong>{passport.name}</strong><small>{passport.code} · {formatRegion(passport.region)}</small>
                    </a>
                  </th>
                  {visibleDestinationIndexes.map((index) => {
                    const destination = matrix.destinations[index];
                    const cell = row.cells[index];
                    const reviewedAt = cell[1] ? matrix.dates[cell[2]] : undefined;
                    const freshness = evidenceFreshness(reviewedAt, matrix.asOf);
                    const matches = cellMatchesFilter(cell, verificationFilter);
                    const label = `${passport.name} to ${destination.name}: ${STATUS_LABELS[cell[0]]}; ${reviewedAt ? `verified ${formatDate(reviewedAt)} from ${cell[4]} official ${cell[4] === 1 ? "source" : "sources"}; ${FRESHNESS_LABELS[freshness]}` : "official-source review pending"}. Open evidence record`;
                    return (
                      <td className={!matches ? "is-muted" : undefined} key={destination.code}>
                        <a
                          href={relationshipHref(passport, destination, cell)}
                          className={`evidence-cell evidence-cell--${freshness} evidence-cell--${cell[0]}`}
                          aria-label={label}
                          title={label}
                        >
                          <strong>{STATUS_SHORT_LABELS[cell[0]]}</strong>
                          <small>{reviewedAt ? `✓ ${formatDate(reviewedAt, true)}` : "Pending"}</small>
                        </a>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="evidence-status-legend" aria-label="Matrix legend">
        <span><i className="verification-key verification-key--fresh" /><strong>0–30 days</strong> — freshly verified</span>
        <span><i className="verification-key verification-key--recent" /><strong>31–90 days</strong> — recently verified</span>
        <span><i className="verification-key verification-key--aging" /><strong>91–180 days</strong> — review becoming due</span>
        <span><i className="verification-key verification-key--stale" /><strong>181+ days</strong> — stale verification</span>
        <span><i className="verification-key verification-key--pending" /><strong>Red</strong> — no active canonical evidence yet</span>
        <span>Cell abbreviations: {ACCESS_STATUSES.map((status) => `${STATUS_SHORT_LABELS[status]} = ${STATUS_LABELS[status]}`).join(" · ")}</span>
      </div>
    </div>
  );
}
