# PR113 - Redis/Valkey Cache Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible route behavior changes.
Status: open for DAEDALUS

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
