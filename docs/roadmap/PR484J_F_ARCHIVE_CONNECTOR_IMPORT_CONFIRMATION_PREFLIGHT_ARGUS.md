# PR484J-F - Archive Connector Import Confirmation Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-E as accepted:

`docs/roadmap/PR484J_E_ARCHIVE_CONNECTOR_SOURCE_INVENTORY_LISTING_CLOSEOUT.md`

Station can now return owner-only safe source inventory metadata for accepted
Reddit and Discord source families. The next product-depth question is owner
confirmation: selecting a safe source inventory row and creating a bounded
import intent/job.

## Decision Requested

ARGUS should hostile-preflight whether DAEDALUS can implement a narrow
owner-confirmed archive connector import intent boundary.

If accepted, wake DAEDALUS with exact route/helper/test boundaries. If blocked,
wake MIMIR with the concrete blocker and smallest next unblock.

## Questions To Settle

- Route shape, for example:
  `POST /archive-connectors/:provider/imports`.
- Exact request body, likely `sourceKey` plus optional client-visible label or
  source family confirmation.
- Whether the route revalidates the source key by re-running source inventory,
  or validates it through a signed/opaque Station source key contract.
- Whether import confirmation creates:
  - an archive source row;
  - an import job row;
  - both;
  - or a dry-run import intent only.
- Whether source body reads remain deferred, or whether this lane may enqueue a
  future worker without executing it.
- Idempotency key and duplicate-click behavior.
- Owner/account/credential checks before writes.
- Safe response fields and forbidden fields.
- Failure modes for stale source key, revoked credential, missing account proof,
  source scope mismatch, provider failure, storage failure, quota/plan gates,
  and unsupported/deferred source families.
- Tests proving no Memory, Canon, Continuity, public documents, review
  candidates, source body readback, queue execution, hosted/runtime UI,
  packages, billing, Redis, Cloudflare, marketplace, partner adapter, or social
  behavior is added unless explicitly accepted.

## Candidate Implementation Boundary

If accepted, DAEDALUS may add only:

- owner-only import confirmation route/helper;
- source-key validation based on accepted inventory metadata;
- bounded archive/import intent persistence if ARGUS accepts the write shape;
- idempotency and duplicate-click protection;
- safe readback of the created pending import;
- focused tests for owner scope, source-key tamper resistance, no private
  source body readback, and forbidden behavior scans.

## Out Of Scope

- source body/content reads unless ARGUS explicitly accepts the smallest body
  read lane;
- executing provider crawls;
- pagination crawl;
- recurring pulls;
- Memory, Canon, Continuity, public document, review candidate, queue, or
  worker execution;
- broad UI;
- hosted proof;
- packages, billing, Redis, Cloudflare, marketplace, partner adapters, or
  social behavior.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-E after ARGUS accepted source inventory listing.
- The next archive connector move is owner-confirmed import intent/job preflight.
Task:
- Hostile-preflight PR484J-F Archive Connector Import Confirmation.
- Decide route/body shape, source-key validation, write shape, idempotency, safe readback, failure modes, and tests.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest unblock.
```
