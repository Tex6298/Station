# PR496C - Workspace Export Readback UI Boundary Hosted Rerun

Date: 2026-07-06

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Status: Open

## Source

ARGUS accepted PR496C:

`docs/roadmap/PR496C_WORKSPACE_EXPORT_READBACK_UI_BOUNDARY_REVIEW_RESULT.md`

Accepted result:

```text
ACCEPT_PR496C_WORKSPACE_EXPORT_READBACK_UI_BOUNDARY_IMPLEMENTATION
```

## Goal

Run the hosted human-eye/browser rerun for the `/studio/export` readback UI
defect found during PR496B hosted proof.

The specific questions:

- Does owner-visible workspace bundle readback no longer show the internal
  package id?
- Does bundle loading/readback appear inside or immediately adjacent to the
  selected package row on desktop, `375px`, and `390px`?
- Does the successful hosted flow still preserve the owner-only, high-level
  inventory export boundary?

## Target

Use hosted Railway staging:

```text
https://stationweb-production.up.railway.app/studio/export
https://stationapi-production.up.railway.app
```

Use the replay owner account/session and the available second replay identity
for cross-owner checks if still available.

Confirm hosted web/API freshness first. Runtime should be at PR496C
implementation commit `f0918a82` or later. If hosted is still older, wait and
retry before returning a deployment blocker.

## Required Checks

Owner browser flow:

- sign in as the replay owner;
- open `/studio/export`;
- create a fresh workspace manifest package or use a fresh completed package
  created after migration 070 was applied;
- confirm the package reaches completed state;
- tap `View bundle files`;
- confirm loading/readback feedback appears in or immediately adjacent to the
  selected package row;
- confirm the immediate mobile viewport shows useful local feedback after the
  tap at `375px` and `390px`.

Readback content:

- visible bundle copy must not show the internal package id;
- visible bundle readback names only `README.md`, `manifest.json`, and
  `manifest.md`;
- workspace Markdown does not show `(undefined)` or owner/target id field
  names;
- no raw ids, owner ids, raw target ids, raw source ids, private bodies, storage
  paths, signed URLs, share URLs, SQL, stack traces, hosted logs, provider
  payloads, prompts, tokens, cookies, headers, or secret-shaped values appear.

Owner-only protection:

- signed-out list/readback/bundle fails closed;
- cross-owner package/bundle readback fails closed if the second replay identity
  is available;
- record any limitation instead of faking cross-owner proof.

Desktop and mobile fit:

- desktop `/studio/export` shows selected-row bundle readback without overlap;
- `375px` shows selected-row bundle readback without horizontal overflow,
  clipped controls, or incoherent overlap;
- `390px` shows selected-row bundle readback without horizontal overflow,
  clipped controls, or incoherent overlap.

Product boundary:

- no full archive, original-file download, PDF, binary package, managed backup,
  restore workflow, disaster recovery, public export, share URL, signed URL,
  social posting, provider/runtime, Redis, Cloudflare, Stripe, billing, worker,
  queue, Archive connector pull, OAuth/API credential flow, public chat, or
  broad Studio shell behavior appears newly claimed or changed.

## Expected Verdicts

Return one of:

```text
PASS_PR496C_HOSTED_WORKSPACE_EXPORT_CLOSEOUT
PRODUCT_DEFECT_ROUTE_DAEDALUS
DEPLOYMENT_WAIT_OR_BLOCKED
HOSTED_AUTH_BLOCKER
OWNER_ONLY_PROTECTION_BLOCKER
```

Use `PASS_PR496C_HOSTED_WORKSPACE_EXPORT_CLOSEOUT` only if hosted desktop,
`375px`, and `390px` proof pass with no package-id leak and local selected-row
readback.

## Result Required

Create:

```text
docs/roadmap/PR496C_WORKSPACE_EXPORT_READBACK_UI_BOUNDARY_RERUN_RESULT.md
```

Include:

- hosted web/API freshness;
- owner create/list/read/bundle verdict;
- selected-row/local feedback verdict;
- package-id visibility verdict;
- signed-out/cross-owner protection result;
- desktop verdict;
- `375px` verdict;
- `390px` verdict;
- privacy/leak scan result;
- product-boundary scan result;
- final verdict and next wakeup.

## Handoff

Wake MIMIR when complete:

```text
WAKEUP A1:
Codename: MIMIR
```

If the verdict passes, MIMIR can close PR496A/PR496B/PR496C. If it fails,
MIMIR should route the concrete defect back to DAEDALUS.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR496C as ACCEPT_PR496C_WORKSPACE_EXPORT_READBACK_UI_BOUNDARY_IMPLEMENTATION.
- /studio/export no longer renders the internal package id in owner-visible workspace bundle readback copy.
- Bundle loading/readback now renders inside the selected package row, preserving local mobile feedback.
- Local review and validation passed; hosted rerun is required because the defect was observed in browser UI.
Task:
- Run hosted desktop/375px/390px proof for /studio/export workspace bundle readback.
- Prove no internal package id appears and selected-row bundle readback feedback is local/obvious after View bundle files.
- Check owner-only protection, high-level inventory-only bundle content, and no leak/overclaim/product-boundary drift.
- Wake MIMIR with PASS_PR496C_HOSTED_WORKSPACE_EXPORT_CLOSEOUT, PRODUCT_DEFECT_ROUTE_DAEDALUS, DEPLOYMENT_WAIT_OR_BLOCKED, HOSTED_AUTH_BLOCKER, or OWNER_ONLY_PROTECTION_BLOCKER.
```
