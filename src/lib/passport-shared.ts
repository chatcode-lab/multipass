import type { AccessStatus } from "./types";

const COUNTRY_NAME_OVERRIDES: Partial<Record<string, string>> = {
  // The upstream feed briefly switched ISO NR to its Nauruan endonym,
  // "Naoero". Keep the English product name and public URLs stable.
  NR: "Nauru",
};

export const STATUS_META: Record<
  AccessStatus,
  { label: string; shortLabel: string; description: string }
> = {
  citizenship: {
    label: "Citizenship",
    shortLabel: "Home",
    description: "Right of entry as a citizen",
  },
  visa_free: {
    label: "Visa-free",
    shortLabel: "Free",
    description: "No visa required before travel",
  },
  eta: {
    label: "ETA",
    shortLabel: "ETA",
    description: "Advance electronic permission for visa-exempt travel",
  },
  visa_on_arrival: {
    label: "Visa on arrival",
    shortLabel: "VOA",
    description: "Visa available at the border or airport",
  },
  evisa: {
    label: "eVisa",
    shortLabel: "eVisa",
    description: "A visa applied for and issued electronically before travel",
  },
  visa_required: {
    label: "Visa required",
    shortLabel: "Visa",
    description: "Traditional visa required before travel",
  },
  entry_restricted: {
    label: "Entry restricted",
    shortLabel: "Restricted",
    description: "Ordinary visitor entry is prohibited or currently suspended",
  },
  unknown: {
    label: "Unknown",
    shortLabel: "—",
    description: "No validated access record is available",
  },
};

export const ACCESS_EASE_WEIGHT: Record<AccessStatus, number> = {
  citizenship: 5,
  visa_free: 5,
  eta: 4,
  visa_on_arrival: 3,
  evisa: 2,
  visa_required: 1,
  entry_restricted: 0,
  unknown: -1,
};

export function canonicalCountryName(code: string, value: string): string {
  return COUNTRY_NAME_OVERRIDES[code.trim().toUpperCase()] ?? value.trim();
}

export function slugifyCountry(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
