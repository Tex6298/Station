# PR484J-K - Archive Connector Import Execution Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Decision

MIMIR closes PR484J-K after ARGUS accepted the implementation and applied one
narrow compatibility patch:

`docs/roadmap/PR484J_K_ARCHIVE_CONNECTOR_IMPORT_EXECUTION_REVIEW_RESULT.md`

Accepted verdict:

```text
ACCEPT_PR484J_K_ARCHIVE_CONNECTOR_IMPORT_EXECUTION
```

## Closed Boundary

PR484J-K adds one owner-only synchronous connector import execution path:

- route:
  `POST /archive-connectors/source-staging-runs/:runId/import`;
- exactly one current owner Reddit saved-items staged run;
- linked activated import-intent, persona, and source-field rechecks before
  decrypt and archive writes;
- dedicated source-staging decrypt for the PR484J-I encrypted batch envelope;
- connector-specific text assembly from staged `normalizedText` values only;
- `import_jobs.kind = 'archive_connector'`;
- unique `archive_connector_source_staging_run_id` pointer;
- direct synchronous `ingestTextIntoArchive`;
- safe generic owner readback and source label;
- private archive chunks through `archiveSource.type = 'import_job'`;
- staged-run `imported` lifecycle on success;
- idempotent completed readback, pending queued/processing readback, and
  failed-job retry through the connector import route only;
- `/imports/:id/retry` rejects connector jobs;
- owner archive list/search redacts connector chunk summaries.

ARGUS also patched the shared import-job select fallback so partially migrated
databases missing only the new connector pointer column continue preserving
existing `file_id` readback.

## Explicit Non-Scope

PR484J-K did not add:

- `/imports/chat` reuse;
- generic import parsers;
- `persona_files`;
- review-candidate writes;
- provider calls or token work;
- source inventory calls;
- queues or workers;
- UI or hosted/runtime proof;
- billing, Redis, Cloudflare, marketplace, partner adapters, or social
  behavior;
- broad Reddit reads, additional Reddit history categories, or Discord content
  reads;
- public documents, Canon, or Continuity writes.

## Validation Truth

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts`
  passed with 82 route tests.
- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/background-jobs.service.test.ts`
  passed with 7 background job service tests.
- The accepted archive/social/background/import/error suite passed with 151
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed.
- `git diff --check` passed.
- Local Windows build still fails during Next standalone traced-file symlink
  creation after compile/static generation; this remains environment truth, not
  a PR484J-K compile/type failure.

## Next Move

The backend connector path now reaches owner-private import execution. The next
product boundary is making that accepted flow usable through a safe owner UI,
without widening provider, import, hosted/runtime, billing, cache, or worker
scope.

Next lane:

```text
PR484J-L - Archive Connector Owner UI Flow Preflight
Owner: ARGUS / A3
```

