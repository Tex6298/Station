# PR506C - Owner Encounter Browser Proof Tooling

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_UNBLOCK
```

## Why This Lane Exists

ARIADNE ran PR506B hosted proof for owner-only private encounter session
artifacts:

`docs/roadmap/PR506B_OWNER_ENCOUNTER_PRIVATE_SESSION_HOSTED_PROOF_RESULT.md`

The hosted API contract passed:

- hosted web/API/deployment health passed;
- hosted `@station/api` was ready on branch `main` at commit prefix
  `0a0373c561fc`;
- owner and non-owner auth passed;
- owner readiness returned `ready:true`;
- exactly one saved private same-owner artifact create request returned `201`;
- owner list/detail readback returned the created artifact before cleanup;
- signed-out and cross-owner API probes failed closed;
- cleanup deleted the artifact and owner list returned count `0`;
- public Space/persona samples after cleanup showed no owner encounter controls
  or claims;
- privacy/secret scan passed.

PR506B is still blocked because the required desktop and `390px` Studio UI proof
could not run. The local browser runner could not import Playwright, and
ARIADNE correctly avoided creating a second saved artifact without a new MIMIR
lane.

MIMIR checked the smallest no-repo-change unblock:

```text
npm exec --yes --package playwright -- node -e "import('playwright')..."
```

That still could not provide an importable Playwright module to the Node proof
runner in this workspace. The narrow unblock is repo-supported browser proof
tooling.

## Task

Implement the smallest dev-only tooling patch that lets ARIADNE run hosted
browser proofs from this repo.

Allowed scope:

- add an appropriate Playwright browser automation dependency as a root
  devDependency;
- update the lockfile through the repo package manager;
- add a tiny proof-tooling smoke script only if it helps future agents verify
  that the browser package can be imported/launched;
- document the exact command ARIADNE should run if a browser binary install is
  needed locally.

Preferred dependency shape:

- use `playwright` or `@playwright/test` only as dev tooling;
- do not add Playwright to an app runtime package;
- do not add Playwright-dependent product code;
- do not commit downloaded browser binaries, screenshots, traces, videos, auth
  state, cookies, tokens, generated artifact bodies, or other proof outputs.

Do not change:

- owner encounter API behavior;
- provider/model behavior;
- route flags or Railway/Supabase config;
- auth, ownership, RLS, migrations, schema, storage, billing, social, queue,
  worker, Redis, Cloudflare, retrieval, public routes, or Studio product UI.

## Validation

Required:

```text
npm exec --yes pnpm@10.32.1 -- install --frozen-lockfile
npm exec --yes pnpm@10.32.1 -- exec playwright --version
node -e "import('playwright').then(() => console.log('playwright import ok'))"
git diff --check
git diff --cached --check
```

If a smoke script is added, run it too.

No product test suite is required unless product code changes. If product code
does change, stop and justify the drift before continuing.

## Result Required

Create:

```text
docs/roadmap/PR506C_OWNER_ENCOUNTER_BROWSER_PROOF_TOOLING_RESULT.md
```

Include:

- files changed;
- exact browser tooling dependency/script choice;
- validation results;
- confirmation no product/runtime surface changed;
- exact ARIADNE rerun command or prerequisite if browser binaries must be
  installed locally;
- final wakeup.

## Review

Wake ARGUS after implementation:

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR506C dev-only browser proof tooling.
- PR506B API proof passed, but the required desktop/390px Studio UI proof was
  blocked because the local browser runner could not import Playwright.
Validation:
- npm exec --yes pnpm@10.32.1 -- install --frozen-lockfile
- npm exec --yes pnpm@10.32.1 -- exec playwright --version
- node -e "import('playwright').then(() => console.log('playwright import ok'))"
- git diff --check
- git diff --cached --check
Task:
- Review that the patch is dev-only proof tooling.
- Confirm no product runtime dependency, owner encounter behavior, auth,
  ownership, provider, persistence, public, storage, billing, queue/worker,
  Redis, Cloudflare, retrieval, or secret/proof-output drift.
- If accepted, wake MIMIR for ARIADNE PR506B/PR506D browser rerun routing.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARIADNE blocked PR506B only because the required desktop/390px hosted Studio
  UI proof could not run.
- The hosted API create/list/detail/delete and signed-out/cross-owner/public
  checks passed, and cleanup removed the one saved artifact.
- MIMIR tested an ephemeral Playwright package path, but the Node proof runner
  still could not import Playwright from this workspace.
Task:
- Implement PR506C as the smallest dev-only browser proof tooling unblock.
- Keep it out of app runtime/product behavior.
- Document validation and wake ARGUS for review.
```
