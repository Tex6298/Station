# UX-09 Railway Staging UX Review Packet

Owner: DAEDALUS
Reviewer: ARIADNE, then ARGUS or MIMIR by verdict
Status: READY - WAKE ARIADNE
Prepared: 2026-06-27

## Verdict

Railway staging is ready for a fresh ARIADNE human-eye browser sweep with one
readiness caveat: the first API deployment check returned `ready:false` from a
database timeout, then a safe retry returned `ready:true`. ARIADNE should begin
with the same health/deployment checks and treat repeated API readiness failure
as `BLOCKED`.

No product code, schema, config, deployment, provider, billing, import,
publishing, Assistant, or package behavior changed in this prep lane.

## Targets

Use these Railway targets:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Safe health/deployment checks:

```text
https://stationweb-production.up.railway.app/health
https://stationweb-production.up.railway.app/health/deployment
https://stationapi-production.up.railway.app/health
https://stationapi-production.up.railway.app/health/deployment
```

Safe check result from DAEDALUS prep:

- Web `/health`: HTTP 200, `ok:true`.
- Web `/health/deployment`: HTTP 200, `ok:true`, `ready:true`, commit prefix
  `4575b10`.
- API `/health`: HTTP 200, `ok:true`.
- API `/health/deployment`: first check HTTP 200, `ok:true`, `ready:false`,
  database timeout.
- API `/health/deployment`: retry HTTP 200, `ok:true`, `ready:true`, commit
  prefix `4575b10`.

The deployed commit prefix is after the accepted UX-07A Settings tier readback
and UX-08A persona provider-copy visible fix product commits. ARIADNE should
still verify those surfaces in the browser instead of treating local evidence
as hosted proof.

## Replay Account Handling

Use local ignored values only. Key names:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Do not print, screenshot, commit, summarize, or retain the values. If login
requires debugging, record only the route, safe status, visible safe error text,
and whether session restore succeeded.

Do not record cookies, auth headers, raw owner identifiers, private source
bodies, prompts, completions, provider payloads, Stripe identifiers, hosted
logs, SQL output, stack traces, or credential material.

## Route Order

Run desktop first, then mobile at `375px` or `390px`.

### Safe Readiness

1. Web `/health`.
2. Web `/health/deployment`.
3. API `/health`.
4. API `/health/deployment`.

Record only HTTP status, readiness booleans, and short commit prefix.

### Public Signed-Out Desktop

1. `/`
2. `/discover`
3. `/writing`
4. `/space/station-replay-alpha`
5. First visible public document from that Space page.
6. Linked forum discussion from that public document, if visible.
7. `/forums`
8. `/forums/station-replay-salon-alpha`
9. First visible replay Salon thread from the category page.
10. `/developer-spaces/station-replay-dev-alpha`
11. `/pricing`

When a route requires a document or thread link, discover it from visible UI and
do not record raw private identifiers.

### Signed-In Owner Desktop

1. `/login?redirect=/studio`
2. `/studio`
3. `/studio/onboarding`
4. `/studio/new?path=fresh-start` to the Channel step only; do not submit.
5. `/studio/new?path=awakening` to the Channel step only; do not submit.
6. `/studio/new?path=document-migrator` to the Channel step only; do not submit.
7. `/space`
8. `/space/new` routeability/readability only; do not submit.
9. `/studio/publish` routeability/readability only; do not save, queue, or
   publish.
10. `/studio/assistant?prompt=Help%20me%20plan%20my%20first%20Space` prompt
   prefill only; do not send.
11. First visible private persona workspace from `/studio`.
12. That persona's Memory route.
13. That persona's Continuity route.
14. That persona's Archive/files route.
15. That persona's Integrity/calibration route.
16. `/studio/archive`
17. `/studio/publishing`
18. `/billing`
19. `/billing?success=1`
20. `/settings`
21. `/developer-spaces`
22. First visible owner Developer Space manage route, if needed for operator
    surface readability only. Do not generate keys or record key values.

### Mobile Critical Subset

1. `/`
2. `/discover`
3. `/space/station-replay-alpha`
4. First visible public document and linked forum discussion, if visible.
5. `/forums`
6. First visible replay Salon thread.
7. `/developer-spaces/station-replay-dev-alpha`
8. `/studio`
9. `/studio/onboarding`
10. `/studio/new?path=awakening` Channel step.
11. First visible persona workspace plus Memory, Continuity, Archive/files, and
    Integrity/calibration routes.
12. `/space`
13. `/space/new`
14. `/studio/publish`
15. `/studio/assistant?prompt=...`
16. `/billing`
17. `/billing?success=1`
18. `/settings`

## Mutation Boundaries

Do not create, edit, publish, retract, delete, report, moderate, upload, import,
connect OAuth, create Spaces, create Developer Spaces, generate keys, send
Assistant messages, change visibility, or trigger billing flows.

Do not click Checkout, Portal, top-up, upgrade, subscription-management,
publish, import, upload, moderation, report, OAuth, key-generation, or
destructive controls on hosted staging.

Do not run API spot checks that expose private payloads. Do not inspect hosted
logs, SQL, raw route payloads, provider payloads, or credential material.

## Caveats To Carry

- PR352 timing caveat: fast route sampling can miss client-loaded seeded links.
  Wait for settled UI before judging Space/document/discussion, Salon thread,
  persona route, and Assistant prompt-prefill paths.
- API deployment readiness had one transient database timeout during DAEDALUS
  prep, then passed on retry. If it repeats and does not recover after one
  retry, classify the sweep as `BLOCKED`.
- PR408 caveat: `/studio/publishing` previously loaded safely but did not
  prominently show linked discussion, retract, or cleanup wording in sampled
  visible copy. Recheck and classify as caveat or repair only if the route story
  is materially worse.
- UX-07A Settings tier readback was previously local mocked evidence. Staging
  commit freshness looks sufficient, but ARIADNE should verify `/settings` and
  `/billing` tier readback on hosted staging.
- UX-08A provider-copy visible fix was previously local mocked evidence.
  Staging commit freshness looks sufficient, but ARIADNE should verify the
  `/studio/new` Channel step on hosted staging.
- PR351 data-shape caveat still applies: optional forum kind/visibility chips
  may not appear if the selected seeded thread does not carry those labels.
- Mobile top navigation may use an intended horizontal scroll container. Treat
  document-level overflow as the defect, not intentional nav scrolling.
- Durable onboarding progress, richer Assistant action chips, and publishing
  walkthrough state remain deferred; their absence is not a UX-09 failure.

## Pass, Caveat, Fail, Block

`PASS`

- Web/API health and deployment checks are ready enough for the sweep.
- Public routes load coherently and do not expose private owner data.
- Replay-owner login/session restore succeeds without recording credential
  values or private identifiers.
- Desktop and mobile routes avoid document-level horizontal overflow,
  overlapping text, clipped primary content, and trapped controls.
- Mutation boundaries are respected.
- UX-07A Settings tier readback and UX-08A provider-copy fixes are visible on
  hosted staging.

`PASS WITH CAVEAT`

- A route loads safely but seeded data lacks an optional label, fixture shape,
  or linked item.
- A transient hosted/network issue recovers on retry and final route evidence
  is coherent.
- `/studio/publishing` remains safe but still has a route-story clarity gap
  around linked discussion/retract wording.
- Browser evidence is useful but not broad enough to support a stronger claim.

`FAIL`

- An expected route persistently returns 5xx/404 or a visible product error.
- Login/session restore fails from visible product behavior rather than missing
  local credential values.
- A page exposes private owner data, source bodies, raw private identifiers,
  cookies, auth headers, provider payloads, credential material, or stack
  traces.
- Mobile has document-level horizontal overflow or unreadable/overlapping core
  content outside an intentionally scrollable container.
- Copy claims unavailable behavior such as automatic publishing, Assistant
  execution, live connector import, production API Bridge workers, unavailable
  Settings provider setup, or immediate billing activation.

`BLOCKED`

- The local replay credential key names are unavailable.
- Web/API health is not ready enough after one safe retry.
- Browser runner, network, or auth handoff fails before product evidence can be
  collected.
- Continuing would require printing credential values, cookies, auth headers,
  raw private identifiers, hosted logs, SQL, private payloads, or provider
  payloads.

## Wakeup Rules

If the sweep runs and verdict is `PASS` or `PASS WITH CAVEAT`, ARIADNE should
wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed UX-09 Railway staging UX review.
Verdict:
- PASS or PASS WITH CAVEAT
Task:
- Decide the next UX/product lane from the result.
```

If a product repair is needed, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE completed UX-09 Railway staging review and found product repair work.
Risk:
- List the smallest exact defects with routes and viewport evidence.
Task:
- Patch only the named defects, validate, and wake ARGUS.
```

If the sweep is blocked by readiness/auth/environment rather than product, wake
MIMIR with the exact blocker and no sensitive material.

## DAEDALUS Prep Validation

Docs-only prep plus safe health/deployment checks. No login, browser sweep,
hosted mutation, product code, schema, config, deployment, package, provider,
billing, import, publishing, or Assistant behavior changed.

| Command / check | Result | Notes |
| --- | --- | --- |
| Safe web health/deployment checks | Pass | Web health and deployment endpoints returned ready state at commit prefix `4575b10`. |
| Safe API health/deployment checks | Pass with caveat | API health passed; first deployment check reported database timeout, retry returned ready at commit prefix `4575b10`. |
| Prior staging evidence reconciliation | Pass | PR351, PR352, PR408, and final staging sweep instructions are folded into this packet. |
| UX-07A/UX-08A freshness caveat | Pass | Deployed commit prefix appears fresh enough, but ARIADNE must verify the surfaces on hosted staging. |
| `git diff --check` | Pass | Passed with no whitespace errors. |
| Added-line sensitive-pattern scan | Reviewed | One expected replay credential key-name match; no values or other matches. |
