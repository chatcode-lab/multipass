import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { PassportSummary } from "@/lib/types";
import PassportPicker from "./PassportPicker";

export default function PassportBuilder({ passports }: { passports: PassportSummary[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  const openSet = () => {
    if (selected.length === 0) return;
    const params = new URLSearchParams();
    params.append("set", selected.join(","));
    window.location.assign(`/compare?${params.toString()}`);
  };

  return (
    <div className="builder-card">
      <div className="builder-card__heading">
        <span className="step-label">Build a passport set</span>
        <p>Choose one passport to inspect its access, or combine up to five.</p>
      </div>
      <div className="builder-card__controls">
        <PassportPicker passports={passports} selected={selected} onChange={setSelected} />
        <button className="button button--primary" type="button" onClick={openSet} disabled={selected.length === 0}>
          See access <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
      <div className="builder-card__hint">
        {selected.length === 0 ? "Try Brazil + Portugal, or start with your current passport." : `${selected.length} of 5 selected`}
      </div>
    </div>
  );
}
