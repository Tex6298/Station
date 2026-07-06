# PR496B - Workspace Export Hosted Create Failure Rerun Result

Date: 2026-07-06

Owner: ARIADNE / A4

Result:

```text
PRODUCT_DEFECT_ROUTE_DAEDALUS
```

## Scope

MIMIR asked ARIADNE to rerun the hosted `/studio/export` proof after DAEDALUS
applied migration 070 to hosted and ARGUS accepted PR496B.

The rerun checked:

- hosted web/API freshness;
- migration 070 readiness through live owner create/read/bundle behavior;
- replay-owner browser access to `/studio/export`;
- owner `workspace_manifest` create, manifest readback, and bundle readback;
- signed-out and cross-owner protection;
- high-level inventory-only JSON/Markdown bundle content;
- desktop, `375px`, and `390px` fit;
- visible copy for private/source/secret/storage/provider/billing/share/PDF/
  binary/backup/restore overclaim.

## Hosted Freshness

Hosted web and API health both reported ready at:

```text
web commit: 42938f5c
api commit: 42938f5c
```

This is the PR496B implementation runtime, so this is not a stale-deploy
result.

## Migration 070 Readiness Signal

The hosted backend defect from PR496A is repaired.

| Check | Result |
| --- | --- |
| Signed-out `GET /exports/workspace` | `401` |
| Owner `GET /exports/workspace` | `200` |
| Owner `POST /exports/workspace` | `201` |
| Created package kind/status | `workspace_manifest`, `completed` |
| Owner `GET /exports/:id` | `200` |
| Owner `GET /exports/:id/bundle` | `200` |
| Bundle files | `README.md`, `manifest.json`, `manifest.md` |
| Manifest schema | `station.workspace.export_manifest.v1` |

The live create/read/bundle path now proves the migration is effectively applied
on hosted.

## API And Bundle Boundary

API readback and bundle content stayed inside the accepted PR496A contract.

The hosted bundle scan found:

- no owner/target/source field names;
- no private body, prompt, provider payload, storage path, signed URL, or source
  id fields;
- no raw UUIDs beyond the expected package envelope;
- no secret-shaped values;
- no positive backup/restore/share/PDF/binary/provider/runtime/infra/billing
  claim;
- no `(undefined)` Markdown text.

This means the stored JSON/Markdown package contract itself passed.

## Owner-Only Protection

Owner-only protection passed:

| Check | Result |
| --- | --- |
| Signed-out package readback | `401` |
| Signed-out bundle readback | `401` |
| Cross-owner package readback | `404` |
| Cross-owner bundle readback | `404` |

The cross-owner result used the available second replay identity.

## Desktop And Mobile

Desktop, `375px`, and `390px` all rendered `/studio/export`, the workspace
manifest package list, completed package rows, and `View bundle files` controls
without measured horizontal overflow, clipped visible controls, visible
secret-shaped values, or positive forbidden product claims.

The bundle readback exists and includes the three expected files. However,
ARIADNE found two visible UI/product-boundary defects:

- The bundle readback panel prints the internal package id in owner-visible copy
  even though the same page states that package IDs are not shown.
- On `375px` and `390px`, after tapping `View bundle files`, the readback panel
  lands below the stacked completed-package list, so the immediate viewport
  still shows package cards rather than the readback feedback.

The first issue is the blocking product-boundary defect. The second is a mobile
feedback/locality issue that should be repaired in the same narrow web slice if
MIMIR routes it.

## Verdict

PR496B repaired the hosted backend create failure. The owner can now create,
read, and bundle a completed `workspace_manifest` on hosted, and the API/bundle
privacy contract passes.

ARIADNE cannot return `PASS_PR496B_HOSTED_WORKSPACE_EXPORT_CLOSEOUT` because
the hosted `/studio/export` readback UI exposes an internal package id while
claiming package IDs are not shown.

Smallest next action:

- Route DAEDALUS for a narrow web-only readback UI patch.
- Hide internal package ids from owner-visible bundle readback copy.
- Make mobile bundle readback feedback local or focus/scroll it into view after
  `View bundle files`.
- Do not change export API semantics, RLS, bundle files, full archive scope,
  original-file/PDF/binary packages, backup/restore, public export, share/signed
  URLs, provider/runtime, queues/workers, Redis, Cloudflare, billing, or Stripe
  behavior.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted API/browser proof | Product defect | Backend create/read/bundle passed, but UI exposed internal package id. |
| Screenshot inspection | Product defect | Desktop showed the raw package id in bundle readback; mobile kept readback below stacked cards after tap. |
| Owner-only API checks | Pass | Signed-out returned `401`; cross-owner returned `404`. |
| API/bundle leak scan | Pass | High-level inventory-only contract held. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE completed the PR496B hosted workspace export rerun.
- Hosted web/API were fresh at 42938f5c; migration 070 is effectively live because owner create/read/bundle now returned 201/200/200 with README.md, manifest.json, and manifest.md.
- Owner-only protection passed: signed-out list/readback/bundle returned 401 and cross-owner readback/bundle returned 404.
- API/bundle high-level inventory boundaries passed, but /studio/export exposes the internal package id in bundle readback while the same page says package IDs are not shown.
- On 375px and 390px, bundle readback also lands below the stacked package list after tap, so mobile feedback is not local.
Next:
- Route DAEDALUS for a narrow web-only readback UI patch: hide internal package ids and make bundle readback feedback local/obvious on mobile without changing export API semantics or scope.
```
