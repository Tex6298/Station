# PR500B - Social Credential Hosted Migration 072 Proof

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open hosted proof/repair

## Source

ARGUS accepted hosted migration proof first in:

`docs/roadmap/PR500B_SOCIAL_CREDENTIAL_OWNER_ROUTE_PREFLIGHT_RESULT.md`

Verdict:

```text
ACCEPT_PR500B_HOSTED_MIGRATION_072_PROOF_FIRST
```

## Task

Probe hosted Supabase for the accepted migration 072 shape. If any accepted
shape is missing, apply only the already-accepted migration:

`infra/supabase/migrations/072_social_connector_credentials.sql`

Then re-run the probes and record the result.

## Required Hosted Shape

Probe and report:

- table `public.social_connector_credentials` exists;
- expected columns exist:
  - `id`
  - `owner_user_id`
  - `provider`
  - `purpose`
  - `credential_category`
  - `encrypted_credential`
  - `credential_fingerprint`
  - `status`
  - `created_at`
  - `updated_at`
  - `rotated_at`
  - `revoked_at`
- provider, purpose, credential category, and status constraints exist and keep
  PR500A limited to Bluesky manual credentials and active/revoked status;
- `social_connector_credentials_owner_provider_active_idx` exists and is the
  partial one-active owner/provider/purpose index;
- `social_connector_credentials_owner_provider_status_idx` exists;
- trigger `trg_social_connector_credentials_updated_at` exists;
- RLS is enabled;
- owner policy `social_connector_credentials_all_owner` exists with owner-only
  `auth.uid() = owner_user_id` behavior.

## Allowed Repair

If hosted Supabase is missing part or all of migration 072, DAEDALUS may apply
only:

`infra/supabase/migrations/072_social_connector_credentials.sql`

Use the existing safe database connection path from local environment. Do not
print connection strings, passwords, tokens, service keys, raw SQL errors, table
row data, owner ids, provider payloads, encrypted payloads, or hosted logs.

## Forbidden Scope

Do not:

- implement owner credential API routes;
- store real or fixture social credentials in hosted data;
- add Settings Social UI, credential forms, Connect/OAuth/disconnect/save
  controls, or document composer behavior;
- start OAuth redirects, callbacks, token exchange, refresh, provider account
  lookup, provider API calls, provider SDKs, posting, scheduling, queues,
  workers, webhooks, Redis, Cloudflare, billing, Stripe, or public syndication;
- use legacy `social_connections` or `social_posts`;
- migrate, decrypt, backfill, expose, or clean up legacy social secret rows;
- change repo code, package manifests, lockfiles, route behavior, UI behavior,
  or public behavior.

## Required Result Doc

Create:

`docs/roadmap/PR500B_SOCIAL_CREDENTIAL_HOSTED_MIGRATION_072_PROOF_RESULT.md`

Record:

- pre-repair hosted schema probe results;
- whether migration 072 was already present or applied;
- post-repair probe results if repair was needed;
- exact pass/fail for table, columns, constraints, indexes, trigger, RLS, and
  owner policy;
- confirmation that no repo code, route behavior, UI, package/lockfile,
  credential storage, provider call, or public behavior changed unless the
  docs result itself changed;
- confirmation that no secret values or hosted raw data were printed.

## Validation

Run the probes described above. If you touch docs only, `git diff --check` is
enough locally after the hosted proof.

If anything beyond applying migration 072 appears necessary, stop and wake
MIMIR/ARGUS with the concrete blocker.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR500B as hosted migration 072 proof first before any owner
  social credential API route.
- MIMIR is routing only hosted schema proof/repair, not route/UI/OAuth/provider
  work.
Task:
- Run docs/roadmap/PR500B_SOCIAL_CREDENTIAL_HOSTED_MIGRATION_072_PROOF_DAEDALUS.md.
- Probe hosted Supabase for migration 072 shape.
- If missing, apply only infra/supabase/migrations/072_social_connector_credentials.sql and re-probe.
- Wake MIMIR with the result.
```
