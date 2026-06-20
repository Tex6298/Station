# Operational Cache Foundation

Status: PR113 foundation, 2026-06-20.

Station has an optional operational cache boundary for short-lived backend
infrastructure. It is not canonical memory, not vector storage, and not a
retrieval-ranking system.

## Configuration

Supported now:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

When both Upstash REST values are present, the API uses the Upstash REST
provider. The token is used only in the request header and is not returned by
status helpers.

Recognized but disabled pending a concrete TCP client:

- `REDIS_URL`
- `REDIS_PRIVATE_URL`
- `VALKEY_URL`

When only TCP Redis/Valkey config is present, the operational cache reports
`tcp_redis_configured_without_client` and fails closed into disabled/no-op mode.
When no cache config is present, it reports `missing_config`.

## Key Scope

Cache keys use:

```text
station:<environment>:<purpose>:owner:<owner>:persona:<persona>:developer-space:<space>:resource:<resource>:operation:<operation>:<extra...>
```

The environment comes from `STATION_ENV`, then `RAILWAY_ENVIRONMENT_NAME`, then
`NODE_ENV`, then `development`.

Any cache entry involving user data must include owner scope and, when
applicable, persona or Developer Space scope. Key components are normalized so
they do not include raw separators or secret-shaped payloads.

## Purposes And TTLs

Every write uses an explicit TTL or the bounded default for its purpose:

- `runtime_context`: 300 seconds
- `idempotency`: 86,400 seconds
- `rate_limit`: 60 seconds
- `queue_state`: 900 seconds

TTLs are clamped to at least 1 second and at most 7 days.

## Accepted Roles

PR113 accepts the cache boundary for:

- runtime context cache;
- idempotency keys;
- rate-limit counters;
- lightweight queue/job state after a later background-jobs lane opens.

The existing Developer Space ingestion limiter already uses the `rate_limit`
purpose through this boundary. Other roles remain helper-ready until a later
lane wires a specific behavior.

## Invalidation Triggers

The first accepted invalidation triggers are:

- archive import;
- memory edit;
- canon edit;
- continuity write;
- persona edit;
- visibility change;
- Developer Space change.

Current hooks invalidate or bypass cache keys in archive/memory services,
continuity routes, persona routes, and Developer Space rate-limit paths. Future
runtime-context cache work must use `invalidateOperationalCacheForChange` rather
than treating Redis as source of truth.

## Non-Goals

PR113 does not add Redis as canonical memory truth, Redis vector storage,
Redis-backed retrieval ranking, Cloudflare integration, background job
execution, durable queue processing, private archive snippet cache truth,
billing/auth/session behavior, UI work, or provider key/prompt/payload logging.
