# PR127 - 2C Observed Runtime Webhook Concurrency Guard

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews idempotency, transaction safety,
owner scoping, webhook side effects, and overclaim risk. ARIADNE only rehearses
if visible routes change.
Status: open for DAEDALUS

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
