# Contributing to MultiPass Rank

Thanks for helping make passport-access research easier to inspect. Small, focused pull requests are easiest to review.

## Development workflow

Use Node.js 24 or newer and npm 11 or newer.

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run test:all
npx playwright install chromium
npm run test:e2e
```

Do not commit `.env`, `.dev.vars`, Wrangler state, credentials, downloaded source documents, or user screenshots and analytics exports.

## Evidence contributions

Treat every existing access status as an unverified hypothesis. Evidence must come from a currently accessible primary official source such as a law, gazette, treaty repository, immigration authority, border authority, foreign ministry, or official embassy or consulate.

Do not use commercial indexes, Timatic summaries, airlines, travel agents, Wikipedia, search-result snippets, portal availability, fee rows, list omission, reciprocity, residence status, or another nationality as publication proof.

The recommended workflow is:

1. Select or add one exact, bounded batch in `research/visa-evidence/queue.json`.
2. Generate its packet with `npm run --silent evidence:packet -- <batch-id>`.
3. Return every assigned cell exactly once as supported, conflicting, or unresolved in a candidate JSON file.
4. Validate it with `npm run evidence:validate -- <candidate.json> --exact`.
5. Have a different reviewer open every source and verify current force, ordinary-passport scope, visitor purpose, actual issuance timing, conditions, and literal excerpts.
6. Promote only an independently approved candidate.

Read [docs/visa-evidence-model-handoff.md](docs/visa-evidence-model-handoff.md) and [docs/visa-evidence-research.md](docs/visa-evidence-research.md) before starting. Keeping a relationship unresolved is preferable to publishing an inference.

## Product changes

- Preserve HTML, Markdown, and machine-readable URL compatibility.
- Keep interactive islands small and test mobile layouts at narrow widths.
- Add narrow regression tests for scoring, URL canonicalization, evidence scope, accessibility, and responsive interactions.
- Do not silently change the scoring methodology or language/region definitions; document the decision and its migration impact.

By contributing, you agree that original code and project documentation are submitted under MIT and original evidence metadata under CC BY 4.0. Do not submit material you do not have the right to contribute.
