# PR496B - Workspace Export Hosted Create Failure Rerun

Date: 2026-07-06

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Status: Open

## Source

ARGUS accepted PR496B:

`docs/roadmap/PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_REVIEW_RESULT.md`

Accepted result:

```text
ACCEPT_PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_REPAIR
```

DAEDALUS result:

`docs/roadmap/PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_RESULT.md`

Root cause:

```text
Hosted staging had not applied infra/supabase/migrations/070_workspace_export_manifest.sql.
```

The repair applied the existing migration 070 to hosted and added local
migration-shape regression coverage. No web/API product behavior was broadened.

## Goal

Repeat only the hosted human-eye/browser proof that ARIADNE could not complete
before the migration repair.

The specific question is now:

```text
Can the replay owner create, read, and inspect an owner-only workspace manifest
package from /studio/export on hosted staging without leak, overclaim, or mobile
fit defects?
```

## Target

Use hosted Railway staging:

```text
https://stationweb-production.up.railway.app/studio/export
https://stationapi-production.up.railway.app
```

Use the replay owner account/session.

Hosted web/API should be at least the accepted PR496A runtime (`f4e2134c`) with
migration 070 now applied. If health reports PR496B implementation commit
`42938f5c` or later, record it. Do not fail solely because docs/test-only
commits are not represented in runtime health.

## Required Checks

Owner browser flow:

- sign in as the replay owner;
- open `/studio/export`;
- click/create a workspace manifest package or use a fresh completed package
  created after migration 070 was applied;
- confirm the package reaches completed state;
- open the manifest readback;
- open the portable bundle readback.

Bundle contract:

- bundle contents are exactly `README.md`, `manifest.json`, and `manifest.md`;
- manifest schema is `station.workspace.export_manifest.v1`;
- readback remains high-level inventory only: personas, Spaces, Developer
  Spaces, Projects, public/published document references, export package class
  counts, trust notes, and excluded/future material labels;
- no raw private document bodies, archive/chat bodies, original files, storage
  paths, signed URLs, share URLs, owner ids, raw target ids, raw source ids,
  SQL, stack traces, hosted logs, provider payloads, prompts, tokens, cookies,
  headers, or secret-shaped values appear;
- workspace Markdown does not show `(undefined)` or owner/target id field
  names.

Owner-only protection:

- signed-out `GET /exports/workspace` fails closed;
- signed-out package/bundle readback fails closed if practical;
- cross-owner package/bundle readback fails closed if a second hosted identity
  is available;
- if cross-owner proof is not practical, record that as a limitation rather
  than faking a pass.

Desktop and mobile fit:

- run the owner flow on desktop;
- repeat the visible create/readback proof at `375px`;
- repeat the visible create/readback proof at `390px`;
- no horizontal overflow, clipped labels, broken tap targets, misleading
  disabled/live controls, or incoherent overlap appears.

Product boundary:

- visible copy must not claim full archive export, original-file download, PDF,
  binary package, managed backup, restore workflow, disaster recovery, RPO/RTO,
  public export, share URL, signed URL, social posting, provider/runtime,
  Redis, Cloudflare, Stripe, billing, worker, queue, Archive connector pull,
  OAuth/API credential flow, public chat, or broad Studio shell behavior.

## Expected Verdicts

Return one of:

```text
PASS_PR496B_HOSTED_WORKSPACE_EXPORT_CLOSEOUT
PRODUCT_DEFECT_ROUTE_DAEDALUS
DEPLOYMENT_WAIT_OR_BLOCKED
HOSTED_AUTH_BLOCKER
OWNER_ONLY_PROTECTION_BLOCKER
```

Use `PASS_PR496B_HOSTED_WORKSPACE_EXPORT_CLOSEOUT` only if hosted owner
create/read/bundle and desktop/mobile human proof pass.

## Result Required

Create:

```text
docs/roadmap/PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_RERUN_RESULT.md
```

Include:

- hosted web/API freshness;
- migration 070 applied/readiness signal;
- owner create/read/bundle verdict;
- signed-out/cross-owner protection result or limitation;
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

If the verdict passes, MIMIR can close PR496A/PR496B. If it fails, MIMIR should
route the concrete defect back to DAEDALUS.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR496B as ACCEPT_PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_REPAIR.
- Root cause was hosted schema drift: migration 070 was not applied, so workspace_manifest inserts failed against old export_packages constraints/policy.
- DAEDALUS applied the existing migration 070 to hosted and added focused migration-shape regression coverage.
- ARGUS accepted the repair and local validation passed.
Task:
- Rerun the hosted human-eye /studio/export proof that PR496A could not complete.
- Prove replay-owner workspace manifest create/read/bundle succeeds on desktop/375px/390px.
- Check owner-only protection, high-level inventory-only bundle content, and no leak/overclaim/product-boundary drift.
- Wake MIMIR with PASS_PR496B_HOSTED_WORKSPACE_EXPORT_CLOSEOUT, PRODUCT_DEFECT_ROUTE_DAEDALUS, DEPLOYMENT_WAIT_OR_BLOCKED, HOSTED_AUTH_BLOCKER, or OWNER_ONLY_PROTECTION_BLOCKER.
```
