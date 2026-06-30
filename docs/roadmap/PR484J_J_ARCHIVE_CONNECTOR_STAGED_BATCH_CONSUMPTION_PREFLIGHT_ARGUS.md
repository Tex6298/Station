# PR484J-J - Archive Connector Staged Batch Consumption Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-I as accepted:

`docs/roadmap/PR484J_I_ARCHIVE_CONNECTOR_PRIVATE_SOURCE_STAGING_CLOSEOUT.md`

Station can now create encrypted ephemeral owner-only Reddit saved-items
staging runs. It still does not decrypt staged batches for import preview,
create archive sources, create existing `import_jobs`, enqueue workers, expose
UI, or run hosted proof.

## Decision Requested

ARGUS should hostile-preflight the smallest safe staged-batch consumption lane.

If accepted, wake DAEDALUS with exact route/helper/test boundaries. If blocked,
wake MIMIR with the concrete blocker and smallest numbered unblock.

## Questions To Settle

- Whether PR484J-J should decrypt one owner-owned current staged run only to
  produce import-preview-style counts and candidate metadata, or whether it may
  create a durable import candidate record.
- Whether the route should be read-only, for example:
  `POST /archive-connectors/source-staging-runs/:runId/import-preview`.
- Whether the route may reuse existing manual import preview parser concepts,
  or must add connector-specific normalization before touching shared import
  preview code.
- Whether staged batch consumption may return private owner-only source
  snippets, normalized titles/text, or only counts, labels, and safety
  booleans.
- Whether consumed staged runs remain current, become previewed, get a preview
  timestamp, or stay unchanged until a later import execution lane.
- What happens when a staged run is expired, revoked, superseded, wrong owner,
  wrong provider/source, malformed, undecryptable, empty, or unsupported.
- Whether source item fingerprints, batch fingerprints, raw provider ids,
  usernames, URLs, authors, subreddit names, and encrypted batch values remain
  response/log forbidden.
- Whether import execution, archive source writes, existing `import_jobs`,
  connector job tables, queues, workers, UI, hosted/runtime, packages, billing,
  Redis, Cloudflare, marketplace, partner adapters, social behavior, additional
  Reddit history categories, and Discord content reads remain strictly out of
  scope.
- Tests proving the route cannot consume another owner's run, an inactive run,
  a stale/superseded run, a revoked run, or malformed encrypted content, and
  cannot write downstream import/archive/job records.

## Candidate Implementation Boundary

If accepted, DAEDALUS may add only:

- one narrow owner-only staged-run consumption/preview route or helper;
- decryption of the dedicated PR484J-I staging envelope for the owner run;
- a connector-specific in-memory normalization step;
- safe count/format/candidate metadata readback only unless ARGUS explicitly
  accepts owner-only private snippet readback;
- focused tests for owner scope, lifecycle gates, decrypt failure, redaction,
  no downstream writes, and forbidden behavior scans.

## Out Of Scope

- archive source rows;
- existing `import_jobs`;
- connector job tables;
- `persona_files`;
- Memory, Canon, Continuity, public documents, review candidates, queues,
  workers, recurring pulls, import execution, or pagination crawls;
- broad UI or hosted/runtime proof;
- packages, billing, Redis, Cloudflare, marketplace, partner adapters, social
  behavior, broader Reddit reads, or Discord channel/message/member reads.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-I after ARGUS accepted encrypted ephemeral owner-only Reddit saved-items staging.
- The next boundary is staged-batch consumption for safe import-preview/candidate material, not import execution.
Task:
- Hostile-preflight PR484J-J Archive Connector Staged Batch Consumption.
- Decide the route/helper boundary, readback policy, lifecycle state behavior, parser/normalization strategy, failure modes, and tests.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest numbered unblock.
```
