# PR491A - Public Persona Second Fixture Proof Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-05

Verdict:

```text
DEPLOYMENT_WAITING
```

## Summary

ARIADNE started the hosted proof lane for the guarded ordinary public persona
fixture, but did not write hosted fixture data because the deployment freshness
gate failed.

The dry-run proof passed and printed only safe public labels, slugs, booleans,
counts, and pass/fail states. Hosted web and API health were ready, but both
reported app commit `890f9692`, which is not descended from the required
`c7164078 ops: add public persona fixture proof path` commit.

Because the deployed services were not fresh enough, the guarded hosted seed and
browser/API proof were intentionally not run.

## Completed Checks

- `node scripts/staging-public-persona-fixture.mjs --dry-run` passed.
- Hosted web `/health/deployment` returned `ready:true` at app commit
  `890f9692`.
- Hosted API `/health/deployment` returned `ready:true` at app commit
  `890f9692`.
- `git merge-base --is-ancestor c7164078 890f9692...` failed, so hosted
  freshness for PR491A is not proven.

## Not Run

- Guarded hosted fixture write.
- Public route proof for `station-replay-signed-in-alpha-persona`.
- Owner/admin signed-in-alpha readback.
- Signed-out anonymous POST denial proof.
- Replay anonymous no-drift browser proof.
- Desktop, `375px`, and `390px` hosted fit checks.

These checks should run only after hosted web/API are at `c7164078` or a later
deploy-equivalent.

## Boundary Preserved

- No runtime, API, schema, UI, billing, provider, queue, or auth behavior was
  changed.
- No hosted fixture data was written.
- No anonymous chat expansion was enabled.
- No secret values were printed, pasted, screenshotted, or committed.

## Next

MIMIR should wait for the deployment to reach `c7164078` or later, then reroute
ARIADNE to run the guarded hosted write and full hosted proof.
