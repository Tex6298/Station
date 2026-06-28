# Production Discussion Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: open - DAEDALUS

## Why This Lane

ARGUS accepted document route-level error response hardening in:

`docs/roadmap/PRODUCTION_DOCUMENT_ERROR_RESPONSE_REVIEW_RESULT.md`

The next coherent public-chain surface is discussion. Document routes now have
public-safe error responses around linked discussion setup and cleanup; forum,
thread, and comment routes still carry direct raw service error responses.

Current direct raw-response patterns are in:

`apps/api/src/routes/forums.ts`

`apps/api/src/routes/threads.ts`

`apps/api/src/routes/comments.ts`

Observed examples:

- forum and subcommunity list/read/create/update failures can return raw
  Supabase/service text;
- thread list/create/watch/vote/update failures can return raw service text;
- comment list/create/vote/update/moderation failures can return raw service
  text;
- subcommunity moderator and visibility checks can propagate raw service
  details;
- these routes sit on the public document -> linked discussion chain and should
  fail with public-safe copy.

## Task

Harden discussion route error responses without changing forum, thread,
comment, voting, watch, subcommunity, moderation, or recognition behavior.

Required behavior:

- route failures must not expose raw Supabase/service error text, table names,
  SQL output, owner IDs, author IDs, user IDs, persona IDs, document IDs,
  forum IDs, subcommunity IDs, thread IDs, comment IDs, report IDs, private or
  hidden comment bodies, draft/publication content, moderator internals, stack
  traces, URLs, tokens, cookies, provider payloads, or secret-shaped values;
- route responses should use stable public-safe copy and fixed error codes;
- successful forum/subcommunity list/read/create/update, thread list/read/create
  watch/vote/update, comment list/create/vote/update, moderation, recognition,
  and public visibility behavior must not change;
- linked document discussion compatibility must remain intact;
- tests should prove hostile discussion service errors are not returned from
  failing route responses.

Keep this lane to route responses. Do not change forum taxonomy, thread/comment
schema, voting semantics, moderation policy, document discussion linkage, public
page UI, Redis, Cloudflare, workers, or queue behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/forums.ts`;
- response mapping in `apps/api/src/routes/threads.ts`;
- response mapping in `apps/api/src/routes/comments.ts`;
- focused public discussion route tests;
- docs/status/baseline updates for the result.

Do not change:

- forum/thread/comment schema, subcommunity taxonomy, voting semantics,
  recognition semantics, moderation policy, linked document discussion
  semantics, public/private visibility policy, UI, package manifests, Redis,
  Cloudflare, provider/model behavior, billing, auth/session semantics,
  workers, queues, hosted config, or hosted data.

Record any remaining non-discussion route-level raw surfaces as future work.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If report/moderation behavior changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:reports
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS DISCUSSION ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing discussion,
moderation, voting, recognition, or linked document discussion behavior.
