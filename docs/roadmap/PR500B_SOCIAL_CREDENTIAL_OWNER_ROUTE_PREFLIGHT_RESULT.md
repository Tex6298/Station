# PR500B - Social Credential Owner Route Preflight Result

Owner: ARGUS / A3

Date: 2026-07-06

Status: Accepted - hosted proof first

## Verdict

```text
ACCEPT_PR500B_HOSTED_MIGRATION_072_PROOF_FIRST
```

ARGUS rejects opening an owner credential API route before hosted Supabase is
proven to have the accepted migration 072 shape.

## Decision

PR500A is locally accepted, but PR500A deliberately did not expose a runtime
route or hosted behavior. A PR500B owner credential route would be the first
hosted runtime dependency on `public.social_connector_credentials`.

The recent PR499A hosted defect showed that a locally accepted migration can be
missing in hosted Supabase. Social credential routes are secret-adjacent, so
ARGUS will not accept create/list/revoke routes until hosted migration 072 is
proven or repaired.

## Next Lane

MIMIR should route DAEDALUS to a narrow hosted migration proof/repair lane:

```text
PR500B - Social Credential Hosted Migration 072 Proof
Owner: DAEDALUS / A2
```

DAEDALUS should probe hosted Supabase for:

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
- provider/purpose/category/status constraints exist and keep PR500A limited to
  Bluesky manual credentials and active/revoked status;
- `social_connector_credentials_owner_provider_active_idx` exists and is the
  partial one-active owner/provider/purpose index;
- `social_connector_credentials_owner_provider_status_idx` exists;
- trigger `trg_social_connector_credentials_updated_at` exists;
- RLS is enabled;
- owner policy `social_connector_credentials_all_owner` exists with owner-only
  `auth.uid() = owner_user_id` behavior.

If any accepted shape is missing, DAEDALUS may apply only the already-accepted
`infra/supabase/migrations/072_social_connector_credentials.sql`, then re-run
the probes.

## Forbidden Scope

The hosted proof lane must not:

- implement owner credential API routes;
- store any real or fixture social credential in hosted data;
- add Settings Social UI, credential forms, Connect/OAuth/disconnect/save
  controls, or document composer behavior;
- start OAuth redirects, callbacks, token exchange, refresh, provider account
  lookup, provider API calls, provider SDKs, posting, scheduling, queues,
  workers, webhooks, Redis, Cloudflare, billing, Stripe, or public syndication;
- use legacy `social_connections` or `social_posts`;
- migrate, decrypt, backfill, expose, or clean up legacy social secret rows;
- print connection strings, env values, bearer tokens, service keys, SQL error
  details, table row data, owner ids, provider payloads, stack traces, hosted
  logs, encrypted payloads, or secret-shaped values.

## Required Output For DAEDALUS

DAEDALUS should produce a result doc recording:

- pre-repair hosted schema probe results;
- whether migration 072 was already present or applied;
- post-repair probe results if repair was needed;
- exact pass/fail for table, columns, constraints, indexes, trigger, RLS, and
  owner policy;
- confirmation that no repo code, route behavior, UI, package/lockfile,
  credential storage, provider call, or public behavior changed unless the
  docs result itself changed;
- confirmation that no secret values or hosted raw data were printed.

## Future Route Boundary

If hosted migration 072 proof passes, the next implementation lane may be
reconsidered as an owner-only backend API. That later route should remain
Bluesky manual credential only and backend-only:

- `GET /social/connectors/credentials` for safe metadata rows only;
- `POST /social/connectors/credentials` for exact bounded Bluesky credential
  storage using the PR500A helper;
- provider-scoped local revoke/disconnect, with no provider call;
- existing `/social/readiness`, Settings Social, and document pages still
  paused/readback-only.

That route is not accepted in this PR500B preflight result.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| PR500B/PR500A docs and source inspection | Pass | Confirmed PR500A is local/backend accepted and no hosted migration 072 proof is recorded. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts` | Pass | 110 social/auth/archive connector tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors before ARGUS docs edits. |

## Handoff

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should route DAEDALUS to hosted migration 072 proof/repair before any
owner social credential route is built.
