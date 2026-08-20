import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { flagEmojiFor, formatRegion } from "@/lib/geography";
import { destinationSlug } from "@/lib/visa-evidence";
import { REGIONS, type Destination, type Region } from "@/lib/types";

interface DestinationExplorerProps {
  destinations: Destination[];
  untracked?: readonly Destination[];
}

export default function DestinationExplorer({ destinations, untracked = [] }: DestinationExplorerProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "ALL">("ALL");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return destinations.filter((destination) =>
      (region === "ALL" || destination.region === region) &&
      (!needle || destination.name.toLowerCase().includes(needle) || destination.code.toLowerCase().includes(needle)),
    );
  }, [destinations, query, region]);
  const filteredUntracked = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return untracked.filter((destination) =>
      (region === "ALL" || destination.region === region) &&
      (!needle || destination.name.toLowerCase().includes(needle) || destination.code.toLowerCase().includes(needle)),
    );
  }, [query, region, untracked]);

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
        <span className="result-count" aria-live="polite">{filtered.length} tracked destinations</span>
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
                    <a href={`/destination/${destinationSlug(destination)}`}>
                      <span className="country-flag" aria-hidden="true">{flagEmojiFor(destination.code)}</span>
                      <span><strong>{destination.name}</strong><small>{destination.code}</small></span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {filteredUntracked.length > 0 && (
          <section className="coverage-disclosure coverage-disclosure--destinations">
            <div className="coverage-disclosure__heading">
              <div><span className="eyebrow">Coverage note</span><h2>Not tracked separately</h2></div>
              <span>{filteredUntracked.length}</span>
            </div>
            <p>
              This concise list covers recognized areas absent from the upstream destination model. They do not affect scores or comparisons, and the list intentionally omits most remote uninhabited areas.
              {" "}<a href="https://unstats.un.org/unsd/methodology/m49/">Names and codes follow the UN M49 reference.</a>
            </p>
            <ul className="coverage-disclosure__grid">
              {filteredUntracked.map((destination) => (
                <li key={destination.code}>
                  <span className="country-flag" aria-hidden="true">{flagEmojiFor(destination.code)}</span>
                  <span><strong>{destination.name}</strong><small>{destination.code} · Not modeled</small></span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {!filtered.length && !filteredUntracked.length && <p className="empty-state">No destinations match those filters.</p>}
      </div>
    </div>
  );
}
