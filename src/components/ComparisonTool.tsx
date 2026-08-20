import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ACCESS_EASE_WEIGHT, STATUS_META } from "@/lib/passport";
import { comparisonHref, flagEmojiFor, formatRegion, rankHref } from "@/lib/geography";
import { ACCESS_STATUSES, REGIONS, type ComparisonResult, type PassportSummary, type Region } from "@/lib/types";
import AccessLegend from "./AccessLegend";
import PassportCover from "./PassportCover";
import PassportPicker from "./PassportPicker";
import StatusPill from "./StatusPill";

interface ComparisonToolProps {
  passports: PassportSummary[];
  initialSets: string[][];
  initialResult: ComparisonResult | null;
}

export default function ComparisonTool({ passports, initialSets, initialResult }: ComparisonToolProps) {
  const [sets, setSets] = useState<string[][]>(initialSets.length ? initialSets : [[]]);
  const [result, setResult] = useState<ComparisonResult | null>(initialResult);
  const [differencesOnly, setDifferencesOnly] = useState(true);
  const [region, setRegion] = useState<Region | "ALL">("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const firstRender = useRef(true);
  const byCode = useMemo(() => new Map(passports.map((passport) => [passport.code, passport])), [passports]);
  const validSets = useMemo(() => sets.filter((set) => set.length > 0), [sets]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const nextUrl = comparisonHref(validSets);
    window.history.replaceState({}, "", nextUrl);

    if (validSets.length === 0) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/v1/compare", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sets: validSets }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Comparison could not be calculated");
        setResult((await response.json()) as ComparisonResult);
      } catch (requestError) {
        if ((requestError as Error).name !== "AbortError") setError((requestError as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [validSets]);

  const replaceSets = (updater: (current: string[][]) => string[][]) => {
    setResult(null);
    setError("");
    setSets(updater);
  };

  const updateSet = (index: number, codes: string[]) => {
    replaceSets((current) => current.map((set, setIndex) => (setIndex === index ? codes : set)));
  };

  const visibleRows = result?.rows.filter((row) =>
    (!differencesOnly || result.scenarios.length < 2 || !row.isEqual) && (region === "ALL" || row.destination.region === region)
  ) ?? [];

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="comparison-tool">
      <div className="set-builder-grid">
        {sets.map((set, index) => (
          <section className="set-editor" key={`editor-${index + 1}`}>
            <div className="set-editor__heading">
              <span>Option {index + 1}</span>
              {sets.length > 1 && (
                <button type="button" className="icon-button" onClick={() => replaceSets((current) => current.filter((_, i) => i !== index))} aria-label={`Remove option ${index + 1}`}>
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </div>
            <PassportPicker passports={passports} selected={set} onChange={(codes) => updateSet(index, codes)} label="Search a passport" />
          </section>
        ))}
        {sets.length < 5 && (
          <button className="add-set-button" type="button" onClick={() => replaceSets((current) => [...current, []])}>
            <Plus size={18} aria-hidden="true" /> Add comparison option
          </button>
        )}
      </div>

      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {loading && <div className="loading-line" aria-label="Updating comparison" />}

      {result && (
        <>
          <div className="scenario-grid">
            {result.scenarios.map((scenario) => (
              <article className="scenario-card" key={scenario.id}>
                <PassportCover
                  codes={scenario.codes}
                  names={scenario.codes.map((code) => byCode.get(code)?.name ?? code)}
                  size="medium"
                />
                <div className="scenario-card__content">
                  <span className="eyebrow">Rank equivalent</span>
                  <strong className="scenario-card__rank">#{scenario.rankEquivalent}</strong>
                  <h2>{scenario.name}</h2>
                  <p><strong>{scenario.mobilityScore}</strong> destinations without a prior visa</p>
                  <div className="scenario-card__counts">
                    {ACCESS_STATUSES.filter((status) => scenario.statusCounts[status] > 0).map((status) => (
                      <span key={status}><i className={`status-dot status-dot--${status}`} />{STATUS_META[status].shortLabel} {scenario.statusCounts[status]}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="comparison-toolbar">
            <label className="check-control">
              <input type="checkbox" checked={differencesOnly} disabled={result.scenarios.length < 2} onChange={(event) => setDifferencesOnly(event.target.checked)} />
              <span>Differences only</span>
            </label>
            <label className="select-field comparison-region-filter">
              <span className="sr-only">Filter comparison destinations by region</span>
              <select value={region} onChange={(event) => setRegion(event.target.value as Region | "ALL")}>
                <option value="ALL">All regions</option>
                {REGIONS.map((value) => <option value={value} key={value}>{formatRegion(value)}</option>)}
              </select>
            </label>
            <span className="comparison-toolbar__count" aria-live="polite">{visibleRows.length} destinations shown</span>
            <a className="button button--quiet comparison-toolbar__ranking" href={rankHref(validSets)}>View ranking</a>
            <button type="button" className="button button--quiet comparison-toolbar__copy" onClick={copyLink}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy link"}
            </button>
          </div>

          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  {result.scenarios.map((scenario) => <th key={scenario.id}>{scenario.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {REGIONS.map((region) => {
                  const regionRows = visibleRows.filter((row) => row.destination.region === region);
                  if (!regionRows.length) return null;
                  return [
                    <tr className="comparison-table__region" key={`${region}-heading`}>
                      <th colSpan={result.scenarios.length + 1}>{formatRegion(region)} <span>{regionRows.length}</span></th>
                    </tr>,
                    ...regionRows.map((row) => {
                      const weights = row.cells.map((cell) => ACCESS_EASE_WEIGHT[cell.status]);
                      const bestWeight = Math.max(...weights);
                      const worstWeight = Math.min(...weights);
                      const hasRelativeDifference = bestWeight !== worstWeight;
                      return (
                        <tr key={row.destination.code}>
                          <th>
                            <span className="country-flag" aria-hidden="true">{flagEmojiFor(row.destination.code)}</span>
                            {row.destination.name}
                          </th>
                          {row.cells.map((cell, index) => {
                            const scenario = result.scenarios[index];
                            const visibleVia = scenario && scenario.codes.length > 1 && cell.via.length < scenario.codes.length
                              ? cell.via
                              : [];
                            const relativeClass = !hasRelativeDifference
                              ? weights[index] === ACCESS_EASE_WEIGHT.visa_free
                                ? "comparison-cell--best"
                                : undefined
                              : weights[index] === bestWeight
                                ? "comparison-cell--best"
                                : weights[index] === worstWeight
                                  ? "comparison-cell--worst"
                                  : undefined;
                            return (
                              <td className={relativeClass} data-label={result.scenarios[index]?.name} key={`${row.destination.code}-${index}`}>
                                <StatusPill
                                  status={cell.status}
                                  via={visibleVia}
                                  compact
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    }),
                  ];
                })}
              </tbody>
            </table>
          </div>
          <AccessLegend />
        </>
      )}

      {!result && validSets.length === 0 && (
        <div className="comparison-empty">
          <PassportCover codes={["PT"]} names={["Your first passport"]} size="medium" />
          <div><h2>Start with one passport</h2><p>Add more options when you want to compare individual passports or complete combinations.</p></div>
        </div>
      )}
    </div>
  );
}
