import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { STATUS_META } from "@/lib/passport";
import { flagEmojiFor, formatRegion } from "@/lib/geography";
import { ACCESS_STATUSES, REGIONS, type AccessStatus, type Destination, type PassportAccess, type Region } from "@/lib/types";
import StatusPill from "./StatusPill";

interface AccessListProps {
  passport: PassportAccess;
  destinations: Destination[];
}

type AccessFilter = Exclude<AccessStatus, "citizenship"> | "all" | "easy";

const EASY_ACCESS_STATUSES = new Set<AccessStatus>(["visa_free", "eta", "visa_on_arrival", "evisa"]);

export default function AccessList({ passport, destinations }: AccessListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AccessFilter>("all");
  const [region, setRegion] = useState<Region | "all">("all");
  const availableStatuses = useMemo(() => ACCESS_STATUSES.filter((value) =>
    value !== "citizenship" && destinations.some((destination) =>
      (passport.statuses[destination.code] ?? "unknown") === value
    )
  ), [destinations, passport.statuses]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return destinations.filter((destination) => {
      const destinationStatus = passport.statuses[destination.code] ?? "unknown";
      const matchesStatus = status === "all"
        || (status === "easy" ? EASY_ACCESS_STATUSES.has(destinationStatus) : destinationStatus === status);
      return matchesStatus
        && (region === "all" || destination.region === region)
        && (!needle || destination.name.toLowerCase().includes(needle));
    });
  }, [destinations, passport.statuses, query, region, status]);

  return (
    <div className="access-list">
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search destinations</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destinations" />
        </label>
        <div className="access-list__filters">
          <label className="select-field select-field--access">
            <span className="sr-only">Filter by access type</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as AccessFilter)}>
              <option value="all">All access</option>
              <option value="easy">Easy access</option>
              {availableStatuses.map((value) => <option value={value} key={value}>{STATUS_META[value].label}</option>)}
            </select>
          </label>
          <label className="select-field select-field--region">
            <span className="sr-only">Filter destinations by region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value as Region | "all")}>
              <option value="all">All regions</option>
              {REGIONS.map((value) => <option value={value} key={value}>{formatRegion(value)}</option>)}
            </select>
          </label>
        </div>
        <span className="result-count" aria-live="polite">{filtered.length} destinations</span>
      </div>

      <div className="region-groups">
        {REGIONS.map((region) => {
          const rows = filtered.filter((destination) => destination.region === region);
          if (rows.length === 0) return null;
          return (
            <section className="region-group" key={region}>
              <div className="region-group__heading">
                <h3>{formatRegion(region)}</h3>
                <span>{rows.length}</span>
              </div>
              <div className="access-rows">
                {rows.map((destination) => (
                  <div className="access-row" key={destination.code}>
                    <span className="country-flag" aria-hidden="true">{flagEmojiFor(destination.code)}</span>
                    <strong>{destination.name}</strong>
                    <StatusPill status={passport.statuses[destination.code] ?? "unknown"} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        {filtered.length === 0 && <p className="empty-state">No destinations match those filters.</p>}
      </div>
    </div>
  );
}
