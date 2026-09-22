# Raw-byte indicator collection correction

Author `/root`, 22 September 2026. This is a new candidate requiring its own independent approval; no historical approved artifact has been rewritten.

Scope, official catalogue/terms reads and geography checks are in `ranks21-40-indicators-2026-09-22.notes.md`. Independent reviewer `/root/review_pass412` caught the initial collector's lossy `response.text()` UTF-8 decoding of a Windows-1252 UNDP CSV. The collector now downloads byte arrays, hashes those original bytes, and separately decodes the CSV as Windows-1252 and JSON as fatal UTF-8. The encoding is explicit in source metadata. The World Bank registry checksum also covers original bytes.

Recollected using `npx tsx scripts/collect-country-indicators.ts --top40 --output=ranks21-40-indicators-raw-2026-09-22`. The corrected raw UNDP SHA-256 is `61ed82e5b66c88dfca8ff9fac775c63981ecab6a254862af97acacc41c143117`. The 73 mappings, 146 outcomes, 140 numbers and six explicit unavailable outcomes remain the proposed scope. Check the exact replacement candidate rather than transferring approval from a previous hash. This revision changes provenance, not rankings, legal claims or statistical observation years.
