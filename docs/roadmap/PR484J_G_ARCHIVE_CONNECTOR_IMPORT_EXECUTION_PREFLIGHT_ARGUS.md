# PR484J-G - Archive Connector Import Execution / Activation Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-F as accepted:

`docs/roadmap/PR484J_F_ARCHIVE_CONNECTOR_IMPORT_CONFIRMATION_CLOSEOUT.md`

Station can now create owner-scoped pending import intent receipts from safe
source inventory rows. Those receipts do not yet execute imports, create
archive sources, enqueue jobs, or read source bodies.

## Decision Requested

ARGUS should hostile-preflight the smallest safe import execution/activation
lane.

If accepted, wake DAEDALUS with exact route/helper/test boundaries. If blocked,
wake MIMIR with the concrete blocker and smallest next unblock.

## Questions To Settle

- Whether this lane should:
  - activate a pending intent into an archive source/import job only;
  - perform a dry-run execution readback only;
  - execute the first source-body read for one source family;
  - or split those into smaller lanes.
- Route shape, for example:
  `POST /archive-connectors/import-intents/:intentId/activate`.
- Whether activation writes existing `import_jobs`, a new connector job table,
  archive source rows, or only an activated intent state.
- Whether any provider source body reads are accepted in this lane, and if so
  which single provider/source family is first.
- Idempotency, duplicate-click, retry, and cancellation behavior.
- Owner/persona/source/credential/account checks before activation.
- Plan/quota/storage gates, if any, before writes.
- Safe response fields and forbidden fields.
- Failure modes for stale intent, revoked credential, missing account proof,
  source no longer available, storage failure, provider failure, quota failure,
  and unsupported/deferred source families.
- Tests proving no Memory, Canon, Continuity, public documents, review
  candidates, queue/worker execution, broad provider crawl, pagination,
  recurring pull, UI, hosted/runtime work, packages, billing, Redis,
  Cloudflare, marketplace, partner adapter, or social behavior unless
  explicitly accepted.

## Candidate Implementation Boundary

If accepted, DAEDALUS may add only the smallest lane ARGUS chooses:

- owner-only activation route/helper;
- pending intent state transition or narrowly accepted import/job write;
- idempotency and duplicate-click protection;
- safe readback of activation status;
- focused tests for owner scope, stale/tampered intent behavior, no private
  source body leakage, and forbidden behavior scans.

## Out Of Scope Unless ARGUS Explicitly Narrows And Accepts

- source body/content reads;
- pagination crawl;
- recurring pulls;
- queue/worker execution;
- Memory, Canon, Continuity, public document, or review candidate writes;
- broad UI;
- hosted/runtime proof;
- packages, billing, Redis, Cloudflare, marketplace, partner adapters, or
  social behavior.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-F after ARGUS accepted import intent receipts.
- The next archive connector move is import execution/activation preflight.
Task:
- Hostile-preflight PR484J-G Archive Connector Import Execution / Activation.
- Decide whether the smallest safe lane is intent activation, import/job write, dry-run execution, or one narrow source-body read.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest unblock.
```
