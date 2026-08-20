export const DATASET_CREATOR = {
  "@type": "Organization",
  "@id": "https://multipassrank.com/#organization",
  name: "MultiPass Rank",
  url: "https://multipassrank.com/",
} as const;

export const DATASET_LICENSE = {
  "@type": "CreativeWork",
  name: "MultiPass Rank Evidence Metadata License 1.0",
  url: "https://multipassrank.com/data-license",
} as const;

export const DATASET_CATALOG = {
  "@type": "DataCatalog",
  name: "MultiPass Rank passport access catalog",
  url: "https://multipassrank.com/destinations",
} as const;

export function datasetMetadata(url: string) {
  return {
    url,
    creator: DATASET_CREATOR,
    publisher: DATASET_CREATOR,
    license: DATASET_LICENSE,
    includedInDataCatalog: DATASET_CATALOG,
    isAccessibleForFree: true,
  };
}
