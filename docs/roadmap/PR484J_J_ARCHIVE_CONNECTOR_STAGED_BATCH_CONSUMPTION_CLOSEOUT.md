# PR484J-J - Archive Connector Staged Batch Consumption Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-J after ARGUS accepted the Archive Connector Staged Batch
Consumption implementation:

`docs/roadmap/PR484J_J_ARCHIVE_CONNECTOR_STAGED_BATCH_CONSUMPTION_REVIEW_RESULT.md`

Accepted boundary:

- authenticated owner-only route:
  `POST /archive-connectors/source-staging-runs/:runId/import-preview`;
- read-only owner-only staged-batch import preview;
- exact owner/current staged-run load from
  `public.archive_connector_source_staging_runs`;
- lifecycle gates before decrypt:
  `status = staged`, not expired, not revoked, and not superseded;
- linked activated import-intent and persona/source rechecks before decrypt;
- dedicated PR484J-I staging envelope decrypt with
  `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY`;
- safe aggregate preview metadata only;
- staged-run lifecycle unchanged after preview;
- no generic import parser use for staged connector batches.

No durable candidates, import execution, archive source rows, existing
`import_jobs`, connector job tables, jobs, queues, workers, UI,
hosted/runtime, provider calls, token work, packages, billing, Redis,
Cloudflare, marketplace, partner adapters, social behavior, broad Reddit reads,
or Discord content reads entered scope.

## Next Move

The next actual execution boundary is connector import execution:

```text
PR484J-K - Archive Connector Import Execution Preflight
```

This should decide how an owner-confirmed current staged run may create/import
owner archive material, including whether to use existing `import_jobs`,
`ingestTextIntoArchive`, a connector-specific job/candidate row, or another
small unblock before any UI, hosted/runtime, queue, worker, pagination crawl, or
broader provider/source expansion is opened.
