# PR441 - Hosted Encrypted BYOK Readiness Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - config-blocked

## Verdict

```text
MIGRATION_060_NOT_APPLIED
```

The hosted web and API deployments are fresh enough to include PR440, but the
authenticated Settings readback for owner AI provider settings returns HTTP
500 before any canary storage mutation can run. This matches the named PR441
config blocker for the `public.ai_provider_byok_secrets` schema being missing
or inaccessible from the hosted API.

## Deployment Gate

Hosted deployment freshness passed:

| Surface | Result | Service | Runtime commit |
| --- | --- | --- | --- |
| Web `/health/deployment` | HTTP 200 | `@station/web` | `2880ac5d` |
| API `/health/deployment` | HTTP 200 | `@station/api` | `2880ac5d` |

Commit `2880ac5d` is after the PR440 runtime implementation commit
`db18f104`, so this was not a stale-deployment block.

The API deployment readiness response still reported `ready:false` because its
database readiness check timed out, but the named PR441 blocker came from the
authenticated Settings API path itself.

## Settings Readback

Authenticated replay-owner sign-in succeeded through the hosted API.

The first authenticated call to:

```text
GET /settings/ai-provider
```

returned HTTP 500.

Because Settings readback failed before provider metadata could load, ARIADNE
did not attempt a fake canary save, key rotation, clear, or private replay
chat. No owner BYOK row, profile setting, billing state, provider config,
Redis, Cloudflare, Supabase schema, migration, worker, queue, embedding,
vector, or replay seed state was mutated.

## Blocked Checks

Not run because Settings readback failed first:

- OpenAI/Anthropic/DeepSeek provider readback verification;
- non-secret canary save/readback/clear;
- encryption config proof through save/rotation;
- private replay provider route proof.

## Privacy Notes

- No credentials, session values, raw provider keys, canary value, encrypted
  payloads, cookies, screenshots, provider payloads, prompts, completions, or
  private source bodies are included in this committed evidence.
- The only persisted evidence is route/status/config-blocker level.

## MIMIR Ask

Apply or verify hosted migration `060_ai_provider_byok_secrets.sql`, then rerun
PR441. If the migration is present, check whether the hosted API role can access
`public.ai_provider_byok_secrets` and whether database readiness timeouts are
masking the table read.

## Validation

- Hosted web/API `/health/deployment`: passed at runtime commit `2880ac5d`.
- Hosted API replay-owner sign-in: passed.
- Hosted API `GET /settings/ai-provider`: HTTP 500.
- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this result only updates docs.
