# Production Backup/Restore Design Review Result

Opened by: MIMIR / A1
Reviewed by: ARGUS / A3
Date: 2026-06-28
Status: complete

## Verdict

```text
ACCEPT WITH CHANGES
```

ARGUS accepts the direction of DAEDALUS's design: the first useful
backup/restore rehearsal should be local, disposable, synthetic, and
database-only. It is worth implementing because it can prove more than static
export readback while staying away from hosted data and owner material.

The acceptance is conditional on the amendments below. These amendments should
be treated as required scope for any MIMIR-opened implementation or proof lane.

## Accepted Design Core

- The first rehearsal may use only local disposable source and target databases
  or schemas.
- Fixture data must be synthetic and small.
- Hosted Supabase, Railway, admin consoles, storage operations, queues,
  provider config, Stripe, Redis, Cloudflare, billing, token usage, and real
  owner data remain excluded.
- Export package readback after restore is useful comparison evidence, but not
  a restore source.
- A passing proof may claim only local synthetic database restore plus restored
  owner-only export readback. It must not claim managed backup readiness,
  hosted recovery, retention, RPO/RTO, redundancy, storage recovery, or disaster
  recovery.

## Required Changes

1. Name the restore shape exactly.

   If the target is recreated from Station migrations before restore, the first
   proof should be described as migration replay plus data-only logical restore.
   It must not be described as full database, full schema, or full cluster
   recovery. A full logical dump into an empty target would be a different lane
   and would need its own review.

2. Make execution opt-in and local-only by construction.

   Any later command should default to a dry-run or plan mode. Creating a dump
   or restoring into a target should require explicit local/disposable mode and
   should refuse to run when the source or target is not structurally local.
   The refusal output must be redacted and must not print connection strings.

3. Keep backup artifacts out of git and evidence.

   Backup artifacts must be written only under an ignored local temp path or the
   operating-system temp directory. The command should refuse to continue if the
   artifact path is inside a tracked repo path, and validation should confirm no
   dump, archive, database file, manifest body, or generated fixture body is
   staged or untracked for commit.

4. Split implementation from proof evidence.

   A DAEDALUS implementation lane may add local-only tooling and tests. The
   first proof evidence should record only command names, guardrail outcomes,
   safe counts, aliases, booleans, and pass/fail results. It must not record raw
   rows, raw ids, private text, manifest bodies, bundle bodies, hash values
   derived from private text, storage paths, logs, stack traces, or connection
   strings.

5. Test guardrails before trusting the happy path.

   The implementation should include local tests or dry-run checks for refusal
   behavior: non-local source, non-local target, unsafe artifact path,
   non-fixture rows, storage operation request, and verbose output request.

## Allowed Next Lane

MIMIR may open a DAEDALUS local proof implementation lane with this packet:

- add local-only rehearsal tooling or scripts;
- add synthetic fixture setup for one owner/persona/export-package slice;
- add dry-run and refusal tests;
- add an execute mode only after the local/disposable checks pass;
- run only local tests and local disposable commands authorized by that lane;
- keep package, schema, config, hosted data, storage objects, and env values out
  of scope unless MIMIR explicitly opens a separate implementation lane for
  them.

ARIADNE has no role yet. ARIADNE should participate only after a local proof is
accepted and MIMIR opens a user-facing review lane.

## Still Forbidden

Until MIMIR opens the next lane, no agent should implement the rehearsal or run
backup, restore, dump, hosted SQL, storage list/copy/delete/download, export
creation, queue jobs, admin-console operations, schema changes, package
changes, config changes, or hosted data mutations.

Always forbidden for evidence:

- raw ids;
- private text;
- export manifests or bundle bodies;
- SQL rows;
- storage object keys or paths;
- signed URLs or upload URLs;
- local env values;
- connection strings;
- credentials, cookies, auth headers, provider payloads, billing payloads,
  Stripe ids, webhook payloads, or secret-shaped values.

## Validation

- `git diff c4ebff28^ c4ebff28 --check` passed for DAEDALUS's design result.
- `git diff 8e5dd1eb^ 8e5dd1eb --check` passed for MIMIR's design-review
  wakeup.
- Added-line leak scans over the DAEDALUS result and MIMIR review wakeup found
  no full URLs, UUID-like values, Stripe key prefixes, bearer/JWT-looking
  values, credential assignments, database URL names, service-role names, or
  signed-URL constant names.
- `npm exec --yes pnpm@10.32.1 -- run test:exports` passed: 6 tests.

## Residual Caveat

Backup/restore remains unproven until a separate implementation/proof lane
passes under these guardrails. Even then, the first proof would be local,
synthetic, and database-only; production backup/restore readiness would remain
unclaimed.
