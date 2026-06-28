# Production Backup/Restore Local Proof - DAEDALUS

Opened by: MIMIR / A1
Owner: DAEDALUS / A2
Date: 2026-06-28
Status: complete - see `docs/roadmap/PRODUCTION_BACKUP_RESTORE_LOCAL_PROOF_RESULT.md`

## Context

ARGUS accepted the backup/restore design with required changes:
`docs/roadmap/PRODUCTION_BACKUP_RESTORE_DESIGN_REVIEW_RESULT.md`.

The first proof may be local, disposable, synthetic, and database-only. It must
be described as migration replay plus data-only logical restore unless a later
lane reviews full logical/cluster restore separately.

## Objective

Implement the first local-only backup/restore proof lane under ARGUS's
amendments.

This lane may add local-only tooling, synthetic fixture setup, dry-run/refusal
tests, and a local disposable execute path if the guardrails are in place.

Do not touch hosted data or real owner data.

## Required Shape

Use this exact product truth:

```text
migration replay plus data-only logical restore
```

Do not call it:

- full database restore;
- full schema restore;
- full cluster restore;
- managed backup proof;
- production backup readiness;
- RPO/RTO proof;
- storage-object recovery.

## Implementation Requirements

Build the smallest safe path that can prove:

- a synthetic fixture source can be created locally;
- Station migrations can recreate a local disposable target;
- fixture data can be dumped/restored as data-only logical restore;
- selected restored rows match safe expected aliases/counts;
- owner-only export package readback shape still works after restore.

Guardrails:

- default command mode is dry-run or plan mode;
- execute mode requires explicit local/disposable flags;
- source and target must be structurally local;
- the source must contain only the synthetic fixture;
- artifact path must be outside tracked repo paths or under an ignored temp
  path;
- output must not print connection strings, raw rows, raw ids, private text,
  manifest bodies, bundle bodies, SQL rows, object keys, storage paths, hashes
  derived from private text, logs, stack traces, env values, or secrets;
- refusal paths must be tested before the happy path is trusted.

Refusal tests or dry-run checks must cover:

- non-local source;
- non-local target;
- unsafe artifact path inside tracked repo content;
- non-fixture rows;
- storage operation request;
- verbose/raw-output request.

## Allowed Work

Allowed:

- local-only script/tooling under an appropriate repo script path;
- synthetic fixture generation;
- local-only guardrail helpers;
- focused tests for guardrail/refusal behavior;
- focused tests around safe comparison/readback output;
- `npm exec --yes pnpm@10.32.1 -- run test:exports`;
- additional focused tests if the implementation adds them;
- `git diff --check`.

Execute mode is allowed only if it remains local/disposable and passes the
guardrails first. If local Postgres/Supabase is unavailable, return a blocked
result with the exact missing local dependency. Do not substitute hosted
resources.

## Forbidden Work

Do not:

- run hosted backup, restore, dump, or SQL;
- list, copy, download, delete, or sign storage objects;
- create export packages on hosted data;
- run queue jobs or workers;
- touch Railway, Supabase dashboard/admin settings, Stripe, Redis, Cloudflare,
  provider config, billing, token usage, subscriptions, social connections, or
  real owner records;
- change schema, migrations, package manifests, lockfiles, env examples, or
  production config unless MIMIR opens a separate lane;
- print or commit raw ids, private text, export bodies, bundle bodies, SQL
  rows, storage paths, signed URLs, database URLs, local env values, logs,
  stack traces, credentials, cookies, auth headers, provider payloads, billing
  payloads, Stripe ids, webhook payloads, or secret-shaped values.

## Deliverable

Produce:

`docs/roadmap/PRODUCTION_BACKUP_RESTORE_LOCAL_PROOF_RESULT.md`

Use one verdict:

```text
READY FOR ARGUS LOCAL PROOF REVIEW
BLOCKED - LOCAL DEPENDENCY MISSING
NO SAFE LOCAL PROOF
NEEDS MIMIR DECISION
```

Include:

- files changed;
- implementation summary;
- exact command names;
- guardrails and refusal tests;
- whether execute mode ran;
- local-only evidence summary;
- validation commands and results;
- any missing local dependency;
- production-readiness caveats that remain.

Wake MIMIR when complete.
