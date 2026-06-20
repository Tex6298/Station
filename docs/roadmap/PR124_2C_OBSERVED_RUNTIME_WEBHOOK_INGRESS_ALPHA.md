# PR124 - 2C Observed Runtime Webhook Ingress Alpha

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews auth, replay/idempotency, visibility,
serialization, and overclaim risk. ARIADNE only rehearses if visible routes
change.
Status: opened for DAEDALUS

## Why This Lane

PR120-PR123 proved the observed-runtime fixture contract, durable classifications,
existing import bridge, and supporting context persistence. The next bounded
Phase 2C step is a first webhook ingress alpha that accepts the same observed
runtime envelope through Station's existing Developer Space security boundary.

This is not hosted runtime. Station still observes external runtime state; it
does not execute, schedule, or control that runtime.

## Scope

- Add a first alpha route for observed-runtime webhook ingress, likely:
  `POST /developer-spaces/ingest/observed-runtime`.
- Require the existing Developer Space ingestion key path. Do not add a bypass
  or public unauthenticated route.
- Require a stable idempotency/replay key, such as `X-Station-Webhook-Id`,
  `Idempotency-Key`, or an envelope delivery id.
- Add a tiny durable receipt/idempotency model if needed, for example
  `developer_space_observed_runtime_webhook_receipts`, with a unique key per
  Developer Space and webhook id. Prefer Supabase persistence over making Redis
  a required dependency.
- Accept the documented `station.observed_runtime.webhook.v1` envelope:
  - source says `runtimeHostedBy: "external"` and `stationRole: "observer"`;
  - observed timestamp;
  - payload families for nodes, events, snapshots, zones, resources/economy,
    edges, and provenance.
- Reuse the accepted PR120-PR123 validation, classification, secret stripping,
  supporting context mapping, usage/quota, and rate-limit behavior.
- Duplicate webhook ids should be safe and machine-readable, not double-import.
- Return non-secret import counts/status only. Do not echo raw private payloads,
  secret-shaped values, provider payloads, prompts, or full incoming bodies.
- Update architecture/status docs with exactly what "webhook ingress alpha"
  does and does not prove.

## Non-Scope

- No HMAC/signature scheme unless DAEDALUS finds an existing local pattern that
  can be added without widening the lane. If not, document it as the next hardening
  lane.
- No hosted runtime, container execution, scheduler, worker, queue, background
  loop, Cloudflare Worker, Vectorize index, D1 binding, or Cloudflare config
  request.
- No partner-specific adapter, partner branding, user-pasted secret flow, vault
  UI, ingestion-key redesign, billing, Stripe, Redis memory truth, provider
  routing, chat-native developer agent, or broad Developer Space UI redesign.
- No claim that Station executes, controls, or hosts the observed runtime.

## Acceptance

- A webhook envelope can be accepted through existing Developer Space key auth
  and transformed through the accepted import/readback path.
- Missing/invalid key is rejected.
- Missing/duplicate/replayed webhook id is handled safely and cannot double
  import.
- Public/member/owner/SSE readbacks preserve PR120-PR123 visibility boundaries.
- Secret-class values and secret-shaped fields never persist or serialize.
- Response bodies and errors are non-secret and machine-readable.
- Docs clearly frame this as webhook ingress alpha, not production-grade
  signed webhook security, Cloudflare runtime, or hosted execution.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

If client package behavior changes, also run its focused tests if available.
If visible web code changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

## Handoff

Wake ARGUS with:

- exact files touched;
- route and envelope shape;
- auth behavior;
- idempotency/replay receipt behavior;
- how webhook payload maps into existing import/readback;
- visibility and secret omission proof;
- validation results;
- explicit non-claims around HMAC/signatures, hosted runtime, Cloudflare,
  workers, queues, partner adapters, and secrets.

If webhook ingress cannot be added safely without widening scope, wake MIMIR
with the exact blocker and recommended next lane.
