# PR436 - Hosted Non-NVIDIA Staged Replay Rehearsal

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: ARIADNE / A4

Status: open - hosted human-eye replay on accepted non-NVIDIA private path

## Why This Lane

PR435 made the PR434 policy executable: private persona chat must not use
NVIDIA platform routing. Private chat can use an accepted non-NVIDIA platform
route when configured, or fail closed with a sanitized provider/data-policy
error if NVIDIA is the only platform route.

Now ARIADNE should run the hosted staged replay from a human-eye view, but only
after confirming the deployed API is at the PR435 runtime guard commit or newer.

This is a hosted rehearsal, not a new implementation lane.

Relevant inputs:

- `docs/roadmap/PR435_PRIVATE_REPLAY_NON_NVIDIA_PROVIDER_GUARD_REVIEW_RESULT.md`
- `docs/roadmap/PR434_NVIDIA_PROVIDER_DATA_POLICY_PREFLIGHT_REVIEW_RESULT.md`
- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`
- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md`

## Required Deployment Gate

Check hosted web/API health before product actions:

- Web: `https://stationweb-production.up.railway.app/health/deployment`
- API: `https://stationapi-production.up.railway.app/health/deployment`

The API must serve PR435 runtime commit `8ea44d01` or later. If hosted runtime
is older, stop and wake MIMIR with:

```text
BLOCKED: DEPLOYMENT_NOT_AT_PR435_RUNTIME
```

Do not run private chat against an older deployment.

## Human Rehearsal

Use the hosted product UI and replay account path available to ARIADNE. Do not
print credentials or secrets.

Rehearse:

1. Sign in as the replay owner.
2. Open Studio and the `Station Replay Persona`.
3. Confirm private replay context surfaces still read coherently:
   - Memory;
   - Continuity/runtime context;
   - Archive;
   - observability/readiness where owner-visible.
4. Send one private staged replay chat prompt that exercises retrieval/context
   but contains no secrets and no copied private source bodies.
5. Inspect owner-visible trace/readback after the turn.

## Provider/Policy Assertions

Classify the result:

- PASS if private chat succeeds, the provider route/readback is non-NVIDIA, and
  Memory/Continuity/Archive context remains available without leaking raw
  private material into public/non-owner surfaces.
- BLOCKED if private chat fails closed with the expected PR435 provider-policy
  error because no accepted non-NVIDIA provider is configured in Railway.
- FAIL if private chat reaches `nvidia_openai_compatible`, leaks private source
  bodies, exposes secrets/IDs/provider payloads, or silently drops the private
  replay context.

Accepted non-NVIDIA labels include:

- `anthropic_platform`;
- `deepseek_fallback`;
- owner BYOK labels if the replay account is intentionally configured for BYOK.

NVIDIA labels are acceptable only for public/synthetic readiness or probe
surfaces, not for the private chat turn.

## Boundaries

Do not:

- run private chat if deployment freshness is behind PR435 runtime;
- treat a fail-closed missing-provider result as a UI defect;
- send copied source bodies, credentials, provider payloads, database URLs,
  cookies, tokens, or screenshots containing secrets into docs;
- mutate billing, provider config, Redis, Cloudflare, Supabase schema,
  migrations, workers, queues, embeddings, vector data, or replay seed data;
- broaden the UI pass beyond the staged replay path unless a directly blocking
  defect appears.

## Wakeup

If PASS or BLOCKED with a config ask, wake MIMIR with `WAKEUP A1:`.

If FAIL due to private NVIDIA routing or a code/privacy regression, wake
DAEDALUS with `WAKEUP A2:` and exact defects.
