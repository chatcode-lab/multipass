# Pass 414: Bosnia and Herzegovina seasonal endpoint

Researcher: `/root/top20_italy_spain`. Actual source reads: 22 September 2026. Scope: only BH→BA, OM→BA and SA→BA, ordinary passport-only visitor access. This is an author candidate, not independent approval or travel advice.

## Outcome and exact scope

The current waiver remains supported from 1 June through 30 September 2026. The maximum is **60 days in aggregate within that fixed window**, not 60 days per entry, a rolling allowance, or permission to stay beyond 30 September. All three current MFA country pages expressly require a visa for stays after 30 September 2026. The proposed prior-visa baseline from 1 October is therefore directly supported, not inferred from an expired waiver or an omitted nationality.

The candidate has four sources and two non-overlapping temporal policies covering the same three exact cells. Its three conflict records describe only the prospective difference after the seasonal endpoint; none alleges that the current 22 September visa-free classification is wrong. It does not decide third-country-document, residence, special-passport or individual exceptional routes. The Saudi page's diplomatic/official exemption is kept outside ordinary-passport scope.

## Actual reads and operative locators

1. [Gazette 37/26, Decision 87/26](https://sluzbenilist.ba/page/akt/Wi2t0dd7Lq4%3D): complete public operative text read through the signature. Article 1 replaces Article 19a: paragraph (1) names all three ordinary-passport cohorts and the precise 2026 dates; paragraph (2) sets the aggregate 60-day maximum. Article 2 makes the decision effective on adoption. The adoption/signature date is 15 April 2026, distinct from the 1 June travel-window start. No date of Gazette publication was guessed.
2. [MFA Bahrain result](https://www.mvp.gov.ba/en/org_cmd57sdlc000nn43u2rk8pgsd_639185064814075651): read the entire rendered body. The inbound paragraph immediately after the outbound BiH-citizen visa table says Bahraini nationals need a visa and identifies issuance by the BiH embassy in Abu Dhabi. The NOTE gives the ordinary-passport seasonal exception, total stay and final express post-30-September-2026 visa requirement. Later Bahrain travel advisories concern outbound BiH travellers and are not applied to entry into BiH.
3. [MFA Oman result](https://www.mvp.gov.ba/en/org_cmd57sdlc000nn43u2rk8pgsd_639185066739711338): entire rendered body read. The inbound paragraph identifies the normal visa requirement and BiH embassy in Riyadh. Its NOTE expressly gives the same 2026 ordinary-passport window, aggregate maximum, last permissible seasonal stay date and subsequent visa requirement. The outbound table's arrival-visa reference is not an inbound Omani route.
4. [MFA Saudi Arabia result](https://www.mvp.gov.ba/en/org_cmd57sdlc000nn43u2rk8pgsd_639185068629890721): entire rendered body read. The inbound paragraph and NOTE give the ordinary-passport baseline, 2026 exemption, aggregate maximum, seasonal endpoint and subsequent visa requirement. The final diplomatic/official-passport paragraph is a separate exemption. The outbound BiH-citizen table is not used.

The three exact result slugs were discovered in the public data of the [current Ministry visa selector](https://www.mvp.gov.ba/en/vize), not guessed from other nationalities. That selector and every retained result were retrieved using ordinary `curl -L --fail` with normal certificate validation. The web reader failed on these URLs; Node HTTPS, including its system-CA option, failed the leaf-chain verification. No insecure TLS flag, custom trust, alternate authentication, proxy or anti-bot bypass was used. Curl succeeded and supplied the actual complete HTML. Gazette text was read directly with the web reader.

## Bounded currentness search and limitations

Destination-domain discovery searched `sluzbenilist.ba`, `mvp.gov.ba` and `vijeceministara.gov.ba` for the three nationalities, visas, 2026 and possible September/October extensions. No newer operative extension or withdrawal was established. This is not an assertion that exhaustive searching proves none exists.

The [Council's 108th-session release](https://vijeceministara.gov.ba/bs/portal/objava/odrzana-108-sjednica-vijeca-ministara-bosne-i-hercegovine-1776260742123), dated 15 April 2026, was actually opened: its Gulf-tourist section independently agrees with the current Gazette's 2026 window and aggregate stay. It is supplementary, not needed as a fifth candidate source.

An actual-read [22 April 2025 MFA announcement](https://www.mvp.gov.ba/en/portal/post/usvojena-odluka-o-ukidanju-viza-za-drzavljane-kraljevine-saudijske-arabije-sultanata-oman-i-kraljevine-bahrein-od-1-lipnja-do-30-rujna-638809429310000000) described a recurring seasonal arrangement until changed. It is not a basis to invent a 2027 renewal: Gazette 37/26 expressly replaces Article 19a with a fixed 2026 window, and the current individual MFA results expressly require visas after its endpoint. Search results for old 2025 notices and a Saudi diplomatic/special/official treaty were not substituted for current ordinary-passport evidence.

The Border Police FAQ landing page was opened but contains a group selector rather than operative entry text; it is not a cited source. No new general entry, supporting-document exception or post-season stay length is asserted from that page.

## Snapshots and integration handoff

The generated packet uses bundled version `fallback-2026-08-26T05-08-41-773Z`, checkedAt `2026-08-26T05:08:41.773Z`. All three scoped cells are visa-free. Normal public live API reads on 22 September also returned visa-free/exact, checkedAt `2026-09-18T03:06:00.204Z`, the existing seasonal policy ending 30 September, and empty structured allowed-stay arrays. Neither dataset was used as proof.

Root may promote only after independent source approval. The old `bosnia-direct-gulf-ordinary-passports-temporary-visa-free-2026` artifact record and its 21 August review date must remain immutable. The new seasonal policy is an exact-cohort refresh with a useful structured stay; if promoted, deduplicate the equivalent old current timeline policy only in the exported projection. The new future policy is substantive new post-season evidence. No canonical file, override, snapshot or publication was edited by this researcher.

Validation: `evidence:validate -- <candidate> --exact` passes. Independently checked scope is exactly the three assigned cells with no date overlap between the seasonal and successor policies. Every registered source has one literal excerpt of at most 25 words; notes do not add quotations.

Final candidate SHA-256: `58ab6e962f63787fa5c6c9889eb15623fbc0afcb41ea4b7eec20ca1a07365c56`.
