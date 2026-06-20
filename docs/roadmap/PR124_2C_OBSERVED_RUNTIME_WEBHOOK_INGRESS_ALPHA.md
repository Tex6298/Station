# PR124 - 2C Observed Runtime Webhook Ingress Alpha

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews auth, replay/idempotency, visibility,
serialization, and overclaim risk. ARIADNE only rehearses if visible routes
change.
Status: accepted by ARGUS on 2026-06-20

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

## DAEDALUS Implementation Notes

Implemented on 2026-06-20 as a webhook ingress alpha:

- added `POST /developer-spaces/ingest/observed-runtime`;
- accepts `station.observed_runtime.webhook.v1` envelopes with external
  observer source, observed timestamp, and the existing batch import payload;
- requires the existing Developer Space ingestion key;
- requires a stable webhook id from `X-Station-Webhook-Id`, `Idempotency-Key`,
  or `deliveryId`;
- added
  `infra/supabase/migrations/047_observed_runtime_webhook_receipts.sql` for
  durable per-space webhook receipts;
- replays with the same id and same payload return the stored non-secret import
  summary without double-importing;
- reusing an id with a different payload returns a machine-readable conflict;
- route responses include counts/status only, not raw payloads;
- the webhook route reuses the same batch import persistence path as
  `/developer-spaces/ingest/import`.

HMAC/signature verification is deferred as the next hardening lane; no existing
local pattern was present that fit without widening this alpha.

No hosted runtime, Cloudflare Worker, Vectorize, D1, worker, queue, partner
adapter, user-pasted secret flow, billing, Stripe, Redis memory truth, provider
routing, chat-native developer agent, or visible Developer Space UI behavior
changed.

## ARGUS Verdict

Accepted on 2026-06-20 as webhook ingress alpha.

ARGUS confirmed:

- the route stays behind the existing Developer Space ingestion key boundary;
- the envelope requires `station.observed_runtime.webhook.v1`,
  `runtimeHostedBy: "external"`, `stationRole: "observer"`, `observedAt`, and a
  stable webhook id;
- same-id/same-payload sequential replays return the stored non-secret import
  summary instead of double-importing;
- same-id/different-payload returns a machine-readable conflict without echoing
  raw changed payload data;
- the webhook route reuses the accepted PR120-PR123 batch import path,
  classification validation, secret stripping, supporting-context persistence,
  usage/quota checks, rate limiting, and readback serializers.

Bounded caveats:

- HMAC/signature verification is deferred and should be the next hardening lane
  before partner or production webhook use.
- This proves receipt-backed sequential replay handling, not a full concurrent
  delivery lock/queue worker design.

Validation: `test:developer-spaces` 23 passed,
`test:developer-space-client` 4 passed, `typecheck` passed, `@station/api`
build passed, and `git diff --check` passed with CRLF normalization warnings
only.

No ARIADNE rehearsal is required because no visible route changed.
