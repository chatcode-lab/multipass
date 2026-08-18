import { Search, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import type { PassportSummary } from "@/lib/types";

interface PassportPickerProps {
  passports: PassportSummary[];
  selected: string[];
  onChange: (codes: string[]) => void;
  label?: string;
  max?: number;
}

export default function PassportPicker({
  passports,
  selected,
  onChange,
  label = "Add a passport",
  max = 5,
}: PassportPickerProps) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const byCode = useMemo(() => new Map(passports.map((passport) => [passport.code, passport])), [passports]);
  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return passports
      .filter(
        (passport) =>
          !selected.includes(passport.code) &&
          (!needle || passport.name.toLowerCase().includes(needle) || passport.code.toLowerCase().includes(needle)),
      )
      .slice(0, 8);
  }, [passports, query, selected]);

  const add = (code: string) => {
    if (selected.length >= max || selected.includes(code)) return;
    onChange([...selected, code]);
    setQuery("");
    setOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="passport-picker">
      {selected.length > 0 && (
        <div className="passport-picker__selected" aria-label="Selected passports">
          {selected.map((code) => {
            const passport = byCode.get(code);
            return (
              <span className="passport-chip" key={code}>
                <span className={`fi fi-${code.toLowerCase()}`} aria-hidden="true" />
                {passport?.name ?? code}
                <button
                  type="button"
                  onClick={() => onChange(selected.filter((selectedCode) => selectedCode !== code))}
                  aria-label={`Remove ${passport?.name ?? code}`}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className="passport-picker__field">
        <Search size={18} aria-hidden="true" />
        <label className="sr-only" htmlFor={inputId}>
          {label}
        </label>
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={open && suggestions[activeIndex] ? `${listId}-${suggestions[activeIndex].code}` : undefined}
          autoComplete="off"
          value={query}
          disabled={selected.length >= max}
          placeholder={selected.length >= max ? `${max} passports selected` : label}
          onFocus={() => {
            setOpen(true);
            setActiveIndex(0);
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => Math.max(current - 1, 0));
            }
            if (event.key === "Enter" && suggestions[activeIndex]) {
              event.preventDefault();
              add(suggestions[activeIndex].code);
            }
            if (event.key === "Escape") setOpen(false);
          }}
        />
      </div>
      {open && selected.length < max && suggestions.length > 0 && (
        <div className="passport-picker__menu" id={listId} role="listbox">
          {suggestions.map((passport, index) => (
            <button
              id={`${listId}-${passport.code}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              tabIndex={-1}
              key={passport.code}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => add(passport.code)}
            >
              <span className={`fi fi-${passport.code.toLowerCase()}`} aria-hidden="true" />
              <span>
                <strong>{passport.name}</strong>
                <small>#{passport.rank} · {passport.mobilityScore} destinations</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
