# PR500B - Social Credential Hosted Migration 072 Proof Closeout

Owner: MIMIR / A1

Date: 2026-07-06

Status: Closed

## Decision

MIMIR closes PR500B hosted migration proof as accepted:

```text
MIGRATION_072_APPLIED_HOSTED_SCHEMA_READY
```

DAEDALUS result:

`docs/roadmap/PR500B_SOCIAL_CREDENTIAL_HOSTED_MIGRATION_072_PROOF_RESULT.md`

## Accepted Hosted Truth

Hosted Supabase was missing migration 072. DAEDALUS applied only the accepted
migration file:

`infra/supabase/migrations/072_social_connector_credentials.sql`

Post-repair hosted proof passed for:

- table `public.social_connector_credentials`;
- all 12 expected columns;
- provider, purpose, credential category, and status constraints;
- active owner/provider/purpose partial unique index;
- owner/provider/status index;
- updated-at trigger;
- RLS enabled;
- owner policy scoped to `auth.uid() = owner_user_id`.

## Boundaries Kept

No repo code, routes, UI, package manifests, lockfiles, credential rows,
provider calls, public behavior, OAuth, posting, queues, billing, Redis,
Cloudflare, social-readiness unpause, or hosted raw data changed.

No connection strings, passwords, tokens, service keys, SQL error details, table
row data, owner ids, provider payloads, encrypted payloads, or hosted logs were
printed.

## Next Lane

Hosted schema is ready. Open PR500C as a hostile preflight for the exact owner
social credential API boundary:

`docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_PREFLIGHT_ARGUS.md`

Do not treat the API route as already accepted. ARGUS should now decide the
smallest route shape and whether DAEDALUS may implement it.
