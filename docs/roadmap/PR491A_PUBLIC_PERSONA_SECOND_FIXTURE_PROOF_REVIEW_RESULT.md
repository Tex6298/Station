# PR491A - Public Persona Second Fixture Proof Review Result

Owner: ARGUS / A3

Implemented by: DAEDALUS / A2

Date reviewed: 2026-07-05

Status: Accepted by ARGUS - ready for MIMIR to route hosted proof

## Verdict

```text
ACCEPT_PR491A_SECOND_FIXTURE_PROOF_IMPLEMENTATION
```

ARGUS accepts DAEDALUS' PR491A fixture/proof path without a review patch.

## Review Summary

The implementation matches the accepted script/test/docs-only boundary:

- added `scripts/staging-public-persona-fixture.mjs`;
- added `scripts/staging-public-persona-fixture.test.mjs`;
- added `docs/ops/STAGING_PUBLIC_PERSONA_FIXTURE_PROOF.md`;
- plans exactly one ordinary public persona fixture:
  `station-replay-signed-in-alpha-persona`;
- keeps the fixture public, `public_chat_enabled:true`, and
  `signed_in_alpha`;
- keeps `station-replay-alpha-persona` as the only `anonymous_alpha` slug;
- expects signed-out anonymous chat for the fixture to return
  `public_persona_auth_required`;
- requires `STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1` plus hosted Supabase access
  for writes;
- dry-run and persisted summaries are restricted to safe public labels, slugs,
  booleans, counts, and pass/fail states.

No runtime/API/schema/UI behavior changed.

## Boundary Checks

ARGUS confirmed:

- no `publicPersonaChatMode` change;
- no anonymous runtime eligibility expansion;
- no public prompt/source selection change;
- no provider/model routing, rate-limit behavior, token attribution, public
  reporting/moderation, API contract, schema, auth/session, billing, worker,
  queue, Redis, Cloudflare, connector, OAuth, social dispatch, public launch
  claim, or broad UI change;
- the script refuses the replay anonymous alpha slug and raw-id-shaped public
  slugs;
- hosted writes require an explicit write flag;
- the write path is same-owner/idempotent and rejects cross-owner slug reuse;
- script output does not include owner ids, persona ids, raw Supabase URLs,
  service keys, cookies, auth headers, IP addresses, user agents, stack traces,
  provider payloads, prompts, completions, private source bodies, or raw rows.

The hosted fixture has not been written by the implementation commit. This
acceptance is for the guarded proof path; MIMIR still needs to route authorized
hosted seed/proof before treating the fixture gap as closed.

## Validation

ARGUS reran the requested validation on 2026-07-05:

| Command | Result | Notes |
| --- | --- | --- |
| `node scripts/staging-public-persona-fixture.mjs --dry-run` | Pass | Printed safe dry-run proof for `station-replay-signed-in-alpha-persona`, `signed_in_alpha`, and `public_persona_auth_required`. |
| `node --test scripts/staging-public-persona-fixture.test.mjs` | Pass | 5 tests passed for dry-run proof, CLI output safety, slug validation, write flag, idempotent write behavior, and cross-owner slug conflict. |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 15 personas tests passed; replay anonymous alpha and ordinary signed-in alpha boundaries remain green. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 12 public persona route/interaction helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning only for ARGUS state receipt. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Required Hosted Proof

MIMIR should route the authorized hosted seed/proof rehearsal before closeout.

Required checks:

- hosted web/API health and deployed commit freshness at `c7164078` or later;
- authorized dry-run and, if seed access is approved, guarded hosted write using
  `STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1`;
- script output records only safe public labels, slugs, booleans, counts, and
  pass/fail states;
- the second ordinary public persona route exists for
  `station-replay-signed-in-alpha-persona`;
- owner/admin Studio public-interaction readback for the fixture says
  signed-in alpha only, not anonymous alpha;
- signed-out public page for the fixture does not show anonymous chat controls;
- signed-out anonymous chat POST for the fixture returns
  `public_persona_auth_required` before provider calls/token usage;
- `station-replay-alpha-persona` remains anonymous alpha and no-drift;
- no private/raw/secret/provider/token/cookie/header/IP/user-agent readback,
  public Salon chat-source overclaim, broad anonymous/runtime-expansion claim,
  live connector/OAuth claim, worker/queue claim, billing claim, or placeholder
  control appears.

If hosted seed access is unavailable, MIMIR should record
`BLOCKED_NEEDS_HOSTED_SEED_ACCESS` with the exact missing condition and no
secret values.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted DAEDALUS' PR491A second public persona fixture proof path without a review patch.
- The new script plans station-replay-signed-in-alpha-persona as a public_chat_enabled true ordinary public persona that remains signed_in_alpha; station-replay-alpha-persona remains the only anonymous_alpha slug.
- Hosted writes are guarded by STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1 and script output is limited to safe public labels, slugs, booleans, counts, and pass/fail states.
- Runtime eligibility, publicPersonaChatMode, prompt sources, provider routing, rate limits, API contracts, schema, public reporting/moderation, and broad UI did not change.
- ARGUS reran dry-run, script tests, test:personas, public persona route/interaction helper tests, typecheck, lint, and git diff --check.
Task:
- Route authorized hosted seed/proof rehearsal before closing the fixture gap.
- Verify hosted web/API freshness at c7164078 or later, safe dry-run/write output, fixture route existence, owner signed-in-only readback, signed-out anonymous POST denial with public_persona_auth_required, replay no-drift, mobile fit, privacy/scope, and no runtime expansion claims.
Guardrails:
- Do not print or request secret values.
- Do not treat dry-run/local validation as hosted fixture proof.
- If hosted seed access is unavailable, record BLOCKED_NEEDS_HOSTED_SEED_ACCESS with the concrete missing condition.
Validation:
- node scripts/staging-public-persona-fixture.mjs --dry-run
- node --test scripts/staging-public-persona-fixture.test.mjs
- npm exec --yes pnpm@10.32.1 -- run test:personas
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
```
