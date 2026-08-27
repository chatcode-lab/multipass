# Official portal source-health registry

`scripts/source-health/index.ts` is a read-only monitor for public official
portal endpoints. The in-code registry records only publisher, URL and a
non-evidentiary monitoring purpose. Its JSON report includes the resolved URL,
HTTP status, content metadata, SHA-256 body hash and a short extracted excerpt.

Run it with:

```sh
npx tsx scripts/source-health/index.ts
npx tsx scripts/source-health/index.ts --id=djibouti-evisa-applicant
```

The report is emitted to stdout only. The scheduled workflow stores it as a
30-day artifact and fails when a required portal becomes unreachable, loses
its identity markers, or changes a reviewed semantic fingerprint. Observe-only
sources stay visible without making every run fail. A healthy response, a matching hash, a
selector, or a country missing from a response never establishes visa status;
research still needs direct, current, ordinary-passport evidence and issuance
timing.
