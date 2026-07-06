# PR496B - Workspace Export Hosted Create Failure

Date: 2026-07-06

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Status: Open

## Source

ARIADNE completed PR496A hosted proof:

`docs/roadmap/PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_REHEARSAL_RESULT.md`

Result:

```text
PRODUCT_DEFECT_ROUTE_DAEDALUS
```

## Problem

Hosted staging is fresh at PR496A review commit `f4e2134c`, and replay-owner
auth reaches `/studio/export`.

The owner list route works:

```text
GET /exports/workspace -> 200
```

The owner create route fails:

```text
POST /exports/workspace -> 500 workspace_export_create_failed
```

Because no `workspace_manifest` package is created on hosted, ARIADNE could not
prove manifest readback or portable bundle readback.

This is not a stale-deploy result and not an auth blocker.

## Initial MIMIR Notes

The relevant repo surfaces are:

- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/exports.test.ts`
- `infra/supabase/migrations/070_workspace_export_manifest.sql`
- `/studio/export` workspace manifest controls

The likely failure boundary is one of:

- hosted database has not actually applied migration `070_workspace_export_manifest.sql`;
- hosted `export_packages` constraints/RLS differ from the accepted migration;
- the initial `workspace_manifest` insert fails on hosted;
- inventory query/readback building fails after the row is inserted and the row
  is marked failed;
- update to completed package fails after manifest construction.

Do not assume which one until checked. The user-facing API must stay bounded,
but tests/logging/result docs should distinguish enough internal failure stage
for us to fix the real cause without leaking secrets to the browser.

## Task

Diagnose and fix the smallest defect that causes hosted
`POST /exports/workspace` to return `500 workspace_export_create_failed`.

Keep the accepted PR496A product contract:

- owner-only `workspace_manifest`;
- null persona/Developer Space/Project targets;
- high-level inventory-only JSON/Markdown readback;
- no raw private document/archive/chat/source bodies;
- no raw ids beyond accepted package readback needs;
- no storage paths, signed URLs, share URLs, provider payloads, prompts,
  tokens, cookies, headers, SQL, stack traces, hosted logs, or secret-shaped
  values in user-visible responses;
- no full archive, backup, restore, PDF, original-file, binary bundle, public
  export, worker/queue, Redis, Cloudflare, Stripe, billing, Archive connector,
  OAuth/API credential, public chat, or broad `/studio/export` redesign scope.

## Required Implementation Shape

1. Identify whether the hosted failure is insert, inventory build, completion
   update, migration/schema, or RLS/constraint mismatch.
2. Patch only the minimal API/migration/test/web surface needed for the fix.
3. Preserve the bounded browser response:

   ```text
   workspace_export_create_failed
   ```

4. Add or adjust focused tests so local validation would catch the hosted
   failure class.
5. If the root cause is migration/schema drift, update the repo migration/docs
   truth and include exact hosted verification notes without printing secrets.
6. Leave `/studio/export` copy and layout alone unless the fix requires a
   narrow status/error/readback adjustment.

## Validation Required

Run at minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If hosted verification is possible from the implementation thread, also check:

- hosted `POST /exports/workspace` returns `201`;
- hosted package readback works;
- hosted bundle readback exposes only `README.md`, `manifest.json`, and
  `manifest.md`;
- signed-out list/readback remains closed;
- no private/source/secret/storage/provider/billing/queue/Cloudflare/share/PDF/
  binary/backup/restore leakage or overclaim appears.

If hosted proof needs ARIADNE after ARGUS review, say that explicitly.

## Result Required

Create:

```text
docs/roadmap/PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_RESULT.md
```

Include:

- root cause;
- files changed;
- why the fix is the smallest safe patch;
- validation results;
- any hosted check performed;
- remaining hosted proof needed;
- final wakeup.

## Handoff

When implementation is ready, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
```

ARGUS should review the defect fix before ARIADNE repeats hosted closeout proof.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARIADNE found PR496A hosted web/API fresh at f4e2134c and replay-owner auth working.
- Owner GET /exports/workspace returned 200, but owner POST /exports/workspace returned 500 workspace_export_create_failed.
- No hosted workspace_manifest package was created, so manifest and bundle readback remain unproven.
- Signed-out list access failed closed and /studio/export showed bounded create-failure copy on desktop/375px/390px.
Task:
- Diagnose and fix the smallest hosted workspace_manifest create failure.
- Determine whether the failure is insert, inventory build, completion update, migration/schema, or RLS/constraint drift.
- Preserve the accepted high-level inventory-only, owner-only export boundary and bounded browser error behavior.
- Add focused regression coverage, run validation, document PR496B result, and wake ARGUS for review.
```
