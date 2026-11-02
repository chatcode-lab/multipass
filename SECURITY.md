# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability or exposed credential. Email [hello@chatcode.dev](mailto:hello@chatcode.dev) with:

- the affected URL, component, or commit;
- a concise reproduction;
- the likely impact; and
- any safe mitigation you have already tested.

Do not access data that is not yours, degrade the service, or publish credentials while testing. We will acknowledge a useful report as soon as practical and coordinate disclosure after a fix is available.

## Scope

Security reports may cover the application at `multipassrank.com`, its same-origin APIs, the Cloudflare Workers, deployment workflow, or this repository. Data accuracy and ordinary visa-policy disagreements are research issues rather than security vulnerabilities; those can use a normal GitHub issue without including personal information.

## Dependency maintenance

Run `npm run security:audit` to check production and development dependencies. CI and deployment reject active advisories at every severity; an unavailable audit service is a failed check, not a clean result. Weekly Dependabot updates group routine minor/patch runtime and tooling changes, with a separate security-update group. Routine major migrations are manual: the `allow.update-types` filter [does not restrict security updates](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#update-types-allow). Updates still require review and the complete test suite before merging.

The November 2026 refresh raises the patched dependency floors and removes the obsolete Miniflare/Undici override. The narrow `minimatch@^10.0.0` override uses `11.0.1` because the [globparts amplification fix](https://github.com/advisories/GHSA-g3hv-75wg-m249) has no v10 backport. This is a major transitive change, not an assumed compatible patch: its current ESLint and TypeScript-ESLint consumers require explicit glob/ignore coverage, lint and typecheck validation. Remove this override when upstream consumers adopt the fixed major themselves. Do not broaden it to older Minimatch API generations or suppress the audit instead.

Only dismiss an alert when its applicability has been established. For example, [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) was withdrawn on 28 October 2026 as not a valid vulnerability; that does not justify dismissing active advisories or claiming an upgrade fixed it.
