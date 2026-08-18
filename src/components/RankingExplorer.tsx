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
      <div className="ranking-table">
        <div className="ranking-table__head" aria-hidden="true">
          <span>Rank</span>
          <span>Passport</span>
          <span>Region</span>
          <span>Score</span>
          <span className="sr-only">Actions</span>
        </div>
        <ol className="ranking-table__list" aria-label="Global passport ranking">
          {filtered.map((passport) => (
            <li key={passport.code}>
              <a className="ranking-row" href={`/passport/${passport.slug}`}>
                <strong className="ranking-row__rank">#{passport.rank}</strong>
                <span className="ranking-row__passport">
                  <PassportCover codes={[passport.code]} names={[passport.name]} size="small" />
                  <span><strong>{passport.name}</strong><small>{passport.code}</small></span>
                </span>
                <span className="ranking-row__region">{passport.region.replace("MIDDLE EAST", "Middle East")}</span>
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
