# PR504C - Station Press Owner Package Hosted Create Failure

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status: Open defect repair

## Source

ARIADNE completed PR504B hosted proof:

`docs/roadmap/PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF_RESULT.md`

Result:

```text
BLOCK_PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF
```

## Problem

Hosted web/API were fresh at:

```text
af5e31457bedfc34d501450d49b42ad3e74d3f74
```

That commit includes the PR504A implementation and ARGUS fail-closed patch.

Hosted owner fixtures are sufficient:

- owner document count: `28`;
- public Space count: `1`;
- package-ready owner publication count: `5`.

Desktop `/studio/publishing` sent exactly one allowed owner create request:

```text
POST /exports/station-press/publications/:documentId
status: 500
code: station_press_publication_create_failed
```

No completed `station_press_publication` package was returned, so ARIADNE
could not prove authenticated readback or bundle files
`README.md`, `manifest.json`, and `manifest.md`.

Access boundaries passed before readback:

- signed-out create/list returned `401`;
- cross-owner create/list returned `404`;
- desktop and 390px mobile layout/privacy/product-boundary scans passed.

This is not a stale deploy, not an auth blocker, and not a fixture-limitation
case.

## Task

Diagnose and repair the smallest defect causing hosted
`POST /exports/station-press/publications/:documentId` to return bounded
`500 station_press_publication_create_failed`.

Start with:

- hosted `@station/api` logs around the failed create;
- hosted schema/migration application for
  `073_station_press_publication_packages.sql`;
- `export_packages.document_id`;
- `station_press_publication` package kind constraint;
- target constraints;
- owner/document index;
- owner-document RLS policy;
- create route owner-scope checks and insert/update/finalize path.

If hosted schema drift is the cause, apply only the accepted PR504A migration
repair needed to bring hosted schema into line. If code is at fault, patch only
the narrow route/migration/type/test surface required.

Do not weaken owner-only package scope, raw-id omission, private-body omission,
storage omission, public-download omission, or bounded browser error behavior.

## Non-Scope

Do not add:

- public package URLs;
- public downloads;
- PDF or binary generation;
- original-file packaging;
- print/fulfillment;
- provider/model calls;
- billing/Stripe;
- social dispatch;
- queues/workers;
- Redis;
- Cloudflare;
- storage objects or signed URLs;
- public routes;
- broad `/studio/publishing` redesign;
- launch claims;
- raw ids in visible/readback copy;
- private body/source exposure.

## Required Validation

Run at minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If hosted verification is possible from the implementation thread, also prove:

- hosted owner create returns `201` or expected success for one
  package-ready publication;
- authenticated package readback works;
- authenticated bundle exposes exactly `README.md`, `manifest.json`, and
  `manifest.md`;
- signed-out create/list/read/bundle remains closed;
- cross-owner create/list/read/bundle remains closed;
- no raw ids, private/source bodies, storage paths, signed URLs, SQL details,
  stack traces, tokens, cookies, env values, provider payloads, public download
  links, or launch/package-publicity claims appear.

If hosted proof still needs ARIADNE after ARGUS review, say so explicitly.

## Result Required

Create:

```text
docs/roadmap/PR504C_STATION_PRESS_OWNER_PACKAGE_HOSTED_CREATE_FAILURE_RESULT.md
```

Include:

- root cause;
- whether hosted schema/migration `073` was missing or code was faulty;
- files changed or hosted migration applied;
- why the fix is the smallest safe patch;
- validation results;
- any hosted checks performed;
- remaining hosted proof needed;
- final wakeup.

## Review

Wake ARGUS after repair:

```text
WAKEUP A3:
Codename: ARGUS
```

ARGUS should review the repair before ARIADNE repeats PR504B hosted proof.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE blocked PR504B on hosted Station Press owner package create.
- Hosted web/API were fresh at af5e31457bedfc34d501450d49b42ad3e74d3f74 and fixtures included five package-ready owner publications.
- Owner/cross-owner auth, layout, privacy, and signed-out/cross-owner create/list boundaries passed.
- The single allowed owner POST /exports/station-press/publications/:documentId returned bounded 500 station_press_publication_create_failed.
Task:
- Diagnose hosted logs/schema/migration 073 and the Station Press create path.
- Repair the smallest defect without weakening owner-only/raw-id/storage/public-download/private-body boundaries.
- Document PR504C result, run validation, and wake ARGUS for review.
```
