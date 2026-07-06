# PR496C - Workspace Export Readback UI Boundary Hosted Rerun Result

Date: 2026-07-06

Owner: ARIADNE / A4

Result:

```text
PASS_PR496C_HOSTED_WORKSPACE_EXPORT_CLOSEOUT
```

## Scope

MIMIR asked ARIADNE to rerun hosted `/studio/export` after ARGUS accepted the
PR496C web-only readback UI boundary patch.

The rerun checked:

- hosted web/API freshness at PR496C runtime;
- replay-owner workspace manifest create/read/bundle;
- selected-row bundle loading/readback feedback on desktop, `375px`, and
  `390px`;
- absence of internal package id in owner-visible bundle copy;
- owner-only signed-out and cross-owner protection;
- high-level inventory-only JSON/Markdown bundle content;
- privacy, leak, product-boundary, and mobile fit regressions.

## Hosted Freshness

Hosted web and API health both reported ready at:

```text
web commit: f0918a82
api commit: f0918a82
```

This is the PR496C implementation runtime, so this is not a stale-deploy result.

## Owner Create, Read, And Bundle

The replay owner completed the workspace manifest flow on hosted:

| Check | Result |
| --- | --- |
| Owner `GET /exports/workspace` | `200` |
| Owner `POST /exports/workspace` | `201` |
| Created package kind/status | `workspace_manifest`, `completed` |
| Owner `GET /exports/:id` | `200` |
| Owner `GET /exports/:id/bundle` | `200` |
| Bundle files | `README.md`, `manifest.json`, `manifest.md` |
| Manifest schema | `station.workspace.export_manifest.v1` |

The PR496A hosted create failure remains repaired.

## Owner-Only Protection

Owner-only checks passed:

| Check | Result |
| --- | --- |
| Signed-out list access | `401` |
| Signed-out package readback | `401` |
| Signed-out bundle readback | `401` |
| Cross-owner package readback | `404` |
| Cross-owner bundle readback | `404` |

The cross-owner result used the available second replay identity.

## Readback UI

The PR496C UI defect is repaired on hosted:

- owner-visible bundle readback no longer prints the internal package id;
- the selected package row changes its action to `Bundle files shown`;
- `Bundle file readback` appears inside the selected package row;
- desktop, `375px`, and `390px` all show the readback in the immediate viewport
  after the tap;
- visible readback names only `README.md`, `manifest.json`, and `manifest.md`.

Desktop, `375px`, and `390px` screenshot inspection matched the automated
metrics. No horizontal overflow, clipped visible controls, incoherent overlap,
visible raw UUIDs, secret-shaped values, or positive forbidden product claims
appeared.

## Privacy And Product Boundary

API and visible-copy scans passed:

- no owner/target/source field names;
- no raw UUIDs beyond the expected package envelope;
- no private bodies, prompts, provider payloads, storage paths, signed URLs,
  share URLs, SQL, stack traces, hosted logs, cookies, headers, or
  secret-shaped values;
- no `(undefined)` Markdown text;
- no new claim for full archive export, original-file download, PDF, binary
  package, managed backup, restore workflow, disaster recovery, public export,
  share/signed URL, provider/runtime, Redis, Cloudflare, Stripe, billing,
  workers, queues, Archive connector pull, OAuth/API credentials, public chat,
  or broad Studio shell behavior.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted API/browser proof | Pass | Owner create/read/bundle returned `201`/`200`/`200`. |
| Screenshot inspection | Pass | Selected-row readback was local and package-id-free on desktop, `375px`, and `390px`. |
| Owner-only API checks | Pass | Signed-out returned `401`; cross-owner returned `404`. |
| API/bundle leak scan | Pass | High-level inventory-only contract held. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE completed the PR496C hosted workspace export rerun.
- Hosted web/API were fresh at f0918a82; owner create/read/bundle returned 201/200/200 with README.md, manifest.json, and manifest.md.
- /studio/export no longer exposes the internal package id in bundle readback.
- Selected-row bundle readback is local and visible after View bundle files on desktop, 375px, and 390px.
- Owner-only protection and high-level inventory-only privacy/product boundaries passed.
Next:
- Close PR496A/PR496B/PR496C or proceed according to the roadmap.
```
