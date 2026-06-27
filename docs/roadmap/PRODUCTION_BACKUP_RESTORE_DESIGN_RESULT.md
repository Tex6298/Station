# Production Backup/Restore Rehearsal Design Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-28

Status: COMPLETE - WAKE MIMIR

## Verdict

```text
READY FOR ARGUS RESTORE-DESIGN REVIEW
```

## First Rehearsal Scope

The first useful restore rehearsal should be local, disposable, synthetic, and
database-only.

It should prove exactly this:

- a minimal Station fixture can be created in a local source database;
- that local source database can produce a logical database backup artifact;
- a separate local target database can be recreated from migrations;
- the backup artifact can be restored into the target;
- selected restored rows match the expected fixture shape;
- owner-only export package readback still works after restore.

It must not claim production backup readiness, managed redundancy, retention,
RPO/RTO, hosted recovery, original-file recovery, or storage-object recovery.

## Non-Production Target Recommendation

Use a local disposable Supabase/Postgres target first.

Preferred target:

- local Supabase stack or equivalent local Postgres instance that can run the
  Station migrations and Supabase-shaped schemas;
- two isolated databases or schemas: one source and one restore target;
- local temp backup artifact under an ignored temp path;
- no Railway, hosted Supabase project, Supabase branch, dashboard, storage
  bucket, SQL editor, or production/staging database.

Do not use a hosted Supabase branch/project for the first rehearsal. A hosted
non-production branch can be a later ARGUS-reviewed proof only after the local
restore script and redaction rules pass.

## Fixture Dataset Recommendation

Use one synthetic owner and one synthetic persona. The fixture should be small
enough for hostile review and broad enough to touch the current export/trust
surface.

Include:

- one synthetic profile/auth owner;
- one private persona;
- one conversation and a small archived-chat transcript;
- one memory item;
- one canon item;
- one continuity candidate and one continuity record;
- one Integrity/calibration session;
- one published public-safe document reference and one linked discussion ref;
- one completed `persona_archive` export package row with JSON/Markdown
  manifest readback;
- storage metadata only if needed for route compatibility, without storage
  object bytes or object-key proof.

Exclude from the first rehearsal:

- original uploaded files and Supabase Storage object copy/download/listing;
- private file bodies, signed URLs, object keys, storage paths, and upload URLs;
- Developer Spaces, Projects, public-persona chat, AI traces, provider config,
  BYOK keys, Redis, Cloudflare, queues/workers, webhooks, billing, Stripe,
  token usage, token top-ups, subscriptions, social publishing connections,
  moderation queues, and admin console state;
- full workspace export, PDF/binary/original-file packages, Station Press, and
  print/fulfilment surfaces.

Developer Space and Project restore can become a second rehearsal after the
persona/export-package path proves safe.

## Source Of Truth Recommendation

Use a local logical database dump generated from the synthetic source database.

Do not use current owner export packages as the restore source for the first
rehearsal. The existing packages are owner-only readback, not a replayable
restore format. They are useful as comparison evidence after restore, not as the
first restore mechanism.

Do not use a hosted database dump, hosted storage copy, or committed export
bundle body in this lane.

## Allowed Later Commands

After ARGUS accepts the design and MIMIR opens an implementation/proof lane,
DAEDALUS may add local-only tooling such as:

- a dry-run command that validates the fixture, target, and guardrails without
  creating a dump;
- an execute mode that creates a local source database, runs migrations, seeds
  the synthetic fixture, creates a local logical dump, restores it into a local
  target, and runs comparisons;
- focused route tests around export package readback after fixture restore;
- `npm exec --yes pnpm@10.32.1 -- run test:exports`;
- `git diff --check`.

Any future dump/restore command must refuse to run unless all of these are
true:

- the operator explicitly selected local/disposable mode;
- the source and target are local-only;
- the source contains only the synthetic fixture;
- no storage, Stripe, provider, Redis, Cloudflare, queue, worker, or hosted
  admin operation is requested;
- the command redacts or suppresses raw row values in output.

## Forbidden Commands And Evidence

Forbidden commands for this design lane and any later proof unless ARGUS
explicitly opens them:

- hosted backup or restore;
- hosted database dump;
- hosted SQL;
- Supabase dashboard/admin-console actions;
- storage list, copy, download, delete, or signed URL creation;
- export package creation on hosted data;
- queue jobs or worker runs;
- schema, package, lockfile, config, Railway, Supabase, Stripe, Redis,
  Cloudflare, provider, or webhook changes;
- destructive cleanup against any non-local target.

Forbidden evidence:

- raw ids;
- private text;
- export manifests or bundle bodies;
- file bodies;
- object keys, storage paths, signed URLs, upload URLs, or bucket listings;
- SQL rows;
- hosted logs or stack traces;
- database URLs;
- local env values;
- credentials, cookies, auth headers, API keys, service-role keys, provider
  payloads, billing payloads, Stripe ids, webhook payloads, or secrets.

## Redaction And Comparison Rules

Comparison output should record only:

- table aliases, not raw table dumps;
- fixture labels, not raw ids;
- expected versus actual counts;
- boolean owner-scope checks;
- export package status, package kind, included-section names, and safe content
  summary counts;
- local-only pass/fail for manifest and bundle integrity shape;
- no hash values if they are derived from private text.

If a future local fixture includes synthetic private text, it may be stored in
an ignored local fixture file or generated in memory. It should not be copied
into roadmap evidence unless MIMIR explicitly accepts the exact public-safe
fixture text.

## Stop Conditions

Stop before any mutation if:

- source or target is not local/disposable;
- the command sees a non-local database URL, hosted project ref, or hosted
  storage target;
- the target has non-fixture rows;
- a storage operation is required;
- a dump contains secret-shaped values or non-fixture private content;
- the fixture would touch billing, Stripe, token usage, provider config, Redis,
  Cloudflare, queues/workers, or admin-console state;
- migrations fail;
- owner-scope comparison fails;
- restored export readback differs from expected shape;
- cleanup cannot be performed safely.

## Cleanup And Rollback

Cleanup language for the later proof lane:

- drop only local disposable source and target databases/schemas created by the
  rehearsal;
- delete only local temp backup artifacts created by the rehearsal;
- stop local containers only if the rehearsal started them;
- do not clean, delete, reset, truncate, or repair hosted resources;
- if cleanup fails, leave local resources in place and record local cleanup
  instructions without dumping row contents.

Rollback for this first rehearsal is local deletion only. There is no hosted
rollback because hosted resources must not be touched.

## ARGUS Review Gates

ARGUS should review before any implementation/proof lane:

- local-only target detection and refusal behavior;
- fixture scope and exclusion list;
- whether the local dump/restore actually proves more than migration replay;
- whether export package readback after restore is enough for first proof;
- redaction of ids, private text, SQL rows, object keys, env values, and URLs;
- cleanup refusal on non-local targets;
- no schema/config/package drift unless MIMIR explicitly opens an implementation
  lane that includes it.

ARGUS should reject any lane that starts by touching hosted staging, storage
objects, managed backups, or real owner data.

## ARIADNE Role

No ARIADNE hosted/browser role in the first design review.

ARIADNE can participate later only after ARGUS accepts a local restore proof
and MIMIR opens a user-facing review, for example checking that `/studio/export`
and owner export readback copy still avoids overclaiming restore readiness.

## Remaining Production-Readiness Caveats

Even after the proposed first rehearsal passes, Station still cannot claim:

- managed backup redundancy;
- hosted restore readiness;
- Supabase managed backup policy validation;
- retention/expiry automation;
- RPO or RTO;
- original uploaded-file recovery;
- storage bucket/object recovery;
- full workspace export;
- public download or signed export URL safety;
- backup worker/retry/queue readiness;
- billing/provider/Redis/Cloudflare recovery;
- disaster recovery for production accounts.

The first rehearsal would prove only a local synthetic database backup/restore
path and restored owner-only export readback.

## Files Inspected

- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_DESIGN_DAEDALUS.md`
- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_PREFLIGHT_RESULT.md`
- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_PREFLIGHT_ARGUS.md`
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

## Validation

No runtime code, migration, package, config, hosted data, storage object, export
package, queue job, backup, restore, dump, SQL, or admin-console behavior
changed in this lane.

Local checks:

- `git diff --check` - pass.
- `npm exec --yes pnpm@10.32.1 -- run test:exports` - pass, 6 tests.
