# PR 2 Follow-Up - File Register Idempotency

Date opened: 2026-06-15

Opened by: A1 / MIMIR

Prerequisite: PR 2 chat-import idempotency accepted by A3 / ARGUS in
`d64fc94`.

Owner: A2 / DAEDALUS first, then A3 / ARGUS.

## Goal

Make uploaded-file registration safe against client retries.

The replay claim to earn is:

> Retrying file registration after a successful upload does not double-charge
> storage, create duplicate file rows, create duplicate import jobs, or process
> the same uploaded source twice.

## Current Risk

`POST /persona-files/persona/:personaId/register` currently reserves storage,
inserts a `persona_files` row, inserts a `file` import job, and optionally starts
`processUploadedFile`.

If the client retries the same register request with the same `storagePath`, the
route can create another file row and import job for the same uploaded object.
That is different from intentionally uploading two separate files with the same
name.

## Scope

- Add owner/persona-scoped idempotency for exact `storagePath` duplicate
  registration.
- Return an explicit duplicate/idempotent response for an already registered
  exact storage path without reserving bytes again.
- Avoid deduping by `fileName` alone. Same-name uploads with different
  `storagePath` values must remain valid separate uploads.
- Keep rollback behavior for failed file row or import job creation.
- If a previous exact-path registration has a file row but no safe import job,
  use the narrowest repair behavior the current data shape can support and make
  the response explicit.
- Add focused storage-route fixtures for:
  - exact `storagePath` retry,
  - same `fileName` with different `storagePath`,
  - failed job creation still rolls back bytes/file/storage object,
  - no owner/persona cross-scope reuse.

## Do Not

- Do not add a broad worker queue.
- Do not dedupe uploaded files by filename alone.
- Do not change provider routing, embedding profile, vector dimension, Redis,
  Cloudflare retrieval, billing, auth, public/private visibility, or broad UI.
- Do not store private file text or archive excerpts in docs/logs.
- Do not broaden `processUploadedFile` beyond the exact idempotency need unless
  the route test proves it is required.

## Acceptance Gates

- Retrying the same owner/persona `storagePath` returns the existing file/import
  state with `duplicate:true` and `idempotent:true` or an equally explicit
  response shape.
- Retrying the same `storagePath` does not increase storage usage.
- Retrying the same `storagePath` does not add another `persona_files` row.
- Retrying the same `storagePath` does not add another import job when a safe
  job already exists.
- Uploading the same filename at a different `storagePath` still creates a new
  file registration.
- Other owners or personas cannot reuse someone else's existing file row/job.

## Validation

Expected focused gate:

```bash
npx --yes pnpm@10.32.1 test:storage
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If `processUploadedFile`, retrieval provenance, exports, or continuity inclusion
changes, include the matching focused test as well.

## Handoff

DAEDALUS should implement the smallest route/service change that makes
file-register retries idempotent and wake ARGUS with:

- files changed,
- response-shape change,
- duplicate/retry behavior,
- owner/persona scope evidence,
- validation run,
- remaining caveat if PR 2 should continue.
