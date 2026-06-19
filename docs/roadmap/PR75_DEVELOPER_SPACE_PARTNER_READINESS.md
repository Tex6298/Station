# PR75 - Developer Space Partner Readiness Follow-Up

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses only if visible
Developer Space route behavior changes.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

The older Developer Space foundation is real: ingestion auth, key rotation,
public-safe serialization, SSE/WebSocket live updates, Discover integration,
linked documents, visual config, usage counters, quotas, exports, and the
workspace-local TypeScript client already exist.

The launch-core docs still leave a sharper partner-readiness gap:

- a partner should be able to integrate from docs and examples without guesswork;
- ingestion failures should be actionable and machine-readable;
- operational limits should be explicit rather than aspirational;
- owner diagnostics should stay private while public observatories remain safe;
- current docs should not drift from the routes that actually exist.

This is not a repeat of historical PR-10 through PR-16. It is a follow-up proof
and small repair lane against the current tree.

## Goal

Make the first external Developer Space integration path safer and clearer.

DAEDALUS should leave Station in one of two states:

1. **Implemented:** a narrow partner-readiness improvement is merged with tests.
2. **Blocked with evidence:** the exact missing schema, API, or adapter needed
   for the next slice is documented for MIMIR.

## Scope

Inspect these first:

- `apps/api/src/routes/developer-spaces.ts`;
- `apps/api/src/services/developer-space.service.ts`;
- `apps/api/src/services/developer-space-usage.service.ts`;
- `apps/api/src/services/developer-space-live.service.ts`;
- `apps/api/src/services/operational-cache.service.ts`, if rate-limit support
  looks appropriate;
- `packages/developer-space-client/README.md`;
- `packages/developer-space-client/src/index.ts`;
- `packages/developer-space-client/examples/node-ingest.ts`;
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`;
- `docs/integration/intelhub-to-station-developer-spaces.md`;
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`;
- `docs/roadmap/builds.md`;
- `docs/roadmap/prep-lane-audit.md`.

Then choose the smallest honest implementation slice from the current evidence.
Good candidates are:

- normalize ingestion validation/auth/quota/limit errors into a clearer
  machine-readable shape without leaking raw payloads;
- add a bounded ingestion-key request limit if the current operational cache
  already supports it cleanly;
- improve client error typing and docs so partners can distinguish auth,
  validation, quota, payload-size, and server failures;
- make partner docs/examples match live endpoints for node state, events,
  snapshots, batch import, visibility, source refs, and private/public safety;
- reconcile any Developer Space live-update docs that are now stale, without
  widening the architecture.

If a candidate needs a migration or new persistent table, do not fake it. Write
the exact blocker and wake MIMIR.

## Guardrails

- No hosted runtime, container execution, job scheduler, or user code runner.
- No Cloudflare Worker, Vectorize, NESTstack, edge retrieval, or new retrieval
  route.
- No Redis memory truth claim. Upstash may be used only as the existing
  operational cache/rate-limit/idempotency layer if the local adapter supports
  the chosen slice.
- No broad Project/DexOS, institutional collaboration, team membership, billing,
  pricing, Stripe, provider/model, parser/OAuth, or public persona expansion.
- No raw public payload expansion and no secret/key/token logging.
- No large UI restyle. Only touch visible Developer Space UI if needed to make
  integration state or errors honest.

## Acceptance

- A partner reading the docs can send node state, events, snapshots, and batch
  imports with the workspace client or curl examples.
- Failed ingestion responses are actionable enough for client code to branch on
  auth, validation, quota/limit, and unexpected server failures.
- Public observatory serialization still excludes private/raw/secret-shaped
  fields.
- Owner-only operational detail remains owner-only.
- If rate limiting is implemented, the response is explicit and
  machine-readable, and the implementation states whether it is in-process,
  cache-backed, or persistent.
- If rate limiting is not implemented, the blocker is named precisely and docs
  do not imply it exists.

## Validation

Run the narrow gate for the chosen slice:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If visible web route behavior changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known Windows standalone symlink `EPERM` remains acceptable only after the
web build compiles, lints/typechecks, collects page data, and generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- exact implementation or blocker result;
- files changed;
- error/limit response shape, if changed;
- docs/examples updated;
- public/private safety notes;
- validation output.

If DAEDALUS cannot choose a narrow implementation safely, wake MIMIR with the
blocker before sleeping. Do not stop silently.

## DAEDALUS implementation - 2026-06-19

Implemented the smallest partner-readiness slice from the current evidence:
machine-readable ingestion failures plus client/docs readback.

Changed behavior:

- ingestion auth failures now keep the existing human `error` string and add
  `code` plus `category: "auth"`;
- ingestion validation failures now return
  `code: "developer_space_validation_failed"`,
  `category: "validation"`, and Zod-flattened `details`;
- Developer Space quota failures keep the existing `code: "quota_exceeded"`,
  `resource`, `limit`, `used`, and optional `retryAfter`, and now add
  `category: "quota"`;
- unexpected ingestion write failures now return a generic
  `category: "server"` response without echoing raw payloads or database error
  text;
- `@station/developer-space-client` exposes `DeveloperSpaceClientError.code`,
  `category`, `resource`, and `retryAfter` so partner code can branch without
  parsing `body`;
- the client README and integration note document node state, events,
  snapshots, batch import, error categories, quota semantics, and the current
  absence of a distinct short-window ingestion-key request rate limit.

No rate limiter was added. The existing operational cache supports general
rate-limit storage, but this slice did not add a new request-window policy or
claim one exists. Quota/limit behavior remains the durable
`developer_space_usage` path.

Files changed:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `packages/developer-space-client/src/index.ts`
- `packages/developer-space-client/src/index.test.ts`
- `packages/developer-space-client/README.md`
- `docs/integration/intelhub-to-station-developer-spaces.md`
- `docs/roadmap/PR75_DEVELOPER_SPACE_PARTNER_READINESS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 13 tests passed; ingestion auth, validation, quota, public-safe serialization, owner raw detail, SSE, usage, key rotation, and revocation stayed covered. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 4 tests passed; client structured error fields cover auth, quota, and fallback server categories. |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local triad state. |

Non-scope:

- No hosted runtime, container execution, scheduler, worker, Cloudflare,
  Vectorize, NESTstack, retrieval route, Redis memory truth, new persistent
  rate-limit table, Project/DexOS expansion, institutional collaboration,
  billing, provider/model work, parser/OAuth, public persona expansion, raw
  public payload expansion, secret logging, broad UI, or visible Developer
  Space route behavior changed.
