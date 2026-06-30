# PR484J-G - Archive Connector Import Activation Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-G after ARGUS accepted the Archive Connector Import
Activation implementation:

`docs/roadmap/PR484J_G_ARCHIVE_CONNECTOR_IMPORT_ACTIVATION_REVIEW_RESULT.md`

Accepted boundary:

- authenticated owner-only route:
  `POST /archive-connectors/import-intents/:intentId/activate`;
- UUID path and strict empty-body validation before storage work;
- owner-scoped intent load by id, owner, and archive connector purpose;
- only pending intents activate;
- already activated intents return the existing safe row without credential
  decrypt, provider source inventory, or writes;
- cancelled, missing, wrong-owner, wrong-purpose, stale, or non-pending intents
  fail before credential decrypt, provider source inventory, or writes;
- owner persona, source-ready credential, completed account proof, and accepted
  PR484J-E source metadata are rechecked before first activation;
- only `archive_connector_import_intents` is updated, recording activated
  status and `activated_at`;
- duplicate source confirmation after activation returns the existing activated
  safe receipt.

No source-body reads, existing `import_jobs`, connector job table writes,
archive source rows, `persona_files`, Memory, Canon, Continuity, public
documents, review candidates, queues, workers, UI, hosted/runtime work,
packages, billing, Redis, Cloudflare, marketplace, partner adapters, or social
behavior entered the lane.

## Next Move

The next actual execution boundary is source-body read dry-run:

```text
PR484J-H - Archive Connector Source Body Read Dry-Run
```

This should choose one safe provider/source family and prove body-read behavior
without import writes.
