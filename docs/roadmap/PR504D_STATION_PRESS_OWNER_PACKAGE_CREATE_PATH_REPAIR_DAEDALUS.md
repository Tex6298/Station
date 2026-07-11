# PR504D - Station Press Owner Package Create Path Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status: Open defect repair

## Source

ARIADNE reran PR504B after PR504C:

`docs/roadmap/PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF_RERUN_RESULT.md`

Result:

```text
BLOCK_PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF
```

## Problem

PR504C repaired one plausible cause: missing optional
`public_seminar_records` schedule schema no longer fails owner package
creation. Hosted proof still failed with the same bounded browser result.

Hosted web/API were fresh at:

```text
0e72d438c9ac5cb1c7ddf2330d42e617ae6c08d7
```

The fixture was not empty:

- owner document count: `28`;
- public Space count: `1`;
- package-ready owner publication count: `5`.

Desktop `/studio/publishing` sent exactly one allowed owner create request:

```text
POST /exports/station-press/publications/:documentId
status: 500
code: station_press_publication_create_failed
```

Because create failed, ARIADNE could not prove authenticated package readback or
the required package bundle files:

```text
README.md
manifest.json
manifest.md
```

Access and product boundaries passed before package readback existed:

- signed-out create/list returned `401`;
- cross-owner create/list returned `404`;
- hosted desktop and 390px mobile layout fit;
- privacy/product-boundary scans exposed no raw ids, secrets, storage paths,
  signed URLs, SQL details, stack traces, provider payloads, public download
  links, or package-publicity claims.

This is now a remaining hosted create-path/source/write defect, not a proof
runner issue.

## Task

Diagnose and repair the smallest remaining defect causing hosted
`POST /exports/station-press/publications/:documentId` to return bounded
`500 station_press_publication_create_failed`.

Start with the hosted `@station/api` logs for the failing create. The result
must identify the exact failing step without copying secrets, raw ids, private
document bodies, source rows, SQL stack traces, cookies, tokens, env values, or
provider payloads into docs or commits.

Inspect the whole owner package create path, not only seminar schedule loading:

- hosted schema and schema-cache state for migration
  `073_station_press_publication_packages.sql`;
- `export_packages.document_id` presence and type;
- `station_press_publication` package kind constraint;
- package target constraints and owner/document indexes;
- owner-document RLS and route owner-scope checks;
- package insert, failure update, and completion update;
- package-ready publication query;
- public Space/public destination read;
- linked discussion source read;
- seminar source read after PR504C;
- manifest assembly and validation;
- bundle file assembly for `README.md`, `manifest.json`, and `manifest.md`;
- any remaining optional source query treated as fatal on hosted schema drift.

If hosted migration `073` or schema cache is stale, apply only the accepted
schema repair required to match the PR504A contract. If code is at fault, patch
only the narrow route/helper/test surface required. If the hosted failure is
configuration or deployment-state dependent, record the concrete blocker and
the smallest unblock lane instead of broadening scope.

## Non-Scope

Do not add:

- public package URLs;
- public downloads;
- signed URLs;
- storage objects;
- PDF or binary generation;
- original-file packaging;
- print/fulfillment;
- provider/model calls;
- billing/Stripe;
- social dispatch;
- queues/workers;
- Redis;
- Cloudflare;
- public routes;
- broad `/studio/publishing` redesign;
- launch claims;
- raw ids in visible/readback copy;
- private body/source exposure;
- SQL details or stack traces in browser-visible responses.

Do not weaken:

- owner-only package scope;
- document-scoped package target;
- cross-owner `404` behavior;
- signed-out `401` behavior;
- package file privacy;
- raw-id omission;
- bounded browser error behavior.

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

Also run targeted hosted or local proof for the repaired create path when
possible:

- owner create succeeds for one package-ready publication;
- authenticated package readback works;
- authenticated bundle exposes exactly `README.md`, `manifest.json`, and
  `manifest.md`;
- signed-out create/list/read/bundle remains closed;
- cross-owner create/list/read/bundle remains closed;
- visible UI and bounded API responses expose no raw ids, private/source
  bodies, storage paths, signed URLs, SQL details, stack traces, tokens,
  cookies, env values, provider payloads, public download links, or
  launch/package-publicity claims.

If hosted proof still requires ARIADNE after ARGUS review, say so explicitly.

## Result Required

Create:

```text
docs/roadmap/PR504D_STATION_PRESS_OWNER_PACKAGE_CREATE_PATH_REPAIR_RESULT.md
```

Include:

- exact root cause;
- exact failing create-path step;
- whether hosted schema/migration `073` or schema cache was involved;
- files changed or hosted migration/schema action taken;
- why the fix is the smallest safe patch;
- validation results;
- hosted checks performed, if any;
- remaining hosted proof required;
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
- ARIADNE reran PR504B after PR504C and hosted create still failed.
- Hosted web/API were fresh at 0e72d438c9ac5cb1c7ddf2330d42e617ae6c08d7.
- Owner/cross-owner auth, hosted fixture readiness, desktop/mobile layout, signed-out/cross-owner create/list boundaries, and privacy/product-boundary scans passed.
- Desktop sent one allowed POST /exports/station-press/publications/:documentId.
- It still returned bounded 500 station_press_publication_create_failed, so readback and README.md / manifest.json / manifest.md bundle proof remain blocked.
Task:
- Inspect hosted @station/api logs and the full Station Press owner package create path.
- Identify the exact failing step and repair the smallest defect.
- Do not weaken owner-only, document-scoped, raw-id omission, private-body omission, storage omission, public-download omission, or bounded browser error behavior.
- Document PR504D result, run validation, and wake ARGUS for review.
```
