# Pass 417: independent dependency security review

Reviewer: `/root/pass416_pacific`, independent of the implementer. Reviewed 29 September 2026.

## Decision: approve the scoped dependency patch

Approval binds these exact SHA-256 values:

- `package.json`: `0cebb8bcad9df509a9faff7a69b99d63400a493abeeaf8795708870b76ab57f4`.
- `package-lock.json`: `1b9cc0ef703aaed4ab45d8b9d393ec93f4d95cd13a1a97f02d5140724e72dbec`.

Independently read repository Dependabot alerts 12 and 13 through the GitHub API. Both concern GHSA-3wwx-pv8p-q78v / CVE-2026-85024, with separate vulnerable major-version branches. Independently opened the [maintainer advisory](https://github.com/nodejs/undici/security/advisories/GHSA-3wwx-pv8p-q78v) and [7.29.1](https://github.com/nodejs/undici/releases/tag/v7.29.1) and [8.10.2](https://github.com/nodejs/undici/releases/tag/v8.10.2) release notes. The advisory concerns process termination through malformed compressed messages from an attacker-controlled or compromised WebSocket peer; the two selected versions are explicitly patched. This is not proof of a reachable exploit in this application.

The lockfile changes exactly two package entries: Astro/unifont's nested Undici 8.10.0 becomes 8.10.2, and Miniflare's Undici 7.29.0 becomes 7.29.1. Independently compared all lockfile package objects against the preceding commit: only each selected entry's version, registry tarball URL and integrity change. No other package metadata changes. Both integrity values, tarball URLs and engine requirements match independently retrieved npm registry metadata.

Unifont 0.7.5 permits `^8.0.0`, so its patch fits the existing range. Miniflare 5.20260915.0-alpha instead pins exactly 7.29.0. The new manifest override is correctly limited to that exact Miniflare release and explicitly selects 7.29.1; it does not pretend an incompatible lockfile substitution satisfies the original pin. Registry inspection also confirmed the newer Miniflare 5.20260926.0-alpha still pins 7.29.0, so an unrelated broad Wrangler/Miniflare upgrade is not required to fix these alerts. Remove or re-evaluate the override when upgrading Miniflare; its version scope deliberately does not silently affect successors.

Independent checks:

- `npm ls undici --all` resolves exactly the two patched branches and recognizes the Miniflare override without invalid dependencies.
- `npm audit --json` reports zero currently known vulnerabilities. This is the registry's current audit result, not a claim that no vulnerability exists.
- A minimal in-memory Miniflare worker, created with its exported v4-options converter, successfully starts, dispatches an HTTP request and returns the expected response; the instance is disposed afterward. An initial reviewer smoke attempt used today's compatibility date, later than the installed workerd's supported 22 September date, and was correctly rejected. Repeating with a supported date passed. No repository compatibility date was changed.
- Root separately reports successful lockfile regeneration and `npm ci`; those are implementer-run installation checks, not independently repeated by this read-only reviewer.

This approval fixes the repository's npm dependency artifacts, not a separately bundled Node.js runtime implementation. It does not assert that remote alerts have already closed, that a deployment occurred, or that every WebSocket path was penetration-tested. Root owns full application/build/browser gates. No dependency, canonical evidence, runtime code, credentials, analytics CSV or deployment state was modified by this reviewer.
