# PR352 - UX-09 Railway Staging Browser Sweep Result

Owner: ARIADNE

Date: 2026-06-26

Verdict: PASS WITH CAVEAT

## Scope

ARIADNE ran the hosted Railway browser sweep from the PR351 route, account, and boundary packet.

Targets:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Credential values, cookies, auth values, authorization header values, raw private IDs, private source bodies, hosted logs, SQL, provider payloads, prompts, completions, Stripe IDs, and secret-shaped values were not committed or summarized.

## Health And Deployment

PASS.

- Web `/health`: 200, `ok: true`.
- Web `/health/deployment`: 200, `ok: true`, `ready: true`.
- API `/health`: 200, `ok: true`.
- API `/health/deployment`: 200, `ok: true`, `ready: true`.
- Deployment endpoints did not expose a short commit prefix in the safe structured fields inspected; readiness booleans were sufficient for the sweep.

## Public Signed-Out Desktop

PASS.

Required public routes loaded without 5xx, 404, visible error page state, document-level horizontal overflow, or private owner data exposure:

- `/`
- `/discover`
- `/writing`
- `/space/station-replay-alpha`
- first visible public document from the Space page
- linked forum discussion from that public document
- `/forums`
- `/forums/station-replay-salon-alpha`
- first visible replay Salon thread from the category page
- `/developer-spaces/station-replay-dev-alpha`
- `/pricing`

The public chain from Space to document to linked discussion works after the page has finished loading seeded public links. The replay Salon category also exposes a visible thread that loads successfully.

## Signed-In Owner Desktop

PASS.

Replay-owner sign-in reached `/studio` using the local ignored credential keys. The required signed-in routes loaded without route errors, document-level horizontal overflow, or credential/session leakage:

- `/studio`
- `/studio/onboarding`
- `/space`
- `/space/new` routeability only
- `/studio/publish` routeability only
- `/studio/assistant?prompt=...` prompt-prefill only
- first visible private persona workspace
- that persona's Memory route
- that persona's Continuity route
- that persona's Archive/files route
- that persona's Integrity/calibration route
- `/studio/archive`
- `/studio/publishing`
- `/billing`
- `/billing?success=1`
- `/settings`

The Assistant handoff prefilled the prompt text and no Assistant message was sent. No Space creation, publish action, billing action, visibility change, upload/import, forum post, moderation action, or connector/OAuth flow was performed.

## Mobile Critical Subset

PASS.

The 375px mobile subset loaded without document-level horizontal overflow, clipped primary content, or trapped route surfaces:

- `/`
- `/discover`
- `/space/station-replay-alpha`
- first visible public document and its linked forum discussion
- `/forums`
- first visible replay Salon thread
- `/developer-spaces/station-replay-dev-alpha`
- `/studio`
- `/studio/onboarding`
- first visible persona workspace plus Memory, Continuity, Archive/files, and Integrity/calibration routes
- `/space`
- `/space/new`
- `/studio/publish`
- `/studio/assistant?prompt=...`
- `/billing`
- `/billing?success=1`

Representative browser screenshots were inspected for Discover, the public Space, mobile Developer Space, and mobile onboarding. The screenshots were local-only evidence and are removed before commit.

## Mutation And Privacy Boundary

PASS.

- Browser-side mutation guard observed no non-auth mutating requests during the routeability sweep.
- Checkout and Billing Portal were not opened.
- Space creation, publishing, visibility mutation, Assistant send, file upload/import, connector/OAuth, forum posting, moderation, schema, worker, provider/model, Railway config, and database-admin work stayed out of scope.

## Caveat

The initial fast route sampler reached the pages safely but sampled some client-loaded seeded links before the UI had finished settling. Settled follow-up checks verified the public document, linked discussion, Salon thread, persona workspace, persona Memory, persona Continuity, persona Archive/files, persona Integrity/calibration, and Assistant prompt-prefill paths. This is not a DAEDALUS repair packet; it is a browser-sweep timing caveat.

## Recommendation

MIMIR can treat PR352 as a passed Railway staging UX-09 sweep with the timing caveat above, then decide the next UX/product lane. No product repair wakeup is needed.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr352-railway-staging-sweep.spec.js --reporter=line --workers=1` - passed, 1 test, 35.4s after the login wait correction.
- Follow-up browser probes verified the settled public document/discussion chain, replay Salon thread, desktop/mobile persona routes, and Assistant prompt prefill.
- `git diff --check` - passed.
