import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { REGIONS, type PassportSummary } from "@/lib/types";
import PassportCover from "./PassportCover";

export default function RankingExplorer({ passports }: { passports: PassportSummary[] }) {
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

  return (
    <div className="ranking-explorer">
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search the passport ranking</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search passports" />
        </label>
        <label className="select-field">
          <span className="sr-only">Filter ranking by region</span>
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="ALL">All regions</option>
            {REGIONS.map((value) => (
              <option key={value} value={value}>{value.replace("MIDDLE EAST", "Middle East")}</option>
            ))}
          </select>
        </label>
        <span className="result-count" aria-live="polite">{filtered.length} passports</span>
      </div>
      <div className="ranking-table" role="table" aria-label="Global passport ranking">
        <div className="ranking-table__head" role="row">
          <span role="columnheader">Rank</span>
          <span role="columnheader">Passport</span>
          <span role="columnheader">Region</span>
          <span role="columnheader">Score</span>
          <span role="columnheader" className="sr-only">Actions</span>
        </div>
        {filtered.map((passport) => (
          <a className="ranking-row" role="row" href={`/passport/${passport.slug}`} key={passport.code}>
            <strong className="ranking-row__rank" role="cell">#{passport.rank}</strong>
            <span className="ranking-row__passport" role="cell">
              <PassportCover codes={[passport.code]} names={[passport.name]} size="small" />
              <span><strong>{passport.name}</strong><small>{passport.code}</small></span>
            </span>
            <span className="ranking-row__region" role="cell">{passport.region.replace("MIDDLE EAST", "Middle East")}</span>
            <span className="ranking-row__score" role="cell"><strong>{passport.mobilityScore}</strong><small>destinations</small></span>
            <ArrowUpRight className="ranking-row__arrow" size={18} aria-hidden="true" />
          </a>
        ))}
        {filtered.length === 0 && <p className="empty-state">No passports match those filters.</p>}
      </div>
    </div>
  );
}
