# PR496A - Owner Workspace Export Package Contract Hosted Proof

Date: 2026-07-06

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Status: Open

## Source

ARGUS accepted PR496A:

`docs/roadmap/PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_REVIEW_RESULT.md`

Accepted result:

```text
ACCEPT_PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_IMPLEMENTATION
```

## Goal

Run the hosted human-eye/browser proof for the owner-only workspace manifest
export package.

This is not a new export product expansion. It is a bounded proof that the
accepted implementation works on hosted staging, that `/studio/export` exposes
the owner workflow clearly, and that the exported JSON/Markdown bundle remains
high-level inventory only.

## Target

Use hosted Railway staging:

```text
https://stationweb-production.up.railway.app/studio/export
https://stationapi-production.up.railway.app
```

Use the replay owner account/session.

Confirm hosted deployment freshness first. The web/API should include PR496A
review commit `f4e2134c` or later, because ARGUS applied a narrow runtime/type
boundary patch before acceptance. If hosted is still on an older runtime, wait
and retry before returning a deployment blocker.

## Required Checks

Hosted owner flow:

- sign in as the replay owner;
- open `/studio/export`;
- confirm the workspace manifest section/control is present and does not claim
  full archive backup, restore, PDF, original-file bundle, binary bundle, share
  URL, public export, recurring backup, worker queue, provider/runtime, Stripe,
  Redis, Cloudflare, or billing behavior;
- create one owner workspace manifest package if no fresh completed package is
  available;
- confirm the package completes or returns only accepted bounded in-progress
  state;
- open/read the package manifest;
- open/read the portable bundle readback.

Bundle contract:

- bundle contents are exactly the accepted JSON/Markdown package shape:
  `README.md`, `manifest.json`, and `manifest.md`;
- manifest content is high-level inventory only: personas, Spaces, Developer
  Spaces, Projects, public/published document references, export package class
  counts, trust notes, and excluded/future material labels;
- visible readback does not include raw private document bodies, archive/chat
  bodies, original files, storage paths, signed URLs, package share URLs,
  owner ids, raw target ids, raw source ids, SQL details, hosted logs, stack
  traces, provider payloads, prompts, tokens, cookies, headers, or
  secret-shaped values;
- workspace Markdown does not show `(undefined)` or owner/target id field
  names.

Owner-only protection:

- signed-out access to the package/readback fails closed if practical to test;
- cross-owner package/readback access fails closed if a second hosted test
  identity is available;
- if cross-owner proof is not practical, record the blocker and still run the
  signed-out proof plus visible leak scan.

Desktop and mobile fit:

- `/studio/export` workspace manifest controls render on desktop without
  overlap, clipped controls, or misleading disabled/live affordances;
- repeat the readback checks at `375px`;
- repeat the readback checks at `390px`;
- no horizontal overflow, incoherent overlap, clipped labels, or broken tap
  targets appear.

Product boundary:

- no public route, signed URL, share link, PDF, original-file download,
  binary/archive bundle, managed backup, restore workflow, disaster recovery,
  RPO/RTO, social posting, provider/model runtime, Redis, Cloudflare, Stripe,
  billing, worker, queue, Archive connector pull, OAuth/API credential flow,
  public chat, or broad Studio shell behavior appears newly claimed or changed.

## Expected Verdicts

Return one of:

```text
PASS_PR496A_HOSTED_WORKSPACE_EXPORT_CLOSEOUT
PRODUCT_DEFECT_ROUTE_DAEDALUS
DEPLOYMENT_WAIT_OR_BLOCKED
HOSTED_AUTH_BLOCKER
OWNER_ONLY_PROTECTION_BLOCKER
```

Use `PRODUCT_DEFECT_ROUTE_DAEDALUS` if the hosted owner flow, bundle contract,
privacy boundary, mobile fit, or product copy fails.

Use `DEPLOYMENT_WAIT_OR_BLOCKED` only if deployment freshness or hosted service
state prevents a real proof after reasonable retry.

Use `HOSTED_AUTH_BLOCKER` only if the replay owner account/session cannot reach
the owner route.

Use `OWNER_ONLY_PROTECTION_BLOCKER` only if signed-out/cross-owner proof is the
only missing piece and the owner workflow itself passes.

## Result Required

Create:

```text
docs/roadmap/PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_REHEARSAL_RESULT.md
```

Include:

- hosted web/API commit freshness;
- owner create/list/read verdict;
- manifest readback verdict;
- portable bundle readback verdict;
- signed-out and cross-owner protection result or blocker;
- desktop verdict;
- `375px` verdict;
- `390px` verdict;
- privacy/leak scan result;
- product-boundary scan result;
- screenshots/Playwright notes if used, without committing private screenshots;
- final verdict and next wakeup.

## Handoff

Wake MIMIR when complete:

```text
WAKEUP A1:
Codename: MIMIR
```

If the verdict passes, MIMIR can close PR496A. If it fails, MIMIR should route
the concrete defect back to DAEDALUS.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR496A as ACCEPT_PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_IMPLEMENTATION.
- Owner-only workspace_manifest exports passed local review after a narrow Markdown/type boundary patch.
- test:exports, test:studio-ui, typecheck, lint, and diff checks passed.
Task:
- Run hosted desktop/375px/390px proof for owner workspace manifest create/readback on /studio/export.
- Verify JSON/Markdown bundle readback remains high-level inventory only and owner-only.
- Check no private bodies, raw ids, storage paths, share URLs, backup/restore claims, or provider/infra/billing drift appear.
- Wake MIMIR with PASS_PR496A_HOSTED_WORKSPACE_EXPORT_CLOSEOUT, PRODUCT_DEFECT_ROUTE_DAEDALUS, DEPLOYMENT_WAIT_OR_BLOCKED, HOSTED_AUTH_BLOCKER, or OWNER_ONLY_PROTECTION_BLOCKER.
```
