# PR16 - Durable File Import Jobs

Date: 2026-06-17
Status: ready for A3 / ARGUS review
Owner: DAEDALUS implementation, ARGUS review, ARIADNE only if Studio job-status
UI changes materially.

## Why This Lane Is Next

PR15 proved the protected-alpha job boundary and made uploaded-file import
execution deterministic. ARGUS accepted that slice, with one important caveat:
the current runner still receives `fileId`, `fileName`, `fileType`, and
`storagePath` from the route/test call site. A future worker cannot claim a
queued uploaded-file job from the database unless the job row has a durable file
pointer or can safely resolve one without ambiguity.

This lane closes that caveat before Reddit intake, true worker deployment, or
export-worker redesign.

## Goal

Make file import jobs independently claimable from durable Station data:

- a file import job should know exactly which `persona_files` row it is for;
- the runner should be able to load the file pointer from the database using the
  owner-scoped job row;
- duplicate registration should remain idempotent;
- ambiguous historical rows should fail safely instead of guessing;
- no private file body, raw archive content, secrets, or storage URLs should be
  copied into wakeups or public responses.

The replay proof should be:

> Station can enqueue an uploaded-file import, persist the file pointer, later
> claim the queued job by job ID, process the correct private file, and report
> owner-visible sanitized status without depending on route-local pointer state.

## Current Baseline

- `apps/api/src/services/file-import-jobs.service.ts` has
  `runFileImportJobInline(input)` and a `FileImportJobPointer` supplied by the
  caller.
- `apps/api/src/routes/persona-files.ts` creates a `persona_files` row and then
  creates an `import_jobs` row with `kind: "file"` and `source_name`, but the
  job row does not durably store `file_id` or `storage_path`.
- `import_jobs` has owner/persona/kind/status/source fields and RLS owner
  policy.
- `persona_files` already has `id`, `owner_user_id`, `persona_id`, `file_name`,
  `file_type`, `file_size`, and `storage_path`.

## Scope

Schema and types:

- Add a narrow migration for file import job pointer data. Prefer
  `import_jobs.file_id uuid references public.persona_files(id) on delete set
  null` if it fits the current schema.
- Add an index that supports owner/persona/file lookup for file import jobs.
- Update `packages/db/src/types.ts` if this repo maintains generated/static DB
  types manually.
- Backfill is only required if it can be done safely. If historical rows are
  ambiguous, leave them null and make the runner fail visibly rather than guess.

Service behavior:

- Add a runner path that can claim/run a file import job by durable job ID and
  owner ID, loading the associated `persona_files` row itself.
- Keep the existing route-fed pointer path only if it remains useful as an
  inline fallback wrapper around the durable loader.
- Enforce owner ID, persona ID, job kind, file ID, file owner, and source-name
  consistency before downloading from storage.
- Keep completed/archive-row reruns idempotent.
- Keep failed jobs sanitized and owner-visible.
- Do not delete successful prior archive rows after a later failed retry.

Route behavior:

- `POST /persona-files/persona/:personaId/register` should persist the new file
  pointer when it creates the import job.
- Duplicate registration by exact owner/persona/storage path should return the
  existing file and the exact matching job. If there are multiple candidate jobs,
  return the existing ambiguity signal instead of guessing.
- Registration response shape may stay compatible, but job payloads should not
  expose storage secrets or raw file contents.

## Out Of Scope

- BullMQ worker deployment.
- Redis/Valkey queue implementation beyond preserving PR15 readiness truth.
- Upstash/QStash queue adapter.
- Reddit OAuth/import.
- Discord production parser.
- Export worker redesign.
- Memory candidate review redesign.
- Broad quota enforcement.
- Cloudflare retrieval, vector reindexing, Redis memory truth, public
  publishing, or UI reskin.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:exports` only if export status behavior changes. Add
`test:token-credits` only if quota/paid usage logic is touched.

## Required Tests

- File registration persists the durable file pointer on the created import job.
- Durable runner can process a queued file job by job ID plus owner ID without
  route-local file pointer input.
- Other owners cannot claim or inspect another owner's file import job.
- Persona/file/job mismatch fails safely and stores sanitized job failure state
  if the job had already been claimed.
- Duplicate exact storage-path registration remains idempotent.
- Multiple candidate file jobs for the same source remain ambiguous rather than
  guessed.
- Existing PR14 parser protections still hold, including `.json` extension
  authority over misleading text MIME.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- migration and type changes;
- exact durable pointer columns;
- how old/null pointer file jobs behave;
- the job-claim path and its owner/persona/file consistency checks;
- duplicate/ambiguous behavior;
- sanitized failure and previous-archive preservation evidence;
- validation commands and results;
- caveats about deferred true workers, Reddit, export jobs, candidate review,
  quotas, and Cloudflare.

ARGUS should review owner scoping, pointer ambiguity, historical-row behavior,
storage-path leakage, private payload redaction, idempotency, and accidental
scope creep.

## DAEDALUS Implementation Notes

- Added migration `infra/supabase/migrations/035_import_job_file_pointer.sql`.
- Durable pointer column: `public.import_jobs.file_id uuid references
  public.persona_files(id) on delete set null`.
- Added indexes for owner/persona/file lookup and file-id lookup.
- Updated `packages/db/src/types.ts` so `import_jobs.Row.file_id` is nullable
  and `Insert.file_id` is optional.
- `IMPORT_JOB_SELECT` now includes `file_id`.
- New file import jobs persist `file_id` when
  `/persona-files/persona/:personaId/register` creates the job.
- Duplicate exact storage-path registration now returns the exact file-job
  pointer when present. A single historical null-pointer job can be safely
  repaired to point at the known existing file; multiple candidate jobs remain
  ambiguous and are not guessed.
- `runFileImportJobById({ jobId, ownerUserId })` now claims by durable job ID
  and owner ID, loads the associated `persona_files` row itself, and enforces:
  owner, persona, kind, file id, file owner, and source-name consistency before
  storage download.
- Null-pointer historical file jobs fail visibly with sanitized job status
  instead of guessing by `source_name`.
- Reruns with existing archive rows remain idempotent and do not create
  duplicate memory chunks.
- No BullMQ/Redis worker deployment, Reddit/Discord import, export worker,
  candidate review, quota, Cloudflare, vector, public publishing, or UI scope
  was added.

Validation run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```
