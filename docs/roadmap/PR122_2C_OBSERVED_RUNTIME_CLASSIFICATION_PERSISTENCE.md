# PR122 - 2C Observed Runtime Classification Persistence

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews schema compatibility, visibility,
serialization, and overclaim risk. ARIADNE only rehearses if visible routes
change.
Status: closed by MIMIR on 2026-06-20 after ARGUS acceptance

## Why This Lane

PR121 proved the accepted observed-runtime fixture can drive the existing
Developer Space import route, but only as a durable public-safe import. The
current Developer Space persistence model has no durable home for PR120 field
classifications, so richer member/owner readbacks remain helper-only proof.

PR122 should add the smallest durable visibility metadata needed before any
real webhook, partner adapter, Cloudflare, or hosted-runtime lane.

## Scope

- Add a migration, likely `045_observed_runtime_classifications.sql`, that gives
  Developer Space observed records durable classification metadata without
  changing existing public-safe behavior.
- Prefer nullable JSONB metadata columns on the current node/event/snapshot
  tables unless a tiny side-table is clearly safer:
  - `developer_space_nodes`;
  - `developer_space_events`;
  - `developer_space_snapshots`.
- Store only classification/provenance metadata needed to reapply PR120
  visibility rules. Do not store secret values.
- Extend Developer Space ingestion schemas for import payloads so observed
  runtime field classifications can be accepted when present, validated, and
  persisted.
- Keep legacy rows and current public-safe imports working with safe defaults.
- Update serializers/readbacks so public/member/owner/SSE responses apply
  durable classifications instead of relying only on pre-flattened public-safe
  payloads.
- Carry zones/resources/economy/edges/provenance as explicit metadata or
  documented unmapped deltas. Do not force them into misleading public fields.
- Add focused API/helper tests proving:
  - unauthenticated or bad-key import remains blocked;
  - overexposed secret-shaped classifications are rejected;
  - public readback omits member/owner/private/secret material;
  - member/owner readbacks can include allowed durable fields where the current
    API access model supports them;
  - secret-class values never serialize;
  - legacy rows continue to serialize safely.
- Update architecture/status docs with exactly what became durable and what is
  still deferred.

## Non-Scope

- No live webhook route, webhook signature scheme, replay protection, or rate
  design beyond current ingestion limits.
- No hosted runtime, container execution, scheduler, worker, queue, background
  loop, Cloudflare Worker, Vectorize index, D1 binding, or Cloudflare config
  request.
- No partner-specific adapter, partner branding, user-pasted secret flow, vault
  UI, ingestion-key redesign, billing, Stripe, Redis memory truth, provider
  routing, chat-native developer agent, or broad Developer Space UI redesign.
- No claim that Station executes, controls, or hosts the observed runtime.

## Acceptance

- Observed-runtime field classifications can be persisted durably for imported
  node/event/snapshot material.
- Existing imports without classification metadata still work and serialize
  with safe legacy defaults.
- Public, member, owner, and SSE readbacks preserve the accepted PR120/PR121
  visibility boundaries.
- Secret-class values are never persisted as serializable data and never appear
  in API responses, error bodies, docs, or tests.
- Any unmapped zones/resources/edges/provenance remain explicit and honest.
- No new live webhook or runtime-hosting claim is introduced.

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

Record the known Windows Next standalone symlink `EPERM` only if the build
reaches successful compile/lint/typecheck/page generation first.

## Handoff

Wake ARGUS with:

- exact files touched;
- migration/table/column choice and legacy-row behavior;
- how ingestion validates and persists classifications;
- public/member/owner/SSE visibility proof;
- secret omission proof;
- unmapped zones/resources/edges/provenance status;
- validation results;
- explicit non-claims around webhooks, hosted runtime, Cloudflare, workers,
  queues, partner adapters, and secrets.

If the current schema cannot support this narrowly, wake MIMIR with the exact
blocker rather than widening the lane.

## DAEDALUS Implementation Notes

Implemented on 2026-06-20 with the smallest durable metadata surface:

- added `infra/supabase/migrations/045_observed_runtime_classifications.sql`
  with nullable `observed_runtime_classifications jsonb` columns on
  `developer_space_nodes`, `developer_space_events`, and
  `developer_space_snapshots`;
- extended shared and client Developer Space payload types with optional
  `fieldClassifications`;
- extended ingestion schemas for node state, events, snapshots, and batch
  imports to accept classification metadata;
- validates classification maps, rejects secret-shaped paths unless classified
  as `secret`, strips secret-class values before persistence, and does not keep
  secret-class field names in persisted metadata;
- keeps legacy rows/imports without metadata on the existing raw-owner /
  public-safe visitor behavior;
- applies persisted classifications in detail and SSE serializers so public,
  member, and owner readbacks follow the PR120 visibility model after storage;
- updates the observed-runtime bridge helper so the import payload carries
  non-secret classified values plus metadata, rather than flattening to
  public-safe only.

Zones, resources/economy, edges, and provenance remain explicit dry-run deltas;
they were not forced into node/event/snapshot payloads.

No live webhook route, webhook signature scheme, hosted runtime, Cloudflare
Worker, Vectorize, D1, worker, queue, partner adapter, user-pasted secret flow,
billing, Stripe, Redis memory truth, provider routing, chat-native developer
agent, or visible Developer Space UI behavior changed.

## ARGUS Verdict

Accepted on 2026-06-20.

ARGUS confirmed:

- nullable JSONB metadata is limited to node/event/snapshot classification
  readback and keeps legacy rows compatible;
- ingestion validates optional `fieldClassifications`, rejects secret-shaped
  paths unless classified as `secret`, strips secret-class values before
  persistence, and omits secret-class field names from persisted metadata;
- public/member/owner detail readbacks and SSE apply the same durable
  classification filtering;
- legacy rows without metadata keep the existing raw-owner/public-safe visitor
  serialization behavior;
- zones, resources/economy, edges, and provenance remain explicit unmapped
  deltas for a later schema lane.

Validation: `test:developer-spaces` 22 passed,
`test:developer-space-client` 4 passed, `typecheck` passed, `@station/api`
build passed, and `git diff --check` passed with CRLF normalization warnings
only.

No ARIADNE rehearsal is required because no visible route changed.

## MIMIR Closeout

MIMIR closes PR122 as the accepted durable classification lane for observed
runtime nodes, events, and snapshots. The import path can now persist
non-secret classification metadata and apply public/member/owner/private
filtering after storage.

The next bounded Phase 2C lane is supporting observed-runtime context
persistence for zones, resources/economy, edges, and provenance. Do not jump to
live webhooks, hosted runtime, Cloudflare, workers, queues, or partner adapters
until those unmapped deltas have an accepted durable model.
