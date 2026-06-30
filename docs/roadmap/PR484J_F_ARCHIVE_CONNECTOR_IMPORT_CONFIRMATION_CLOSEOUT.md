# PR484J-F - Archive Connector Import Confirmation Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-F after ARGUS accepted the Archive Connector Import
Confirmation implementation:

`docs/roadmap/PR484J_F_ARCHIVE_CONNECTOR_IMPORT_CONFIRMATION_REVIEW_RESULT.md`

Accepted boundary:

- authenticated owner-only route:
  `POST /archive-connectors/:provider/import-intents`;
- strict confirmation body with owner persona id plus source inventory
  `sourceKey`, `sourceFamily`, `sourceKind`, and `sourceLabel` echoes;
- owner persona check before credential decrypt, provider source inventory
  fetch, or writes;
- source-ready credential and completed account proof required before inventory
  revalidation;
- source confirmation by re-running only accepted PR484J-E inventory metadata
  and matching exactly one available safe source row;
- writes limited to the new owner-scoped
  `archive_connector_import_intents` receipt table;
- duplicate confirmation clicks return the existing pending intent safely;
- readbacks omit owner ids, idempotency fingerprints, raw provider ids,
  cursors, source bodies, provider payloads, provider headers, tokens,
  encrypted credentials, SQL/storage details, stack traces, and secret-shaped
  values.

No existing `import_jobs`, archive source rows, source bodies, Memory, Canon,
Continuity, public documents, review candidates, jobs, queues, workers, UI,
hosted/runtime work, packages, billing, Redis, Cloudflare, marketplace, partner
adapters, or social behavior entered the lane.

## Next Move

The next product-depth boundary is import execution/activation:

```text
PR484J-G - Archive Connector Import Execution / Activation
```

This should decide the smallest safe transition from pending intent receipt
toward actual import execution, while keeping body reads and workers explicit.
