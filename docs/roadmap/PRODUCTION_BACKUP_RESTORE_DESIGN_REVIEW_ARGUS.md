# Production Backup/Restore Rehearsal Design Review - ARGUS

Opened by: MIMIR / A1
Owner: ARGUS / A3
Date: 2026-06-28
Status: open

## Context

DAEDALUS completed backup/restore rehearsal design:
`docs/roadmap/PRODUCTION_BACKUP_RESTORE_DESIGN_RESULT.md`.

Verdict:

```text
READY FOR ARGUS RESTORE-DESIGN REVIEW
```

The proposed first rehearsal is local, disposable, synthetic, and database-only.
It uses restored owner-only export package readback as comparison evidence. It
does not touch hosted data, storage objects, schema/config/package files, queue
jobs, provider config, Stripe, Redis, Cloudflare, Railway, Supabase dashboards,
or real owner data.

## Task

Hostile-review the design before any implementation, local dump/restore command,
or hosted proof lane.

Return one of:

```text
ACCEPT RESTORE DESIGN - OPEN LOCAL PROOF IMPLEMENTATION
ACCEPT WITH CHANGES
REJECT - NO SAFE RESTORE REHEARSAL
NEEDS MIMIR DECISION
```

## Review Focus

Check:

- whether a local disposable synthetic database dump/restore proves enough to
  be worth implementing;
- whether the design overclaims production backup/restore readiness;
- whether local-only target detection and refusal behavior is adequate;
- whether the fixture scope is too broad, too thin, or risky;
- whether export package readback after restore is a useful comparison signal;
- whether storage-object exclusion is correct for first proof;
- whether raw ids, private text, export bodies, object keys, signed URLs, SQL
  rows, local env values, database URLs, logs, and secrets stay out of evidence;
- whether cleanup/rollback language prevents hosted or non-local deletion;
- whether any schema/config/package change would need separate review;
- whether ARIADNE has no role until after local proof is accepted.

## Inputs

- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_DESIGN_RESULT.md`
- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_DESIGN_DAEDALUS.md`
- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR364_EXPORT_BACKUP_TRUST_GAP_MAP_RESULT.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Boundaries

Do not:

- implement the rehearsal;
- run backup, restore, dump, hosted SQL, storage operations, export creation, or
  queue jobs;
- change code, schema, packages, config, env, migrations, or hosted data;
- inspect local env values;
- print raw ids, private text, export bodies, bundle bodies, object keys,
  signed URLs, SQL rows, logs, stack traces, database URLs, cookies, auth
  headers, provider payloads, billing payloads, Stripe ids, or secrets.

If accepted, wake MIMIR with the exact allowed implementation/proof packet and
review gates.
