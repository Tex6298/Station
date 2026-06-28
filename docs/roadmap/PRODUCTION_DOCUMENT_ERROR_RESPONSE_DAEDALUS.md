# Production Document Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: open - DAEDALUS

## Why This Lane

ARGUS accepted integrity route-level error response hardening in:

`docs/roadmap/PRODUCTION_INTEGRITY_ERROR_RESPONSE_REVIEW_RESULT.md`

The next product-critical public-chain surface is documents. Document routes
connect owner-authored writing, continuity publication, public document
readback, version snapshots, and linked forum discussion setup/cleanup.

Current direct raw-response patterns are in:

`apps/api/src/routes/documents.ts`

Observed examples:

- owner document list and version history failures can return raw Supabase
  error text;
- document create/update/publish/delete failures can return raw document,
  snapshot, or cleanup error text;
- continuity publication can return raw document insert text;
- linked discussion cleanup and discussion setup are close to public document
  routing and must keep owner/private details bounded.

## Task

Harden document route error responses without changing document lifecycle,
publication, versioning, public readback, or linked discussion behavior.

Required behavior:

- route failures must not expose raw Supabase/service error text, table names,
  SQL output, owner IDs, author IDs, persona IDs, space IDs, document IDs,
  version IDs, continuity source IDs, discussion thread IDs, private draft
  bodies, continuity source content, snapshot payloads, cleanup internals,
  stack traces, URLs, tokens, cookies, provider payloads, or secret-shaped
  values;
- route responses should use stable public-safe copy and fixed error codes;
- successful owner document list/readback, version history, create, update,
  publish-from-continuity, publish, delete, snapshot creation/cleanup,
  discussion ensure/sync/cleanup, public document readback, not-found behavior,
  and owner/admin access behavior must not change;
- linked discussion behavior must remain compatible with the public chain:
  public document -> linked discussion;
- tests should prove hostile document service errors are not returned from
  failing route responses.

Keep this lane to route responses. Do not change document schema, publication
policy, public/private visibility rules, forum/thread semantics, public page UI,
Redis, Cloudflare, workers, or queue behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/documents.ts`;
- focused document route tests;
- docs/status/baseline updates for the result.

Do not change:

- document schema, snapshot/version numbering, slug generation, publication
  state machine, public/private visibility policy, linked discussion creation
  semantics, forum/thread/comment route behavior, UI, package manifests, Redis,
  Cloudflare, provider/model behavior, billing, auth/session semantics,
  workers, queues, hosted config, or hosted data.

Do not attempt forum, thread, or comment route raw errors in this PR. Record
remaining public discussion route-level raw surfaces as future work.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:continuity-publication
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If public document readback behavior changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:writing
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS DOCUMENT ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing document,
publication, snapshot, public readback, or linked discussion behavior.
