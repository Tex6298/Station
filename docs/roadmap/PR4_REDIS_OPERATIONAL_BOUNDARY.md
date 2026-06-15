# PR 4 - Redis Operational Boundary Hardening

Date opened: 2026-06-15

Opened by: A1 / MIMIR

Prerequisite: PR 3 Stripe paid-path proof accepted by A3 / ARGUS in
`192fb6f`.

Owner: A2 / DAEDALUS first, then A3 / ARGUS.

Status: ARGUS accepted the result on 2026-06-15 and recommends closing PR 4.
See `docs/roadmap/PR4_REDIS_OPERATIONAL_BOUNDARY_RESULT.md`.

## Goal

Keep Redis/Valkey/Upstash useful, boring, and correctly bounded for the current
backend.

The replay claim to earn is:

> Redis is clearly operational infrastructure for cache, idempotency, rate-limit,
> and short-lived queue state; it is not silently treated as canonical memory in
> the current replay backend.

## Current Truth To Reconcile

- `apps/api/src/services/operational-cache.service.ts` already defines scoped
  operational cache purposes, environment/owner/persona/Developer Space key
  segments, TTLs, Upstash REST support, disabled TCP Redis/Valkey behavior, and
  best-effort invalidation hooks.
- `/health/deployment` already reports non-secret Redis/Upstash readiness
  booleans.
- `/observability/replay-readiness` still contains older cache-provider blocker
  wording. PR 4 should reconcile that with current staging truth and with the
  operational-cache boundary.
- Redis as memory truth is not rejected forever. It is simply out of scope for
  this lane because durability, eviction, backup, deletion, export, audit, and
  semantic-search semantics need a separate decision.

## Scope

- Audit the operational-cache service, tests, health/deployment readiness,
  replay-readiness wording, env/example coverage, and current call sites.
- Verify or add non-secret readiness/status facts for:
  - Upstash REST configured/enabled,
  - TCP Redis/Valkey configured but disabled pending a concrete client/provider,
  - missing cache config,
  - provider kind without URLs, tokens, hostnames, or credentials.
- Reconcile docs and replay-readiness language so current Redis/Upstash support
  is not framed as unresolved when it is merely an operational-cache boundary.
- Preserve owner/persona/Developer Space key scoping and TTL behavior.
- Add or adjust focused tests only if the audit finds a real gap in readiness,
  key scoping, disabled behavior, invalidation, or secret redaction.
- If DAEDALUS finds a concrete idempotency/cache helper needed by the just-closed
  import or Stripe lanes, implement the smallest helper and test it.

## Do Not

- Do not store canonical memory, archive truth, continuity truth, or export truth
  in Redis.
- Do not design long-term working memory in this lane.
- Do not add Redis-dependent replay behavior.
- Do not introduce a broad worker queue.
- Do not add Cloudflare retrieval, provider migration, billing changes,
  archive/import rewrites, or broad UI work.
- Do not print or commit Redis URLs, Upstash tokens, hostnames, credentials,
  private cache values, prompt text, archive excerpts, or replay credentials.

## Acceptance Gates

- Health/readiness surfaces expose only non-secret Redis/cache status.
- Replay-readiness no longer overstates cache-provider selection as an open
  blocker if the current staging truth is already "Upstash operational cache is
  configured" or "cache explicitly disabled/deferred".
- Operational cache keys remain environment and owner/persona/Developer Space
  scoped.
- TTLs remain short and purpose-specific.
- Disabled Redis/Valkey states fail closed without runtime dependence.
- Any new helper is explicitly for operational cache, idempotency, rate limit, or
  short-lived queue state, not canonical memory.
- Docs leave room for a future Redis-backed memory or working-memory lane only
  after durability/export/deletion/audit semantics are deliberately accepted.

## Validation

Expected focused gate:

```bash
npx --yes pnpm@10.32.1 exec tsx --test apps/api/src/services/operational-cache.service.test.ts
npx --yes pnpm@10.32.1 test:health
npx --yes pnpm@10.32.1 test:replay-readiness
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If import or Stripe idempotency helpers are touched, also run the corresponding
focused route test:

```bash
npx --yes pnpm@10.32.1 test:storage
npx --yes pnpm@10.32.1 test:billing
npx --yes pnpm@10.32.1 test:token-credits
```

## Handoff

DAEDALUS should wake ARGUS with:

- files changed,
- whether the result is audit/docs-only or behavior-changing,
- readiness/status shape changes,
- cache key/TTL/disabled-state evidence,
- secret-redaction evidence,
- validation run,
- remaining caveat if PR 4 should continue.
