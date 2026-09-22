# Pass 413 French Guiana: independent source review

Reviewer: `/root/review_pass412`. Reviewed: 22 September 2026.

## Decision: APPROVE

Exact candidate SHA-256: `1271f3c5bc152fe96ce17676ad642f0eddb51dbba43af8d9da892c70e5087dd0`.

Approval covers only BR → GF ordinary, non-commercial short visitors during the temporary waiver: up to 30 days in any 180-day period, from 31 July 2026 through 31 January 2027 inclusive. It does not approve a renewal, permanent exemption or an automatic blanket visa-required classification after expiry. Integration and release remain separate gates.

## Every registered authority independently read

1. [Initial order of 31 July 2026](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054594286): read the actual official HTML notice, preamble, Articles 1–3 and publication/signature metadata. Article 1 expressly derogates from the underlying annex for ordinary Brazilian passports, with a 30-in-180 limit; Article 2 supplies a six-month term beginning 31 July. The 1 August publication date is not confused with that express operational date.
2. [French Guiana prefecture notice](https://www.guyane.gouv.fr/Actions-de-l-Etat/Cooperation/Cooperation-transfrontaliere-France-Bresil/Entree-en-Guyane-fin-de-l-obligation-de-visa-de-court-sejour-pour-les-Bresiliens): independently retrieved with ordinary unmodified Chromium, HTTP 200, and read the full French and Portuguese main body. Both language versions expressly give 31 January 2027 as the endpoint; the date is not inferred by converting months to days. The passport, insurance, financial-guarantee, yellow-fever, non-commercial and border-checkpoint conditions match the candidate. Only this paragraph's operative visa/admission content is relied upon; its informal classification of all travel beyond 30 days as long-stay is not imported into the candidate.
3. [Current posted Annex II](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000051759462): read the heading, version date, Brazil row and all its exceptions. The pre-existing organised-travel, limited air-stopover, local frontier-card and emergency-team routes do not become prerequisites for the new general temporary concession. This annex is subject to the later autonomous derogation; it cannot alone establish the current trial category or a uniform post-trial outcome.
4. [France-Visas overseas short-stay framework](https://www.france-visas.gouv.fr/en/visa-de-court-sejour): read the actual overseas section and qualifying document exemptions. Territorial ministerial orders, not generic Schengen admission, determine this nationality route. The candidate does not require a supporting foreign visa or residence permit for the trial.

Also independently read the [consolidated new order](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000054594286/). Its current header on this read is 22 September 2026, with article-version metadata beginning 2 August. The operative six-month start remains 31 July; the candidate accurately preserves this distinction. No search snippet or failed PDF response was counted as a source read.

## Correction and exact-byte checks

Requested one precision correction: insurance coverage must be **at least** EUR 30,000 for the whole stay. The Portuguese prefecture text expressly establishes a minimum; the author's original wording could be mistaken for an upper limit. Independently confirmed the corrected wording and hash; reversing only that substitution restores the original reviewed hash `e9749bbabec243727b6e9cbc2ab5067f6601641424b67c62cd7316281f53aa67`, proving the final candidate contains no unrelated change.

All four stored excerpts are literal after HTML whitespace normalization and contain 11, 11, 11 and 12 words. Exact validation passes: four sources, one policy, one bundled fallback conflict and no unresolved pair. The statutory inclusive 30-day limit controls over the prefecture's later informal less-than-30 shorthand. The policy term, permitted stay and passport validity are separate quantities.

## Integration requirements

The old broad prior-visa policy may be split into an untouched remaining cohort and a dated historical BR subcohort without altering its original sources or review dates. The temporary policy must cease to provide current verification and allowed stay after 31 January 2027. A narrow post-expiry unknown hold is appropriate pending a reviewed successor, including when a patched fallback or stale live feed still says visa-free. Do not let the fallback or cached combination results silently extend the trial or restore an unreviewed uniform prior-visa rule. Boundary and downstream integration tests are required separately.

This reviewer changed no candidate, canonical evidence, access override, fallback, application code or deployment state.
