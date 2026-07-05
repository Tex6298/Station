# PR491A - Public Persona Second Fixture Proof Hosted Rerun Result

Owner: ARIADNE / A4

Date: 2026-07-05

Verdict:

```text
PASS_READY_TO_CLOSE_FIXTURE_GAP
```

## Summary

ARIADNE reran the PR491A hosted fixture proof using MIMIR's corrected freshness
gate. The local checkout included `c7164078` or later, and hosted web/API were
ready at the accepted runtime commit `890f9692`.

The guarded hosted fixture seed completed with safe output only. The fixture
`station-replay-signed-in-alpha-persona` now exists as an ordinary public
persona fixture with public chat enabled but `signed_in_alpha` mode. The replay
slug `station-replay-alpha-persona` remained the only `anonymous_alpha` slug.

## Proof

- Local checkout freshness passed: `c7164078` is an ancestor of `HEAD`.
- Hosted web/API health returned `ready:true` at app commit `890f9692`.
- `node scripts/staging-public-persona-fixture.mjs --dry-run` passed with safe
  public labels, slugs, booleans, counts, and pass/fail states.
- Guarded hosted write ran with `STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1` and
  safe output; `hostedWriteUsed:true`, `fixtureUpserted:true`, and
  `ownerEligible:true`.
- Public API route exists for
  `station-replay-signed-in-alpha-persona` and reports `signed_in_alpha`.
- Owner readback for the fixture reports signed-in alpha only, public route
  live, fail-closed rate-limit readiness, provider readiness, public-source-only
  scope, owner-paid attribution, and no visitor transcript, identity, or raw
  event storage.
- Signed-out anonymous chat POST for the fixture returned HTTP `401` with
  `public_persona_auth_required`.
- `station-replay-alpha-persona` still reports `anonymous_alpha` and kept its
  anonymous chat form.
- Hosted browser proof passed on desktop, `375px`, and `390px` for the fixture
  signed-out page and owner readback page.
- Replay public no-drift fit passed on desktop, `375px`, and `390px`.

## Boundary Preserved

- No runtime, API, schema, UI, billing, provider, queue, auth/session, connector,
  OAuth, or worker behavior was changed.
- No anonymous chat expansion was enabled beyond
  `station-replay-alpha-persona`.
- The fixture public chat card did not expose signed-out chat controls.
- The public chat cards did not claim public Salon chat sources.
- No private/raw/secret/provider payload, token, cookie, auth header, IP address,
  user-agent, storage path, live connector/OAuth claim, worker/queue claim,
  billing claim, or broad runtime-expansion claim appeared in the proof output
  or checked readbacks.
- Temporary hosted proof harnesses were removed before commit.

## Validation

- `git merge-base --is-ancestor c7164078 HEAD`
- hosted web/API `/health/deployment`
- `node scripts/staging-public-persona-fixture.mjs --dry-run`
- guarded hosted write through `scripts/staging-public-persona-fixture.mjs`
- temporary dependency-free Chrome DevTools hosted fixture proof
- temporary dependency-free Chrome DevTools replay mobile fit proof

## Next

MIMIR should close PR491A / close the hosted fixture gap.
