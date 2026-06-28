# Production Integrity Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: ready for ARGUS - DAEDALUS complete

## Why This Lane

ARGUS accepted memory/canon route-level error response hardening in:

`docs/roadmap/PRODUCTION_MEMORY_CANON_ERROR_RESPONSE_REVIEW_RESULT.md`

The next highest core surface is integrity sessions. Integrity routes generate
trust and continuity decisions from private persona material, owner answers,
session turns, and output review.

Current direct raw-response patterns are in:

`apps/api/src/routes/integrity.ts`

Observed examples:

- session start can return raw session/turn insert errors;
- answer and confirm-summary progression can return raw follow-up, summary, or
  anchor turn creation errors;
- output listing/review can return raw output load/update errors;
- due/history routes can return raw persona/session load errors;
- session completion can return raw turn/output generation and insert errors.

## Task

Harden integrity route error responses without changing integrity session,
turn, output, review, due/history, or completion behavior.

Required behavior:

- route failures must not expose raw Supabase/provider/service error text,
  table names, SQL output, owner IDs, persona IDs, session IDs, turn IDs,
  output IDs, private owner answers, generated questions, summaries, output
  content, clusters beyond existing successful owner readback, stack traces,
  URLs, tokens, cookies, provider payloads, or secret-shaped values;
- route responses should use stable public-safe copy and fixed error codes;
- successful session start, answer progression, follow-up/summary/anchor
  generation, summary confirmation, end-early behavior, output listing/review,
  due/history readback, completion/idempotent completed-session behavior, and
  owner-only access behavior must not change;
- existing generated integrity output behavior and writeAcceptedOutput behavior
  must not change;
- tests should prove hostile integrity service errors are not returned from
  failing route responses.

Keep this lane to route responses. Do not change integrity prompts, cluster
selection, output generation, memory/canon write behavior, provider/model
behavior, Redis, Cloudflare, workers, or queue behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/integrity.ts`;
- focused integrity route tests;
- docs/status/baseline updates for the result.

Do not change:

- integrity prompt content, cluster selection, question/summary/output
  generation, `writeAcceptedOutput` semantics, memory/canon schema, lifecycle
  semantics, provider/model behavior, retrieval, embeddings/vector behavior,
  migrations, package manifests, Redis, Cloudflare, billing, auth/session
  semantics, UI, workers, queues, hosted config, or hosted data.

Record any remaining non-integrity route-level raw surfaces as future work.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:integrity
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If accepted-output writes touch memory/canon behavior, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:continuity
```

DAEDALUS result:

`docs/roadmap/PRODUCTION_INTEGRITY_ERROR_RESPONSE_RESULT.md`

Validation completed:

- `npm exec --yes pnpm@10.32.1 -- run test:integrity` passed, 3 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed.
- Added-line sensitive scan was reviewed; hits were synthetic integrity
  fixtures, fake tokens/URLs, fixed public copy/codes, or docs text only.
- `test:continuity` was not run because accepted-output memory/canon write
  semantics were not changed.

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS INTEGRITY ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing integrity
session, output, review, or completion behavior.
