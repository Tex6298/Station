# PR123 - 2C Observed Runtime Supporting Context

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews schema compatibility, visibility,
serialization, and overclaim risk. ARIADNE only rehearses if visible routes
change.
Status: accepted by ARGUS on 2026-06-20

## Why This Lane

PR122 made observed-runtime classifications durable for Developer Space nodes,
events, and snapshots. The remaining explicit PR120-PR122 delta is supporting
context: zones, resources/economy, graph edges, and provenance.

PR123 should give that supporting context a small durable home before any live
webhook, partner adapter, Cloudflare, or hosted-runtime lane.

## Scope

- Add the smallest durable model for observed-runtime supporting context.
  A single table is likely cleaner than overloading node/event/snapshot rows,
  for example:
  - `developer_space_observed_runtime_context`;
  - `developer_space_id`;
  - `context_type` for `zone`, `resource`, `edge`, or `provenance`;
  - optional `external_id` / `source_ref`;
  - public-safe `payload`;
  - nullable classification metadata using the PR122 rules;
  - timestamps and provenance fields.
- Extend the existing Developer Space import bridge/import route only as needed
  to accept optional supporting context from the PR120 fixture. Do not create a
  separate live webhook route.
- Persist only non-secret supporting context. Reject overexposed secret-shaped
  fields and strip secret-class values before storage.
- Add readback/serialization for supporting context only where the existing API
  shape can carry it safely. Public readback must stay public-safe; member and
  owner readbacks may include allowed classified fields if the existing access
  model supports them.
- Keep legacy Developer Spaces and imports working.
- Update the observed-runtime architecture doc so zones/resources/edges/
  provenance are no longer called unmapped if they become durable; otherwise
  record the exact remaining blocker.

## Non-Scope

- No live webhook route, webhook signatures, replay protection, or new external
  delivery contract.
- No hosted runtime, container execution, scheduler, worker, queue, background
  loop, Cloudflare Worker, Vectorize index, D1 binding, or Cloudflare config
  request.
- No partner-specific adapter, partner branding, user-pasted secret flow, vault
  UI, ingestion-key redesign, billing, Stripe, Redis memory truth, provider
  routing, chat-native developer agent, or broad Developer Space UI redesign.
- No claim that Station executes, controls, or hosts the observed runtime.

## Acceptance

- Zones, resources/economy, graph edges, and provenance from the canonical
  observed-runtime fixture either persist durably or have a precise blocker
  recorded for MIMIR.
- Supporting context uses the same visibility/secret boundary as PR122.
- Public/member/owner/SSE readbacks do not leak private or secret supporting
  context.
- Existing node/event/snapshot imports and legacy Developer Spaces still work.
- Docs accurately state what supporting context is durable and what remains
  deferred.
- No live webhook or runtime-hosting claim is introduced.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

If visible web code changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

## Handoff

Wake ARGUS with:

- exact files touched;
- table/column choice and legacy behavior;
- how zones/resources/edges/provenance map and what remains unmapped;
- ingestion validation and secret-stripping proof;
- public/member/owner/SSE serialization proof;
- validation results;
- explicit non-claims around webhooks, hosted runtime, Cloudflare, workers,
  queues, partner adapters, and secrets.

If supporting context cannot be persisted narrowly, wake MIMIR with the exact
blocker rather than widening the lane.

## DAEDALUS Implementation Notes

Implemented on 2026-06-20 with a single supporting-context table:

- added `infra/supabase/migrations/046_observed_runtime_supporting_context.sql`
  for `developer_space_observed_runtime_context`;
- added `supportingContext[]` to Developer Space batch import payloads and
  shared/client types;
- mapped canonical fixture zones, resources/economy, graph edges, and
  provenance into supporting context entries via the existing bridge helper;
- persists supporting context through the existing `/developer-spaces/ingest/import`
  route only, with no new live webhook route;
- applies the PR122 classification validation and secret stripping rules to
  supporting context payloads;
- returns supporting context through the existing Developer Space detail and
  SSE readback path, filtered by public/member/owner access.

There are no remaining unmapped PR120 fixture families in the synthetic bridge:
nodes, events, snapshots, zones, resources/economy, graph edges, and provenance
all have a durable import/readback path. Future live webhook work still needs a
delivery/auth/replay/rate-limit design before it can claim live ingestion.

No live webhook, webhook signature scheme, replay protection, hosted runtime,
Cloudflare Worker, Vectorize, D1, worker, queue, partner adapter, user-pasted
secret flow, billing, Stripe, Redis memory truth, provider routing,
chat-native developer agent, or visible Developer Space UI behavior changed.

## ARGUS Verdict

Accepted on 2026-06-20.

ARGUS confirmed:

- the single supporting-context table is scoped to Developer Space observed
  runtime context and keeps legacy spaces/imports compatible;
- `supportingContext[]` is accepted only through the existing batch import
  boundary;
- supporting context uses the PR122 classification validator and secret
  stripping before persistence;
- public/member/owner detail readbacks and SSE serialize supporting context
  through the same access-aware filtering as node/event/snapshot material;
- no canonical synthetic fixture families remain unmapped in the bridge, while
  live webhook delivery/auth/replay/rate-limit design remains deferred.

Validation: `test:developer-spaces` 22 passed,
`test:developer-space-client` 4 passed, `typecheck` passed, `@station/api`
build passed, and `git diff --check` passed with CRLF normalization warnings
only.

No ARIADNE rehearsal is required because no visible route changed.
