# MultiPass Rank

MultiPass Rank is a fast passport-ranking and multi-passport comparison tool for [multipassrank.com](https://multipassrank.com). It ranks 199 passports, shows destination-level access across 227 countries and territories, and calculates the practical reach of passport combinations.

The application is intentionally direct: no accounts, lead forms, analytics, or commercial ranking adjustments.

Regional and language collections are generated from the registry in `src/lib/geography.ts`. Language groups use official or nationally designated administrative/working-language status rather than ethnicity or assumed individual fluency.

## Stack

- Astro SSR with small React islands
- Cloudflare Workers with Static Assets
- A scheduled Cloudflare Worker that normalizes upstream access data
- Workers KV with atomic, versioned snapshot publication
- TypeScript, Vitest, Playwright, and axe

## Local development

Requirements: Node.js 24 or newer and npm 11 or newer.

```bash
npm install
npm run dev
```

The repository contains a generated fallback snapshot so local development and CI do not depend on a live upstream service. Refresh it explicitly with:

```bash
npm run data:fallback
```

The small country diagrams use the public-domain Natural Earth dataset through `world-atlas`. They render region-only context, the selected country outline when available, and a location marker for microstates. Regenerate the optimized SVG paths with:

```bash
npm run assets:map
```

Passport cover colors are sampled from the corresponding Passport Index thumbnails and stored as a tiny local color map; the application does not hotlink or ship those source images. Regenerate the map with:

```bash
npm run assets:passports
```

To seed an empty production KV namespace from the validated bundled snapshot, generate the bulk payload, upload it, and publish the pointer last:

```bash
npm run data:kv-bulk
wrangler kv bulk put .wrangler/passport-bootstrap.json --binding PASSPORT_DATA --remote --config wrangler.worker.jsonc
wrangler kv key put snapshot:pointer '{"current":"<fallback-version>"}' --binding PASSPORT_DATA --remote --config wrangler.worker.jsonc
```

Run the complete local verification suite:

```bash
npm run test:all
npx playwright install chromium
npm run test:e2e
```

## Data lifecycle

The `multipass-data-sync` Worker stages ten passport records per invocation. Four staggered daily Cron triggers complete a coherent snapshot in about five days. Only a fully validated set of 199 passport issuers and 227 destinations can replace the current KV pointer; the previous snapshot remains available for rollback.

Before publication, the Worker also evaluates every two- and three-passport combination and solves the exact minimum set cover for the destination catalog. That versioned analysis is published atomically with the access snapshot and exposed at `/api/v1/combination-insights`.

The public application reads KV in its Worker runtime. Browsers only use same-origin `/api/v1/*` routes and never contact the upstream provider.

Shareable tools use the same URL convention: each `set` query parameter is one option, and comma-separated codes form a combined option. `/compare?set=US,CA&set=PT` compares destination access; `/rank?set=US,CA&set=PT` places both options into the global ranking. Add `.md` before the query string for a text-first version.

The interactive builders intentionally cap manual combinations at five passports. Direct research links and the JSON comparison API accept up to ten passports per set so the exact world-coverage experiment remains reproducible.

## Catalog coverage

The global ranking contains 199 passport issuers, while access calculations use 227 destinations. The ranking footer lists tracked destinations for which the upstream source provides no separate passport record; MultiPass Rank does not invent ranks for them.

The destination directory also carries a concise UN M49/ISO-based disclosure of relevant inhabited or commonly referenced areas that the upstream destination model does not represent separately. Those areas do not affect scores or comparisons, and the disclosure intentionally omits most remote uninhabited areas.

Each tracked destination also has a dedicated `/destination/{slug}` page. A passport–destination result uses the canonical root URL `/{passport}-{destination}-{status}`, for example `/belgium-kenya-eta`. Recognized URLs with an outdated status suffix redirect to the current result.

Official evidence is stored as policy-level records in `src/data/visa-evidence.ts`, so a single law or agreement can support many relationships without copying claims. Evidence pages with verified current status are indexable; incomplete placeholders are explicitly marked `noindex` and stay out of the sitemap.

Narrow destination-authority corrections live in `src/data/access-overrides.ts` and are reapplied to every complete staged snapshot before scores and combination insights are published. For assisted evidence collection, generate a bounded packet with `npm run --silent evidence:packet -- <batch-id>`, then validate the model's candidate JSON with `npm run evidence:validate -- <candidate.json>`. The full small-model handoff and strong-review gate are documented in `docs/visa-evidence-model-handoff.md`.

After a human or stronger-model review opens every official source and resolves conflicts, append the approved candidates to the production evidence artifact:

```bash
npm run evidence:promote -- research/visa-evidence/<approved-batch-1>.candidate.json research/visa-evidence/<approved-batch-2>.candidate.json
```

Use `--replace` only to update candidates that are already promoted. `--from-head` is a recovery option that starts from the committed artifact before applying the selected candidates.

The generated `src/data/reviewed-visa-evidence.json` contains only publishable source and policy fields. Candidate-only excerpts, confidence notes, conflicts, and unresolved-pair research remain outside the production bundle.

The priority-destination evidence program tracks 42 EU/Schengen and other widely used destinations, including the United Kingdom, United States, Canada, Australia, New Zealand, Japan, South Korea, Singapore, Hong Kong, Israel, and Taiwan. Report current-status evidence coverage without changing data:

```bash
npm run evidence:coverage
npm run evidence:coverage -- --all --summary
```

The first command reports the 42 initial priority destinations. The second reports active canonical evidence across the complete passport–destination matrix, with regional totals. Add `--incomplete` without `--summary` to list only destination columns that still have unsupported current-status cells.

Dataset JSON-LD identifies MultiPass Rank as creator and publisher and links to `/data-license`. The license covers the site’s original evidence metadata and presentation, not upstream access snapshots or official source documents.

## Cloudflare provisioning

Authenticate Wrangler without storing credentials in the repository:

```bash
npx wrangler login
```

Create the production KV namespace, then insert the returned 32-character ID into both Wrangler configurations:

```bash
npx wrangler kv namespace create multipass-passport-data
npm run cf:set-kv -- <namespace-id>
```

Deploy the Worker, set its protected manual-sync secret, and bootstrap the first complete snapshot:

```bash
npm run worker:deploy
npx wrangler secret put SYNC_TOKEN --config wrangler.worker.jsonc
SYNC_ENDPOINT=https://multipass-data-sync.<account-subdomain>.workers.dev \
SYNC_TOKEN=<local-secret> \
npm run data:bootstrap
```

Deploy the web application Worker:

```bash
npm run app:deploy
```

The app configuration attaches catch-all Worker routes to the existing proxied DNS records for `multipassrank.com` and `www.multipassrank.com`; the application redirects `www` to the apex. Verify the `workers.dev` deployment and the sync Worker health endpoint before enabling the production GitHub workflow.

For automated deployment, configure the GitHub environment `production` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, then set the repository variable `CLOUDFLARE_DEPLOY_ENABLED=true`. The token needs edit access to Workers, Workers Routes, and KV.

## Scoring

Visa-free, visa on arrival, and ETA destinations count toward a passport's mobility score. eVisas and traditional visas do not. Equal scores share a dense rank.

For combined sets, the easiest available status wins per destination. All citizenship countries count as accessible, then one home destination is subtracted so a one-passport set exactly matches its individual score. Combined positions are displayed as rank equivalents, not official passport ranks.

Travel requirements can change without notice. Verify rules with official destination authorities before making travel arrangements.
