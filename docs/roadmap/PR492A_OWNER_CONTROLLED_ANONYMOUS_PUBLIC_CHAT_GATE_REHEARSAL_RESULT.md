# PR492A - Owner-Controlled Anonymous Public Chat Gate Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-05

Verdict:

```text
BLOCKED_NEEDS_HOSTED_MIGRATION
```

## Summary

ARIADNE started the PR492A hosted proof and confirmed the web/API deployment is
fresh enough, but the hosted database migration is not applied.

Hosted web and API both reported `ready:true` at app commit `a2d3f6be`, and the
local checkout includes `a2d3f6be` or later. The proof stopped before owner
enable, rollback, browser, or signed-out success checks because the hosted
database does not have `personas.public_anonymous_chat_enabled`.

## Evidence

- Hosted web `/health/deployment` returned `ready:true` at app commit
  `a2d3f6be`.
- Hosted API `/health/deployment` returned `ready:true` at app commit
  `a2d3f6be`.
- `git merge-base --is-ancestor a2d3f6be HEAD` passed.
- Direct hosted Supabase REST read for
  `personas.public_anonymous_chat_enabled` returned HTTP `400`, code `42703`,
  with missing-column text for `personas.public_anonymous_chat_enabled`.
- Authenticated owner `/personas` returned HTTP `500` with the same missing
  column condition.
- Public persona reads for `station-replay-signed-in-alpha-persona` and
  `station-replay-alpha-persona` returned `404`, consistent with the hosted API
  selecting the missing gate column and failing closed.

## Not Run

- Owner enable for a non-replay public persona.
- Signed-out anonymous success for an owner-enabled non-replay persona.
- Signed-out replay success/no-drift browser proof.
- Signed-in fixture negative-control browser proof.
- Rollback proof.
- Public card/page no-leak and desktop/`375px`/`390px` fit proof.

These checks require the hosted migration first.

## Boundary Preserved

- No broad migration was applied by ARIADNE.
- No owner anonymous gate was enabled.
- No public persona data was seeded or broadened.
- No anonymous chat expansion was performed.
- No secret values were printed, pasted, screenshotted, or committed.

## Next

MIMIR should route the hosted migration/application step before rerouting
ARIADNE for the PR492A hosted gate proof.
