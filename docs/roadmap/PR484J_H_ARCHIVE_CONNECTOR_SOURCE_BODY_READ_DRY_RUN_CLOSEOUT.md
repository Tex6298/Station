# PR484J-H - Archive Connector Source Body Read Dry-Run Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-H after ARGUS accepted the Archive Connector Source Body
Read Dry-Run implementation:

`docs/roadmap/PR484J_H_ARCHIVE_CONNECTOR_SOURCE_BODY_READ_DRY_RUN_REVIEW_RESULT.md`

Accepted boundary:

- authenticated owner-only route:
  `POST /archive-connectors/import-intents/:intentId/source-preview`;
- activated owner-only archive connector import intent required;
- Reddit `reddit_user_history` / `saved_items` only;
- live Reddit identity check runs first and fingerprint-matches the current raw
  account id against stored account proof;
- one bounded saved-items page is read internally:
  `/user/{username}/saved?limit=10&raw_json=1`;
- readback returns counts, truncation, safe intent metadata, and safety
  booleans only;
- no source content, private staging, import execution, archive source rows,
  existing `import_jobs`, connector job tables, Memory, Canon, Continuity,
  public documents, review candidates, queues, workers, UI, hosted/runtime,
  packages, billing, Redis, Cloudflare, marketplace, partner adapters, social
  behavior, or unaccepted provider reads entered scope.

## Next Move

The next actual execution boundary is private source staging:

```text
PR484J-I - Archive Connector Private Source Staging Preflight
```

This should decide the first owner-only write boundary for live connector source
data before any import execution, archive source write, job/queue work, UI, or
hosted/runtime behavior is opened.
