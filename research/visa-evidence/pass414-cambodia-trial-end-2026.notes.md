# Pass 414: Cambodia's Chinese-passport trial endpoint

Researcher: `/root/top20_korea_finland`.

Actual research date: 2026-09-22.

Scope: exactly CN, HK and MO ordinary passports → KH, ordinary tourist visits.

Candidate: `pass414-cambodia-trial-end-2026.candidate.json`

## Proposed result and boundary

Reconfirm the current temporary `visa_free` policy only for 2026-06-15 through 2026-10-15, with 14 days per entry, multiple entries and required e-Arrival completion. The destination's government publication expressly includes mainland China, Hong Kong and Macao, and travel originating in another country. Taiwan is expressly excluded and is outside this batch.

No extension or post-trial successor status has been established. In particular, the 20 August government publication records an extension **request**, not a decision. Neither reciprocal arrangements, tourism branding, old exemption-list omissions nor the continued availability of an application portal proves a successor. Do not infer `visa_free`, `visa_on_arrival`, `evisa` or `visa_required` for a new entry on or after 2026-10-16 from this candidate.

The schema has no separate temporal-unresolved object. All three pairs are terminally covered by the current dated policy, so the `unresolved` array is empty; the post-trial gap is explicitly retained in the policy conditions and these notes. Root owns any expiry safeguard. No canonical, queue, override, publication or deployment changes were made by this researcher.

The official announcement and launch report state the endpoint. Repository date semantics treat `effectiveTo` as inclusive. The sources do not explicitly determine the final departure date for someone entering immediately before the endpoint. Do not convert the programme endpoint into either an automatic departure obligation or guaranteed permission to remain for another fourteen days.

## Contracts and exact scope

Read the contribution instructions, visa-evidence model handoff, research playbook/source hierarchy, candidate schema and validation workflow, the existing-data triage dated 2026-09-22, and Pass 413 release notes. Read the old Cambodia candidate's relevant sources/policy only as historical context; its source review date is not refreshed.

`npm run --silent evidence:packet -- pass414-cambodia-trial-end-2026` resolved exactly CN/HK/MO → KH. The bundled snapshot `fallback-2026-08-26T05-08-41-773Z` labels all three `visa_free`, which agrees with the supported current trial. Accordingly, there are no snapshot conflicts. The snapshot was not used as proof.

The queue entry was added separately by `/root/top20_italy_spain`. This researcher wrote only this candidate and these notes.

## Retained sources actually read

1. [AKP: January Tourism Ministry announcement](https://akp.gov.kh/post/detail/359142), dated 16 January 2026. Actual complete HTML article read, especially the paragraphs following the dateline: passport coverage; any departure country; 14 days; 15 June–15 October; no visa application or fee; e-Arrival; multiple entries. The article expressly attributes the statement to the Ministry of Tourism and dates it 15 January. This is a fresh reading of a separate destination-government publication, not a claim that the original eVisa URL was retrieved.
2. [AKP: trial launch](https://akp.gov.kh/post/detail/373161), dated 15 June 2026. Actual complete article read. Opening paragraph confirms implementation on that day through 15 October; the next operative paragraph expressly says up to 14 days per visit and multiple entries/exits. Tourism Minister's launch remarks are identified in the following paragraph.
3. [PRC Embassy in Cambodia: consular reminder](https://kh.china-embassy.gov.cn/lsfws/lsbh/202606/t20260620_11949230.htm), dated 20 June 2026. Actual full notice read in Chinese. Opening paragraph expressly names ordinary PRC passports and confirms any departure country, trial dates, multiple entries and a single stay of no more than 14 days. The first travel-arrangements paragraph permits e-Arrival preparation within seven days before entry **or at immigration on arrival**. This is issuer corroboration of the destination-government publications, not the sole authority for the rule.
4. [Macao DSI: trial reminder](https://www.gcs.gov.mo/news/detail/en/N26FLLniYL), dated 12 June 2026. Actual article body read. It names Macau SAR Passport holders, cites the Cambodian Ministry announcement and confirms the exact dates and 14 days per single entry. It says e-Arrival must be completed prior to entry. Its final paragraph describes visa-on-arrival/eVisa availability **before the forthcoming trial**, not an express instruction for 16 October onward. No successor is derived from it.
5. [Hong Kong Immigration Department: HKSAR access PDF](https://www.immd.gov.hk/pdf/Visa-free%20Access%20or%20Visa-on-arrival%20for%20HKSAR%20passport%20list_Eng.pdf), heading updated 15 September 2026. Ordinary Node HTTPS returned actual `application/pdf`; PDFKit extracted the relevant text. PDF page 1 row 29 gives Cambodia 14 days; PDF page 7 Remark 8 attributes the June–October visa-free rule to Cambodia's Consulate General in Hong Kong. The general-reference and destination-confirmation caveats on PDF page 6 were read and retained in assessing this as corroboration. The PDF was reached from the actual official HTML page's download link, not a guessed document path. No other country's row was researched or published.
6. [AKP: Tourism Ministry/aviation meeting](https://akp.gov.kh/post/detail/378851), dated 20 August 2026. Actual full article read. The paragraph introducing two requests says they were raised by the private sector at the 4 August meeting. The next paragraph includes a request to extend the Chinese pilot to year-end. The rest of the article describes discussion and cooperation, not government adoption. This source is retained solely to document why the discovered extension language does not alter the expiry.

AKP officiality was separately corroborated by an actual read of its [3 December 2025 institutional annual-meeting report](https://akp.gov.kh/post/detail/354794), whose operative paragraph identifies AKP as Cambodia's state-owned news agency under the Ministry of Information. The retained policy sources are direct destination-government publications reproducing an identified Ministry statement and confirming launch, not commercial news reports. Their nature is disclosed rather than presented as a gazetted legal instrument.

The e-Arrival wording is deliberately limited to completion being required. The issuer notices differ in practical timing language. No advance approval, ETA, fee, universal seven-day deadline, processing guarantee or admission guarantee is invented.

## Failed and excluded retrievals

- `https://www.evisa.gov.kh/?vcode=-14`: web-reader redirect-loop error. Standard unmodified Playwright navigation returned an HTTP 200 browser-check/challenge page, not the announcement. No challenge manipulation or circumvention was used. Search-preview text was not evidence. The old source identifier and old review date remain untouched.
- `https://tourism.gov.kh/2026/01/announcement-11/`: web reader extracted no article; normal Playwright navigation redirected to the Ministry homepage and exposed only homepage/navigation content. HTTP 200 was not treated as support. Inspecting ordinary public scripts revealed application-shell routes but did not recover the announcement.
- `https://www.immd.gov.hk/eng/service/travel_document/visa_free_access.html`: web-reader timeouts. Ordinary Playwright successfully read the official page, last revised 15 September 2026, but its body did not contain the Cambodia row. Its actual download link led to the retained PDF, which was fetched and read separately.
- `https://rnk.gov.kh/index.php/article/59330`: web reader returned no operative article text; not cited. Other indexed national-radio leads were discovery only.
- `https://ctp.gov.kh/direct/index.php?skip=20`: actual Tourist Police page included a 20 January reproduction of the trial scope but mixed it with social-feed scaffolding and duplicates. Not retained because the clean government AKP publication is clearer.
- `https://www.cambodiaembassyuk.org/faq/`: actual page read. Its exemption table is explicitly updated 8 July 2019 and contains a Hong Kong 30-day row plus mainland China non-exemption, among old pandemic-era guidance. It is not used to contradict the specific 2026 trial or to establish its successor. The separate embassy exemption page exposed only an image link; that image was not read or cited.
- A Ministry-authored one-page announcement scan dated 15 January 2026, numbered 009/MOT, was actually read by OCR from the non-government Open Development Cambodia mirror at `https://opendevelopmentcambodia.net/wp-content/blogs.dir/2/files_mf/1768537068a.pdf`. It matches the operative scope reproduced by AKP. The mirror and its article are **not** retained as published evidence; they were only a cross-check/discovery aid. The source is not misrepresented as a government-hosted PDF.
- The January AKP article's linked image was downloaded and viewed; it depicts tourists disembarking an aircraft, not the Ministry announcement. It is not documentary evidence.
- The Ministry Telegram public-channel search could not be read with the web reader. It is not cited. Other commercial summaries, search snippets and this application's own indexed pages were never treated as authority.

## Currentness search and remaining questions

Bounded English/Chinese searches covered Cambodia's eVisa, Tourism, Foreign Affairs, Immigration, government press/AKP, Council of Ministers and Information domains, official mission leads, and the relevant passport issuers. Extension/successor searches found the specific August request above, not an adopted replacement. This is a retrieval finding, not proof that no later measure exists.

Reopen destination guidance before the 15 October endpoint. Establish any actual extension or successor from the operative official text, including document scope and effective date. The general availability of a visa-on-arrival or eVisa route should be researched afresh if it becomes the proposed baseline. Also resolve near-endpoint admitted stays if the product later needs trip-date advice rather than an entry-date classification.

Independent review must reopen all retained sources, check the destination/issuer distinction and bind its decision to the exact candidate bytes. This author has not approved or promoted the candidate.

## Validation and handoff

Exact candidate SHA-256: `07941befc57517eea89600f9c890f712d2fc414ce4a92fd9f8ec8bff46001f0b`.

`npm run --silent evidence:validate -- research/visa-evidence/pass414-cambodia-trial-end-2026.candidate.json` passed: 6 sources, 1 policy, exactly 3 scoped relationships, 0 conditional records, 0 conflicts and 0 current unresolved records. `git diff --check` was clean for these paths. The future gap remains explicit; it is not erased by the current-scope validator count.
