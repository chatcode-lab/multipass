# Multipass Rank

Multipass Rank is a fast passport-ranking and multi-passport comparison tool for [multipassrank.com](https://multipassrank.com). It ranks 199 passports, shows destination-level access across 227 countries and territories, and calculates the practical reach of combinations containing up to five passports.

The application is intentionally direct: no accounts, lead forms, analytics, or commercial ranking adjustments.

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

The public application reads KV in its Worker runtime. Browsers only use same-origin `/api/v1/*` routes and never contact the upstream provider.

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
