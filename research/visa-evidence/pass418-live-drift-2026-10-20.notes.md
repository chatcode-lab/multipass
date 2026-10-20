# Pass 418 production snapshot reconciliation

Observed through normal public requests on 20 October 2026, after the reviewed release. This is a discovery/consistency audit, not fresh legal verification.

The bundled fallback is the dated 26 August snapshot, while production serves live version `2026-10-14T02-06-00-474Z`, checked `2026-10-18T03:05:36.335Z`. Date-aware normalization uses 20 October for both. Seven regional status API responses expose 185 differences in current categories; none is one of this pass's Montenegro/Russia relationships. Comparing each differing pair against the same bundled evidence accounts for exactly forty fewer exact relationships and thirty-two fewer supported stays on live data.

| Destination | Category differences | Fewer exact relationships | Fewer supported stays | Exact-evidence follow-up |
| --- | ---: | ---: | ---: | --- |
| Thailand | 33 | 33 | 32 | MC, AD, SM, MX, UY, CR, SC, PA, PY, TT, DM, GT, SV, CO, TO, AL, VE, EC, XK, NR, JM, BO, PG, AZ, DO, NA, AM, MA, TN, KG, UZ, CU, LK |
| Chad | 144 | 1 | 0 | PS: prior visa → upstream eVisa |
| Morocco | 1 | 1 | 0 | AL: prior visa → upstream visa-free |
| Tanzania | 1 | 1 | 0 | NG: eVisa → upstream visa on arrival |
| Anguilla | 1 | 1 | 0 | TW: eVisa → upstream visa-free |
| Israel | 1 | 1 | 0 | CO: prior visa → upstream visa-free |
| Solomon Islands | 4 | 2 | 0 | CO and PS: prior visa → upstream eVisa |

Most of Chad's 144 changes were already unsupported in the bundled matrix; do not count them as 144 newly lost verified relationships. All 185 changed live categories currently lack exact supporting evidence. Neither the upstream value nor the prior evidence alone establishes a new legal rule. The status and indexing safeguards correctly avoid labeling those categories exact or including their bare unsupported relationship pages in the sitemap.

The live matrix is **40,898 / 44,974 (90.9%)**, with **4,076** not exact and **4,394** stay-covered. Bundled tests remain **40,938 / 44,974 (91.0%)**, with **4,036** not exact and **4,426** stay-covered. Both have 1,142 characterized, 244 fresh and zero stale; live has 40,654 old versus bundled 40,694. These are different snapshot populations, not a failed deployment or a forty-cell regression caused by this release.

Normal sitemap responses contain eight successful shards, **42,665 unique live URLs** and a 20 October modification date, compared with **42,705** on the bundled preview. The forty-URL difference matches the forty exact-evidence losses. The current ME → RU visa-free canonical is included; its premature visa variant and the three expired Cambodia visa-free URLs are absent. No cache-busting parameter, forced source refresh, KV mutation or cache purge was used.

## Next bounded source work

Prioritize queued batch `pass419-thailand-live-drift-2026`. Read any adopted Gazette successor and its actual commencement, rather than treating the previous Cabinet announcement or upstream changes as adoption. Preserve historical policy and stay scope. The other seven exact-evidence discrepancies can be researched in destination-specific batches using the earlier source links below as leads, not freshly verified proof:

- PS → TD: destination Chadian entry/eVisa authority; the older issuer-side lead is `https://www.mofa.pna.ps/portals/0/ENGLISHVISAREGULATIONS2026.pdf`.
- AL → MA: `https://www.acces-maroc.ma/` and the destination's operative ordinary-passport schedule.
- NG → TZ: `https://visa.immigration.go.tz/guidelines` and `https://www.immigration.go.tz/index.php/entry-requirements`.
- TW → AI: `https://evisa.gov.ai/Countries` and `https://evisa.gov.ai/Applications/Apply`.
- CO → IL: `https://israel-entry.piba.gov.il/api/getalldata`, the current population authority nationality schedule and visa process.
- CO/PS → SB: current Solomon Islands immigration/eVisa authority; issuer-side schedule PDFs are discovery only until destination confirmation is obtained.

No new legal conclusion, override or source-review date is created from this audit. The live state provides the next research targets.
