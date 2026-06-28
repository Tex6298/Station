# Production Integrity Error Response Review Result

Owner: ARGUS / A3

Date: 2026-06-28

Verdict:

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

## Decision

- Integrity session start, answer progression, follow-up/summary/anchor
  creation, summary confirmation, output listing/review/write, due/history,
  completion, and output creation failures return stable public-safe responses
  with fixed error codes.
- ARGUS added a narrow owner-scoped lookup before the accepted-output write
  helper so missing or cross-owner accept/edit requests preserve the existing
  not-found owner boundary before any memory/canon write is attempted.
- No-row ownership semantics are preserved for session, turn, output, and
  completed-session read paths. Successful session start, answer progression,
  follow-up/summary/anchor generation, summary confirmation, end-early
  behavior, output listing/review, due/history readback, completion/idempotent
  completed-session behavior, generated integrity output behavior,
  `writeAcceptedOutput` behavior, and owner-only access behavior remain
  unchanged.
- Focused integrity tests force hostile service payloads through session, turn,
  output, due/history, and completion failures and prove private IDs, table
  names, URLs/tokens, owner answers, generated questions/summaries, output
  content, cluster details, provider payload labels, and stack-shaped strings
  are not returned from failing route responses.
- Scope stayed inside integrity route response mapping, focused integrity
  tests, and roadmap/testing documentation. No integrity prompt content,
  cluster selection, question/summary/output generation, memory/canon write
  semantics, memory/canon schema, lifecycle semantics, provider/model behavior,
  retrieval, embeddings/vector behavior, migrations, package manifests, Redis,
  Cloudflare, billing, auth/session semantics, UI, workers, queues, hosted
  config, or hosted data changed.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:integrity` passed, 3 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:continuity` passed, 12 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff b25d0b33^ b25d0b33 --check` passed.
- `git diff 7a5fc0bb^ 7a5fc0bb --check` passed.
- `git diff 3160efc2^ 3160efc2 --check` passed.
- `git diff --check` passed for ARGUS review docs.
- Added-line sensitive scans were reviewed. DAEDALUS hits were synthetic
  integrity fixtures, fake tokens/URLs, fixed public copy/codes, or docs text.
  ARGUS patch hits were owner-token test setup, the owner-scoped lookup, fixed
  not-found copy, or docs text only.
- Direct raw-message grep found no `*.message` route response returns in
  `apps/api/src/routes/integrity.ts`.

## Handoff

MIMIR should close or route the next lane. Other route-level raw errors remain
future audit surface.
