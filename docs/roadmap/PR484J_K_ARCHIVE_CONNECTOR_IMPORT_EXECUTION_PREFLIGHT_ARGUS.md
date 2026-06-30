# PR484J-K - Archive Connector Import Execution Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-J as accepted:

`docs/roadmap/PR484J_J_ARCHIVE_CONNECTOR_STAGED_BATCH_CONSUMPTION_CLOSEOUT.md`

Station can now decrypt one current owner-only Reddit saved-items staged run
into safe aggregate import-preview metadata. It still does not execute imports,
create archive source rows, write existing `import_jobs`, enqueue jobs, expose
UI, or prove hosted runtime behavior.

Existing manual pasted-chat imports use `POST /imports/chat`, existing
`import_jobs`, and `ingestTextIntoArchive`. PR484J-K should decide whether and
how a connector staged run may enter that archive write path.

## Decision Requested

ARGUS should hostile-preflight the smallest safe connector import execution
lane.

If accepted, wake DAEDALUS with exact route/helper/test boundaries. If blocked,
wake MIMIR with the concrete blocker and smallest numbered unblock.

## Questions To Settle

- Whether PR484J-K may create an existing `import_jobs` row for one current
  staged Reddit saved-items run, or whether a durable connector candidate/job
  row must come first.
- Whether the route shape should be owner-only confirmation such as:
  `POST /archive-connectors/source-staging-runs/:runId/import`.
- Whether import execution may synchronously call `ingestTextIntoArchive` with
  connector-normalized text, or must only create a queued/pending job for a
  later worker lane.
- What `import_jobs.kind`, `source_name`, status transitions, archive source
  metadata, and idempotency keys are allowed.
- Whether the staged run lifecycle remains `staged`, becomes `imported`,
  becomes `consumed`, records an import job id, or is left unchanged until a
  later lane.
- Whether duplicate clicks should return the existing completed/processing job,
  block, or create a new job when the staged snapshot changed.
- Whether failed execution can mark an import job failed while preserving the
  staged run for retry.
- How to sanitize import job source names, error messages, and archive source
  labels so private Reddit titles, bodies, URLs, authors, subreddit names, raw
  ids, usernames, item fingerprints, and encrypted batch values never leak.
- Whether `ingestTextIntoArchive` may create private archive chunks and review
  candidates in this lane, or whether PR484J-K must stop at import job creation.
- Whether source-preview/staged-batch aggregate preview must be rechecked before
  import execution.
- Tests proving owner scope, lifecycle gates, duplicate behavior, failure
  handling, quota handling, redaction, no UI/hosted/runtime drift, no queues or
  workers unless explicitly accepted, and no broad Reddit/Discord expansion.

## Candidate Implementation Boundary

If accepted, DAEDALUS may add only:

- one owner-only import confirmation route/helper for current Reddit
  saved-items staged runs;
- decryption of the accepted PR484J-I staging envelope for the owner run;
- connector-specific normalized text assembly for archive ingest;
- either one accepted existing `import_jobs` write or one accepted
  connector-specific candidate/job write, not both unless ARGUS explicitly
  accepts it;
- focused tests for idempotency, failed writes, failed ingest, status
  transitions, redaction, quota behavior, and no forbidden downstream drift.

## Out Of Scope

- broad UI or hosted/runtime proof;
- background queues, workers, scheduled pulls, pagination crawls, recurring
  imports, Redis, Cloudflare, marketplace, partner adapters, social behavior,
  packages, billing, or Stripe;
- additional Reddit history categories;
- Discord channel/message/member reads;
- public documents, Memory, Canon, Continuity, or review candidates unless
  ARGUS explicitly accepts that existing archive ingest produces them as part
  of the smallest safe import execution boundary.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-J after ARGUS accepted read-only staged-batch import preview.
- The next boundary is connector import execution for one owner-confirmed current staged run.
Task:
- Hostile-preflight PR484J-K Archive Connector Import Execution.
- Decide whether to use existing import_jobs/ingestTextIntoArchive, a connector candidate/job row, or a smaller unblock; define route, lifecycle, idempotency, failure, redaction, and tests.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest numbered unblock.
```
