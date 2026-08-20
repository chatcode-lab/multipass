import { ExternalLink, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { EvidenceStatusCell, EvidenceStatusRegion } from "@/lib/evidence-status";
import { formatRegion } from "@/lib/geography";
import { ACCESS_STATUSES, REGIONS, type AccessStatus, type Region } from "@/lib/types";
import "@/styles/evidence-status.css";

type VerificationFilter = "all" | "verified" | "pending";

interface EvidenceStatusMatrixProps {
  initialRegion: Region;
  initialFilter: VerificationFilter;
  regionCounts: Record<Region, number>;
}

interface SelectedCell {
  passport: EvidenceStatusRegion["passports"][number];
  destination: EvidenceStatusRegion["destinations"][number];
  cell: EvidenceStatusCell;
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
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: compact ? "short" : "long",
    year: compact ? undefined : "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function relationshipHref(selected: SelectedCell): string {
  const [status] = selected.cell;
  if (status === "citizenship") return `/passport/${selected.passport.slug}`;
  return `/${selected.passport.slug}-${selected.destination.slug}-${STATUS_SLUGS[status]}`;
}

function cellMatchesFilter(cell: EvidenceStatusCell, filter: VerificationFilter): boolean {
  if (filter === "all") return true;
  return filter === "verified" ? cell[1] === 1 : cell[1] === 0;
}

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
  const [selected, setSelected] = useState<SelectedCell | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/v1/evidence-status?region=${encodeURIComponent(region)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Evidence API returned ${response.status}`);
        return response.json() as Promise<EvidenceStatusRegion>;
      })
      .then(setMatrix)
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Unable to load the evidence matrix");
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
      <nav className="evidence-region-tabs" aria-label="Destination region">
        {REGIONS.map((value) => (
          <button
            type="button"
            className={region === value ? "is-active" : undefined}
            aria-pressed={region === value}
            onClick={() => {
              if (region === value) return;
              setMatrix(null);
              setSelected(null);
              setError(null);
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
      </div>

      {matrix && (
        <div className="evidence-status-summary" aria-live="polite">
          <span><strong>{visibleSummary.percent}%</strong> verified in view</span>
          <span><i className="verification-key verification-key--verified" />{visibleSummary.verified.toLocaleString()} verified</span>
          <span><i className="verification-key verification-key--pending" />{visibleSummary.pending.toLocaleString()} pending</span>
          <span>{visibleRows.length} passports × {visibleDestinationIndexes.length} destinations</span>
          <span>Access checked {formatDate(matrix.checkedAt.slice(0, 10))}</span>
        </div>
      )}

      {selected && matrix && (
        <aside className="evidence-cell-detail" aria-live="polite">
          <div>
            <span className="eyebrow">Selected relationship</span>
            <h2>{selected.passport.name} → {selected.destination.name}</h2>
          </div>
          <dl>
            <div><dt>Access</dt><dd>{STATUS_LABELS[selected.cell[0]]}</dd></div>
            <div>
              <dt>Evidence</dt>
              <dd>{selected.cell[1] ? `Verified ${formatDate(matrix.dates[selected.cell[2]])}` : "Official-source review pending"}</dd>
            </div>
            <div><dt>Policies</dt><dd>{selected.cell[3]}</dd></div>
            <div><dt>Sources</dt><dd>{selected.cell[4]}</dd></div>
          </dl>
          <a href={relationshipHref(selected)}>Open relationship record <ExternalLink size={14} aria-hidden="true" /></a>
        </aside>
      )}

      {error && (
        <div className="evidence-status-error" role="alert">
          <strong>Matrix unavailable.</strong> {error}
          <button type="button" onClick={() => {
            setMatrix(null);
            setError(null);
            setRequestKey((value) => value + 1);
          }}>Try again</button>
        </div>
      )}

      {!matrix && !error && <div className="evidence-status-loading" role="status">Loading {formatRegion(region)} evidence…</div>}

      {matrix && !visibleDestinationIndexes.length && <p className="empty-state">No destinations match that filter.</p>}
      {matrix && visibleDestinationIndexes.length > 0 && !visibleRows.length && <p className="empty-state">No passport rows match those filters.</p>}

      {matrix && visibleDestinationIndexes.length > 0 && visibleRows.length > 0 && (
        <div className="evidence-matrix-scroll" tabIndex={0} aria-label={`${formatRegion(region)} evidence matrix; scroll horizontally to see destinations`}>
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
                      <span>{destination.name}</span><strong>{destination.code}</strong>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ passport, row }) => (
                <tr key={passport.code}>
                  <th scope="row">
                    <strong>{passport.name}</strong><small>{passport.code} · {formatRegion(passport.region)}</small>
                  </th>
                  {visibleDestinationIndexes.map((index) => {
                    const destination = matrix.destinations[index];
                    const cell = row.cells[index];
                    const reviewedAt = cell[1] ? matrix.dates[cell[2]] : undefined;
                    const matches = cellMatchesFilter(cell, verificationFilter);
                    const isSelected = selected?.passport.code === passport.code && selected.destination.code === destination.code;
                    const label = `${passport.name} to ${destination.name}: ${STATUS_LABELS[cell[0]]}; ${reviewedAt ? `verified ${formatDate(reviewedAt)}` : "official-source review pending"}`;
                    return (
                      <td className={!matches ? "is-muted" : undefined} key={destination.code}>
                        <button
                          type="button"
                          className={`evidence-cell evidence-cell--${cell[1] ? "verified" : "pending"} evidence-cell--${cell[0]}${isSelected ? " is-selected" : ""}`}
                          aria-label={label}
                          title={label}
                          onClick={() => setSelected({ passport, destination, cell })}
                        >
                          <strong>{STATUS_SHORT_LABELS[cell[0]]}</strong>
                          <small>{reviewedAt ? `✓ ${formatDate(reviewedAt, true)}` : "Pending"}</small>
                        </button>
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
        <span><i className="verification-key verification-key--verified" /><strong>Verified</strong> — an active policy and official source support the current access status.</span>
        <span><i className="verification-key verification-key--pending" /><strong>Pending</strong> — the current status has not yet been supported by active canonical evidence.</span>
        <span>Cell abbreviations: {ACCESS_STATUSES.map((status) => `${STATUS_SHORT_LABELS[status]} = ${STATUS_LABELS[status]}`).join(" · ")}</span>
      </div>
    </div>
  );
}
