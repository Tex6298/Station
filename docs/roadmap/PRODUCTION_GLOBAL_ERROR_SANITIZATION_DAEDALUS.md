# Production Global Error Sanitization

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: complete - wake ARGUS

## Why This Lane

MIMIR is parking the backup/restore local proof because this machine lacks
`psql`, `pg_dump`, Docker, and Supabase CLI. The next unblocked production-risk
target is not worker activation: PR147 and PR368 already say no queue/worker
implementation should open without measured pain.

The concrete issue found during the next-lane scan is the global API error
handler:

```text
apps/api/src/middleware/error-handler.ts
```

It currently logs the raw error object and returns `err.message` to clients for
generic 500s. That is not compatible with the production-readiness posture in
the existing roadmap: no stack traces, SQL errors, provider payloads, private
snippets, URLs, tokens, raw ids, or secret-shaped values should be exposed from
unexpected server failures.

## Task

Harden the global API error boundary.

Required behavior:

- generic unhandled 500 responses return a stable public-safe error envelope;
- the response does not include raw exception messages, stack traces, SQL
  output, URLs, bearer material, database URLs, API keys, provider payloads,
  private snippets, raw ids, cookies, or secret-shaped values;
- known route-level 4xx/409/503 errors that are already deliberately bounded do
  not get broadened or rewritten by accident;
- server-side logging is minimized or sanitized enough that this lane does not
  introduce new raw private payload logging;
- tests prove hostile raw messages are not returned to the client.

Prefer a small focused middleware test over a broad route rewrite. If a shared
safe-error helper already fits the repo, use it. If not, keep the helper local
and narrow.

## Scope

Allowed:

- `apps/api/src/middleware/error-handler.ts`;
- focused middleware tests;
- package script updates only if a new focused test gate is needed;
- roadmap/status/baseline docs for the actual result.

Do not change:

- schema, migrations, Supabase config, Railway config, package lockfile, Redis,
  Cloudflare, provider/model behavior, embeddings, Stripe, auth/session
  semantics, background worker execution, queue adapters, hosted data, or UI;
- route-specific business errors unless the test proves they pass through the
  global handler unsafely.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
```

Run a focused middleware test. If you add a root script, record it in
`docs/testing/VALIDATION_BASELINE.md`.

Also run:

```bash
git diff --check
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS ERROR-SANITIZATION REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if current Express/error architecture makes a narrow fix unsafe.

## DAEDALUS Result

Completed on 2026-06-28:
`docs/roadmap/PRODUCTION_GLOBAL_ERROR_SANITIZATION_RESULT.md`.

Verdict:

```text
READY FOR ARGUS ERROR-SANITIZATION REVIEW
```
