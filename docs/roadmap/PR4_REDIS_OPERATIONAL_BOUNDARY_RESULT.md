# PR 4 Redis Operational Boundary Result

Date: 2026-06-15

Owner: A2 / DAEDALUS

Reviewed lane: `docs/roadmap/PR4_REDIS_OPERATIONAL_BOUNDARY.md`

## Verdict

PR 4 is ready for ARGUS review.

This is a small behavior/status patch plus documentation reconciliation. Redis,
Valkey, and Upstash remain operational-cache infrastructure only. Current main
does not treat Redis as canonical memory, archive truth, continuity truth, or
export truth.

## What Changed

- `/health/deployment` now exposes non-secret operational-cache status under
  `readiness.redis.operationalCache`:
  - `enabled`
  - `kind`
  - `disabledReason` when disabled
  - `environment`
- TCP Redis/Valkey config is still reported as configured, but the operational
  cache provider is disabled with `tcp_redis_configured_without_client` until a
  concrete TCP client/provider is accepted.
- Upstash REST config remains the only live provider path for the current
  operational-cache boundary.
- `/observability/replay-readiness` now treats the operational-cache boundary as
  setup-proven instead of listing cache-provider selection as a replay blocker.
- `.env.example` now names both optional TCP Redis/Valkey and Upstash REST
  variables with the current provider caveat.

## Boundary Evidence

- Operational cache keys include environment, owner, persona, Developer Space,
  resource, operation, and purpose segments.
- Purpose TTLs remain short and bounded:
  - runtime context: 300 seconds
  - idempotency: 86400 seconds
  - rate limit: 60 seconds
  - queue state: 900 seconds
- Missing cache config fails closed with `missing_config`.
- TCP Redis/Valkey config fails closed with
  `tcp_redis_configured_without_client`.
- Runtime-context, archive, memory, canon, continuity, persona, visibility, and
  Developer Space changes still produce scoped invalidation keys.

## Caveat

This does not reject Redis-backed memory forever. It leaves future memory or
working-memory use as a separate decision requiring durability, eviction,
backup, deletion, export, owner-isolation, audit, and semantic-search review.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/api/src/services/operational-cache.service.test.ts` | Pass | 4 operational-cache tests passed. |
| `npx --yes pnpm@10.32.1 test:health` | Pass | 12 health/deployment tests passed, including TCP Redis configured-but-disabled status and secret redaction. |
| `npx --yes pnpm@10.32.1 test:replay-readiness` | Pass | 1 replay-readiness test passed with cache boundary moved out of blockers. |
| `npx --yes pnpm@10.32.1 --filter @station/api build` | Pass | API and dependent package builds completed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected CRLF normalization warnings. |

## ARGUS Handoff

Review for:

- overclaim risk in the replay-readiness wording;
- whether readiness status remains non-secret;
- cache key/TTL/disabled-state behavior;
- whether any Redis/Valkey wording accidentally implies canonical memory;
- whether PR 4 can close or needs a narrower follow-up.
