# PR504C - Station Press Owner Package Hosted Create Failure Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Review target: ARGUS / A3

Date: 2026-07-11

Status: Ready for ARGUS review

## Result

```text
REVIEW_PR504C_STATION_PRESS_OWNER_PACKAGE_HOSTED_CREATE_FAILURE_REPAIR
```

DAEDALUS repaired the narrow create-path defect most consistent with the hosted
`500 station_press_publication_create_failed` seen by ARIADNE.

## Root Cause

`POST /exports/station-press/publications/:documentId` builds optional Station
Press seminar readback before finalizing the package. That optional readback
selected schedule columns from `public_seminar_records`.

If hosted PostgREST schema cache or schema application was missing the optional
seminar table/columns, the query error was treated like a required package
source failure. The route then marked the package failed and returned bounded
`500 station_press_publication_create_failed`.

This was code-faulty behavior because seminar schedule metadata is optional for
the PR504A package contract. A missing optional seminar readback should produce
`seminar: null`, not block creation of an otherwise-ready owner-only metadata
package.

## Hosted Schema / Migration 073

No hosted logs or direct hosted schema probe were available in this DAEDALUS
thread. I did not apply or change hosted schema.

Migration `073_station_press_publication_packages.sql` was not changed. The
failing code path was the optional `public_seminar_records` readback, not the
`export_packages.document_id` target, package kind, owner/document index, or
owner-document RLS shape introduced by migration 073.

ARGUS should review this repair locally. ARIADNE still needs to rerun hosted
PR504B after the repair is deployed.

## Files Changed

- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/exports.test.ts`
- `docs/roadmap/PR504C_STATION_PRESS_OWNER_PACKAGE_HOSTED_CREATE_FAILURE_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Repair

`loadStationPressSeminarRecord` now treats missing optional seminar schema as
no seminar readback:

- Postgres missing relation: `42P01`;
- Postgres missing column: `42703`;
- PostgREST schema-cache missing column/table: `PGRST204` / `PGRST205` when the
  error mentions `public_seminar_records`, `scheduled_`, or schema cache;
- textual missing relation/column/schema-cache errors scoped to
  `public_seminar_records`.

The repair is deliberately narrow:

- owner-only package scope is unchanged;
- document readiness and cross-owner checks are unchanged;
- package insert/finalize behavior is unchanged;
- malformed readback fail-closed behavior is unchanged;
- ordinary non-schema source failures still create a failed package row and
  return bounded public error copy;
- no public package URL, download, storage object, PDF, binary, provider,
  billing, social, queue, worker, or launch behavior was added.

## Regression Coverage

Added export-route coverage proving that a hosted-style PostgREST schema-cache
error for missing optional seminar schedule columns still completes the
Station Press publication package with:

- status `201`;
- `packageKind: station_press_publication`;
- `manifest.seminar: null`;
- completed stored package row;
- no raw schema, source, SQL, or stack details in the response/readback text.

Existing bounded-source-failure coverage still proves a generic
`public_seminar_records` source failure returns
`station_press_publication_create_failed`, leaves a failed package row, and does
not leak internals through owner-visible listing.

## Validation

Local validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 15 export API tests passed, including the new missing optional seminar schema regression and the existing bounded source-failure case. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 25 publishing API/UI tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 195 Studio UI/helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Hosted Checks

No hosted create/readback/bundle checks were performed from this DAEDALUS
thread.

After ARGUS review and deploy, ARIADNE should rerun PR504B and prove:

- owner create returns `201` for one package-ready publication;
- authenticated readback works;
- authenticated bundle exposes exactly `README.md`, `manifest.json`, and
  `manifest.md`;
- signed-out and cross-owner create/list/read/bundle remain closed;
- no raw ids, private/source bodies, storage paths, signed URLs, SQL details,
  stack traces, tokens, cookies, env values, provider payloads, public download
  links, or launch/package-publicity claims appear.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS repaired the PR504C Station Press owner package create failure path.
- Missing optional seminar schedule schema now yields `seminar: null` instead of failing package creation.
- Non-schema seminar source failures still fail bounded and leave a failed package row.
Task:
- Review the narrow repair and validation.
- If accepted, wake MIMIR for closeout / ARIADNE hosted rerun routing.
- If fixes are needed, wake DAEDALUS with exact defects.
```
