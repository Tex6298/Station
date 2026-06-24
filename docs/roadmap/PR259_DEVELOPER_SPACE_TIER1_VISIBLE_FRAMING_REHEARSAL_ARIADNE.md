# PR259 - Developer Space Tier 1 Visible Framing Rehearsal

Owner: A4 / ARIADNE

Status: passed

Opened by: A1 / MIMIR on 2026-06-24

## Why This Lane Exists

ARGUS accepted PR258, but PR258 changes visible browser copy and framing on the
public Developer Space route and the owner manage console. Before MIMIR closes
the lane, ARIADNE should rehearse it from a human eye view on hosted Railway.

This is a rehearsal lane only. Do not implement fixes in this lane. If a defect
appears, wake MIMIR with a precise `PASS`, `FAIL`, or `BLOCKED` result and the
smallest DAEDALUS repair you recommend.

## Hosted Freshness Gate

Check hosted Railway first:

- Web `/health/deployment` is healthy, ready, on branch `main`, and at or
  beyond ARGUS review commit `9c18eb6`.
- API `/health/deployment` is healthy and ready if the API health route is
  needed for sign-in/API-backed owner checks.

If the hosted app is still deploying or reports an older commit, wait/retry
briefly. If it remains old, return `BLOCKED` with the observed commit and
health state. Do not call the browser rehearsal a failure before hosted
freshness is established.

## Routes To Rehearse

Use hosted Railway:

- Public route: `/developer-spaces/station-replay-dev-alpha`
- Owner route: `/developer-spaces/station-replay-dev-alpha/manage`

Use desktop and `390px` mobile or the closest available mobile width. Sign in
as the replay owner only for owner-route checks. Do not print credentials,
tokens, cookies, local env values, API keys, or response bodies containing
secret-shaped material.

## Public Route Pass Criteria

On desktop and mobile, the public route should read as:

- Tier 1 showcase / public observatory / evidence path for an external or
  self-hosted developer runtime.
- Station displays public-safe node, event, snapshot, live-signal, and evidence
  summaries.
- Live signals are described as public-safe summaries, not raw runtime payloads.
- The page does not imply Station hosts the developer app, database, queue,
  repository, deployment pipeline, provider runtime, or job worker.
- Evidence/methodology/field-log copy is visible or honestly thin if the seeded
  data has little evidence.
- Anonymous or non-owner public view does not expose owner manage-console
  controls, ingestion keys, signing secrets, raw payloads, private fields,
  private document bodies, source ids, raw link ids, prompts, provider payloads,
  SQL, stack traces, hosted logs, bearer tokens, or credentials.
- The layout has no horizontal overflow, incoherent overlap, clipped primary
  controls, or unreadable text on desktop or mobile.

## Owner Manage Route Pass Criteria

On desktop and mobile, the owner route should read as:

- Private Tier 1 operating/readback console.
- Ingestion-key copy clearly says keys belong in the self-hosted runtime
  environment, not browser code or public pages.
- Visual mode/widgets copy makes clear it frames the public observatory only.
- Evidence path copy makes clear public evidence is curated from methodology,
  findings, field logs, notes, and public-safe document links.
- Export/readback copy remains owner-only.
- Developer Agent copy remains bounded to preview/readback, confirmation,
  receipt, selected status note, layout suggestion, and `run_job`
  dry-run/readiness only.
- The owner route does not imply repo push, real job execution, key rotation,
  signing-secret creation by agent, direct layout mutation, provider calls,
  deploys, workers, billing, Redis/queues, Cloudflare, Docker/Coolify, or
  Station-hosted partner runtime.
- Existing controls remain visibly wired or honestly disabled/preview-only.
- The layout has no horizontal overflow, incoherent overlap, clipped primary
  controls, or unreadable text on desktop or mobile.

## Non-Scope

- Do not test or change schema, migrations, API contracts, serializers, SDKs,
  env vars, Railway/Supabase config, billing, community/forum surfaces,
  Project/persona/export payload behavior, background jobs, provider execution,
  Redis/Cloudflare behavior, or developer-agent capabilities.
- Do not generate ingestion keys, rotate secrets, publish evidence, create
  exports, approve agent confirmations, or mutate live data unless an existing
  rehearsal script already does so safely and you explicitly report it.

## Wake MIMIR

When complete, commit with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR259 Developer Space Tier 1 Visible Framing Rehearsal.
- Verdict: PASS/FAIL/BLOCKED.
- Routes/viewports checked: ...
Findings:
- ...
Validation:
- ...
Task:
- Close PR258/PR259 or open the smallest DAEDALUS repair.
```

If `FAIL`, include exact route, viewport, visible defect, and whether the defect
is copy/framing, action wiring, layout, privacy, or hosted freshness.

## ARIADNE Result - 2026-06-24

Verdict: PASS.

Hosted freshness:

- Web `/health/deployment` returned `ok:true`, `ready:true`, branch `main`,
  service `@station/web`, and commit `3bedfa5`.
- API `/health/deployment` returned `ok:true`, `ready:true`, branch `main`,
  service `@station/api`, and commit `3bedfa5`.
- `3bedfa5` is the PR258 web implementation commit. The later ARGUS review
  commit `9c18eb6` changed docs/status/validation files only, so Railway's
  watched-file deploy skip does not make the visible browser rehearsal stale.

Routes/viewports checked:

- Anonymous public `/developer-spaces/station-replay-dev-alpha` at desktop
  `1280x900`.
- Anonymous public `/developer-spaces/station-replay-dev-alpha` at `390x844`
  mobile.
- Replay-owner `/developer-spaces/station-replay-dev-alpha/manage` at desktop
  `1280x900`.
- Replay-owner `/developer-spaces/station-replay-dev-alpha/manage` at
  `390x844` mobile.

Findings:

- Public route reads as a Tier 1 showcase, public observatory, evidence path,
  and readback for an external/self-hosted runtime.
- Public live-signal copy is public-safe and does not imply Station hosts the
  app, database, queue, repo, deploy pipeline, provider runtime, or job worker.
- Public route did not expose owner controls, raw event/snapshot controls,
  ingestion snippets, bearer tokens, credentials, or secret-shaped material.
- Owner manage route reads as a private Tier 1 operating/readback console with
  keys framed as runtime-environment material, not browser/public-page
  material.
- Owner visual mode, widget, evidence, export, and Developer Agent copy keeps
  the boundary narrow: public observatory framing only, owner-only exports, and
  Developer Agent preview/readback/confirmation/receipt/status-note/layout
  suggestion/`run_job` dry-run/readiness only.
- Desktop and `390px` mobile checks found no page-level horizontal overflow,
  clipped primary controls, or unreadable framing text.

Validation:

- `node --check tmp-pr259-developer-space-tier1-framing.spec.js`
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr259-developer-space-tier1-framing.spec.js --reporter=line --workers=1`
