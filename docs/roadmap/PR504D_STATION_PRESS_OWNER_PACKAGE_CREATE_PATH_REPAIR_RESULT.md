# PR504D - Station Press Owner Package Create Path Repair Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Review target: ARGUS / A3

Date: 2026-07-11

Status: Ready for ARGUS review

## Result

```text
REVIEW_PR504D_STATION_PRESS_OWNER_PACKAGE_CREATE_PATH_REPAIR
```

DAEDALUS repaired the hosted Station Press owner package create failure by
applying the already-accepted PR504A migration 073 to hosted Supabase.

## Exact Root Cause

Hosted Supabase had not applied:

```text
infra/supabase/migrations/073_station_press_publication_packages.sql
```

The hosted pre-repair schema probe showed:

| Object | Pre-repair result |
| --- | --- |
| `export_packages.document_id` | Missing |
| `export_packages_kind_check` allows `station_press_publication` | False |
| `export_packages_target_check` has the `station_press_publication` document target branch | False |
| `idx_export_packages_owner_station_press_document` | Missing |
| `export_packages_all_owner` policy has the `station_press_publication` owner/document branch | False |
| `export_packages` RLS | Enabled |

Because `document_id` and the accepted package-kind/target/policy shape were
absent, hosted `POST /exports/station-press/publications/:documentId` failed at
the initial `export_packages` insert boundary before manifest building,
completion update, readback, or bundle assembly.

PR504C was correct but insufficient: optional seminar schema was no longer a
fatal source read, but the package table still lacked the core PR504A target
schema on hosted.

## Hosted Logs

The local Railway CLI was not available in this DAEDALUS shell, so hosted
`@station/api` logs were not retrieved.

The exact failing step was established by direct hosted schema proof before
repair and by hosted owner create/readback/bundle success after applying
migration 073.

## Repair Applied

Applied only:

```text
infra/supabase/migrations/073_station_press_publication_packages.sql
```

Apply path:

- used the existing local `SUPABASE_POOLER_URL`;
- used a temporary `pg@8.13.1` install under the OS temp directory, outside the
  repo;
- did not print connection strings, service keys, tokens, cookies, raw ids,
  private bodies, SQL stack traces, provider payloads, or row data;
- requested PostgREST schema reload with `NOTIFY pgrst, 'reload schema'`;
- recorded a hosted migration ledger row:
  `20260711030634 / 073_station_press_publication_packages`.

No repo code, API contract, UI behavior, package files, lockfiles, env files,
product features, or hosted product rows were changed beyond the one owner
package created during proof.

## Post-Repair Hosted Schema Proof

Sanitized post-repair probe:

| Object | Post-repair result |
| --- | --- |
| Pooler path | Usable |
| `export_packages.document_id` | Present |
| `document_id` type | `uuid/uuid` |
| `export_packages_kind_check` | Present |
| `station_press_publication` kind | Allowed |
| `export_packages_target_check` | Present |
| `station_press_publication` document target branch | Present |
| `idx_export_packages_owner_station_press_document` | Present |
| Owner/document index includes `document_id` and `station_press_publication` | True |
| `export_packages_all_owner` policy | Present |
| Owner policy includes `station_press_publication` document branch | True |
| RLS | Enabled |
| Supabase REST schema cache sees `document_id` | HTTP `200` |

## Hosted Owner Package Proof

After applying migration 073:

| Check | Result |
| --- | --- |
| Owner sign-in | `200`, tier `canon` |
| Cross-owner sign-in | `200` |
| Owner document count | `28` |
| Package-ready candidate count | `5` |
| Candidate attempts | `1` |
| Owner create | `201` |
| Created package kind/status | `station_press_publication` / `completed` |
| Owner readback | `200`, `station_press_publication` |
| Owner bundle | `200` |
| Bundle files | `README.md`, `manifest.json`, `manifest.md` |
| Signed-out create/list/read/bundle | `401`, `401`, `401`, `401` |
| Cross-owner create/list/read/bundle | `404`, `404`, `404`, `404` |

Content scan of manifest, markdown, and bundle files found no:

- UUID-shaped raw ids;
- owner/document/thread/source key names;
- storage paths or signed URL fields;
- database/env/provider/stack details;
- known private source-body fixture text.

The first hosted proof script intentionally used the returned package id for
owner readback and cross-owner probes. The final content scan excludes that
transport id and checks only owner-visible manifest/markdown/bundle content.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted schema probe before repair | Pass | Proved migration 073 was missing from hosted schema. |
| Hosted migration apply | Pass | Applied only `073_station_press_publication_packages.sql`, recorded ledger row, and requested PostgREST schema reload. |
| Hosted schema probe after repair | Pass | Column, constraints, index, RLS owner policy branch, and REST schema cache all passed. |
| Hosted owner create/readback/bundle proof | Pass | Owner create `201`; readback `200`; bundle `200`; exact three files. |
| Hosted auth boundary probes | Pass | Signed-out stayed `401`; cross-owner stayed `404` for create/list/read/bundle. |
| Hosted content privacy scan | Pass | Manifest, markdown, and bundle files exposed no raw ids, source keys, storage paths, SQL/stack/env/provider details, or known private-body fixture text. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 15 export API tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 25 publishing API/UI tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 195 Studio UI/helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Why This Is The Smallest Safe Repair

The accepted PR504A code and migration already defined the correct package
contract. Hosted lacked the migration. Applying only migration 073:

- restores the accepted document-scoped package table shape;
- keeps the owner-only route contract unchanged;
- keeps signed-out `401` and cross-owner `404` unchanged;
- keeps package files metadata-only and private to the owner;
- adds no public package URLs, downloads, signed URLs, storage objects, PDF,
  binary, print, provider/model calls, billing, social dispatch, queue, worker,
  Redis, Cloudflare, public routes, broad UI redesign, launch claims, raw ids,
  private bodies, SQL details, or stack traces.

## Remaining Hosted Proof

PR504D includes a direct hosted API proof of create/readback/bundle and
boundaries after the schema repair. ARIADNE can still rerun the browser
PR504B proof if MIMIR wants a human-eye `/studio/publishing` closeout, but the
blocking backend create/readback/bundle path is now proven.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS repaired PR504D by applying hosted Supabase migration 073.
- Hosted pre-repair schema lacked export_packages.document_id, station_press_publication constraints, the owner/document index, and the owner policy branch.
- Hosted post-repair owner create/readback/bundle now passes, with signed-out 401 and cross-owner 404 boundaries intact.
Task:
- Review the hosted schema repair and proof.
- If accepted, wake MIMIR for closeout / ARIADNE browser rerun decision.
- If fixes are needed, wake DAEDALUS with exact defects.
```
