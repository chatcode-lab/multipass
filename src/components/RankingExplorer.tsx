import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { formatRegion } from "@/lib/geography";
import { REGIONS, type PassportSummary } from "@/lib/types";
import PassportCover from "./PassportCover";

interface RankingExplorerProps {
  passports: PassportSummary[];
  scoped?: boolean;
  showRegionFilter?: boolean;
  listLabel?: string;
}

export default function RankingExplorer({
  passports,
  scoped = false,
  showRegionFilter = true,
  listLabel = "Global passport ranking",
}: RankingExplorerProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("ALL");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return passports.filter(
      (passport) =>
        (region === "ALL" || passport.region === region) &&
        (!needle || passport.name.toLowerCase().includes(needle) || passport.code.toLowerCase().includes(needle)),
    );
  }, [passports, query, region]);
  const scopedRanks = useMemo(
    () => new Map(passports.map((passport, index) => [passport.code, index + 1])),
    [passports],
  );

  return (
    <div className="ranking-explorer">
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search the passport ranking</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search passports" />
        </label>
        {showRegionFilter && (
          <label className="select-field">
            <span className="sr-only">Filter ranking by region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              <option value="ALL">All regions</option>
              {REGIONS.map((value) => <option key={value} value={value}>{formatRegion(value)}</option>)}
            </select>
          </label>
        )}
        <span className="result-count" aria-live="polite">{filtered.length} passports</span>
      </div>
      <div className="ranking-table">
        <div className="ranking-table__head" aria-hidden="true">
          <span>{scoped ? "Group rank" : "Rank"}</span>
          <span>Passport</span>
          <span>Region</span>
          <span>Score</span>
          <span className="sr-only">Actions</span>
        </div>
        <ol className="ranking-table__list" aria-label={listLabel}>
          {filtered.map((passport) => (
            <li key={passport.code}>
              <a className="ranking-row" href={`/passport/${passport.slug}`}>
                <strong className="ranking-row__rank">
                  #{scoped ? scopedRanks.get(passport.code) : passport.rank}
                  {scoped && <small>global #{passport.rank}</small>}
                </strong>
                <span className="ranking-row__passport">
                  <PassportCover codes={[passport.code]} names={[passport.name]} size="small" />
                  <span><strong>{passport.name}</strong><small>{passport.code}</small></span>
                </span>
                <span className="ranking-row__region">{formatRegion(passport.region)}</span>
                <span className="ranking-row__score"><strong>{passport.mobilityScore}</strong><small>destinations</small></span>
                <ArrowUpRight className="ranking-row__arrow" size={18} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
        {filtered.length === 0 && <p className="empty-state">No passports match those filters.</p>}
      </div>
    </div>
  );
}
