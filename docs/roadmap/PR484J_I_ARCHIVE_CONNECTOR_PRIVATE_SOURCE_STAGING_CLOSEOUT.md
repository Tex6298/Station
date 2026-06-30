# PR484J-I - Archive Connector Private Source Staging Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-I after ARGUS accepted the Archive Connector Private Source
Staging implementation:

`docs/roadmap/PR484J_I_ARCHIVE_CONNECTOR_PRIVATE_SOURCE_STAGING_REVIEW_RESULT.md`

Accepted boundary:

- authenticated owner-only route:
  `POST /archive-connectors/import-intents/:intentId/source-staging-runs`;
- dedicated owner-scoped staging table:
  `public.archive_connector_source_staging_runs`;
- dedicated encrypted staging envelope:
  `station.archive_connector.source_staging_batch.v1`;
- dedicated runtime key:
  `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY`;
- activated owner-scoped import intent, owner persona recheck, source-ready
  Reddit credential, completed account proof, source staging encryption, and
  fresh Reddit identity fingerprint match before one bounded saved-items read;
- private normalized source text is stored only inside the encrypted batch;
- safe run metadata readback only;
- duplicate, supersede, expiry, and owner-scoped revoke lifecycle accepted
  after ARGUS patched changed-snapshot replacement failure behavior.

No staged-batch consumption, import execution, archive source rows, existing
`import_jobs`, connector job tables, jobs, queues, workers, UI,
hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner
adapters, social behavior, broad Reddit reads, additional Reddit history
content lanes, or Discord channel/message/member reads entered the lane.

## Next Move

The next actual execution boundary is staged-batch consumption:

```text
PR484J-J - Archive Connector Staged Batch Consumption Preflight
```

This should decide how Station may decrypt an owner-only staged batch and turn
it into safe import-preview/candidate material before any archive source write,
existing import job write, queue, worker, UI, or hosted/runtime behavior is
opened.
