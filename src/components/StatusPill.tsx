import { STATUS_META } from "@/lib/passport";
import type { AccessStatus } from "@/lib/types";

interface StatusPillProps {
  status: AccessStatus;
  compact?: boolean;
  via?: string[];
}

export default function StatusPill({ status, compact = false, via = [] }: StatusPillProps) {
  const meta = STATUS_META[status];
  const viaLabel = via.length ? ` via ${via.join(", ")}` : "";
  const visibleVia = compact && via.length > 2
    ? `${via.slice(0, 2).join(" / ")} +${via.length - 2}`
    : via.join(" / ");
  return (
    <span
      className={`status-pill status-pill--${status}`}
      title={`${meta.description}${viaLabel}`}
      aria-label={`${meta.label}${viaLabel}`}
    >
      <span className="status-pill__dot" aria-hidden="true" />
      {compact ? meta.shortLabel : meta.label}
      {via.length > 0 && <small>via {visibleVia}</small>}
    </span>
  );
}
