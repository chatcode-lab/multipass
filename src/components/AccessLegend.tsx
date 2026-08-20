import { STATUS_META } from "@/lib/passport-shared";
import { ACCESS_STATUSES } from "@/lib/types";
import StatusPill from "./StatusPill";

export default function AccessLegend() {
  return (
    <aside className="access-legend" aria-labelledby="access-legend-title">
      <div className="access-legend__heading">
        <div>
          <span className="eyebrow">Access legend</span>
          <h2 id="access-legend-title">What the labels mean</h2>
        </div>
        <a href="/evisa-vs-eta">eVisa vs ETA explained</a>
      </div>
      <dl>
        {ACCESS_STATUSES.map((status) => (
          <div key={status}>
            <dt><StatusPill status={status} compact /></dt>
            <dd>{STATUS_META[status].description}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
