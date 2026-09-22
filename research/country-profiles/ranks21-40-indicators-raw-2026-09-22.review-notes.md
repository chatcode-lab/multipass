# Independent approval of raw-hash indicator replacement

Decision: APPROVE. Reviewer `/root/review_pass412`, 2026-09-22, recheck by 2026-12-21.

Exact candidate SHA-256: `39a387a50a2aabd1d22f731ee6cac6f5c5ca947272add45f874774511443a18c`.

The full independent provider/terms/mapping/value review is recorded in [the initial review notes](ranks21-40-indicators-2026-09-22.review-notes.md). The initial candidate was correctly held for hashing a UTF-8-decoded derivative of a Windows-1252 CSV rather than its original bytes; it was not approved retrospectively.

For this new immutable replacement I read the new candidate and current schema, compared its entire observations array byte-for-byte as JSON with the 146 independently verified outcomes, and checked each source hash against the separately downloaded original payloads. All 146 outcomes are unchanged, and the raw UNDP hash is now correct. Its explicit Windows-1252 encoding agrees with the independent Ruby CSV parse; World Bank JSON is UTF-8. The World Bank registry hash also remains exact.

Verified counts: 73 requested statistical geographies, 146 collection outcomes, 140 native numerical values and six source-specific missing outcomes. The two frozen cohorts and India are retained. This is collection completeness, not 146 populated values or new visa verification. No unreported Vatican/Taiwan/Macao/Monaco measurement is replaced by a parent-country or regional aggregate.

Licences, original data-provider attribution, actual observation years and retrieval dates remain separate and unchanged. This review approves the new candidate's exact bytes, not the publication code, deployment or broader legal-profile research. No historical candidate or approval was edited.
