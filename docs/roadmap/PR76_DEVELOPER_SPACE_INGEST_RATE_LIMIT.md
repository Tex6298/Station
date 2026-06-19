# PR76 - Developer Space Ingestion Rate Limit

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews.
Status: open

## Why This Lane

PR75 made Developer Space ingestion failures machine-readable and documented the
current truth: durable usage quotas exist, but there is no distinct
short-window ingestion-key request rate limit.

Upstash Redis REST configuration is now available in the Railway API
environment and the repo already has an operational-cache boundary with a
`rate_limit` purpose. That makes this the right moment to turn the remaining
partner-readiness gap into real guarded behavior, without promoting Redis to
memory truth or queue infrastructure.

## Goal

Add a bounded request-window limiter for Developer Space ingestion routes.

The limiter should protect authenticated ingestion-key routes from bursts while
keeping the existing durable `developer_space_usage` quotas authoritative for
nodes, events, snapshots, storage, public reads, and exports.

## Scope

Inspect before editing:

- `apps/api/src/routes/developer-spaces.ts`;
- `apps/api/src/routes/developer-spaces.test.ts`;
- `apps/api/src/services/operational-cache.service.ts`;
- `apps/api/src/services/operational-cache.service.test.ts`;
- `apps/api/src/services/operational-quota.service.ts`;
- `packages/developer-space-client/src/index.ts`;
- `packages/developer-space-client/src/index.test.ts`;
- `packages/developer-space-client/README.md`;
- `docs/roadmap/PR75_DEVELOPER_SPACE_PARTNER_READINESS.md`;
- `docs/roadmap/PR4_REDIS_OPERATIONAL_BOUNDARY.md`;
- `docs/roadmap/PR71_LIVE_CONFIG_READINESS_REFRESH.md`.

Preferred implementation path:

1. Add a small operational-cache primitive for rate-limit counters if the
   current provider interface is missing one.
   - Prefer Redis `INCR` plus TTL/expiry semantics for Upstash REST.
   - Keep disabled/no-provider behavior explicit and safe.
   - Do not use raw ingestion keys in cache keys or logs.
2. Apply the limiter after a Developer Space API key authenticates and before
   payload parsing/write work.
3. Scope the counter to the Developer Space and, if safely available, the active
   ingestion-key row id. Legacy-key fallback may be scoped to the Developer
   Space if no key row exists.
4. Return a stable 429 response such as:

```json
{
  "error": "Developer Space ingestion rate limit exceeded.",
  "code": "developer_space_rate_limited",
  "category": "rate_limit",
  "resource": "developer_space_ingest_requests",
  "limit": 120,
  "used": 121,
  "retryAfter": 60
}
```

5. Expose only non-secret docs/client behavior. The client should surface
   `category: "rate_limit"` and `retryAfter` without special-case string
   parsing.
6. Document whether the limiter is active only when the operational cache is
   enabled. Local disabled-cache fallback must stay honest and testable.

If a safe cache-backed counter cannot be implemented without a larger adapter or
persistent schema change, stop and wake MIMIR with the exact blocker.

## Configuration

Use conservative defaults, with env overrides if the codebase pattern supports
them:

```env
DEVELOPER_SPACE_INGEST_RATE_LIMIT_PER_MINUTE=120
DEVELOPER_SPACE_INGEST_RATE_LIMIT_WINDOW_SECONDS=60
```

Do not require Marty to provide new config for this lane. Upstash REST is
already present for staging, and local tests should use the test provider.

## Guardrails

- No Redis memory truth, retrieval cache, queue, worker, BullMQ, QStash, or
  background-job architecture.
- No hosted runtime, container execution, Cloudflare/Vectorize/NESTstack, or
  edge route.
- No new persistent rate-limit table unless DAEDALUS wakes MIMIR first with a
  blocker.
- No billing/pricing/tier redesign.
- No Project/DexOS/institutional-collaboration expansion.
- No public payload expansion, raw ingestion key storage, secret logging, or
  raw database error echo.
- No broad UI. This should be API/client/docs/tests unless a tiny owner-facing
  copy correction is unavoidable.

## Acceptance

- Ingestion-key routes are rate limited when the operational-cache provider is
  enabled.
- Disabled-cache fallback is explicit and does not pretend rate limiting is
  active.
- Auth, validation, durable quota, rate-limit, and server failures remain
  distinguishable by `category` and `code`.
- Rate-limit responses include `retryAfter` and do not include secrets, raw
  keys, raw payloads, or database errors.
- Existing public observatory and owner/raw serializers are unchanged.
- Partner docs explain request-window limits separately from durable usage
  quotas.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/operational-cache.service.test.ts
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If implementation touches web UI, also run `test:studio-ui` and the web build.

## Handoff

DAEDALUS must wake ARGUS with:

- exact limiter behavior and defaults;
- whether active behavior is cache-backed, disabled fallback, or blocked;
- response shape;
- files changed;
- docs/client updates;
- public/private safety notes;
- validation output.

If blocked, wake MIMIR instead with the missing primitive or schema change. Do
not go idle without a wakeup handoff.
