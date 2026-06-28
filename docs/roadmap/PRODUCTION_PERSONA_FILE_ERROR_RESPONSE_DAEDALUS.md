# Production Persona File Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: open - wake DAEDALUS

## Why This Lane

ARGUS accepted Developer Space credential-boundary error response hardening in:

`docs/roadmap/PRODUCTION_DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSE_REVIEW_RESULT.md`

Non-credential Developer Space routes and other route-level raw errors remain
future audit surface. The next narrow high-risk slice is persona file/archive
file routes because they sit on private archive storage paths and import job
repair.

Current direct raw-response patterns are in:

`apps/api/src/routes/persona-files.ts`

Observed examples:

- persona file list returns raw Supabase error text;
- signed upload URL creation returns raw storage error text;
- register duplicate lookup returns raw file lookup errors;
- import job repair fallback returns raw service error text;
- register insert/cleanup fallback returns raw file insert errors.

## Task

Harden persona file route error responses without changing archive file
lifecycle behavior.

Required behavior:

- persona file route failures must not expose raw storage paths, signed upload
  URLs, upload tokens, bucket internals, table names, SQL output, owner IDs,
  persona IDs, file IDs, import job IDs, private file names beyond existing
  successful owner readback, stack traces, cookies, provider payloads, private
  snippets, or secret-shaped values;
- existing quota/storage error responses may keep their current bounded shape
  if tests prove they do not leak private details;
- successful signed upload and registration behavior must not change;
- duplicate/idempotent register behavior must not change;
- best-effort cleanup and storage reservation/release behavior must not change;
- tests should prove hostile persona-file service errors are not returned.

Keep this lane to route responses. Do not change fire-and-forget processing,
file import execution, archive parsing, retrieval, or storage schema behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/persona-files.ts`;
- focused storage/persona-file route tests;
- docs/status/baseline updates for the result.

Do not change:

- upload path generation, signed upload URL creation semantics, storage bucket
  config, file registration semantics, import job execution, archive parsing,
  storage quota math, schema, migrations, package manifests, Redis, Cloudflare,
  provider/model behavior, billing, auth/session semantics, UI, workers,
  queues, hosted config, or hosted data.

Do not attempt every archive/import route in this PR. Record remaining raw
route-level archive/import surfaces as future work if you see them.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If touched tests already live under another gate, run that focused gate too.

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS PERSONA FILE ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing file lifecycle
behavior.
