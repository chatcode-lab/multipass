# Quarantined visa discovery clues

This directory is deliberately outside `research/visa-evidence`. It stores **non-official discovery clues** that identify official pages to verify. A clue is not evidence, cannot establish a visa status, and must never be copied into production data or an evidence candidate without independently replaying the named official target.

## Safety boundary

- Use the `visa-discovery-clue/v1` format in [`discovery-clue.schema.json`](./discovery-clue.schema.json).
- Every clue has the literal quarantine fields `classification: "non-official-discovery-only"`, `productionImport: "forbidden"`, and `verificationState: "unverified"`.
- The schema intentionally has no `sources`, `policies`, `conflicts`, `unresolved`, or normalized-status field. It is therefore incompatible with the evidence validator and promotion tool.
- A discovery URL may be commercial, media, a traveller report, or a search result. It is recorded only as an audit lead. The output deliberately shows only the official verification targets.
- An official target is a page to inspect, not proof that the page supports the claimed route. Normal evidence rules still apply: current primary authority, exact ordinary-passport nationality, destination, and issuance timing.

## Use

Create a `*.clue.json` file under this directory from the schema (the example is intentionally not auto-discovered):

```bash
npx tsx scripts/validate-prioritize-visa-discovery.ts research/visa-discovery/example.discovery-clue.json
```

To scan all active `*.clue.json` files, run:

```bash
npx tsx scripts/validate-prioritize-visa-discovery.ts
```

Add `--json` for an automation-friendly, still-quarantined priority report. The command is read-only: it uses the public snapshot's ISO-code manifest solely to reject malformed codes, and never writes, imports, or verifies production evidence, candidates, queues, or overrides.

For a broad matrix pass, compare the maintained Passport Index-derived catalog
with the exact canonical evidence layer:

```bash
npm run evidence:discovery-diff -- --limit=100
npm run evidence:discovery-diff -- --limit=500 --json
```

That report keeps the catalog's raw category and stay-day value as clues,
prioritizes exact-evidence gaps and disagreements, and attaches existing
official destination sources or government-domain search prompts. Its output is
not accepted by the evidence promotion tool.

## Discovery catalogs worth replaying

- [`imorte/passport-index-data`](https://github.com/imorte/passport-index-data) is the default broad matrix because it exposes
  ISO-2 pairs and day values under an MIT license. It is derived from Passport
  Index and remains non-official.
- [`xpressmike/visa-matrix`](https://github.com/xpressmike/visa-matrix) compares Wikipedia-derived tables with Passport
  Index data and records disagreements. Those disagreements are useful search
  priorities, never proof.
- [Orizn's Visa API](https://visa.orizn.app/docs) exposes `source_url` and `last_verified_at` on some records.
  Treat the API and its “verified” flag as a lead; open and independently
  review the linked authority page before using it.
- [DataHub's visa-requirements package](https://datahub.io/visa-requirements/visa-requirements-dataset) advertises requirement, stay, verification,
  and source fields. The package remains a secondary catalog even where its
  source field points to government material.

Never merge two agreeing catalogs into “verification.” Their agreement can
raise triage priority, but only the underlying current authority can create a
canonical policy.

## Workflow

1. Record the lead and one or more concrete HTTPS official verification targets.
2. Run the script to reject malformed or non-quarantined records and rank official checks.
3. Replay the official target independently.
4. Only if that replay satisfies the normal official-evidence gate, create a separate candidate in `research/visa-evidence` and validate it there. Do not copy a discovery clue into that candidate.
