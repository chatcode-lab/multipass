# Pass 413 — Brazil to French Guiana live-drift research

Researcher: `/root/top20_korea_finland`. Actual research date: 22 September 2026. Scope: exactly BR → GF, ordinary non-commercial short visitors. This is an author candidate; independent approval is required before publication.

Candidate SHA-256: `1271f3c5bc152fe96ce17676ad642f0eddb51dbba43af8d9da892c70e5087dd0`.

## Result

The current evidence supports **temporary visa-free access**, not the bundled prior-visa default and not a permanent exemption. The new [order of 31 July 2026](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054594286), NOR INTV2619705A, expressly derogates from Annex II of the 2011 overseas order for Brazilian ordinary-passport holders. Article 1 supplies **30 days in any 180-day period**; Article 2 supplies a **six-month term from 31 July 2026**. The [prefecture's actual operational notice](https://www.guyane.gouv.fr/Actions-de-l-Etat/Cooperation/Cooperation-transfrontaliere-France-Bresil/Entree-en-Guyane-fin-de-l-obligation-de-visa-de-court-sejour-pour-les-Bresiliens) supplies the named endpoint, **31 January 2027**, in both French and Portuguese.

The general trial exemption is not biometric-, tour-, Amapá-residence-, frontier-card- or third-country-document-qualified. Ordinary admission evidence still applies. The prefecture excludes commercial activity. The profile remains visitor-scoped; it does not turn work, settlement, studies or longer travel into visa-free rights. No electronic authorisation or arrival-issued visa is established or needed to normalize this specific visitor waiver.

## Instructions, packet and repository state

Read CONTRIBUTING.md, the evidence-model handoff, the research playbook's main workflow and relevant French-overseas pass records, the complete JSON candidate schema, the validator's actual shape/conflict logic, and the prior French-overseas complement candidate before authoring. Ran the read-only expiry report; it listed no existing BR → GF temporary record.

The parent added the exact queue entry; this researcher did not edit it. The generated packet identifies:

- Batch `pass413-french-guiana-brazil-live-drift-2026`, priority 982, passport BR and destination GF only.
- Bundled version `fallback-2026-08-26T05-08-41-773Z`, checked at `2026-08-26T05:08:41.773Z`.
- Bundled hypothesis `visa_required`.
- Existing policy `french-guiana-ordinary-passport-advance-visa-complement`, which includes BR and records the older conditional exceptions.

The parent's separately observed live snapshot says `visa_free` / unverified. This researcher treats that as a drift report, not independent immigration evidence, and does not invent a live-fetch timestamp. The candidate conflict uses the bundled `visa_required` exactly as required by the validator. The live category is consistent with the new temporary rule but says nothing about duration, expiry or evidence sufficiency.

## Actual source reading and reproducible access

1. **New JORF order.** Opened and read the whole actual official HTML: audience/object/entry-into-force notice, legal preamble, Articles 1–3 and signature/publication metadata. JORF 178 of 1 August 2026, text 6. Article 1 names ordinary Brazilian passports and an explicit derogation; this is not an inference from omission in a nationality list. The authenticated-PDF link returned an unrelated Légifrance HTML body in the web tool, so no PDF reading is claimed. The operative official HTML itself was accessible.
2. **Current consolidated new order.** Also read the actual [consolidated text](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000054594286/) in full. Its visible current-version date was 20 September 2026 and its last-data-update/article-version labels were 2 August 2026. Its substantive Articles 1–3 match the original order. The date-specific 22 September URL failed in the web tool; it was not counted as a successful read.
3. **Prefecture operational notice.** Web extraction returned 502. Ordinary Node HTTPS fetched the actual public site index with status 200 and exposed the linked notice. Standard unmodified Playwright Chromium, `page.goto(url, { waitUntil: 'networkidle' })`, returned 200 for the notice; `page.locator('main').innerText()` exposed the complete French and Portuguese body. Both language versions were read. The page is updated 29 July 2026. No challenge manipulation, stealth, login or exported cookies were used.
4. **Underlying Annex II.** Read the actual current Brazil row of [Annex II](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000051759462), version since 19 June 2025, together with its heading and surrounding rows. It excludes ordinary Brazilian passports from the general Guyane waiver except for the expressly described organised travel, air stopover, local frontier and emergency-team routes. The July 2026 autonomous order overrides this row for the trial's short-visitor scope without rewriting the underlying annex. A current-looking annex alone therefore misses the new rule.
5. **France-Visas framework.** Read the actual [overseas short-stay section](https://www.france-visas.gouv.fr/en/visa-de-court-sejour), including territory-specific ministerial orders, residence-permit/long-stay-visa exemptions and the distinction from a generic Schengen short-stay visa. No Schengen rule is transferred to GF. The Brazil country-page URLs returned no operative Guyane text in the available web extraction; search previews of their older prior-visa wording are not treated as a read source or as a competing current rule.
6. **Underlying general visa obligation, supplemental post-expiry check.** Followed the new order's link to the actual [consolidated 2011 order](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000024403998) and read Articles 1–6 and the Brazil row. Article 1(1)(b) requires a valid visa when Annex II requires it; Article 3 applies the annex's exemptions within their limits and permits exceptional transit admission. Article 6's exceptional compelling/unforeseeable border issuance is not an ordinary visa-on-arrival route. Thus a non-exempt independent visitor's underlying prior-visa default is explicitly sourced, not inferred from list omission. Nevertheless the old ordinary-tour and other conditional routes prevent this research from automatically endorsing a future single rank-grade status for every Brazilian ordinary visitor after the trial. This supplementary text is not used to create a second candidate policy.

Commercial pages, a government-hosted press digest quoting news coverage, and Brazilian public-broadcaster reporting were discovery aids only. None is a candidate source or substitutes for the French legal and prefectural text. Separate Brazilian-side corroboration was not needed after those direct destination authorities were actually read.

## Timing and numerical precision

- **Start:** the initial order's notice and operative Article 2 say 31 July 2026; the prefecture says the same. `effectiveFrom` follows that express statement. The 1 August JORF publication and 2 August consolidated metadata are recorded separately, not silently equated. This historical distinction does not cast doubt on applicability on the September research date.
- **End:** the statute gives six months, without an explicit calendar endpoint. The prefecture expressly names 31 January 2027 in both languages. `effectiveTo` uses that date under the repository's inclusive-end convention; it is not a calculation choosing 30 versus 31 January. The candidate preserves the literal six-month term as well. No automatic renewal is claimed.
- **Stay:** Article 1 says a stay not exceeding 30 days during any 180-day period. The prefecture's opening paragraph agrees; its later informal phrase “less than 30” is not used to cut the statutory limit to 29 days. The six-month trial is not an allowed stay.
- **Longer travel:** the prefecture broadly calls travel beyond 30 days a long-stay-visa case. The candidate deliberately does not generalize that visa-type label or resolve the 31–90-day classification; it only says the trial does not establish that longer permission.

## Historical exceptions and admission requirements

The older Brazil row describes trips shorter than fifteen days arranged through a Guyane-registered operator or its partner, specified air stopovers up to three days with an onward ticket, a local frontier-card route for eligible Oiapoque residents limited to 72 consecutive hours in the defined Saint-Georges area, and emergency-team missions with advance notification/documentation. These are not prerequisites for the new general trial waiver. They must be re-examined, together with any successor instrument, before claiming a post-trial baseline.

The prefecture requires passport validity/document-space/issuance-age conditions, medical insurance, financial guarantees varying with accommodation and yellow-fever proof. It directs land and Saint-Georges river arrivals to the bridge checkpoint. These standard admission conditions do not transform the ordinary tourist cohort into a biometric or supporting-visa split. Vehicle insurance, customs allowances and checkpoint hours were read but omitted from this narrow visa profile.

## Promotion and expiry handoff — no edits performed here

The proposed correction is exactly BR → GF to `visa_free`, bounded by the reviewed July 2026–January 2027 window. The existing broad prior-visa policy must be reconciled by the authorized publisher so it does not simultaneously characterize the trial as prior-visa access. Do not rewrite the other passports in that policy or erase its source history. The new order is a temporary derogation, not evidence that the annex was repealed.

No automatic `visa_required` assertion after expiry is proposed. A safe publisher must recheck the applicable instruments and special routes before the trial ends, and must not let the temporary waiver silently become indefinite. Exact expiry handling and the old-policy coexistence are integration tasks for the parent, not changes made by this author.

The candidate has one supported policy, one bundled conflict, no conditional records and no unresolved pair. That partition is justified because all ordinary Brazilian passports in the bounded non-commercial short-visitor cohort qualify during the trial; the old route/document exceptions no longer divide that cohort. Application for a longer/different purpose remains outside this policy.

## Proposed queue entry

The parent has already installed the correctly scoped entry. The suggested additional source hint is the prefecture URL above, which explicitly resolves the calendar endpoint. No further queue change is required for candidate validation.

## Validation

`npm run --silent evidence:validate -- research/visa-evidence/pass413-french-guiana-brazil-live-drift-2026.candidate.json --exact` passed: four sources, one policy, zero conditional records, one conflict and zero unresolved. The exact final candidate hash is recorded above and was sent to the independent reviewer. Passing structural validation is not independent approval. No queue, canonical evidence, access override, bundled snapshot, deployment or commit was edited by this researcher.

Independent review requested one wording correction: medical insurance must cover the whole stay for **at least** EUR 30,000, matching the Portuguese prefecture text's explicit minimum. Only that candidate phrase changed; all other claims and dates remain unchanged. The consolidated page's 20 September visible-date observation above records the author's actual response, not static metadata; the reviewer subsequently observed 22 September with unchanged operative articles.
