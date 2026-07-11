# PR506D - Owner Encounter Private Session Browser Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_HOSTED_BROWSER_RERUN
```

## Source

PR506B hosted API proof:

`docs/roadmap/PR506B_OWNER_ENCOUNTER_PRIVATE_SESSION_HOSTED_PROOF_RESULT.md`

PR506C browser tooling acceptance:

`docs/roadmap/PR506C_OWNER_ENCOUNTER_BROWSER_PROOF_TOOLING_REVIEW_RESULT.md`

## Why This Lane Exists

PR506B proved the hosted private encounter session API contract:

- hosted deployment health passed;
- owner and non-owner auth passed;
- owner readiness returned `ready:true`;
- exactly one saved private same-owner artifact create request returned `201`;
- owner list/detail readback passed;
- signed-out and cross-owner boundaries failed closed;
- cleanup deleted the artifact;
- public Space/persona samples after cleanup showed no owner encounter controls
  or claims;
- privacy/secret scan passed.

PR506B remained blocked because desktop and `390px` owner Studio UI proof did not
run. PR506C has now supplied root-only Playwright dev tooling and ARGUS accepted
it as dev-tooling-only.

## Task

Run a focused hosted browser rerun for the remaining owner encounter private
session proof gap.

Targets:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

If Chromium is missing locally, you may run:

```text
npm exec --yes pnpm@10.32.1 -- exec playwright install chromium
```

Do not commit installed browsers, screenshots, traces, videos, auth state,
cookies, tokens, generated artifact bodies, or hosted proof outputs.

## Required Flow

Use the original PR506B proof packet as the contract:

`docs/roadmap/PR506B_OWNER_ENCOUNTER_PRIVATE_SESSION_HOSTED_PROOF_ARIADNE.md`

Because the PR506B artifact was deleted during cleanup, PR506D may create
exactly one new saved private same-owner encounter artifact for this browser
rerun.

Prove:

1. Hosted web/API are reachable and the API deployment floor still includes
   PR506A private-session routes.
2. Owner auth works.
3. Owner readiness is `ready:true`.
4. Exactly one saved private same-owner artifact is created for this rerun.
5. Desktop Studio owner UI shows the saved private artifact/readback controls
   without raw ids, provider payloads, prompt/private context bodies, generated
   reply text, cookies, tokens, SQL details, stack traces, env values, or secret
   material.
6. `390px` Studio owner UI shows the same private artifact/readback controls
   without horizontal overflow or clipped critical controls.
7. Public Space/persona routes show no saved private encounter output, owner
   encounter controls, or owner-only claims while the artifact exists.
8. Signed-out and cross-owner API boundaries still fail closed if you touch
   those routes during setup/cleanup.
9. Cleanup deletes/discards the saved artifact.
10. Owner readback after cleanup no longer exposes the artifact.

Do not create more than one saved artifact unless MIMIR explicitly opens a new
lane.

## Pass Conditions

PR506D may pass only if:

- the browser tooling works from this repo;
- exactly one new saved private same-owner artifact is created;
- desktop and `390px` owner Studio proof passes;
- public no-drift is checked while the saved artifact exists;
- cleanup removes the artifact and owner readback confirms it is gone;
- no raw ids, generated reply text, prompt/private context bodies, provider
  payloads, cookies, tokens, env values, SQL details, stack traces, browser
  artifacts, or secret-shaped values are recorded or committed.

If the browser tool still cannot run, block with the exact command/error class
and do not create another artifact just to retry.

If the browser tool runs but the product UI fails, block with the exact owner
flow defect and wake MIMIR with enough detail to route DAEDALUS.

## Result Required

Create:

```text
docs/roadmap/PR506D_OWNER_ENCOUNTER_PRIVATE_SESSION_BROWSER_RERUN_RESULT.md
```

Include:

- pass/block verdict;
- hosted deployment floor;
- count of saved artifact create requests;
- desktop/390px UI verdict;
- public no-drift verdict while artifact existed;
- cleanup verdict;
- privacy/secret scan result;
- final wakeup.

Do not include raw ids, generated reply text, prompt/private context bodies,
provider payloads, cookies, tokens, SQL details, stack traces, env values, or
secret material.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR506C browser proof tooling.
- PR506B hosted API proof passed; the only remaining gap is the desktop/390px owner Studio browser proof and public no-drift while a saved private artifact exists.
- Playwright is now a root devDependency and import/CLI validation passed.
Task:
- Run PR506D hosted browser rerun for owner encounter private session artifacts.
- You may create exactly one saved private same-owner artifact for this rerun, then delete it.
- Prove desktop and 390px owner Studio readback/delete, public no-drift while the artifact exists, cleanup, and privacy boundaries.
- Wake MIMIR with PASS or BLOCK.
```

