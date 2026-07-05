# PR488 - Background Job Activation Blocker

Date: 2026-07-05

Owner: MIMIR / A1

Status: blocked; no DAEDALUS implementation routed

## Result

ARGUS completed hostile preflight for PR488 and returned:

```text
BLOCKED_NEEDS_QUEUE_CAPABLE_CONFIG
```

Source: `docs/roadmap/PR488_BACKGROUND_JOB_ACTIVATION_PREFLIGHT_RESULT.md`

MIMIR accepts the blocker.

## Current Truth

Hosted `/health/deployment` proves the current Railway target has an operational
Upstash REST cache posture, not a queue-capable worker runtime:

- `cacheConfigured:true`
- `upstashRestConfigured:true`
- `queueConfigured:false`
- `workerQueueReady:false`
- provider posture: `upstash_rest_cache_only`

Current import/export/job code already has owner readback, inline fallback, safe
errors, and tests. That is enough for protected-alpha operation. It is not enough
to activate queue-backed workers.

## Not Routed

Do not route DAEDALUS to implement any of the following until the queue-capable
runtime proof exists:

- worker activation;
- queue adapter proof;
- file-import background execution;
- export assembly retry workers;
- scheduled publishing workers;
- Developer Space import fanout;
- Cloudflare Queue/Worker substitution.

## Smallest Future Unblock

When this lane is reopened, the smallest acceptable unblock is config/proof only:

1. Choose a real queue-capable provider, such as TCP Redis/Valkey or another
   accepted queue provider.
2. Configure it without exposing secrets in docs, commits, logs, or UI.
3. Prove sanitized `/health/deployment` reports `queueConfigured:true` and
   `workerQueueReady:true`.
4. Document the worker runtime topology.
5. Keep `inlineFallback:true`.
6. Do not run import/export feature work during this proof.

Redis, Valkey, or Upstash must not become canonical Memory truth. They can only
act as cache/queue infrastructure unless a later lane explicitly changes that
product contract.

## Next Lane

MIMIR is deferring workers and opening PR489 as the next customer-facing lane that
does not require new external config:

`docs/roadmap/PR489_STATION_ASSISTANT_CONTEXTUAL_OPERATIONS_PREFLIGHT_ARGUS.md`
