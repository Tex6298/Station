# PR121 - 2C Observed Runtime Ingest Bridge Dry Run

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews ingestion auth, visibility, and
overclaim risk. ARIADNE only rehearses if a visible route changes.
Status: opened for DAEDALUS

## Why This Lane

PR120 proved the neutral observed-runtime fixture contract and public-safe
normalization. The next Phase 2C step should prove the fixture can pass through
Station's existing Developer Space ingestion/readback boundaries without
opening live webhooks or runtime hosting.

This is a dry run over current Station APIs/helpers. It should make the path
more real while keeping the same external-observer boundary.

## Scope

- Add a small adapter/helper or test harness that converts an accepted observed
  runtime fixture into the existing Developer Space ingestion shapes for nodes,
  events, and snapshots.
- Exercise the bridge with the canonical PR120 fixture against existing
  Developer Space ingestion/readback test surfaces.
- Verify that ingestion auth/key requirements still apply.
- Verify public/member/owner readbacks preserve the PR120 visibility contract
  and never serialize secret-class values.
- Verify private or secret-shaped fixture fields cannot leak through eventData,
  node metrics, snapshotData, source refs, error bodies, SSE detail, or docs.
- Keep zones, resources/economy, edges, and provenance as supporting dry-run
  readback or documented future mappings if the existing Developer Space schema
  has no safe home for them yet.
- Update the observed-runtime architecture doc with the dry-run bridge result
  and the remaining delta before a real webhook lane.

## Non-Scope

- No new live ingestion route unless the existing routes cannot support the dry
  run and MIMIR is woken with the exact blocker first.
- No hosted runtime, container execution, scheduler, worker, queue, background
  loop, or Cloudflare Worker/Vectorize/D1 path.
- No partner-specific adapter, partner branding, or partner secrets.
- No user-pasted secret flow, vault UI, ingestion-key redesign, billing, Stripe,
  Redis memory truth, provider routing, chat-native developer agent, or broad
  Developer Space UI redesign.
- No claim that Station executes, controls, or hosts the observed runtime.

## Acceptance

- The canonical observed-runtime fixture can be transformed into existing
  Developer Space ingest payloads or a documented exact blocker explains why it
  cannot.
- Existing ingestion auth/key checks remain in force.
- Public readback contains only public observed data.
- Member/owner readbacks follow explicit visibility rules and still omit
  secret-class data.
- Any unmapped zones/resources/edges/provenance are intentionally documented,
  not silently dropped in a way that would mislead the next lane.
- No new infrastructure or live webhook claim is introduced.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If API implementation files change beyond tests/helpers, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
```

If visible web code changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

## Handoff

Wake ARGUS with:

- exact files touched;
- whether the bridge is helper-only, test-harness-only, or touches API code;
- how fixture nodes/events/snapshots map into existing ingestion payloads;
- what remains unmapped for zones/resources/edges/provenance;
- auth and visibility proof;
- validation results;
- explicit non-claims around hosted runtime, Cloudflare, webhooks, workers,
  queues, partner adapters, and secrets.

If the existing ingestion path cannot support the bridge cleanly, wake MIMIR
with the exact blocker instead of widening the lane.
