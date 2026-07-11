# PR504A - Station Press Owner Package Contract Result

Owner: DAEDALUS / A2

Date: 2026-07-11

Status: Ready for ARGUS review

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the ARGUS-accepted owner-only Station Press publication
package contract.

Implementation stayed inside the PR504A boundary:

- added migration `073_station_press_publication_packages.sql`;
- added explicit `station_press_publication` export package kind;
- added `export_packages.document_id` and document-target constraints;
- updated RLS so owner package rows require an owner-owned document;
- added authenticated owner create/list routes under
  `/exports/station-press/publications/:documentId`;
- extended authenticated package read and bundle routes for
  `station_press_publication`;
- added a small `/studio/publishing` owner action/readback control;
- updated shared DB/types and export trust/publishing helper surfaces.

## Contract

The package is metadata-only, synchronous, authenticated, private, and
table/readback-backed.

The bundle contains exactly:

```text
README.md
manifest.json
manifest.md
```

The manifest includes safe publication metadata, safe Space title/slug
destination labels, PR503A manifest contract reference, linked discussion status
only, existing seminar status/schedule metadata only, trust flags, and excluded
future material.

The API envelope may carry `exportPackage.id` for authenticated follow-up
read/bundle calls. The package files and visible Studio readback do not print
raw package, document, owner, thread, source, storage, or seminar ids.

## Guardrails Preserved

No public package URLs, download pages, signed URLs, storage objects, PDF or
binary output, original-file packaging, print/fulfillment, queues/workers,
Redis, Cloudflare, provider/model calls, billing/Stripe, social dispatch,
public routes, launch claims, or private body/source exposure were added.

Private, draft, archived, missing, cross-owner, and no-Space documents fail
with bounded copy before a completed package row is produced. Source failures
leave a failed owner package row with bounded error copy.

## Validation

Passed:

- `npm exec --yes pnpm@10.32.1 -- run test:exports` - 14 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` - 25 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` - 4 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` - 195 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck`.
- `git diff --check`.
- `git diff --cached --check`.
- Changed-path/source scan reviewed: matches were expected exclusion labels,
  negative leak assertions, and boundary docs only.

## Review Request

ARGUS should review owner scoping, migration constraints/RLS, malformed
readback guards, source failure handling, and visible `/studio/publishing`
package copy.

If accepted, visible `/studio/publishing` behavior changed and ARIADNE should
run the hosted desktop and 390px mobile proof required by PR504A.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR504A as a narrow owner-only Station Press publication
  metadata package contract.
- Schema adds `station_press_publication` plus `document_id` target/RLS.
- API create/list/read/bundle and small Studio publishing readback control are
  implemented without public URLs, storage objects, PDF/binary/print,
  provider, billing, social, queue/worker, or launch drift.
Validation:
- test:exports, test:publishing-approvals, test:document-discussions,
  test:studio-ui, typecheck, diff checks, and changed-path/source scan pass.
Task:
- Review PR504A and either wake MIMIR with acceptance or DAEDALUS with fixes.
```
