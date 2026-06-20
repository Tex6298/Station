# PR113 - Redis/Valkey Cache Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible route behavior changes.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

PR112 closed the retrieval metadata contract. The next backend roadmap item is
BE-05 Redis or Valkey foundation.

Station now has Upstash Redis configuration available in deployed and local
environments. Before using cache in runtime context, replay optimization,
idempotency, rate limits, or background jobs, Station needs a small safe cache
foundation with scoped keys, TTLs, invalidation rules, and disabled behavior
when config is absent.

## Goal

Add a narrow cache foundation that can support future replay-ready backend work
without making Redis canonical memory or vector storage.

## Scope

DAEDALUS should implement or precisely block:

- a cache configuration resolver that supports the currently available Upstash
  REST variables and can document future `REDIS_URL`, `REDIS_PRIVATE_URL`, or
  `VALKEY_URL` support without requiring them now;
- disabled/no-op behavior when cache config is absent so local/test runs do not
  fail without Redis;
- a small cache client/helper surface for JSON get/set/delete or equivalent
  bounded operations;
- a scoped key builder that includes environment plus owner/persona or
  Developer Space scope where applicable;
- TTL required by default for writes, with explicit short-lived defaults;
- cache namespace/version prefix so future invalidation and migrations are
  possible;
- documentation of first accepted cache roles and invalidation triggers:
  archive import, memory/canon edits, continuity writes, persona edits, and
  visibility changes;
- tests for config resolution, disabled mode, key scoping, TTL enforcement,
  deletion/invalidation helper behavior, and absence of secret logging.

If current package structure already contains cache helpers, extend them instead
of inventing a parallel abstraction.

## First Accepted Roles

Allowed foundation roles:

- runtime context cache;
- idempotency keys;
- rate-limit counters;
- lightweight queue/job state after a later background-jobs lane opens.

PR113 does not need to wire all roles into product behavior. Prefer a small
foundation plus one safe internal use only if the existing code clearly calls
for it.

## Non-Scope

Do not add:

- Redis as canonical memory truth;
- Redis vector storage;
- Redis-backed retrieval ranking;
- Cloudflare integration;
- background job execution;
- durable queue processing;
- private archive snippet storage unless encrypted/redacted and explicitly
  approved in a later lane;
- billing/auth/session behavior changes;
- broad UI work;
- provider key, prompt, payload, or secret logging.

## ARGUS Review Requirements

ARGUS should verify:

- cache config can be absent without breaking tests or local startup;
- Upstash REST config is supported without printing secrets;
- key format includes environment and owner/persona or Developer Space scope
  where user data is involved;
- writes require TTL or have an explicit safe default;
- invalidation helpers are present or precisely documented;
- Redis is not used as canonical memory or vector storage;
- no private archive text, provider keys, prompts, payloads, or secrets are
  logged;
- validation passed.

No ARIADNE rehearsal is required if this remains backend/helper/docs/tests only.
If visible route behavior changes, ARGUS should wake ARIADNE after technical
acceptance.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add and run the narrow cache test gate if PR113 creates one. Also run any
existing affected API/package tests touched by the implementation.

## DAEDALUS Implementation

Implemented on 2026-06-20.

Current main already contained the narrow operational cache foundation in
`apps/api/src/services/operational-cache.service.ts`:

- Upstash REST provider support using `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN`;
- disabled/no-op behavior for missing config;
- fail-closed disabled state for configured TCP Redis/Valkey URLs until a
  concrete TCP client/provider is added;
- JSON get/set, scoped rate-limit counters, delete/invalidation helpers, and
  non-secret readiness status;
- scoped keys containing environment, owner, persona, Developer Space, resource,
  operation, and optional extra parts;
- short bounded default TTLs for `runtime_context`, `idempotency`,
  `rate_limit`, and `queue_state`;
- invalidation hooks already called from archive/memory services, continuity
  routes, persona routes, and Developer Space ingestion rate limiting.

This DAEDALUS pass added the missing durable validation and documentation:

- root `package.json` now has `test:cache`;
- `docs/architecture/operational-cache-foundation.md` documents config,
  disabled mode, key scope, TTLs, accepted roles, invalidation triggers, and
  non-goals;
- roadmap/status/baseline docs now record PR113 validation and scope.

Config and disabled-mode proof:

- No cache config returns disabled provider status with reason `missing_config`.
- TCP Redis/Valkey config without a concrete client returns disabled provider
  status with reason `tcp_redis_configured_without_client`.
- Upstash REST is enabled only when both REST URL and token are present.
- Status/readiness surfaces expose provider kind/enabled/disabled reason only,
  not tokens or raw connection values.

Key-scope and TTL proof:

- Keys start with `station:<environment>:<purpose>` and include owner, persona,
  Developer Space, resource, operation, and optional extra parts.
- User-data cache entries must include owner scope and applicable persona or
  Developer Space scope.
- Writes require an explicit TTL or use bounded defaults; TTLs are clamped
  between 1 second and 7 days.

Explicit non-scope confirmation:

- No Redis canonical memory truth, Redis vector storage, Redis-backed retrieval
  ranking, Cloudflare integration, background job execution, durable queue
  processing, private archive snippet cache truth, billing/auth/session change,
  broad UI work, provider key logging, prompt logging, payload logging, or
  visible route change was added.

DAEDALUS validation on 2026-06-20:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:cache` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local watcher state. |
