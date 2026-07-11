# PR504C - Station Press Owner Package Hosted Create Failure Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Decision

ARGUS accepts PR504C as:

```text
ACCEPT_PR504C_STATION_PRESS_OWNER_PACKAGE_HOSTED_CREATE_FAILURE_REPAIR
```

The repair is narrow and matches the defect lane: missing optional seminar
schedule schema no longer blocks Station Press owner package creation, while
non-schema seminar source failures still fail bounded and leave a failed package
row.

No ARGUS patch was required.

## Review

Accepted facts:

- `loadStationPressSeminarRecord` treats missing optional
  `public_seminar_records` table/column/schema-cache errors as no seminar
  readback and returns `null`;
- the resulting package can complete with `manifest.seminar: null`;
- generic seminar source failures still return bounded
  `station_press_publication_create_failed` behavior and failed package rows;
- migration `073_station_press_publication_packages.sql` was not changed;
- owner document readiness, cross-owner checks, package insert/finalize,
  malformed readback fail-closed behavior, package files, and visible UI scope
  remain unchanged.

Preserved non-scope:

- no public package URL, public download, signed URL, storage object, PDF,
  binary archive, original-file packaging, print/fulfillment, provider call,
  billing, social dispatch, queue/worker, Redis, Cloudflare, public route,
  broad UI redesign, launch claim, raw-id readback, or private body/source
  exposure was added.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 15 export API tests passed, including missing optional seminar schema and non-schema source-failure coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 25 publishing API/UI tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 195 Studio UI/helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Changed-path/source scan | Pass | Changed code is limited to exports route/test optional seminar schema handling. Matches for schema-cache, SQL, stack trace, source/id fields, tokens, and secrets are negative assertions or scoped internal query fields. |

## Remaining Hosted Proof

No hosted create/readback/bundle proof was performed in this ARGUS review.
After deploy, MIMIR should route ARIADNE to rerun PR504B and prove:

- owner create returns `201` for one package-ready publication;
- authenticated readback works;
- authenticated bundle files are exactly `README.md`, `manifest.json`, and
  `manifest.md`;
- signed-out and cross-owner create/list/read/bundle remain closed;
- visible UI, package files, and bounded API responses expose no raw ids,
  private/source bodies, storage paths, signed URLs, SQL details, stack traces,
  tokens, cookies, env values, provider payloads, public download links, or
  launch/package-publicity claims.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR504C.
- Missing optional seminar schedule schema now yields `manifest.seminar: null`
  instead of failing Station Press owner package creation.
- Non-schema seminar source failures still fail bounded and leave failed
  package rows.
- No hosted proof was run in ARGUS review; ARIADNE should rerun PR504B after
  deploy.
Task:
- Close PR504C and route ARIADNE for the PR504B hosted package proof rerun.
```
