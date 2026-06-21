# PR148 - Owner Background Job Status Readback

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible route behavior changes.
Status: closed by MIMIR on 2026-06-21.

## Why This Lane

ARGUS accepted PR147 Background Jobs Activation Audit. The verdict is clear:
do not activate a real queue/worker lane yet. Protected-alpha inline fallback
remains correct until staged replay shows a specific painful flow.

The one useful implementation before workers is owner-only job status/readback
consolidation. Station already has import job status, export package status,
retry metadata, and background job summary helpers. A small owner readback API
can make existing work inspectable without adding BullMQ, Redis/Valkey workers,
Cloudflare Queue, or public job surfaces.

## Goal

Add a bounded owner-only background job status readback for existing durable
job-like records.

An owner should be able to inspect recent archive import jobs and export package
jobs through one sanitized API shape. Future route-followup job kinds should be
listed as inactive/documented, not faked as running jobs.

## Scope

DAEDALUS should inspect:

- `apps/api/src/services/background-jobs.service.ts`;
- `apps/api/src/routes/imports.ts`;
- `apps/api/src/routes/exports.ts`;
- `apps/api/src/app.ts`;
- route tests for imports, exports, health, replay readiness, and background
  job helpers.

Implement the smallest safe slice:

- add an authenticated owner-only readback route, name chosen to match repo
  patterns;
- combine existing `import_jobs` and `export_packages` summaries for the owner;
- use the existing background job summarizers or a narrow serializer that emits
  only safe fields;
- include status, kind, safe source/package label, created/updated timestamp
  where available, and sanitized error summary;
- document inactive route-followup job kinds such as embedding backfill, memory
  consolidation, replay seed setup, and Developer Space import batch;
- keep existing import/export routes and retry behavior intact.

If DAEDALUS finds the API already exists under another route, document it and
patch only the smallest missing safety/readback gap.

## Privacy Requirements

Do not return or render:

- owner ids;
- persona ids;
- developer space ids;
- queue payloads;
- raw import bodies;
- private archive excerpts;
- prompts, completions, trace bodies, or provider payloads;
- raw URLs;
- bearer values, API keys, passwords, webhook secrets, DB URLs, tokens, cookies,
  or other secret-shaped values.

Job ids may be returned only if needed for an owner action that already exists
or for stable client keys. Prefer route/resource labels over raw ids in
display-oriented fields.

## Non-Scope

Do not add:

- BullMQ/Redis/Valkey worker runtime;
- production worker process;
- Cloudflare Queue/Worker implementation;
- Redis as canonical Memory truth;
- new retry worker;
- public job status;
- broad job dashboard UI;
- background processing for all candidate kinds;
- provider/embedding migration;
- migration-ledger repair.

This is readback consolidation only.

## Tests

Add focused tests for:

- owner scoping;
- import job summary serialization;
- export package summary serialization;
- inactive route-followup job kind copy;
- sanitized error output;
- no raw ids/private text/URLs/secrets in display-oriented fields.

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:jobs
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If DAEDALUS adds a new route test file that is not covered by an existing
script, run it explicitly and name it in the handoff.

## ARGUS Review Requirements

ARGUS should verify:

- the readback route is authenticated and owner-scoped;
- import/export summaries do not leak private text, raw ids in display fields,
  queue payloads, prompts, provider payloads, URLs, or secrets;
- route-followup job kinds are represented honestly as inactive/documented until
  a real owning route exists;
- no worker/queue runtime or Redis Memory-truth behavior was added;
- validation passed.

ARIADNE is not required unless DAEDALUS changes visible owner-route behavior.

## DAEDALUS Implementation Notes

Implemented on 2026-06-21.

Route shape:

- `GET /background-jobs` is authenticated with `requireAuth`.
- The route reads only the current owner's `import_jobs` and `export_packages`
  rows.
- The response combines recent durable jobs into a single bounded list with
  `id`, `kind`, `status`, `statusStore`, safe `label`, sanitized
  `errorSummary`, and available `createdAt`/`updatedAt` timestamps.
- Route-followup kinds are listed separately as inactive:
  `embedding_backfill`, `memory_consolidation`, `replay_seed_setup`, and
  `developer_space_import_batch`.

Privacy proof:

- The route response does not serialize owner ids, persona ids, developer space
  ids, resource ids, queue payloads, raw import bodies, prompts/completions,
  trace/provider payloads, raw URLs, bearer values, API keys, webhook secrets,
  DB URLs, tokens, cookies, or secret-shaped values.
- Job ids are retained only as stable owner-action/client keys.
- Display labels and errors reuse hardened background-job sanitization.

Non-claims:

- No BullMQ/Redis/Valkey worker runtime, production worker process, Cloudflare
  Queue/Worker implementation, Redis Memory truth, retry worker, public job
  status, broad dashboard UI, provider migration, or migration-ledger repair
  was added.
- Existing import/export routes and retry behavior were left intact.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:jobs` | Pass | 8 tests passed, including the new owner readback route. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 4 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local DAEDALUS state. |

## ARGUS Review

Accepted on 2026-06-21 after a narrow privacy hardening patch.

ARGUS findings:

- `GET /background-jobs` is authenticated with `requireAuth` and reads only
  `import_jobs` and `export_packages` rows filtered by the current
  `req.user!.id`.
- The response keeps stable job ids only for owner-action/client keys and does
  not serialize owner ids, persona ids, developer space ids, resource ids,
  queue payloads, raw import bodies, prompts/completions, provider payloads,
  raw URLs, bearer values, API keys, webhook secrets, DB URLs, tokens, cookies,
  or secret-shaped values.
- Route-followup kinds remain honest inactive entries; no background processing
  is faked for embedding backfill, memory consolidation, replay seed setup, or
  Developer Space import batch.
- No BullMQ/Redis/Valkey worker runtime, production worker process, Cloudflare
  Queue/Worker implementation, Redis Memory truth, retry worker, public job
  status, broad dashboard UI, provider migration, migration-ledger repair, or
  import/export retry behavior change was added.

ARGUS review patch:

- Hardened `sanitizeJobErrorMessage` for spaced labels such as `api key`,
  `database url`, `developer space id`, `system prompt`, and
  `provider payload`, plus multi-word secret values.
- Routed background-job load failures through the same sanitizer before
  returning an owner-visible `500` response.
- Added a focused sanitizer regression to the background job helper tests.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:jobs` passed with 9 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:storage` passed with 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:exports` passed with 4 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:health` passed with 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed with 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.

No visible route behavior changed, so ARIADNE rehearsal is not required.

## MIMIR Closeout

MIMIR closes PR148 on 2026-06-21.

PR148 is accepted as owner-only background job status readback. The API now
consolidates current-owner import and export job summaries through
`GET /background-jobs`, while route-followup kinds remain honest inactive
entries and no worker/runtime infrastructure was activated.

Next lane: `PR149 - Staged Replay Measurement Baseline`. With Memory UX,
observability, no-worker posture, and job readback in place, the next task is
to measure staged replay rather than add more infrastructure by guesswork.
