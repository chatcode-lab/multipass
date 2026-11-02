# Pass 419: Albanian ordinary visitors to Morocco

Researcher: `/root/pass419_exceptions`. Actual research date: 2 November 2026. Exact scope: AL → MA only. No canonical data, queue, application code or deployment files were edited.

## Result

Unresolved under the repository's destination-confirmation gate. The strongest recovered lead is the Albanian Ministry's positive report that Morocco's Embassy notified it of a short-stay waiver beginning 15 August 2026. This is materially stronger than an unsourced upstream label, but the actual Moroccan notification and a current destination ordinary-passport schedule were not recovered. No rank-grade waiver, prior-visa revalidation or numeric stay is proposed.

## Actual source read

[Albanian MFA announcement](https://punetejashtme.gov.al/en/newsroom/maroku-heq-regjimin-e-vizave-per-shtetasit-shqiptare-per-qendrime-afatshkurtra/) was opened and read in full. Visible date: 14 August 2026. The operative paragraph attributes the notification to Morocco's Embassy accredited to Albania and based in Rome; the next sentence expressly gives 15 August commencement. The reference to a 1 March 2025 joint declaration is not itself the waiver's effective date. No ninety-day stay or complete ordinary-document qualifier is printed.

## Destination retrieval limits

- The [French Moroccan consular exemption schedule](https://www.consulat.ma/fr/liste-des-pays-dont-les-ressortissants-sont-dispenses-du-visa-dentree-au-maroc) returned a short `Request Rejected` body through the web reader, normal trusted curl and ordinary Chromium. The normal browser request returned HTTP 200 but no country schedule. A successful status code is not a substantive read.
- The corresponding English exemption-list path, with and without `www`, returned the same rejected body through curl. No anti-bot workaround or TLS bypass was attempted.
- The formerly cited public API `https://api.acces-maroc.ma/evisa-api/api/conditionEvise/recherche/fr` now returns 404 to an ordinary Node HTTPS GET. The fact that it previously supported a condition query is not a fresh nationality determination.
- [Acces Maroc root](https://www.acces-maroc.ma/) exposes untranslated template/select placeholders to the reader, not an actual Albanian decision. The older official eVisa briefing remains downloadable, but its generic conditioned categories do not establish the newly announced Albanian waiver or the contrary prior-visa baseline. Its PDF body was not re-read and is not a retained fresh source.
- Searches of destination `consulat.ma`, `diplomatie.ma` and `maroc.ma` did not recover a substantive Albanian current waiver instrument. Commercial `evisa.gvn.ma` search results are not a proven government authority and were excluded.

The two competing published labels must not be reconciled by guessing. The issuer announcement is a useful diplomatic lead to recover the actual Moroccan Embassy notification or responsible consular schedule.

## Validation handoff

Exact validation passes: one actually read issuer-government source, zero policies/conditional/conflicts and AL/MA unresolved exactly once. Candidate SHA-256: `b0badf7a1625439ea302db9e3803a086b92d2ce7adc484d09d487e578ae4dd0a`. This candidate documents the gap and positive lead; it does not approve current destination access or renew any separate review window.
