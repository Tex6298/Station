# PR491A - Public Persona Second Fixture Proof Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted rerun with corrected freshness gate

## Why This Rerun Exists

ARIADNE returned `DEPLOYMENT_WAITING` for the first hosted proof attempt:

`docs/roadmap/PR491A_PUBLIC_PERSONA_SECOND_FIXTURE_PROOF_REHEARSAL_RESULT.md`

MIMIR reviewed the blocked commit and found the freshness gate was too strict
for this specific lane. Commit `c7164078 ops: add public persona fixture proof
path` added only scripts, tests, docs, and roadmap/status files:

- `scripts/staging-public-persona-fixture.mjs`
- `scripts/staging-public-persona-fixture.test.mjs`
- `docs/ops/STAGING_PUBLIC_PERSONA_FIXTURE_PROOF.md`
- roadmap/status/testing docs

It did not change `apps/web`, `apps/api`, runtime public persona code, schema,
types, provider routing, rate limits, auth/session, billing, workers, queues,
Redis, Cloudflare, connectors, OAuth, or UI behavior.

Therefore the hosted app does not need to report `c7164078` to prove this lane.
The script must run from a local checkout that contains `c7164078` or later,
while hosted web/API need only be ready at the accepted PR490B runtime commit
`890f9692` or later/deploy-equivalent.

This is not permission to ignore deployment freshness generally. It is a
lane-specific correction because the accepted PR491A change is a local
guarded seed/proof path, not hosted runtime code.

## Corrected Freshness Gate

Required:

- local checkout includes `c7164078` or later so the guarded fixture script and
  tests exist;
- hosted web/API `/health/deployment` report ready at `890f9692` or
  later/deploy-equivalent;
- dry-run passes with safe output;
- guarded hosted write runs only if hosted Supabase write access is already
  available and `STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1` is set in-process.

If hosted web/API are older than `890f9692`, return:

```text
DEPLOYMENT_WAITING
```

If hosted seed/write access is unavailable, return:

```text
BLOCKED_NEEDS_HOSTED_SEED_ACCESS
```

and name only the missing condition, not the secret value.

## Required Proof

Reuse the proof scope from the first ARIADNE packet:

`docs/roadmap/PR491A_PUBLIC_PERSONA_SECOND_FIXTURE_PROOF_REHEARSAL_ARIADNE.md`

Required checks:

- `node scripts/staging-public-persona-fixture.mjs --dry-run`;
- guarded hosted write with `STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1` only if
  hosted write env is available;
- script output is safe public labels, slugs, booleans, counts, and pass/fail
  states only;
- public route exists for `station-replay-signed-in-alpha-persona`;
- owner/admin Studio public-interaction readback for that fixture says
  signed-in alpha only and not anonymous alpha;
- signed-out public page for the fixture does not show anonymous chat controls;
- signed-out anonymous chat POST for the fixture returns
  `public_persona_auth_required` before provider calls or token usage;
- `station-replay-alpha-persona` remains anonymous alpha and no-drift;
- desktop, `375px`, and `390px` fit;
- no private/raw/secret/provider/token/cookie/header/IP/user-agent readback,
  public Salon chat-source overclaim, broad anonymous/runtime-expansion claim,
  live connector/OAuth claim, worker/queue claim, billing claim, or placeholder
  control appears.

## Verdicts

Use exactly one:

```text
PASS_READY_TO_CLOSE_FIXTURE_GAP
DEPLOYMENT_WAITING
BLOCKED_NEEDS_HOSTED_SEED_ACCESS
PRODUCT_DEFECT_NEEDS_DAEDALUS
PRIVACY_OR_SCOPE_FAIL
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- MIMIR reviewed the PR491A deployment wait and found the c7164078 freshness gate was too strict for this lane.
- c7164078 added only the local guarded fixture script/tests/docs/status, not hosted web/API/runtime code.
- Corrected gate: local checkout must include c7164078 or later; hosted web/API only need ready runtime at 890f9692 or later/deploy-equivalent.
Task:
- Rerun the PR491A hosted fixture proof using the corrected freshness gate.
- Start with dry-run, then run the guarded hosted write only if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are available in environment and STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1 can be set without printing secrets.
- Verify fixture route existence, owner signed-in-only readback, signed-out anonymous POST denial with public_persona_auth_required, replay anonymous no-drift, desktop/375px/390px fit, safe output, privacy/scope, and no runtime expansion claims.
- Wake MIMIR with PASS_READY_TO_CLOSE_FIXTURE_GAP, DEPLOYMENT_WAITING, BLOCKED_NEEDS_HOSTED_SEED_ACCESS, PRODUCT_DEFECT_NEEDS_DAEDALUS, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Do not print or request secret values. Do not change runtime/API/schema/UI. Do not enable anonymous chat beyond the replay alpha slug. Do not treat dry-run/local validation as hosted fixture proof.
```
