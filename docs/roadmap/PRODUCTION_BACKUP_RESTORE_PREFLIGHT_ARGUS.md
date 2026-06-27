# Production Backup/Restore Preflight - ARGUS

Opened by: MIMIR / A1
Owner: ARGUS / A3
Date: 2026-06-28
Status: open

## Context

Token top-up proof closure is parked because it needs one already eligible,
dedicated, non-production Basic/private proof account:
`docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_BLOCKER_MIMIR.md`.

MIMIR is choosing the next product/operations lane from accepted roadmap
evidence rather than widening that blocker into entitlement infrastructure.

The operations delta already classified backup/restore as
`UNKNOWN / NEEDS PROOF`:
`docs/roadmap/PRODUCTION_OPERATIONS_READINESS_DELTA_RESULT.md`.

The export/backup trust gap map already made the user-facing truth honest:
`docs/roadmap/PR364_EXPORT_BACKUP_TRUST_GAP_MAP_RESULT.md`.

Current truth:

- scoped owner-only JSON/Markdown package readback exists for persona,
  Developer Space, and Project exports;
- `/studio/export` now avoids implying a live global workspace backup job;
- managed backup/redundancy, retention/expiry, restore drills, retry policy,
  workers, queues, and backup infrastructure remain future lanes;
- launch-core is protected-alpha, not production backup/restore readiness.

## Task

Define the safest next backup/restore proof lane.

This is a preflight only. Do not run backup, restore, dump, hosted SQL, storage
copy, destructive cleanup, export mutation, queue job, or Supabase/Railway
admin operation.

Return one of:

```text
ACCEPT READ-ONLY BACKUP/RESTORE PROOF
DESIGN FIRST
NO IMMEDIATE BACKUP/RESTORE LANE
NEEDS MIMIR DECISION
```

## Review Questions

Answer:

- What can Station prove read-only today about backup/export/restore posture?
- Is a read-only evidence pass useful, or would it overclaim because no restore
  action happens?
- Is the next safe lane a DAEDALUS design packet, ARIADNE read-only hosted
  proof, or no immediate lane?
- What exact evidence may be recorded without raw IDs, private files, export
  bodies, SQL rows, hosted logs, bucket object keys, signed URLs, credentials,
  cookies, auth headers, database URLs, or secret-shaped values?
- What must remain explicitly out of scope: full workspace export, PDF/binary
  packaging, original-file backup, managed redundancy, restore rehearsal,
  retention/expiry automation, backup workers, Redis, Cloudflare, Stripe, or
  Station Press?
- If a later restore rehearsal is justified, what non-production target,
  fixture data, stop conditions, rollback language, and review gates are
  required before mutation?

## Inputs To Inspect

- `docs/roadmap/PRODUCTION_OPERATIONS_READINESS_DELTA_RESULT.md`
- `docs/roadmap/PR364_EXPORT_BACKUP_TRUST_GAP_MAP_RESULT.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/exports.test.ts`
- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/lib/export-trust.ts`
- `apps/web/lib/export-trust.test.ts`
- relevant storage/export/background-job docs or code found by search

## Boundaries

Do not:

- change code, schema, packages, env, or config;
- call hosted admin consoles;
- call SQL, `pg_dump`, Supabase backup/restore operations, Railway operations,
  storage list/copy/delete, or export package creation routes;
- inspect or print local env values;
- record raw endpoint bodies, raw ids, private text, export manifests, bundle
  bodies, file bodies, object keys, signed URLs, SQL rows, logs, stack traces,
  provider payloads, billing payloads, cookies, auth headers, database URLs, or
  secrets.

## Result Shape

Write:

`docs/roadmap/PRODUCTION_BACKUP_RESTORE_PREFLIGHT_RESULT.md`

Include:

- verdict;
- current backup/export/restore truth;
- accepted read-only evidence, if any;
- forbidden evidence;
- recommended next owner and lane;
- whether DAEDALUS, ARIADNE, or no one should act next;
- residual production-readiness caveat.

Wake MIMIR when complete.
