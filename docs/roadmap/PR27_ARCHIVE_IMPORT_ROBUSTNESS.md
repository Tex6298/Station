# PR27 - Archive/Import Robustness For Replay Safety

Date: 2026-06-18
Status: implemented by A2 / DAEDALUS; ready for ARGUS review
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE only rehearses if visible
archive/import UI behavior changes.

## Purpose

Prevent bad imports from poisoning memory, archive retrieval, or replay trust.

This follows `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md` PR 2 after the
accepted PR26 retrieval quality pass.

## Scope

- Make archive/import idempotent where practical.
- Add duplicate detection or safe overwrite behavior where the current model
  supports it.
- Add or harden partial-failure reporting.
- Keep failed imports visible to the owner without silently degrading existing
  archive material.
- Prove retrieval behavior after clean, duplicate, and failed/partial imports.
- Keep import job state owner-visible and specific enough for replay debugging.

## Explicit Non-Scope

- Do not build a full worker queue.
- Do not build large async orchestration unless replay pain proves it necessary.
- Do not add live Reddit/Discord OAuth, recurring sync, or external social API
  pulls.
- Do not add Cloudflare retrieval.
- Do not add Redis memory truth or Redis-dependent replay behavior.
- Do not change embedding providers or vector dimensions.
- Do not redesign the archive UI beyond necessary state/copy fixes.

## Required Fixtures

Add focused replay/import fixtures for:

- clean import;
- duplicate import;
- partial or failed import;
- retrieval after import.

If one fixture is already covered, name the existing test in the handoff instead
of duplicating it.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

Add `test:integrity` only if candidate review or integrity-linked import output
changes.

## ARGUS Review Ask

ARGUS should hostile-review:

- duplicate import behavior;
- partial failure behavior;
- whether failed imports preserve previous safe archive/retrieval data;
- owner-only import/job/file visibility;
- retrieval after import without cross-owner leakage;
- error messages and status states for non-secret, owner-visible debugging.

## Wake Discipline

DAEDALUS should wake ARGUS when done with:

- files changed;
- exact import/duplicate/failure semantics;
- fixture names and what each proves;
- validation commands/results;
- any remaining archive/import caveat.

If this lane exposes a true need for workers, Redis, or Cloudflare, wake MIMIR
with concrete replay evidence instead of adding that infrastructure.

## DAEDALUS Implementation Package

Implemented on 2026-06-18 as a narrow import robustness patch.

Behavior changes:

- Failed chat import retries now count existing owner/persona archive rows before
  requiring retry `content`. If archive rows already exist, the route marks the
  same job completed, returns `idempotent: true`, and reports
  `recoveredFrom: "partial_archive_rows"` without asking the owner to paste
  private source text again.
- Queued/processing chat retries with existing archive rows still complete
  idempotently and now report `recoveredFrom: "archive_rows_already_exist"`.
- Completed chat retries remain duplicate-safe and return the same completed job
  with no new archive rows.
- File import job reruns now validate the durable file pointer and count
  existing archive rows before changing job status to `processing`. A failed file
  job with existing archive rows is completed idempotently and reports
  `execution.reason: "partial_archive_rows"`.

Fixture coverage:

- Clean import: existing `chat imports reserve text bytes and roll back when
  archive insert fails` still proves a clean chat import creates a completed job
  and archive rows.
- Duplicate import: the same test proves a duplicate named chat import returns
  the original completed job without extra archive rows; `persona file
  registration is idempotent for exact owner persona storage paths` proves exact
  file registration duplicates do not reserve more storage or create new jobs.
- Partial/failed import: `background job retry reuses failed chat import jobs
  and redacts private failure text` now proves failed chat jobs with existing
  archive rows complete without retry content; `file import job runner claims
  durable file pointers, gates owners, and fails safely` now proves failed file
  jobs with existing archive rows complete idempotently without duplicating
  chunks.
- Retrieval after import: existing `private archive retrieval is owner-scoped and
  source-authoritative` and `/imports/archive/search is owner-scoped, filtered,
  and sanitized` continue to prove imported archive material is retrievable only
  for the owner and failed/non-authoritative rows are excluded or owner-visible
  as status metadata.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 tests passed, including file partial-failure idempotent recovery and duplicate file registration coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 28 tests passed, including failed chat import retry recovery without retry content. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 6 tests passed; runtime context behavior stayed unchanged. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API package build and dependent package builds passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

Scope notes:

- No worker queue, live Reddit/Discord OAuth/API pull, recurring sync,
  Cloudflare retrieval, Redis memory truth, provider change, vector dimension
  change, integrity output change, or archive UI redesign was added.
- This patch makes partial rows safe and diagnosable in the current
  protected-alpha synchronous/inline path; it does not claim durable production
  orchestration.
