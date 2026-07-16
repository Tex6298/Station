# PR527F1 - Settings Persistence Hosted Schema And Deployment

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - exact hosted schema and deployment alignment

## Authority

Use these accepted contracts without widening them:

- `docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md`
- `docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_ARGUS_RESULT.md`

Accepted product floor:

```text
e542423bc07a9be77e7ad82f2b5ac6b65af087da
ACCEPT_PR527F_OWNER_ONLY_FORUM_REPLY_PREFERENCE_WITH_ARGUS_SAFETY_PATCH
```

Exact migration:

```text
infra/supabase/migrations/084_community_notification_preferences.sql
SHA-256 BB23AB2222AD5F159000F93931842497CE6830BC10C19E676516D13820671263
```

## Sequencing Truth

MIMIR observed both Railway services healthy and ready on exact product commit
`e542423bc07a...` before opening this lane. ARGUS's final read-only precheck had
proved migration ledger `084=0`, the preference table absent, Watches `0`, and
notifications `0`.

Railway auto-deployed the accepted API before schema `084` could be applied.
The accepted contract predicts this narrow inversion: preference reads fail
boundedly and reply fanout fails closed. Do not hide the inversion or claim
schema-first ordering. Independently prove its zero-row preconditions, apply
the schema immediately, and record the exact interval as bounded and closed.

Later docs-only descendants may become the reported Railway SHA. They are
acceptable only when they descend from the product floor and this diff is
empty:

```text
git diff e542423bc07a9be77e7ad82f2b5ac6b65af087da..<deployed-sha> -- \
  infra/supabase/migrations/084_community_notification_preferences.sql \
  packages/db/src/types.ts \
  apps/api/src/routes/settings.ts \
  apps/api/src/routes/settings.test.ts \
  apps/api/src/services/community-notifications.service.ts \
  apps/api/src/routes/community.test.ts \
  apps/web/lib/api-client.ts \
  apps/web/lib/notification-preferences.ts \
  apps/web/lib/notification-preferences.test.ts \
  apps/web/components/settings/notification-preferences-panel.tsx \
  apps/web/app/settings/page.tsx
```

## Exact Hosted Work

1. Recompute the migration SHA from checked-in bytes and require the exact
   value above.
2. Require healthy/ready web and API deployments on `main`, with deployed SHA
   descending from the accepted product floor and zero locked-path drift.
3. In a read-only hosted precheck require:
   - no `084_community_notification_preferences` ledger row;
   - no `public.community_notification_preferences` table;
   - unchanged catalog preconditions required by the migration;
   - zero Watches and zero notifications; and
   - zero matching PR527F disposable residue.
4. If any absence or baseline precondition differs, stop without applying
   anything and wake MIMIR with sanitized evidence.
5. Apply only the exact migration bytes through the hosted pooler. Let its own
   transaction, advisory lock, preconditions, DDL, grants, comments, schema
   reload, and commit finish.
6. Only after the schema transaction commits and postcheck passes, insert one
   honest fresh row in `supabase_migrations.schema_migrations` named
   `084_community_notification_preferences`, using the established hosted
   timestamp-version convention. Require exactly one name and one version.
7. Prove exact table columns/default/FK/primary key, updated-at trigger, RLS,
   three owner policies, no DELETE policy, authenticated SELECT/INSERT/UPDATE
   only, no anon grant, service-role grants, comments, and zero preference
   rows.
8. Prove signed-out GET and PATCH return `401`. An authenticated replay-owner
   GET may prove missing-row `enabled` truth only if it creates no row.
9. Recheck deployment readiness, source drift, zero preferences, zero Watches,
   zero notifications, zero tagged residue, and no unrelated ledger/catalog or
   product-row change.

Do not create a preference, account, profile, thread, comment, notification,
Watch, report, review request, billing row, or external delivery. Do not touch
Railway variables, OAuth, providers, or unrelated migrations. Never print a
database URL, token, credential, id, row body, or secret.

## Result And Handoff

Create:

`docs/roadmap/PR527F1_SETTINGS_PERSISTENCE_HOSTED_SCHEMA_DEPLOYMENT_DAEDALUS_RESULT.md`

Record the source floor/deployed descendant proof, exact hash, sanitized
precheck, honest sequencing inversion, migration/ledger/catalog/RLS/grant
postcheck, API boundary, aggregate restoration, and zero product writes.

Commit and push the result, then wake ARIADNE:

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- DAEDALUS applied and proved exact hosted migration 084, its one honest ledger row, deployed source alignment, zero preference rows, and zero unrelated product drift.
Task:
- Execute docs/roadmap/PR527F2_SETTINGS_PERSISTENCE_HOSTED_LIFECYCLE_ARIADNE.md exactly.
- Commit and push the result, then wake MIMIR with WAKEUP A1:. Do not stop without a committed pass/block handoff and cleanup proof.
```

DAEDALUS may change only its result, operational status/index/baseline docs,
and `.station-agents/state/DAEDALUS.json`. Do not edit product source or the
accepted migration.
