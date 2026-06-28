# Production Conversation Continuity Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: complete - wake ARGUS

Result:

`docs/roadmap/PRODUCTION_CONVERSATION_CONTINUITY_ERROR_RESPONSE_RESULT.md`

## Why This Lane

ARGUS accepted import job route-level error response hardening in:

`docs/roadmap/PRODUCTION_IMPORT_JOB_ERROR_RESPONSE_REVIEW_RESULT.md`

Conversation archive routes remain the next private continuity/archive surface.
They handle owner conversation lists, continuity candidate lists, chat archive
creation/readback, generated continuity candidate review, save-to-canon, and
conversation deletion.

Current direct raw-response patterns are in:

`apps/api/src/routes/conversations.ts`

Observed examples:

- conversation and continuity candidate list failures can return raw
  Supabase/service error text;
- save-to-canon and conversation delete failures can return raw service text;
- archive creation can expose message lookup, transcript insert, archive
  indexing, and candidate insert failure text;
- continuity candidate accept/reject/update paths can expose memory/canon
  service failures and database payloads.

## Task

Harden conversation/continuity route error responses without changing archive,
memory, canon, or conversation lifecycle behavior.

Required behavior:

- route failures must not expose raw Supabase/storage/provider error text,
  table names, SQL output, owner IDs, persona IDs, conversation IDs, message
  IDs, transcript IDs, candidate IDs, memory IDs, canon IDs, private message
  content, transcript excerpts, source labels beyond existing successful owner
  readback, storage paths, stack traces, URLs, tokens, cookies, provider
  payloads, or secret-shaped values;
- route responses should use stable public-safe copy and fixed error codes;
- existing successful owner readbacks for conversations, archive bundles,
  continuity candidates, saved memory/canon targets, and delete semantics must
  not change;
- archive idempotency for already archived conversations must not change;
- transcript creation, archive indexing, candidate generation, candidate
  accept/reject lifecycle, memory lifecycle evidence, canon creation, and
  conversation deletion behavior must not change;
- tests should prove hostile conversation/archive/continuity service errors are
  not returned from failing route responses.

Keep this lane to route responses. Do not change chat-turn generation,
retrieval, embeddings, archive chunking, parser behavior, Redis, Cloudflare,
workers, or queue behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/conversations.ts`;
- focused conversation archive/continuity route tests;
- docs/status/baseline updates for the result.

Do not change:

- chat-turn provider behavior, conversation history assembly, runtime context
  selection, archive chunking, retrieval, embeddings/vector behavior, parser
  behavior, storage quota math, schema, migrations, package manifests, Redis,
  Cloudflare, provider/model behavior, billing, auth/session semantics, UI,
  workers, queues, hosted config, or hosted data.

Do not attempt export routes in this PR. Record remaining export route-level raw
surfaces as future work.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If memory lifecycle helpers or persona runtime context behavior are touched,
also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS CONVERSATION CONTINUITY ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing conversation,
archive, memory, or canon lifecycle behavior.
