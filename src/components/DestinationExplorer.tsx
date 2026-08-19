import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { flagCodeFor, formatRegion } from "@/lib/geography";
import { REGIONS, type Destination, type Region } from "@/lib/types";

export default function DestinationExplorer({ destinations }: { destinations: Destination[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "ALL">("ALL");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return destinations.filter((destination) =>
      (region === "ALL" || destination.region === region) &&
      (!needle || destination.name.toLowerCase().includes(needle) || destination.code.toLowerCase().includes(needle)),
    );
  }, [destinations, query, region]);

  return (
    <div className="destination-explorer">
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search destinations</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destinations" />
        </label>
        <label className="select-field">
          <span className="sr-only">Filter destinations by region</span>
          <select value={region} onChange={(event) => setRegion(event.target.value as Region | "ALL")}>
            <option value="ALL">All regions</option>
            {REGIONS.map((value) => <option value={value} key={value}>{formatRegion(value)}</option>)}
          </select>
        </label>
        <span className="result-count" aria-live="polite">{filtered.length} destinations</span>
      </div>
      <div className="destination-groups">
        {REGIONS.map((regionName) => {
          const rows = filtered.filter((destination) => destination.region === regionName);
          if (!rows.length) return null;
          return (
            <section className="destination-group" key={regionName}>
              <div className="region-group__heading">
                <h2>{formatRegion(regionName)}</h2>
                <span>{rows.length}</span>
              </div>
              <ul className="destination-grid">
                {rows.map((destination) => (
                  <li key={destination.code}>
                    <span className={`fi fi-${flagCodeFor(destination.code)}`} aria-hidden="true" />
                    <span><strong>{destination.name}</strong><small>{destination.code}</small></span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {!filtered.length && <p className="empty-state">No destinations match those filters.</p>}
      </div>
    </div>
  );
}
