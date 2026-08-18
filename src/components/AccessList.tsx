import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { STATUS_META } from "@/lib/passport";
import { ACCESS_STATUSES, REGIONS, type AccessStatus, type Destination, type PassportAccess } from "@/lib/types";
import StatusPill from "./StatusPill";

interface AccessListProps {
  passport: PassportAccess;
  destinations: Destination[];
}

export default function AccessList({ passport, destinations }: AccessListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AccessStatus | "all">("all");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return destinations.filter((destination) => {
      const destinationStatus = passport.statuses[destination.code] ?? "unknown";
      return (status === "all" || destinationStatus === status) && (!needle || destination.name.toLowerCase().includes(needle));
    });
  }, [destinations, passport.statuses, query, status]);

  return (
    <div className="access-list">
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search destinations</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destinations" />
        </label>
        <label className="select-field">
          <span className="sr-only">Filter by access type</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as AccessStatus | "all")}>
            <option value="all">All access types</option>
            {ACCESS_STATUSES.map((value) => <option value={value} key={value}>{STATUS_META[value].label}</option>)}
          </select>
        </label>
        <span className="result-count" aria-live="polite">{filtered.length} destinations</span>
      </div>

      <div className="region-groups">
        {REGIONS.map((region) => {
          const rows = filtered.filter((destination) => destination.region === region);
          if (rows.length === 0) return null;
          return (
            <section className="region-group" key={region}>
              <div className="region-group__heading">
                <h3>{region.replace("MIDDLE EAST", "Middle East")}</h3>
                <span>{rows.length}</span>
              </div>
              <div className="access-rows">
                {rows.map((destination) => (
                  <div className="access-row" key={destination.code}>
                    <span className={`fi fi-${destination.code.toLowerCase()}`} aria-hidden="true" />
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

