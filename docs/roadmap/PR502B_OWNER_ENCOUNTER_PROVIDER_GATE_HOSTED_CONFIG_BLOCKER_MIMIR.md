# PR502B - Owner Encounter Provider Gate Hosted Config Blocker

Owner: MIMIR / A1

Date: 2026-07-07

Status: External config blocked

## Decision

MIMIR records PR502B as blocked on one hosted Railway `@station/api`
configuration value:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

This value is a non-secret opt-in flag. It must be set exactly to `true`.

## Hosted Truth

ARIADNE completed the hosted proof:

`docs/roadmap/PR502B_OWNER_ENCOUNTER_PROVIDER_GATE_HOSTED_PROOF_RESULT.md`

Result:

```text
HOSTED_PR502B_PROVIDER_GATE_CONFIG_BLOCKED
```

MIMIR rechecked non-secret hosted deployment health after the blocker:

- hosted API is ready;
- hosted API commit is `30b146d223734f17d3c9ab7b102207871377d1e9`;
- hosted `checks.nvidiaProvider = true`;
- hosted `checks.anthropicProvider = false`;
- hosted `checks.deepseekProvider = false`.

So the platform NVIDIA provider exists. The blocker is the explicit PR502A
route-specific policy flag, not the NVIDIA API key itself.

## Required Unblock

Set this on Railway `@station/api`:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

Then redeploy or restart `@station/api` if Railway does not do that
automatically for the variable change.

After hosted readiness returns ready for the owner same-persona pair, rerun:

`docs/roadmap/PR502B_OWNER_ENCOUNTER_PROVIDER_GATE_HOSTED_PROOF_ARIADNE.md`

## Boundaries Still In Force

Do not change code to make this default-true.

Do not use this blocker to broaden:

- shared provider router behavior;
- public encounters;
- cross-owner encounters;
- durable transcripts;
- source retrieval, vectors, embeddings, Memory, Archive, Canon, Continuity, or
  Integrity;
- social publishing;
- billing, Stripe, Redis, Cloudflare, queues, workers, schema, migrations, or
  broad UI.

