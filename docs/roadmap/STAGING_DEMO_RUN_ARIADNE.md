# Staging demo run rehearsal - ARIADNE

Date: 2026-06-12

Owner: ARIADNE, A4 UX Navigator

## Verdict

STAGING-DEMO-RUN-01 is rehearsed, but not clean.

The seeded non-paid staging demo path is mostly route-complete: the primary
live pass returned 46 passing checks and 1 failing check across staging API,
public web routes, protected web shells, owner-scoped replay data, export,
Developer Space, billing, and observability surfaces.

One concrete backend blocker surfaced: owner memory endpoints fail on staging
with a Supabase relationship-embed ambiguity between `memory_items` and
`memory_item_lifecycle`. This can break the Memory tab/briefing portion of the
demo even though the protected web shell route itself returns 200.

Paid activation remains out of scope for this run. Redis, Cloudflare,
background jobs, and full workspace export should not be reopened from this
rehearsal.

## Rehearsal Mode

- Live staging API: `https://stationapi-production.up.railway.app`
- Live staging web: `https://stationweb-production.up.railway.app`
- Replay owner credentials were read from ignored local `.env`.
- Tokens and owner/persona/document/thread/export/trace/customer IDs stayed in
  process memory only.
- Staging URLs were hardcoded in the probe because the local `.env` points
  app/API defaults at localhost.
- No Checkout payment was started.
- No Developer Space key was shown or rotated.
- No chat/model prompt was sent.
- No prompt, completion, private excerpt, raw body, manifest body, raw snapshot,
  credential, token, cookie, or replay corpus text was captured.
- Protected web checks were HTTP shell checks with the auth cookie present; the
  actual authenticated data proof comes from bearer-token API routes.

## Route Completion

Preflight and public entry passed:

- API `/health`: 200, `ok:true`.
- API `/health/deployment`: 200, `ready:true`, served SHA prefix
  `5d6f5575b990`.
- Web `/`, `/discover`, `/developer-spaces`, and `/forums`: 200 app shells.

Public Space/community path passed:

- API `/spaces/station-replay-alpha`: 200, public access, 1 public document.
- Web `/space/station-replay-alpha`: 200 shell.
- API public document read: 200, visibility `public`, comments enabled.
- Web public document route: 200 shell.
- API document discussion: 200, eligible, discussion present.
- API thread detail: 200, active, 1 comment.
- Web forum discussion route: 200 shell.

Public Developer Space path passed:

- API `/developer-spaces/station-replay-dev-alpha`: 200, public access,
  1 node, 1 event, latest snapshot present.
- Web `/developer-spaces/station-replay-dev-alpha`: 200 shell.
- API `/developer-spaces/station-replay-dev-alpha/stream?once=1`: 200,
  readable SSE update.

Replay owner auth and Studio shells passed:

- API replay owner sign-in: 200, tier `canon`, token captured in memory only.
- API `/auth/me`: 200, tier `canon`, non-admin.
- API `/personas`: 200, 1 persona, replay persona matched.
- Web `/studio`, `/billing`, `/studio/export`,
  `/studio/personas/:personaId`, `/studio/personas/:personaId/files`,
  `/studio/personas/:personaId/continuity`,
  `/studio/personas/:personaId/memory`, and
  `/studio/personas/:personaId/canon`: 200 shells.

Persona continuity/archive/export path mostly passed:

- API `/conversations/persona/:personaId`: 200, 3 conversations
  (`active:2`, `archived:1`).
- API `/persona-files/persona/:personaId`: 200, 0 files.
- API `/imports/persona/:personaId`: 200, 0 jobs.
- API `/memory/persona/:personaId/graph`: 200, 4 nodes, 0 edges.
- API `/canon/persona/:personaId`: 200, 0 canon items.
- API `/continuity/persona/:personaId/records`: 200, 1 memory record.
- API `/conversations/persona/:personaId/context-preview`: 200, counts
  `canon:0`, `memory:1`, `integrity:1`, `archive:2`; source types
  `integrity`, `memory`, `archive`.
- API `/conversations/persona/:personaId/archive-retrieval`: 200, vector mode,
  1 returned, 2 searched, 0 skipped.
- API `/exports/persona/:personaId`: 200, 1 completed export.
- API `/exports/:id`: 200, completed `persona_archive`, 5 manifest keys.
- API `/exports/:id/bundle`: 200, 3 files.

Owner Developer Space path passed with a narrative gap:

- API `/developer-spaces`: 200, 1 owner Developer Space, replay slug matched.
- Web `/developer-spaces/station-replay-dev-alpha/manage`: 200 shell.
- API `/developer-spaces/:id/usage`: 200, warning `none`, but usage counters
  returned `nodes:0`, `events:0`, `snapshots:0` while the public observatory
  showed 1 node, 1 event, and a latest snapshot.
- API `/exports/developer-spaces/:id`: 200, 0 exports.

Billing and observability passed within non-paid scope:

- API `/billing/me`: 200, tier `canon`, subscription `inactive`, customer
  present.
- API `/observability/replay-readiness`: 200, 8 top-level metadata keys.
- API `/observability/summary`: 200, 3 traces, 0 failed, 3,882 total tokens,
  0.4002 estimated pence.
- API `/observability/traces?limit=5`: 200, 3 traces, 2 non-zero-token traces,
  all completed.
- API `/observability/traces/:traceId` was read in memory only to confirm
  3 events, 2 token-bearing events, and provider/model labels
  `platform/openai/gpt-oss-120b` and `platform`.

## Concrete Blocker

These owner memory routes fail on staging:

- API `/memory/persona/:personaId`
- API `/memory/persona/:personaId/briefing`

Sanitized error:

```text
Could not embed because more than one relationship was found for 'memory_items'
and 'memory_item_lifecycle'
```

Likely cause:

- `apps/api/src/routes/memory.ts` selects
  `memory_items(..., memory_item_lifecycle(*))`.
- `apps/api/src/services/memory-continuity.service.ts` uses the same embedded
  relationship for persona memory briefing.
- Staging schema now has more than one relationship path between
  `memory_items` and `memory_item_lifecycle`, including the lifecycle primary
  memory item and supersession target relationship.

UX impact:

- The Memory page shell can load, but owner memory list/briefing data can fail.
- This undercuts the demo's continuity promise because Memory is one of the
  surfaces where paid value should feel like it is accumulating.

Recommended DAEDALUS lane:

- `STAGING-DEMO-MEMORY-01`
- Fix the memory lifecycle query ambiguity without widening backend semantics.
- Prefer an explicit foreign-key embed if Supabase supports it cleanly, or split
  lifecycle loading into a second owner/persona-scoped query.
- Preserve owner scoping, persona scoping, lifecycle status semantics, and
  existing privacy behavior.
- Validate both `/memory/persona/:personaId` and
  `/memory/persona/:personaId/briefing` against staging or an equivalent focused
  test.

## Product Friction

- The owner Developer Space usage panel can read as inconsistent: public
  observatory data exists, but owner usage counters returned zero for nodes,
  events, and snapshots in this rehearsal.
- The protected web checks were shell-level, not a full human browser
  click-through with localStorage-backed authenticated UI state.
- The seeded persona Archive tab has no persona files or import jobs in this
  pass. Archive trust is still evidenced through private retrieval, continuity,
  and export readback, but the visible import/status story is thin.
- Billing is safe to show as `canon` with inactive subscription and customer
  present. Do not claim paid activation unless the external Stripe action is
  completed.

## Recommended Next Product Lane

Wake DAEDALUS for `STAGING-DEMO-MEMORY-01`.

After the memory endpoints are fixed, ARIADNE should rerun a narrow demo
rehearsal:

- memory list
- memory briefing
- persona Memory web surface
- continuity context preview
- archive retrieval
- export bundle readback

If that passes, MIMIR can decide whether to open a true human browser rehearsal
or move to demo narrative polish. Do not open Redis, Cloudflare, background
jobs, full workspace export, or Stripe activation unless new evidence demands
one of them.

## Post-Unblock Rerun

After ARGUS accepted STAGING-DEMO-MEMORY-01, ARIADNE reran the narrow memory
and continuity slice against live staging.

Deployment proof:

- API `/health/deployment`: 200, `ready:true`, served SHA prefix
  `bfdf5e31e6d3`.

Unblocked memory path:

- API `/memory/persona/:personaId`: 200, 4 memory rows, lifecycle statuses
  `rejected` and `active`.
- API `/memory/persona/:personaId/briefing`: 200, 3 active memories,
  lifecycle keys `rejected` and `active`.
- Web `/studio/personas/:personaId/memory`: 200 shell.

Continuity/archive/export smoke:

- API `/conversations/persona/:personaId/context-preview`: 200, counts
  `canon:0`, `memory:1`, `integrity:1`, `archive:2`.
- API `/conversations/persona/:personaId/archive-retrieval`: 200, vector mode,
  1 returned, 2 searched, 0 skipped.
- API `/exports/persona/:personaId`: 200, 1 completed export.
- API `/exports/:id/bundle`: 200, 3 files.

Post-unblock product verdict:

- The memory blocker is cleared on live staging.
- The seeded non-paid demo can move to a true human browser rehearsal with
  localStorage-backed auth and mobile checks.
- Keep paid activation excluded unless Marty completes the external Stripe
  Checkout/event step first.
- Keep Redis, Cloudflare, background jobs, and full workspace export out of
  scope unless new rehearsal evidence demands them.

Recommended next lane:

- `STAGING-DEMO-BROWSER-01`
- Run a real browser click-through of the non-paid route sequence, including
  Memory, Continuity, Archive, public Space/document/forum, Developer Space,
  Billing status, and mobile.
- Capture only route completion, user-facing friction, narrative gaps, and
  concrete blockers.
