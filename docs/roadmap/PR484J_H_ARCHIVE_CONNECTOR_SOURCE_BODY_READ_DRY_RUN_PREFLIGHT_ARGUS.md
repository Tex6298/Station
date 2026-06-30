# PR484J-H - Archive Connector Source Body Read Dry-Run Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-G as accepted:

`docs/roadmap/PR484J_G_ARCHIVE_CONNECTOR_IMPORT_ACTIVATION_CLOSEOUT.md`

Station can now create and activate owner-only archive connector import intent
receipts. It still does not read source bodies or execute imports.

## Decision Requested

ARGUS should hostile-preflight the smallest safe source-body read dry-run lane.

If accepted, wake DAEDALUS with exact route/helper/test boundaries. If blocked,
wake MIMIR with the concrete blocker and smallest next unblock.

## Questions To Settle

- Which single provider/source family should be first:
  - Reddit history category;
  - Reddit subreddit-membership metadata only;
  - Discord guild metadata only;
  - or no source-body read until another scope/config lane exists.
- Exact provider endpoint(s) and primary-doc evidence for the chosen source
  family.
- Whether the route is owner-only dry-run readback, an internal helper, or a
  private staging row.
- Route shape, for example:
  `POST /archive-connectors/import-intents/:intentId/source-preview`.
- Whether the intent must already be activated.
- Whether the response may include private source body text, sanitized snippet
  only, metadata-only counts, or no content at all.
- Bounded page size, timeout, rate-limit, and pagination behavior.
- Safe response fields and forbidden fields.
- Failure modes for stale intent, revoked credential, missing account proof,
  source no longer available, provider auth failure, rate limit, payload shape
  mismatch, quota/storage failure, and unsupported/deferred source family.
- Tests proving no import writes, existing `import_jobs`, archive source rows,
  Memory, Canon, Continuity, public documents, review candidates, queue/worker
  execution, broad crawl, recurring pull, UI, hosted/runtime, packages,
  billing, Redis, Cloudflare, marketplace, partner adapter, or social behavior.

## Candidate Implementation Boundary

If accepted, DAEDALUS may add only:

- one narrow source-body or metadata dry-run route/helper for the accepted
  provider/source family;
- provider-client seam with injected fetch/client;
- bounded private owner-only readback or private staging record only if ARGUS
  explicitly accepts it;
- focused tests for owner scope, credential/account/intent gates, redaction,
  provider failures, and forbidden behavior scans.

## Out Of Scope

- import writes or import execution;
- existing `import_jobs` writes;
- archive source rows;
- pagination crawl beyond the accepted dry-run page;
- recurring pulls;
- Memory, Canon, Continuity, public document, review candidate, queue, or
  worker execution;
- broad UI;
- hosted/runtime proof;
- packages, billing, Redis, Cloudflare, marketplace, partner adapters, or
  social behavior.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-G after ARGUS accepted activation receipts.
- The next actual execution boundary is source-body read dry-run, not import writes.
Task:
- Hostile-preflight PR484J-H Archive Connector Source Body Read Dry-Run.
- Choose the first safe provider/source family, exact endpoint evidence, route/helper shape, readback/staging policy, failure modes, and tests.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest unblock.
```
