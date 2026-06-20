# PR127 - 2C Observed Runtime Webhook Concurrency Guard

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews idempotency, transaction safety,
owner scoping, webhook side effects, and overclaim risk. ARIADNE only rehearses
if visible routes change.
Status: implemented by DAEDALUS on 2026-06-21; waiting for ARGUS review

## Why This Lane

PR124 added observed-runtime webhook ingress and receipt-backed sequential
idempotency. PR125 added HMAC signatures. PR126 added dedicated signing-secret
lifecycle. The remaining bounded webhook hardening caveat is concurrent
delivery: two identical deliveries, or same-id/different-payload deliveries,
must not race into duplicate imports, duplicate usage/quota mutation, duplicate
SSE broadcasts, or inconsistent receipt state.

This lane should harden the existing API/database path without introducing
workers, queues, partner adapters, hosted runtime, Cloudflare, or broader
runtime architecture.

## Scope

- Review the current `POST /developer-spaces/ingest/observed-runtime` receipt
  and import transaction flow.
- Add the smallest concurrency guard that fits the existing stack, such as:
  - relying on the existing receipt unique key plus an atomic insert/select
    pattern;
  - using a Postgres transaction or row lock around receipt/import side effects;
  - treating in-progress same-id/same-payload delivery as a bounded replay or
    retryable conflict;
  - ensuring same-id/different-payload never imports or mutates usage after a
    competing receipt exists.
- Preserve PR124 sequential replay behavior:
  - same id plus same payload returns the stored non-secret import summary;
  - same id plus different payload returns a bounded conflict without echoing
    raw changed payload data.
- Preserve PR125 and PR126 auth/signature behavior:
  - Developer Space key auth remains required;
  - signature verification still happens before JSON parse, import, receipt,
    usage/quota mutation, or SSE broadcast;
  - active dedicated signing secrets and the documented ingestion-key fallback
    semantics remain intact.
- Add focused tests that simulate concurrent duplicate deliveries as directly
  as the local test harness allows. If true parallel DB simulation is not
  practical, add a deterministic unit/service-level proof for the lock/receipt
  branch and explain the limitation.
- Keep response and log surfaces non-secret.

## Non-Scope

- No worker, queue, background processor, scheduler, hosted runtime, container
  execution, Cloudflare Worker, Vectorize, D1, or Cloudflare config request.
- No partner adapter, partner onboarding, public webhook wizard, or production
  partner claim.
- No user-pasted secret flow, vault UI, billing, Stripe, Redis memory truth,
  provider routing, chat-native developer agent, or broad Developer Space UI.
- No migration of canonical runtime truth out of Supabase.
- No visible-route rehearsal unless a visible route changes.

## Acceptance

- Concurrent same-id/same-payload deliveries cannot create duplicate imports,
  duplicate receipts, duplicate usage/quota mutation, or duplicate SSE
  broadcast side effects.
- Concurrent same-id/different-payload deliveries cannot import the changed
  payload or mutate usage/quota after the first payload wins.
- Existing sequential replay/conflict semantics remain unchanged.
- Existing PR125/PR126 signature and signing-secret semantics remain unchanged.
- Owner/private/public readback and secret stripping remain unchanged.
- Tests cover the concurrency guard and the existing replay/conflict behavior.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

If raw-body middleware, billing wiring, or signing-secret encryption helpers
change unexpectedly, rerun the relevant focused gate and explain why.

## Handoff

Wake ARGUS with:

- exact files touched;
- concurrency guard strategy;
- transaction/unique-key/lock behavior;
- same-id/same-payload concurrent proof;
- same-id/different-payload concurrent proof;
- proof that signature verification still precedes side effects;
- proof that usage/quota/import/SSE side effects do not duplicate;
- validation results;
- explicit non-claims around workers, queues, hosted runtime, Cloudflare,
  partner adapters, Redis memory truth, broad UI, and secrets.

If the current schema cannot support a truthful concurrency guard without a
larger queue/worker/lock primitive, wake MIMIR with the exact blocker and the
smallest recommended next lane.

## DAEDALUS Implementation Notes - 2026-06-21

Implemented the smallest Supabase-backed concurrency guard over the existing
receipt table and route:

- The route now computes a stable sorted JSON payload hash so semantically
  equivalent payloads do not depend on object insertion order after Zod
  normalization.
- After key auth, raw-body signature verification, JSON parse, envelope
  validation, webhook id extraction, and stable payload hashing, the route
  claims the existing unique `(developer_space_id, webhook_id)` receipt before
  import-side effects.
- A new receipt is first written with non-secret processing state:
  `{ accepted:false, replayed:false, webhookId, status:"processing" }`.
- Only the claimed request proceeds to rate checks, usage/quota checks, import,
  receipt finalization, and SSE broadcast.
- If a concurrent request sees the same webhook id and same payload hash while
  the receipt is still processing, it receives a bounded retryable
  `developer_space_webhook_in_progress` response and does not import.
- If a concurrent request sees the same webhook id and a different payload hash,
  it receives the existing bounded
  `developer_space_webhook_replay_conflict` response and does not import.
- If a request sees a completed same-id/same-payload receipt, existing replay
  behavior remains unchanged.
- If the insert loses a unique-key race, the route reselects the receipt and
  applies the same in-progress/replay/conflict classification.

Local tests simulate the concurrent branch by preloading a processing receipt
with the stable payload hash. This is deterministic and proves the route branch
that a losing concurrent delivery hits; true database-level parallelism remains
covered by the existing unique key rather than a local thread scheduler.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 25 tests passed, including in-progress same-id/same-payload retryable response, same-id/different-payload conflict without import, no duplicate receipt/import/usage side effects, and existing webhook replay/signing-secret behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 4 client tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API build completed. |
| `git diff --check` | Pass | CRLF normalization warnings only, including local agent state that was not staged. |

Non-claims preserved: no worker, queue, background processor, hosted runtime,
Cloudflare Worker/Vectorize/D1, partner adapter, user-pasted secret flow, vault
UI, billing/Stripe change, Redis memory truth, provider routing, chat-native
developer agent, broad UI, or migration of canonical runtime truth out of
Supabase was added.
