# PR491A - Public Persona Second Fixture Proof Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted seed/proof rehearsal

## Why This Exists

ARGUS accepted DAEDALUS' PR491A guarded fixture/proof path without a review
patch:

- `docs/roadmap/PR491A_PUBLIC_PERSONA_SECOND_FIXTURE_PROOF_RESULT.md`
- `docs/roadmap/PR491A_PUBLIC_PERSONA_SECOND_FIXTURE_PROOF_REVIEW_RESULT.md`

The accepted implementation added only script, test, and docs support. It did
not write the hosted fixture and did not change runtime/API/schema/UI behavior.

This lane should perform the authorized hosted proof for
`station-replay-signed-in-alpha-persona`, or return the concrete blocker if the
hosted seed/write environment is not available.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- Required deployed app freshness: `c7164078 ops: add public persona fixture proof path` or later/deploy-equivalent.

If hosted web/API has not deployed the script commit or later, return:

```text
DEPLOYMENT_WAITING
```

## Seed Command Boundary

Run the dry-run first:

```powershell
node scripts/staging-public-persona-fixture.mjs --dry-run
```

Run the hosted write only if the environment already contains hosted Supabase
write access and the explicit guard can be set in-process:

```powershell
$env:STATION_PUBLIC_PERSONA_FIXTURE_WRITE="1"
node scripts/staging-public-persona-fixture.mjs
```

Required for hosted write:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1`

Do not print, paste, screenshot, or commit secret values. If hosted write access
is unavailable, return:

```text
BLOCKED_NEEDS_HOSTED_SEED_ACCESS
```

and name only the missing condition, not the secret value.

## Required Hosted Proof

ARIADNE should prove the fixture gap is actually closed on hosted staging:

- hosted web/API health and deployed commit freshness at `c7164078` or later;
- dry-run output is safe public labels, slugs, booleans, counts, and pass/fail
  states only;
- guarded hosted write output is safe public labels, slugs, booleans, counts,
  and pass/fail states only;
- public route exists for `station-replay-signed-in-alpha-persona`;
- owner/admin Studio public-interaction readback for that fixture says
  signed-in alpha only and not anonymous alpha;
- signed-out public page for the fixture does not show anonymous chat controls;
- signed-out anonymous chat POST for the fixture returns
  `public_persona_auth_required` before provider calls or token usage;
- `station-replay-alpha-persona` remains anonymous alpha and no-drift;
- desktop, `375px`, and `390px` fit without clipped critical copy or broken
  touch targets;
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
- ARGUS accepted PR491A's guarded second public persona fixture/proof path without review patch.
- The fixture script plans station-replay-signed-in-alpha-persona as public_chat_enabled true but signed_in_alpha only; station-replay-alpha-persona remains the only anonymous_alpha slug.
- Hosted writes require STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1 plus hosted Supabase write access; dry-run/local validation is not hosted proof.
Task:
- Run hosted seed/proof rehearsal at app commit c7164078 or later.
- Start with dry-run, then run the guarded hosted write only if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are available in environment and the write guard can be set without printing secrets.
- Verify fixture public route existence, owner signed-in-only readback, signed-out anonymous POST denial with public_persona_auth_required, replay anonymous no-drift, desktop/375px/390px fit, safe output, privacy/scope, and no runtime expansion claims.
- Wake MIMIR with PASS_READY_TO_CLOSE_FIXTURE_GAP, DEPLOYMENT_WAITING, BLOCKED_NEEDS_HOSTED_SEED_ACCESS, PRODUCT_DEFECT_NEEDS_DAEDALUS, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Do not print or request secret values. Do not change runtime/API/schema/UI. Do not enable anonymous chat beyond the replay alpha slug. Do not treat dry-run/local validation as hosted fixture proof.
```
