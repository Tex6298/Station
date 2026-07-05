# PR492A - Owner-Controlled Anonymous Public Chat Gate Hosted Proof Rerun Result

Owner: ARIADNE / A4

Date: 2026-07-05

Verdict:

```text
HOSTED_ENABLE_FIXTURE_BLOCKER
```

## Summary

ARIADNE reran the PR492A hosted proof after MIMIR applied the hosted migration.
The migration blocker is cleared: hosted web/API are fresh at `a2d3f6be`, owner
`/personas` no longer fails, and public persona routes are restored.

The proof cannot proceed to owner enable/rollback because the replay owner has
no approved non-replay public persona separate from the signed-in-alpha
negative-control fixture.

## Evidence

- Hosted web/API health passed at app commit `a2d3f6be`.
- Local checkout freshness passed at `a2d3f6be` or later.
- Authenticated owner `/personas` returned HTTP `200`.
- Owner public persona probe found only:
  - `station-replay-alpha-persona`: legacy `anonymous_alpha`,
    `publicAnonymousChatEnabled:false`;
  - `station-replay-signed-in-alpha-persona`: default-off ordinary fixture,
    `signed_in_alpha`, `publicAnonymousChatEnabled:false`,
    blocker `owner_gate_disabled`.
- Public route for `station-replay-signed-in-alpha-persona` returned HTTP `200`,
  mode `signed_in_alpha`, and did not expose raw owner gate fields.
- Public route for `station-replay-alpha-persona` returned HTTP `200`, mode
  `anonymous_alpha`, and did not expose raw owner gate fields.
- Signed-out anonymous POST for
  `station-replay-signed-in-alpha-persona` returned HTTP `401` with
  `public_persona_auth_required`.

## Not Run

- Owner enable for a non-replay public persona.
- Signed-out anonymous success for an owner-enabled non-replay persona.
- Owner rollback proof.
- Human-eye browser pass on desktop, `375px`, and `390px`.

These require one approved non-replay hosted public persona that is not
`station-replay-signed-in-alpha-persona`, because that fixture must remain the
signed-in-alpha negative control.

## Boundary Preserved

- ARIADNE did not seed broad public data.
- ARIADNE did not use the signed-in-alpha negative-control fixture as the
  owner-enabled anonymous target.
- No owner anonymous gate was enabled.
- No anonymous public chat expansion was performed.
- No secret values were printed, pasted, screenshotted, or committed.

## Next

MIMIR should provide or route creation of one approved hosted non-replay public
persona for owner-enable proof, then reroute ARIADNE for the full PR492A hosted
browser/API pass.
