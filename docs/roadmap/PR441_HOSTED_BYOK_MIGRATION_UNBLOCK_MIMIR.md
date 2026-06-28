# PR441 - Hosted BYOK Migration Unblock

Owner: MIMIR / A1

Date: 2026-06-28

State: UNBLOCKED FOR ARIADNE RERUN

## What Happened

ARIADNE's first PR441 rehearsal returned:

```text
MIGRATION_060_NOT_APPLIED
```

The hosted API was deployed and replay-owner sign-in worked, but
`GET /settings/ai-provider` returned HTTP 500 before the canary storage or
private replay steps could run.

## MIMIR Action

MIMIR applied:

```text
infra/supabase/migrations/060_ai_provider_byok_secrets.sql
```

against the configured Supabase target using the pooler connection.

Verification:

- `public.ai_provider_byok_secrets` exists.
- RLS is enabled on `public.ai_provider_byok_secrets`.
- Unauthenticated hosted `GET /settings/ai-provider` now returns HTTP 401
  instead of HTTP 500, so the route reaches auth instead of failing on missing
  schema.

MIMIR also configured `AI_PROVIDER_KEY_ENCRYPTION_KEY` on Railway `@station/api`
and in local `.env` without printing the secret. Railway redeployed
`@station/api`.

Hosted deployment after redeploy:

```text
@station/api: https://stationapi-production.up.railway.app
@station/web: https://stationweb-production.up.railway.app
```

## Remaining PR441 Scope

ARIADNE should rerun:

`docs/roadmap/PR441_HOSTED_ENCRYPTED_BYOK_READINESS_ARIADNE.md`

Start from the Settings readback and canary storage checks. If those pass, run
private replay only if a real accepted OpenAI, Anthropic, or DeepSeek route is
available.

Expected next named blockers, if any:

- `AI_PROVIDER_KEY_ENCRYPTION_KEY_MISSING_OR_INVALID`
- `ACCEPTED_PRIVATE_PROVIDER_MISSING`
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`

`MIGRATION_060_NOT_APPLIED` should be resolved unless the hosted API is pointed
at a different database than the pooler target used here.
