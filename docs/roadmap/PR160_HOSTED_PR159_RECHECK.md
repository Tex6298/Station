# PR160 - Hosted PR159 Recheck

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE runs the focused hosted recheck.
Status: focused hosted recheck passed; waking MIMIR for closeout

## Why This Lane

PR159 found concrete hosted product defects. DAEDALUS patched them and ARGUS
accepted the public-read and UUID-redaction boundaries. Because the patch
changes hosted-visible web behavior, the next useful step is a focused hosted
recheck after Railway serves the accepted commit.

This is not a broad product walkthrough and not another optimization lane.

## Goal

Verify that the accepted PR159 patch works on the hosted Railway web app.

## Deployment Gate

ARIADNE should first check:

- `https://stationweb-production.up.railway.app/health/deployment`
- `https://stationapi-production.up.railway.app/health/deployment`

Record only sanitized status, service, branch, commit, and `ready` fields.

If Railway has not deployed the PR159 accepted commit yet, wait/retry within a
reasonable bounded window. If it still has not deployed, wake MIMIR with
`deployment_not_current` and do not run stale-hosted conclusions as product
truth.

## Focused Recheck

When hosted web is current enough for the PR159 patch, rerun only the focused
checks:

- signed-out public document chain no longer performs a browser-visible API 401
  to the owner-aware `/documents/:documentId` route;
- public document shell still reaches the linked forum discussion path where
  available;
- signed-in persona workspace Runtime Context readback no longer shows
  UUID-shaped visible values in the source list or compiled prompt preview;
- signed-in Memory page no longer shows UUID-shaped visible values in Saved
  Memory cards on desktop or 390px mobile;
- signed-in Global Archive readback no longer shows UUID-shaped visible values
  in item title/summary/match-reason text;
- covered pages still avoid document-level horizontal overflow at 390px.

## Non-Scope

Do not:

- change code or docs beyond the evidence note;
- click Stripe Checkout/portal actions;
- mutate replay data, billing state, imports, exports, Developer Space keys,
  Redis, Cloudflare, provider config, workers, or cache state;
- broaden into another full walkthrough unless a focused check requires the
  exact route chain;
- print or commit secrets, cookies, tokens, raw IDs, private corpus text,
  Checkout URLs, Stripe IDs, customer/subscription IDs, or webhook payloads.

## ARIADNE Recheck Result

ARIADNE completed the focused hosted recheck on 2026-06-21.

Deployment identity:

- API `/health/deployment`: HTTP 200, `ready: true`, service `@station/api`,
  branch `main`, commit `6a8bb3eea401`.
- Web `/health/deployment`: HTTP 200, `ready: true`, service `@station/web`,
  branch `main`, commit `6a8bb3eea401`.

Deployment note: Railway is serving the PR159 runtime patch commit. Later
ARGUS/PR160 docs-test commits do not change watched runtime files, so a skipped
deploy for those commits is not a stale-runtime product blocker.

Focused results:

- Signed-out public document shell returned HTTP 200.
- The public document chain produced no browser-visible API errors, including
  no owner-aware `/documents/:documentId` HTTP 401.
- The linked forum route was available and returned HTTP 200.
- Persona workspace Runtime Context source list UUID-shaped visible-value
  count: 0.
- Persona workspace compiled prompt preview UUID-shaped visible-value count: 0.
- Desktop Memory Saved Memory card UUID-shaped visible-value count: 0.
- Global Archive readback UUID-shaped visible-value count: 0.
- 390px mobile Memory returned HTTP 200, had viewport width 390 and scroll
  width 390, and had no document-level horizontal overflow.
- 390px mobile Memory Saved Memory card UUID-shaped visible-value count: 0.

Verdict: the focused PR159 hosted defects are cleared on the hosted runtime. No
DAEDALUS follow-up remains from this recheck.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr160-hosted-recheck.spec.js --reporter=line --workers=1`
  passed: 1 test.

Caveats:

- This was a focused PR159 recheck, not a broad walkthrough.
- No replay data, billing state, imports, exports, Developer Space keys, Redis,
  Cloudflare, provider config, workers, or cache state was mutated.
- No secrets, cookies, tokens, raw IDs, private corpus text, Checkout URLs,
  Stripe IDs, customer/subscription IDs, or webhook payloads were printed or
  committed.
- `pnpm typecheck` was not run because the committed changes are docs-only
  evidence.

## Handoff

If the focused hosted recheck passes:

- wake MIMIR with the closeout verdict and any honest caveats.

If a focused defect remains on the current deployment:

- wake DAEDALUS with the exact route/control/API symptom and whether ARGUS
  should review first for visibility/auth/privacy.

If deployment is not current:

- wake MIMIR with the deployment identity mismatch and no product verdict.
