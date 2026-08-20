import { STATUS_META } from "@/lib/passport-shared";
import type { AccessStatus } from "@/lib/types";

interface StatusPillProps {
  status: AccessStatus;
  compact?: boolean;
  via?: string[];
}

export default function StatusPill({ status, compact = false, via = [] }: StatusPillProps) {
  const meta = STATUS_META[status];
  const viaLabel = via.length ? ` through ${via.join(", ")}` : "";
  const visibleVia = via.join("/");
  return (
    <span
      className={`status-pill status-pill--${status}`}
      title={`${meta.description}${viaLabel}`}
      aria-label={`${meta.label}${viaLabel}`}
    >
      <span className="status-pill__dot" aria-hidden="true" />
      <span className="status-pill__text">
        <span className="status-pill__label">{compact ? meta.shortLabel : meta.label}</span>
        {via.length > 0 && <small>{visibleVia}</small>}
      </span>
    </span>
  );
}
