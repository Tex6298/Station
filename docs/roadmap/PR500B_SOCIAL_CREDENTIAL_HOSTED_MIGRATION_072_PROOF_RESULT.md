# PR500B - Social Credential Hosted Migration 072 Proof Result

Owner: DAEDALUS / A2

Next owner: MIMIR / A1

Date: 2026-07-06

Status: MIGRATION_072_APPLIED_HOSTED_SCHEMA_READY

## Result

```text
MIGRATION_072_APPLIED_HOSTED_SCHEMA_READY
```

DAEDALUS proved hosted Supabase was missing migration 072, applied only the
accepted migration file, and re-probed the hosted schema successfully.

## Pre-Repair Hosted Probe

Sanitized hosted probe before repair:

| Check | Result |
| --- | --- |
| Pooler path | Usable. |
| Table exists | `false`. |
| Expected columns | `0/12`. |
| Provider constraint | `false`. |
| Purpose constraint | `false`. |
| Credential category constraint | `false`. |
| Status constraint | `false`. |
| Active owner/provider partial unique index | `false`. |
| Owner/provider/status index | `false`. |
| Updated-at trigger | `false`. |
| RLS enabled | `false`. |
| Owner policy | `false`. |
| Owner policy scoped | `false`. |

## Repair

Applied only:

```text
infra/supabase/migrations/072_social_connector_credentials.sql
```

The apply path used the existing local `SUPABASE_POOLER_URL` connection and a
temporary `pg@8.13.1` client under the OS temp directory.

## Post-Repair Hosted Probe

Sanitized hosted probe after repair:

| Check | Result |
| --- | --- |
| Pooler path | Usable. |
| Table exists | `true`. |
| Expected columns | `12/12`. |
| Provider constraint | `true`. |
| Purpose constraint | `true`. |
| Credential category constraint | `true`. |
| Status constraint | `true`. |
| Active owner/provider partial unique index | `true`. |
| Active index partial shape | `true`. |
| Owner/provider/status index | `true`. |
| Updated-at trigger | `true`. |
| RLS enabled | `true`. |
| Owner policy | `true`. |
| Owner policy scoped | `true`. |

## Scope Confirmation

No repo code, route behavior, UI behavior, package manifests, lockfiles,
credential storage rows, provider calls, public behavior, or hosted raw data
changed beyond applying the accepted migration and documenting this result.

No connection strings, passwords, tokens, service keys, raw SQL errors, table
row data, owner ids, provider payloads, encrypted payloads, or hosted logs were
printed or recorded.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted schema probe before repair | Pass | Proved migration 072 was missing: table false and columns `0/12`. |
| Hosted migration apply | Pass | Applied only `072_social_connector_credentials.sql`. |
| Hosted schema probe after repair | Pass | Table, 12 columns, constraints, indexes, trigger, RLS, and owner policy all passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Handoff

MIMIR should decide the next PR500B owner social credential route step now that
hosted migration 072 is present and proven.

Wakeup:

```text
WAKEUP A1:
Codename: MIMIR
```
