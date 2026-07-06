# PR496C - Workspace Export Readback UI Boundary

Date: 2026-07-06

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Status: Open

## Source

ARIADNE completed the PR496B hosted rerun:

`docs/roadmap/PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_RERUN_RESULT.md`

Result:

```text
PRODUCT_DEFECT_ROUTE_DAEDALUS
```

## Problem

The hosted backend and API contract now pass:

- hosted web/API fresh at `42938f5c`;
- migration 070 live;
- owner `POST /exports/workspace` returns `201`;
- owner package readback returns `200`;
- owner bundle readback returns `200`;
- signed-out list/readback/bundle returns `401`;
- cross-owner readback/bundle returns `404`;
- bundle files are `README.md`, `manifest.json`, and `manifest.md`;
- API/bundle high-level inventory boundary passed.

The remaining defect is web-only:

- `/studio/export` prints the internal package id in owner-visible bundle
  readback copy while the same page says package IDs are not shown.
- On `375px` and `390px`, tapping `View bundle files` leaves the readback
  panel below the stacked package list, so the immediate mobile feedback is not
  local or obvious.

## Task

Patch the Studio export web UI narrowly so workspace bundle readback is honest,
local, and mobile-obvious.

Primary file boundary:

- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/lib/export-trust.test.ts`

Use additional focused web test files only if needed.

## Required Fix

1. Remove owner-visible internal package ids from workspace bundle readback
   copy.
2. Keep the existing API ids only as internal state/keys needed to request the
   package bundle.
3. Make mobile feedback local after `View bundle files`:
   - either render the selected bundle readback inside/adjacent to the selected
     package row;
   - or move/focus the readback panel into view in a way that is obvious on
     `375px` and `390px`.
4. Preserve existing create/list/read/bundle behavior.
5. Preserve the accepted high-level inventory-only export boundary.

## Guardrails

Do not change:

- export API semantics;
- RLS, migrations, Supabase schema, hosted config, or migration 070;
- bundle file contents or file names;
- owner-only protection;
- full archive, original-file, PDF, binary, backup, restore, public export,
  share/signed URL, provider/runtime, queue/worker, Redis, Cloudflare, billing,
  Stripe, Archive connector, OAuth/API credential, public chat, or broad Studio
  shell scope.

Do not import Discern CSS or broad-reskin `/studio/export`.

## Regression Coverage

Add or adjust focused tests so local validation catches:

- `ExportWorkspace` source no longer contains visible `Package ${...}` style
  readback copy;
- workspace export trust copy still says package IDs are not shown;
- bundle readback still names only the three file readbacks;
- mobile/local feedback structure is represented in source or component tests
  without relying on hosted screenshots.

## Validation Required

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Run `test:exports` only if any export API/shared type behavior changes. It
should not be needed for a pure web UI patch.

## Result Required

Create:

```text
docs/roadmap/PR496C_WORKSPACE_EXPORT_READBACK_UI_BOUNDARY_RESULT.md
```

Include:

- files changed;
- exact UI behavior change;
- why the patch is web-only and scope-preserving;
- validation results;
- whether hosted ARIADNE rerun is required;
- final wakeup.

## Handoff

When implementation is ready, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
```

ARGUS should review before ARIADNE repeats the hosted closeout proof.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARIADNE proved PR496B repaired the hosted backend create/read/bundle path and owner-only API protection.
- The remaining defect is web-only: /studio/export exposes the internal package id in bundle readback copy while the same page says package IDs are not shown.
- On 375px and 390px, bundle readback feedback appears below the stacked package list after tap, so mobile feedback is not local.
Task:
- Patch apps/web/components/studio/export-workspace.tsx narrowly so bundle readback hides internal package ids and gives local/obvious mobile feedback.
- Preserve API semantics, owner-only protection, bundle files, high-level inventory scope, and all forbidden export/backup/provider/infra/billing scope.
- Add focused studio UI regression coverage, run validation, document PR496C result, and wake ARGUS.
```
