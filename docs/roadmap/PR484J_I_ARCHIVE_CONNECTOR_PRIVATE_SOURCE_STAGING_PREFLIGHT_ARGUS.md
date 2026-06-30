# PR484J-I - Archive Connector Private Source Staging Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-H as accepted:

`docs/roadmap/PR484J_H_ARCHIVE_CONNECTOR_SOURCE_BODY_READ_DRY_RUN_CLOSEOUT.md`

Station can now prove one activated owner-only Reddit saved-items body/listing
read and return counts only. It still does not persist private source data,
create import jobs, create archive sources, enqueue workers, or expose UI.

## Decision Requested

ARGUS should hostile-preflight the smallest safe owner-only private source
staging lane for live archive connectors.

If accepted, wake DAEDALUS with exact schema/route/helper/test boundaries. If
blocked, wake MIMIR with the concrete blocker and smallest numbered unblock.

## Questions To Settle

- Whether the first write boundary should be a dedicated connector staging
  table, a connector staging run plus items table, an existing import job, an
  archive source row, or no write until another schema/privacy contract exists.
- Whether PR484J-I should stay limited to activated Reddit saved-items intents
  and the same one-page provider read accepted in PR484J-H.
- Whether staged records may store private source text/title/url/permalink
  material, normalized text only, metadata/fingerprints only, encrypted blobs
  only, or no content until a later lane.
- Whether API readback may include only counts and staging ids, or whether any
  private owner-only source snippet/readback is acceptable.
- The route shape, for example:
  `POST /archive-connectors/import-intents/:intentId/source-staging-runs`.
- Whether the staging action must require a fresh source-preview read in the
  same request, reuse only activated intent metadata, or require both.
- Idempotency and duplicate behavior for repeated owner clicks, provider
  retries, and duplicate Reddit saved items.
- Retention, deletion, and revocation behavior when a connector credential is
  revoked, an intent is cancelled, or a staged run is superseded.
- Safe fields, forbidden fields, logging policy, and whether staging rows need
  a separate redaction/readback serializer.
- Failure modes for stale intent, revoked credential, missing account proof,
  provider auth failure, rate limit, payload mismatch, duplicate staging,
  storage failure, and unsupported source family.
- Tests proving no existing `import_jobs`, archive source rows, `persona_files`,
  Memory, Canon, Continuity, public documents, review candidates, queues,
  workers, recurring pulls, UI, hosted/runtime, packages, billing, Redis,
  Cloudflare, marketplace, partner adapters, social behavior, additional Reddit
  history categories, or Discord channel/message/member reads enter scope.

## Candidate Implementation Boundary

If accepted, DAEDALUS may add only:

- one narrow owner-only staging route/helper for activated Reddit saved-items
  intents;
- a dedicated owner-scoped staging schema only if ARGUS accepts it;
- a provider-client seam reusing the PR484J-H identity-first saved-items read
  boundary;
- idempotent staging run/item writes only inside the accepted staging tables;
- safe count/status readback and focused tests for owner scope, credential and
  account gates, redaction, no downstream imports, duplicate behavior, and
  forbidden behavior scans.

## Out Of Scope

- existing `import_jobs` writes unless ARGUS explicitly accepts them;
- archive source rows;
- `persona_files`;
- Memory, Canon, Continuity, public document, review candidate, queue, worker,
  recurring pull, or import execution;
- broad UI or hosted/runtime proof;
- packages, billing, Redis, Cloudflare, marketplace, partner adapters, social
  behavior, or additional provider/source families.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-H after ARGUS accepted the Reddit saved-items source-preview route.
- The next boundary is the first private source staging/write decision, not import execution.
Task:
- Hostile-preflight PR484J-I Archive Connector Private Source Staging.
- Decide the staging schema/route/helper boundary, allowed private data shape, readback policy, idempotency, retention, failure modes, and tests.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest numbered unblock.
```
