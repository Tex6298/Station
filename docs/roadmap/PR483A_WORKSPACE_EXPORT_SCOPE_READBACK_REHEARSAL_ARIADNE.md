# PR483A Workspace Export Scope Readback Hosted Rehearsal

Date: 2026-06-29

Owner: ARIADNE / A4

State: OPEN - HOSTED OWNER READ-ONLY PROOF

Source:

- `docs/roadmap/PR483A_WORKSPACE_EXPORT_SCOPE_READBACK_REVIEW_RESULT.md`
- `docs/roadmap/PR483A_WORKSPACE_EXPORT_SCOPE_READBACK_RESULT.md`

## Purpose

ARGUS accepted PR483A Workspace Export Scope Readback after a narrow UI
visibility patch. Because `/studio/export` visible product copy changed,
ARIADNE should run hosted read-only human-eye proof before MIMIR closes the
lane.

This is proof of owner-visible export scope truth only. It is not a package
creation, bundle download, PDF, binary, backup, restore, or Station Press lane.

## Required Hosted Route

Use the current hosted Railway web/API target and a signed-in owner session.

Primary route:

```text
/studio/export
```

Viewports:

- desktop;
- 390px mobile.

## Required Checks

Verify the owner `/studio/export` route shows the workspace scope readback.

Live scoped package classes must be visible:

- `persona_archive`;
- `developer_space_archive`;
- `project_manifest`.

All future/unavailable rows must be visible:

- full workspace bundle;
- original files;
- PDF/binary/Station Press;
- managed backup/redundancy/restore;
- shareable/private URLs.

Excluded material rows must be visible:

- raw private source bodies;
- storage/download internals;
- credential/provider material.

The page should stay readable on desktop and 390px mobile with no horizontal
overflow, clipping, overlapping labels, or broken card rhythm.

## Safety Checks

Do not trigger any action that creates or mutates export packages.

During read-only route proof, verify no visible UI/API readback exposes:

- public export access;
- package URL;
- signed URL;
- storage path;
- raw private source body;
- archive snippet;
- document body;
- prompt;
- provider payload;
- SQL/table detail;
- stack trace;
- hosted log;
- credential;
- token;
- cookie;
- secret-shaped value.

Also verify no browser-observed API mutation is triggered by simply loading and
inspecting the route:

```text
POST
PUT
PATCH
DELETE
```

Allowed read behavior is limited to existing authenticated owner reads needed
to render the page.

## Non-Scope

- Creating an export package.
- Opening or downloading an existing bundle.
- Generating PDF, binary, or print output.
- Original-file packaging.
- Backup, restore, redundancy, retention, or expiry drills.
- Public export routes or shareable package URLs.
- Storage architecture, schema, migrations, workers/queues, Redis, Cloudflare,
  billing/Stripe, provider/model calls, or external config.

## Return Verdict

Wake MIMIR with one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_EXPORT_BOUNDARY_FAIL
SEED_OR_ROUTE_BLOCKER
```

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` only for a concrete visible route/content/
mobile/no-mutation defect. Use `DEPLOYMENT_WAITING` only if hosted web/API has
not yet deployed the accepted PR483A commit.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR483A hosted workspace export scope readback proof.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_EXPORT_BOUNDARY_FAIL | SEED_OR_ROUTE_BLOCKER
Task:
- Close PR483A, route a repair, wait for deploy, or decide the blocker.
```
