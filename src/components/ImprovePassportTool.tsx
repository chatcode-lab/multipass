import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { citizenshipCombinationNotices, citizenshipPolicyAnchor } from "@/lib/citizenship-compatibility";
import { comparisonHref, flagEmojiFor, formatRegion, improveHref, rankHref } from "@/lib/geography";
import { STATUS_META } from "@/lib/passport-shared";
import { destinationSlug, visaRelationshipHref } from "@/lib/visa-urls";
import { REGIONS, type ImprovementResult, type PassportSummary, type Region } from "@/lib/types";
import AccessLegend from "./AccessLegend";
import PassportCover from "./PassportCover";
import PassportPicker from "./PassportPicker";
import StatusPill from "./StatusPill";

interface ImprovePassportToolProps {
  passports: PassportSummary[];
  initialSets: string[][];
  initialResult: ImprovementResult | null;
}

const MAX_STAGES = 5;
const MAX_TOTAL_PASSPORTS = 10;
const MAX_PER_EDITOR = 5;

export default function ImprovePassportTool({ passports, initialSets, initialResult }: ImprovePassportToolProps) {
  const [sets, setSets] = useState<string[][]>(initialSets.length ? initialSets : [[]]);
  const [result, setResult] = useState<ImprovementResult | null>(initialResult);
  const [gainsOnly, setGainsOnly] = useState(true);
  const [region, setRegion] = useState<Region | "ALL">("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const firstRender = useRef(true);
  const hasInitialResult = useRef(Boolean(initialResult));
  const byCode = useMemo(() => new Map(passports.map((passport) => [passport.code, passport])), [passports]);
  const validSets = useMemo(() => sets.filter((set) => set.length > 0), [sets]);
  const selectedCount = sets.reduce((total, set) => total + set.length, 0);
  const compatibilityNotices = useMemo(
    () => {
      const codes = result?.stages.at(-1)?.cumulativeCodes ?? [];
      return citizenshipCombinationNotices(codes.length ? [codes] : []);
    },
    [result],
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      if (hasInitialResult.current) return;
    }
    window.history.replaceState({}, "", improveHref(validSets));
    if (validSets.length === 0) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/v1/improve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sets: validSets }),
          signal: controller.signal,
        });
        const payload = await response.json() as ImprovementResult & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Improvement sequence could not be calculated");
        setResult(payload);
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

  const visibleRows = result?.rows.filter((row) =>
    (!gainsOnly || result.stages.length < 2 || row.hasScoreGain)
    && (region === "ALL" || row.destination.region === region)
  ) ?? [];

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const comparisonSets = result?.stages.map((stage) => stage.cumulativeCodes) ?? [];
  const finalSet = result?.stages.at(-1)?.cumulativeCodes ?? [];

  return (
    <div className="improvement-tool">
      <div className="improvement-builder" aria-label="Ordered passport improvement stages">
        {sets.map((set, index) => {
          const selectedElsewhere = new Set(sets.flatMap((other, otherIndex) => otherIndex === index ? [] : other));
          const available = passports.filter((passport) => set.includes(passport.code) || !selectedElsewhere.has(passport.code));
          const editorMax = Math.min(MAX_PER_EDITOR, MAX_TOTAL_PASSPORTS - (selectedCount - set.length));
          return (
            <section className="set-editor improvement-editor" key={`stage-editor-${index + 1}`}>
              <div className="set-editor__heading">
                <span><b>{index + 1}</b>{index === 0 ? "Base set" : `Addition ${index}`}</span>
                {sets.length > 1 && (
                  <button type="button" className="icon-button" onClick={() => replaceSets((current) => current.filter((_, i) => i !== index))} aria-label={`Remove stage ${index + 1}`}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              <PassportPicker
                passports={available}
                selected={set}
                onChange={(codes) => replaceSets((current) => current.map((value, setIndex) => setIndex === index ? codes : value))}
                label={index === 0 ? "Choose your current passport" : "Add a passport or set"}
                max={editorMax}
              />
            </section>
          );
        })}
        {sets.length < MAX_STAGES && selectedCount < MAX_TOTAL_PASSPORTS && (
          <button className="add-set-button improvement-add" type="button" onClick={() => replaceSets((current) => [...current, []])}>
            <Plus size={18} aria-hidden="true" /> Add next stage
          </button>
        )}
      </div>

      <p className="improvement-order-note">Order matters: each stage is measured against everything in the stages before it. A passport can appear once, with ten passports maximum across the sequence.</p>
      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {loading && <div className="loading-line" aria-label="Updating passport improvement sequence" />}

      {result && (
        <>
          <div className="improvement-stage-grid">
            {result.stages.map((stage, index) => (
              <article className="improvement-stage" key={stage.id}>
                <div className="improvement-stage__topline"><span>Stage {index + 1}</span><strong>#{stage.rankEquivalent}</strong></div>
                <PassportCover codes={stage.addedCodes} names={stage.addedCodes.map((code) => byCode.get(code)?.name ?? code)} size="small" />
                <div className="improvement-stage__body">
                  <h2>{stage.name}</h2>
                  <p className="improvement-stage__gain">
                    {index === 0 ? <><strong>{stage.mobilityScore}</strong><span>base score</span></> : <><strong>+{stage.marginalEasyDestinations}</strong><span>new destinations</span></>}
                  </p>
                  <p><b>{stage.cumulativeAccessibleDestinations}</b> cumulative easy-access destinations</p>
                </div>
              </article>
            ))}
          </div>

          {compatibilityNotices.length > 0 && (
            <aside className="citizenship-notices" aria-label="Citizenship compatibility notes">
              <div className="citizenship-notices__heading"><span className="eyebrow">Citizenship compatibility</span><p>Travel calculations do not prove that a combination can be acquired or retained.</p></div>
              {compatibilityNotices.map(({ policy, severity }) => (
                <article className={`citizenship-notice citizenship-notice--${severity}`} key={policy.code}>
                  <span>{policy.country}</span><strong>{policy.headline}</strong><p>{policy.summary}</p>
                  <a href={`/dual-citizenship-countries#${citizenshipPolicyAnchor(policy)}`}>Review rule and official sources</a>
                </article>
              ))}
            </aside>
          )}

          <nav className="table-view-actions" aria-label="Improvement view actions">
            <a className="button button--quiet" href={comparisonHref(comparisonSets)}>Compare stages</a>
            <a className="button button--quiet" href={rankHref([finalSet])}>Rank final set</a>
            <button type="button" className="button button--quiet" onClick={copyLink}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy link"}
            </button>
          </nav>

          <div className="comparison-toolbar">
            <label className="check-control">
              <input type="checkbox" checked={gainsOnly} disabled={result.stages.length < 2} onChange={(event) => setGainsOnly(event.target.checked)} />
              <span>New access only</span>
            </label>
            <label className="select-field comparison-region-filter">
              <span className="sr-only">Filter improvement destinations by region</span>
              <select value={region} onChange={(event) => setRegion(event.target.value as Region | "ALL")}>
                <option value="ALL">All regions</option>
                {REGIONS.map((value) => <option value={value} key={value}>{formatRegion(value)}</option>)}
              </select>
            </label>
            <span className="comparison-toolbar__count" aria-live="polite">{visibleRows.length} destinations shown</span>
          </div>

          <div className="comparison-table-wrap">
            <table className="comparison-table improvement-table">
              <thead><tr><th>Destination</th>{result.stages.map((stage, index) => <th key={stage.id}><span>{index === 0 ? "Base" : `+ Stage ${index + 1}`}</span><strong>{stage.name}</strong><small>{index === 0 ? `${stage.mobilityScore} score` : `+${stage.marginalEasyDestinations} · ${stage.mobilityScore} score`}</small></th>)}</tr></thead>
              <tbody>
                {REGIONS.map((regionValue) => {
                  const regionRows = visibleRows.filter((row) => row.destination.region === regionValue);
                  if (!regionRows.length) return null;
                  return [
                    <tr className="comparison-table__region" key={`${regionValue}-heading`}><th colSpan={result.stages.length + 1}>{formatRegion(regionValue)} <span>{regionRows.length}</span></th></tr>,
                    ...regionRows.map((row) => (
                      <tr key={row.destination.code}>
                        <th className="comparison-destination-cell"><a className="comparison-destination-link" href={`/destination/${destinationSlug(row.destination)}`}><span className="country-flag" aria-hidden="true">{flagEmojiFor(row.destination.code)}</span>{row.destination.name}</a></th>
                        {row.cells.map((cell, index) => {
                          const stage = result.stages[index];
                          const evidencePassport = cell.via.length === 1 ? byCode.get(cell.via[0] ?? "") : undefined;
                          const cellHref = evidencePassport
                            ? visaRelationshipHref(evidencePassport, row.destination, cell.status)
                            : `/destination/${destinationSlug(row.destination)}#passports=${cell.via.join(",")}`;
                          const visibleVia = stage.cumulativeCodes.length > 1 && cell.via.length < stage.cumulativeCodes.length ? cell.via : [];
                          return (
                            <td className={["comparison-cell--linked", cell.scoreGain && "improvement-cell--gain", !cell.scoreGain && cell.improved && "improvement-cell--upgrade"].filter(Boolean).join(" ")} data-label={`${stage.name} · cumulative`} key={`${row.destination.code}-${stage.id}`}>
                              <a className="comparison-status-link improvement-status-link" href={cellHref} aria-label={`${stage.name} cumulative access to ${row.destination.name}: ${STATUS_META[cell.status].label}${cell.scoreGain ? "; newly easy access at this stage" : ""}`}>
                                <StatusPill status={cell.status} via={visibleVia} compact />
                                {cell.scoreGain && <small>New</small>}
                              </a>
                            </td>
                          );
                        })}
                      </tr>
                    )),
                  ];
                })}
              </tbody>
            </table>
          </div>
          <p className="improvement-table-note"><strong>New</strong> marks a destination that first becomes citizenship, visa-free, ETA, or visa on arrival at that stage. Pale cells mark a route improvement that does not increase the main score.</p>
          <AccessLegend />
        </>
      )}

      {!result && validSets.length === 0 && (
        <div className="comparison-empty"><PassportCover codes={["US"]} names={["Your current passport"]} size="medium" /><div><h2>Start with what you hold.</h2><p>Then add passports or combined sets in the order you want to measure them.</p></div></div>
      )}
    </div>
  );
}
