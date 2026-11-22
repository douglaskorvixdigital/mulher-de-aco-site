# Supply Chain Risk Report — `mulher-de-aco-site`

**Scanned:** `.`  
**Commit:** `7a62961913cc`  
**Manifests read:** `package.json`, `package-lock.json`  
**Scanned at:** 2026-11-22T05:31:58+00:00  
**Direct dependencies:** 11 (npm 11)

## Summary

- **No known advisory affects any of the 11 direct dependencies**, checked at the versions this project resolves.
- No known advisory affects any of the 416 registry-verified transitive packages at their locked versions.
- 3 of 11 dependencies carry at least one finding, 0 of which reach production.
- Weakest coverage: **Publisher concentration**, established for 5 of 11; the Coverage section lists every criterion.

## Production dependencies

3 dependencies are declared as runtime dependencies and ship in the built artifact. Advisory status is given for every one, clean or not.

| Dependency | Version | Advisories | Other findings |
|---|---|---|---|
| `next` | 16.4.6 | none known | — |
| `react` | 19.3.0 | none known | — |
| `react-dom` | 19.3.0 | none known | — |

## Findings

### Build-time only

Declared as development dependencies. A compromise here reaches build and CI hosts rather than users of the shipped artifact.

| Dependency | Version | Weekly downloads | Findings |
|---|---|---|---|
| `@types/node` | 20.19.43 | 668,203,298/wk | single human publisher (types) of 1 listed |
| `@types/react` | 19.3.0 | 248,043,232/wk | single human publisher (types) of 1 listed |
| `@types/react-dom` | 19.3.0 | 210,611,836/wk | single human publisher (types) of 1 listed |

## Upstream repository and CI hygiene — OpenSSF Scorecard

These criteria describe each dependency's own repository, not the audited
project. Remediation, where any exists, is upstream.

No criterion in this tier was assessable for any dependency.

## Transitive advisories

No known advisory affects any of the 416 registry-verified packages beyond the direct set (resolved by `package-lock.json`), at the locked versions. Only advisories were checked at this depth; every other criterion in this report describes direct dependencies only.

## Informational

Measured, not flagged.

- **Publish provenance**: 6 of 11 publish with build provenance.
  Without: `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `typescript`
- **Security policy published**: 9 of 11 publish a security policy.
  Without: `@tailwindcss/turbopack`, `tailwindcss`
- **Download volume**: established for 11 of 11; median 216,652,348/week. Lowest: `@tailwindcss/turbopack` (3,058,665/wk), `eslint-config-next` (50,435,234/wk), `next` (98,723,467/wk).

## Coverage

What was and was not measured, per criterion.

| Criterion | Tier | Assessed | Flagged | Not assessable |
|---|---|---|---|---|
| Known advisories | A | 11/11 | 0 | 0 |
| Deprecated or yanked | A | 11/11 | 0 | 0 |
| Repository archived | A | 11/11 | 0 | 0 |
| Maintenance activity | A | 11/11 | 0 | 0 |
| Publisher concentration | B | 5/11 | 3 | 6 |
| Install-time script execution | B | 11/11 | 0 | 0 |
| Dangerous CI workflow | scorecard | 0/11 | 0 | 11 |
| CI token permissions | scorecard | 0/11 | 0 | 11 |
| Checked-in binaries | scorecard | 0/11 | 0 | 11 |
| Changes reviewed by a second person | scorecard | 0/11 | 0 | 11 |
| Publish provenance | info | 11/11 | 0 | 0 |
| Security policy published | info | 11/11 | 0 | 0 |
| Download volume | info | 11/11 | 0 | 0 |

## Not assessable

**Checked-in binaries**

- 11 dependencies — the Scorecard API did not answer: `@tailwindcss/turbopack`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next` and 5 more

**Changes reviewed by a second person**

- 11 dependencies — the Scorecard API did not answer: `@tailwindcss/turbopack`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next` and 5 more

**Dangerous CI workflow**

- 11 dependencies — the Scorecard API did not answer: `@tailwindcss/turbopack`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next` and 5 more

**Publisher concentration**

- 6 dependencies — publishes from CI with provenance, so the effective publisher set is whoever can merge to the release branch — not externally observable: `@tailwindcss/turbopack`, `eslint-config-next`, `next`, `react`, `react-dom`, `tailwindcss`

**CI token permissions**

- 11 dependencies — the Scorecard API did not answer: `@tailwindcss/turbopack`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next` and 5 more

## Method and caveats

- cache directory ownership was not verified: os.getuid is POSIX-only, so a cache at C:\Users\Douglas\AppData\Local\Temp\supply-chain-risk-auditor-cache owned by another user would not be detected on this platform. Keep the cache under your own user profile, or pass --cache with a private path.
- gh is not authenticated. GitHub allows 60 requests/hour unauthenticated against 5000 authenticated, so repository signals may be unassessable.
- Repository-level criteria (archived, maintenance activity, security policy, and the Scorecard checks) describe the source repository rather than the package. 11 dependencies resolve to 6 distinct repositories, so one repository can appear as several findings. Shared: github.com/DefinitelyTyped/DefinitelyTyped, github.com/react/react, github.com/tailwindlabs/tailwindcss, github.com/vercel/next.js
- Optional tooling detected: npm. Not installed, so not used: bundler-audit, cargo-audit, osv-scanner, pip-audit.
- Every criterion except advisories applies to direct dependencies only. The 416 registry-verified packages resolved by package-lock.json were checked for known advisories at their locked versions, and for nothing else.
- HTTP sources: 35 fetched, 28 served from cache (oldest 0.0h old), 0 refetched as stale, 0 unavailable offline, 11 errors.
