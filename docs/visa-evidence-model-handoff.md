# Visa evidence handoff for a smaller model

This lane lets a less capable web-enabled model collect bounded evidence without editing MultiPass Rank's canonical data. It separates discovery from publication: the small model returns a candidate JSON file, automated checks reject malformed output, and a human or stronger model verifies every official page before merge.

## What to give the model

Choose one batch from [`research/visa-evidence/queue.json`](../research/visa-evidence/queue.json). The queue is deliberately ordered: finish `hk-special-arrangements` before expanding to Kenya, HKSAR outbound access, or one EU agreement at a time.

Generate a current hypothesis packet:

```bash
npm run --silent evidence:packet -- hk-special-arrangements > /tmp/hk-special-arrangements-packet.json
```

Give the model these three files in the same conversation:

1. The generated packet.
2. [`candidate.schema.json`](../research/visa-evidence/candidate.schema.json).
3. [`visa-evidence-research.md`](visa-evidence-research.md).

The model must have live web access. If it cannot open sources, it may organize documents you provide but must not claim it verified a URL.

## Copy-paste prompt

```text
You are collecting candidate evidence for one MultiPass Rank visa-policy batch.

Read the attached research playbook, packet, and JSON schema completely. Browse the web, but cite only primary official sources: laws, gazettes, treaties, government datasets, immigration/border/foreign-ministry pages, or official embassy/consulate pages. Search engines, snippets, Wikipedia, Reddit, airlines, Timatic summaries, commercial passport indexes, travel agents, and blogs are discovery aids only and must never appear in sources.

Treat every snapshot status in the packet as an unverified hypothesis. Open every cited URL. Confirm that the page itself supports the nationality, destination, ordinary-passport type, visitor purpose, access category, conditions, and any date you return. Distinguish announcement, publication, and effective dates. Do not infer a rule from silence, a catch-all label, a portal's branding, or a reciprocal rule that the source does not state.

Return exactly one JSON object matching candidate.schema.json and no surrounding prose or Markdown. Use ISO alpha-2 codes from the packet. Put unsupported pairs in unresolved. Put disagreements with the snapshot in conflicts. Use “not established” in a reason instead of guessing. Keep each supportingExcerpt to 25 words or fewer; it is for review only and will not be published. Set confidence to high only when a direct official source explicitly supports the complete normalized rule.

Do not edit canonical source files. Do not propose travel, citizenship, or legal advice.
```

## Validate the response

Save only the returned JSON under a local candidate path, then run:

```bash
npm run evidence:validate -- /path/to/candidate.json
```

The validator checks the shape, ISO codes, source references, HTTPS URLs, duplicate IDs, known discovery-only hosts, and the 25-word excerpt limit. Passing validation does **not** establish truth or official status.

## Strong-review gate

Before copying anything into [`src/data/visa-evidence.ts`](../src/data/visa-evidence.ts) or [`src/data/access-overrides.ts`](../src/data/access-overrides.ts), a human or stronger model must:

1. Open every direct URL and prove the publisher is the relevant authority.
2. Read the source around the cited support rather than relying on the excerpt.
3. Check ordinary versus diplomatic, official, biometric, refugee, residence, transit, and special travel documents.
4. Confirm current validity and separate announcement from legal effect.
5. Compare every affected pair with the latest snapshot and review all conflicts explicitly.
6. Store one group policy instead of duplicating hundreds of pair records.
7. Add a narrow access override only when the official taxonomy clearly conflicts with upstream data.
8. Run `npm run test:all` and manually open one relationship page for every status in the batch.

Reject the entire candidate if a source is invented, inaccessible, unofficial, or materially weaker than the claim. Keeping a pair unresolved is a successful research outcome.

## Recommended batch size

Give a smaller model one authority and one policy cluster at a time: usually 5–25 exceptional pairs or one official nationality list. Do not ask it to prove every passport–destination relationship in one run. Government lists and multilateral agreements create the highest evidence coverage per reviewed source.
