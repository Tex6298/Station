# PR499B - Public Seminar Schedule Route Defect Result

Owner: DAEDALUS / A2

Next owner: MIMIR / A1

Date: 2026-07-06

Status: MIGRATION_071_APPLIED_READY_FOR_PR499A_RERUN

## Result

```text
MIGRATION_071_APPLIED_READY_FOR_PR499A_RERUN
```

DAEDALUS diagnosed the hosted PR499A owner seminar records defect as hosted
schema drift and repaired it by applying the already-accepted migration 071.

## Root Cause

Hosted staging had not applied:

```text
infra/supabase/migrations/071_public_seminar_schedule_metadata.sql
```

Sanitized hosted schema probe before the repair:

| Probe | Result |
| --- | --- |
| Pooler path | Usable. |
| Schedule columns | `0/3` present. |
| Schedule constraint | Missing. |
| Schedule index | Missing. |

That matches ARIADNE's hosted symptom: the owner records route selected the new
schedule metadata fields and returned bounded
`503 seminar_records_unavailable` before record selection.

## Repair

Applied only the existing accepted migration 071 through the local
`SUPABASE_POOLER_URL` path using a temporary `pg@8.13.1` client installed under
the OS temp directory.

No repo code, route logic, migration file, web UI, tests, or product behavior
changed.

## Hosted Verification

Sanitized hosted schema probe after the repair:

| Probe | Result |
| --- | --- |
| Pooler path | Usable. |
| Schedule columns | `3/3` present. |
| Schedule constraint | Present. |
| Schedule index | Present. |

Hosted route probe after the repair:

| Check | Result |
| --- | --- |
| API/replay-owner config | Present by name; values were not printed. |
| Replay owner sign-in | `200`. |
| `GET /events/seminars/records` | `200`. |
| Response code | None. |
| Record count | `2`. |

No secrets, connection strings, bearer tokens, raw owner ids, private/source
bodies, SQL errors, table-error details, or stack traces were printed in the
repair output or recorded in this doc.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted schema probe before repair | Pass | Proved migration 071 was missing: schedule columns `0/3`, constraint missing, index missing. |
| Hosted migration apply | Pass | Applied only `071_public_seminar_schedule_metadata.sql`. |
| Hosted schema probe after repair | Pass | Schedule columns `3/3`, constraint present, index present. |
| Hosted owner route probe | Pass | Sign-in `200`; `GET /events/seminars/records` `200`; no `seminar_records_unavailable`. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

No code tests, typecheck, or lint were run because this is a migration-only
hosted repair with docs-only repo updates.

## Handoff

MIMIR should route the PR499A hosted schedule metadata rerun. The first previous
blocker, `GET /events/seminars/records`, is now repaired on hosted.

Wakeup:

```text
WAKEUP A1:
Codename: MIMIR
```
