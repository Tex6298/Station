# Production Memory Canon Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: open - DAEDALUS

## Why This Lane

ARGUS accepted export route-level error response hardening in:

`docs/roadmap/PRODUCTION_EXPORT_ERROR_RESPONSE_REVIEW_RESULT.md`

The next highest-product-risk route-level raw error surface is private memory
and canon. These routes handle the material Station uses to keep a persona
steady: shared owner memory, persona memory briefing, memory graph, lifecycle
state, recallable memory items, and canon items.

Current direct raw-response patterns are in:

`apps/api/src/routes/memory.ts`

`apps/api/src/routes/canon.ts`

Observed examples:

- shared memory and persona memory briefing failures can return raw service
  error text;
- memory graph item/edge loads and edge writes can return raw Supabase text;
- memory item list/create/update/delete failures can return raw archive,
  embedding, lifecycle, or Supabase error text;
- memory lifecycle update failures can return raw lifecycle or edge-write text;
- canon list/create/update/delete failures can return raw Supabase text.

## Task

Harden memory and canon route error responses without changing memory, canon,
briefing, graph, lifecycle, embedding, or owner readback behavior.

Required behavior:

- route failures must not expose raw Supabase/archive/provider/embedding error
  text, table names, SQL output, owner IDs, persona IDs, memory IDs, canon IDs,
  edge IDs, source IDs, private memory/canon content, briefing excerpts,
  evidence payloads, archive source names beyond existing successful owner
  readback, storage paths, stack traces, URLs, tokens, cookies, provider
  payloads, or secret-shaped values;
- route responses should use stable public-safe copy and fixed error codes;
- successful shared memory, persona memory briefing, graph readback, graph edge
  creation, memory item list/create/update/delete, lifecycle update, canon
  list/create/update/delete, and owner-only access behavior must not change;
- existing `sanitizeArchiveSourceName` successful owner readback behavior must
  not change;
- embedding generation and memory lifecycle event recording behavior must not
  change;
- tests should prove hostile memory/canon service errors are not returned from
  failing route responses.

Keep this lane to route responses. Do not change retrieval, embeddings,
lifecyle semantics, memory graph semantics, archive source policy, Redis,
Cloudflare, workers, or queue behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/memory.ts`;
- response mapping in `apps/api/src/routes/canon.ts`;
- focused API route tests for memory/canon failures;
- docs/status/baseline updates for the result.

Do not change:

- memory/canon schema, lifecycle state machine semantics, graph edge semantics,
  embedding/vector behavior, archive source sanitization readback, retrieval,
  storage quota math, migrations, package manifests, Redis, Cloudflare,
  provider/model behavior, billing, auth/session semantics, UI, workers,
  queues, hosted config, or hosted data.

Record any remaining non-memory/canon route-level raw surfaces as future work.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If the implementation adds or expands route-level memory/canon tests under a
different focused gate, run that gate too and record it.

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS MEMORY CANON ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing memory, canon,
lifecycle, graph, briefing, or embedding behavior.
