# Independent ranks 21–40 indicator review

Reviewer: `/root/review_pass412`. Source retrieval and review: 2026-09-22.

Initial decision: HOLD pending correction of UNDP raw-payload hashing. No approval JSON has been issued at this stage.

## Independent checks completed

- Re-fetched the exact three candidate payload URLs: the UNDP HDR25 composite time-series CSV, the complete World Bank SP.DYN.LE00.IN 2020–2026 response, and the complete World Bank geography registry. No author-provided payload or importer parser was used as the verification authority.
- Parsed the downloaded UNDP bytes independently with Ruby's standard CSV library using Windows-1252 to UTF-8 decoding. Parsed the World Bank payloads independently with Ruby JSON. The CSV has 206 rows and the latest HDI column is `hdi_2023`. The WDI response contains all 1,590 rows in its single declared page, with `lastupdated` 2026-07-13. The registry contains all 295 rows in its single declared page.
- Compared **every one of the 146 outcomes** against its provider value, period and entity name, not a sample. All 140 populated values match exactly at native precision: HDI year 2023 and life expectancy year 2024. Provider spellings, including differing Hong Kong and Caribbean names between datasets, match.
- Cross-checked all ISO2/ISO3 mappings against the World Bank registry and ruled out aggregate-region entities. The 73 requested geographies equal the union of the frozen 47-country first cohort, 25-country new cohort and retained India.
- Confirmed all six explicit missing outcomes: Monaco has a UNDP row but no 2023 HDI; Macao has no HDI row but has separate World Bank life expectancy; Vatican City and Taiwan have neither a matching UNDP observation nor an entry in the complete checked World Bank registry/series. Their names are accurately qualified as requested geographies, not claimed publisher entries. No mainland, neighbouring-country or regional substitution occurs.

## Provenance issue reported to the author

The freshly downloaded UNDP CSV is 2,001,263 bytes. Its raw-byte SHA-256 is `61ed82e5b66c88dfca8ff9fac775c63981ecab6a254862af97acacc41c143117`, but the initial candidate stores `676dd227ec1826642283cfc4172b50084f85fcc3004eb1bc5715a3503871593a`. The latter is reproducibly the hash after `response.text()` replaces invalid UTF-8 bytes and the string is encoded again. A UTF-8-strict independent CSV read fails at line 46. Explicit Windows-1252 decoding parses the original file without replacement characters. None of the selected values/names differ, but the raw source hash must not describe a decoded derivative.

The World Bank series raw hash already matches: `19be3c9b22cbba7a453233aa0f98f86f0ca1437667a57e91e899d9d43e8a5784`. The registry raw hash already matches: `d29d57f8adf954c5e2a1520a02fb2c7b45575d8db3bd327a9dff47d66914231c`.

Requested correction: hash raw response bytes before decoding; explicitly handle the CSV encoding; regenerate only the new candidate. Preserve historical approved bytes. Final exact-byte approval requires re-reading the corrected candidate.

## Editions and reuse terms checked

- [UNDP documentation/downloads](https://hdr.undp.org/data-center/documentation-and-downloads) still links the exact HDR2025 CSV and states 1990–2023 coverage. The 2026 report is presented as forthcoming, not used to invent a newer observation year.
- [UNDP terms](https://hdr.undp.org/terms-use) specify CC BY 3.0 IGO, appropriate attribution, identifying modifications and no implied endorsement; the candidate identifies selection and display rounding. The licence link and attribution must remain visible in published representations. Latest-data and recalculated-series cautions remain applicable.
- [World Bank indicator page](https://data.worldbank.org/indicator/SP.DYN.LE00.IN) explicitly labels the series CC BY 4.0 and attributes the UN World Population Prospects, national statistical offices and Eurostat; the candidate retains those providers. [Summary terms](https://data.worldbank.org/summary-terms-of-use) permit reuse with attribution and the additional World Bank terms. The linked general terms redirect to the World Bank's current legal page, which preserves the distinction between dataset-specific terms and other website content; this review does not generalise the data licence to arbitrary website materials.

No application artifact, original candidate, historic approval or production data was edited by this reviewer.
