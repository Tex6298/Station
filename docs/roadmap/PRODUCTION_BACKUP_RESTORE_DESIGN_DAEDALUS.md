# Production Backup/Restore Rehearsal Design - DAEDALUS

Opened by: MIMIR / A1
Owner: DAEDALUS / A2
Date: 2026-06-28
Status: open

## Context

ARGUS returned `DESIGN FIRST` for production backup/restore:
`docs/roadmap/PRODUCTION_BACKUP_RESTORE_PREFLIGHT_RESULT.md`.

Read-only inspection can confirm Station's existing owner-only export readback
and honest trust-map boundaries, but it cannot prove restore, managed backups,
retention, RPO/RTO, or recovery. A restore rehearsal needs a design packet
before any mutation or hosted operation is allowed.

## Task

Design the first safe non-production backup/restore rehearsal for Station.

This is a design lane. Do not run backup, restore, dump, hosted SQL, storage
list/copy/delete, export mutation, admin-console operation, queue job, schema
change, package change, config change, or hosted data mutation.

Produce:

`docs/roadmap/PRODUCTION_BACKUP_RESTORE_DESIGN_RESULT.md`

Use one verdict:

```text
READY FOR ARGUS RESTORE-DESIGN REVIEW
NO SAFE RESTORE REHEARSAL YET
NEEDS MIMIR DECISION
```

## Design Questions

Answer:

- What is the narrowest useful restore rehearsal that does not overclaim
  production backup readiness?
- Should the first rehearsal use only existing export packages, a local
  disposable database, a Supabase branch/project, or another isolated
  non-production target?
- What fixture data is in scope: persona profile, memory, archive metadata,
  archived chats, continuity records, published documents, discussion refs,
  Developer Spaces, Projects, private files, storage quota, token usage, or
  billing records?
- What must be explicitly excluded from the first rehearsal?
- What source of truth is being restored from: export package, database dump,
  storage copy, migration replay plus fixture seed, or another mechanism?
- How are restored records compared to expected data without committing raw
  private text, raw ids, object keys, signed URLs, SQL rows, or bundle bodies?
- What stop conditions prevent accidental production mutation?
- What cleanup/rollback language is required?
- What RPO/RTO, retention, redundancy, and managed-backup claims remain unmade
  after the rehearsal?
- Which tests or dry-run commands can DAEDALUS safely add later, and which
  hosted proof would require ARGUS and ARIADNE first?

## Inputs To Inspect

- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR364_EXPORT_BACKUP_TRUST_GAP_MAP_RESULT.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/roadmap/STATION_BACKEND_IMPLEMENTATION_ROADMAP.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/exports.test.ts`
- `apps/api/src/services/storage.service.ts`
- `apps/api/src/services/operational-quota.service.ts`
- `apps/api/src/services/background-jobs.service.ts`
- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/lib/export-trust.ts`
- `infra/supabase/README.md`
- `infra/supabase/migrations/`
- `scripts/`

## Required Result Shape

Include:

- verdict;
- exact first rehearsal scope;
- non-production target recommendation;
- fixture dataset recommendation;
- source-of-truth recommendation;
- allowed commands for a later implementation/proof lane;
- forbidden commands and evidence;
- redaction rules;
- stop conditions;
- cleanup/rollback plan;
- ARGUS review gates;
- ARIADNE role, if any;
- production-readiness caveats that remain after the rehearsal.

## Boundaries

Do not:

- add or change runtime code;
- add or change migrations;
- change package manifests or lockfiles;
- run backup/restore/dump commands;
- query hosted SQL;
- inspect local env values;
- list, copy, delete, or download storage objects;
- create export packages;
- run queue jobs;
- touch Stripe, Redis, Cloudflare, provider config, Railway config, Supabase
  dashboard settings, or hosted data;
- print or commit secrets, raw ids, private text, export bodies, bundle bodies,
  object keys, signed URLs, SQL rows, logs, stack traces, database URLs,
  cookies, auth headers, provider payloads, or billing payloads.

Wake MIMIR when complete.
