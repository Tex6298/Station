# PR496A Owner Workspace Export Package Contract - Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-06

Result:

```text
PRODUCT_DEFECT_ROUTE_DAEDALUS
```

## Scope

MIMIR asked ARIADNE to prove the accepted PR496A owner-only workspace manifest
package contract on hosted `/studio/export` without expanding the export scope.

The proof checked:

- hosted web/API deployment freshness;
- replay-owner access to `/studio/export`;
- owner create/list/readback for `/exports/workspace`;
- owner-only denial where a package existed or could be reached;
- JSON/Markdown bundle readback remaining high-level inventory only;
- desktop, `375px`, and `390px` fit;
- absence of private bodies, raw ids, storage paths, share URLs, backup/restore
  claims, provider/runtime/infra/billing drift, and secret-shaped values.

## Hosted Freshness

Hosted web and API health both reported ready on the same accepted deployment:

```text
web commit: f4e2134c
api commit: f4e2134c
```

This is not a stale-deploy result.

## Owner Flow

Replay-owner authentication worked and reached `/studio/export`.

API proof:

| Check | Result |
| --- | --- |
| Owner `GET /exports/workspace` | `200`, empty export list |
| Owner `POST /exports/workspace` | `500` |
| Error code | `workspace_export_create_failed` |
| Error copy | `Could not create workspace manifest package.` |

Because the hosted owner create path returns `500`, no `workspace_manifest`
package was created. ARIADNE could not prove owner package readback, manifest
readback, or portable bundle readback on hosted.

## Owner-Only Protection

Signed-out list access failed closed:

```text
GET /exports/workspace without auth: 401
```

Signed-out and cross-owner package/bundle readback could not be tested because
the owner create defect left no hosted package to read back. This is not the
primary blocker; the owner create path fails first.

## Desktop And Mobile

Hosted `/studio/export` rendered the workspace manifest package control on
desktop, `375px`, and `390px`.

Clicking `Create workspace manifest` surfaced bounded error copy:

```text
Could not create workspace manifest package.
```

Playwright metric checks found no document/body horizontal overflow, clipped
visible controls, visible secret-shaped values, or positive backup/restore/
share/PDF/binary/provider/runtime/infra/billing claims on the checked
viewports. Screenshot inspection confirmed the create control and error state
remain visible on mobile.

## Privacy And Product Boundary

No JSON/Markdown bundle was available to inspect because no package was
created. Therefore the high-level inventory-only bundle contract could not be
proven on hosted.

Visible UI copy stayed inside the accepted boundary. It did not claim a full
archive, backup service, restore workflow, PDF export, binary/original-file
package, public download, share link, signed URL, worker queue, provider
runtime, Redis/Cloudflare behavior, Stripe, or billing behavior.

## Defect

Hosted owner `POST /exports/workspace` returns:

```text
500 workspace_export_create_failed
```

Smallest next action:

- Route DAEDALUS to diagnose the hosted workspace manifest create failure while
  preserving the accepted high-level inventory-only/export-boundary scope.
- Keep the next patch limited to the hosted create/readback path, likely around
  migration/RLS/query/runtime differences between local acceptance and hosted.
- Do not broaden into full archive export, backup/restore, public export,
  original files, PDF/binary packages, share links, signed URLs, provider work,
  queues/workers, billing, Redis, Cloudflare, or broad `/studio/export` redesign.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted deployment health | Pass | Web/API were ready at `f4e2134c`. |
| Replay-owner auth | Pass | Owner reached `/studio/export`; no hosted auth blocker. |
| Owner workspace list | Pass | `GET /exports/workspace` returned `200`. |
| Owner workspace create | Fail | `POST /exports/workspace` returned `500 workspace_export_create_failed`. |
| Signed-out list protection | Pass | Signed-out list access returned `401`. |
| Manifest readback | Blocked | No package exists because create failed. |
| Bundle readback | Blocked | No package exists because create failed. |
| Desktop/375px/390px UI proof | Pass for bounded error state | Create control and error copy rendered without measured overflow or visible leak/overclaim. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE completed PR496A hosted workspace export proof.
- Hosted web/API were fresh at f4e2134c and replay owner auth reached /studio/export.
- Owner GET /exports/workspace returned 200, but owner POST /exports/workspace returned 500 workspace_export_create_failed, so no workspace_manifest package, manifest readback, or bundle readback could be proven.
- /studio/export rendered the workspace manifest control and surfaced bounded create-failure copy on desktop/375px/390px without visible privacy/scope drift.
Next:
- Route DAEDALUS to diagnose the hosted workspace_manifest create failure while preserving the accepted high-level inventory-only/export-boundary scope.
```
