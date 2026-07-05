# PR492B - Owner-Gated Public Persona Fixture Setup Result

Owner: ARIADNE / A4

Date: 2026-07-05

Verdict:

```text
PASS_READY_FOR_PR492A_CLOSEOUT
```

## Summary

ARIADNE found the approved non-production fixture
`station-replay-owner-gate-alpha-persona` on hosted and completed the PR492A
owner-controlled anonymous gate proof through the hosted owner API and browser
surfaces.

The fixture was restored to public chat enabled and anonymous owner gate
disabled after the rollback proof.

## Proof

- Hosted web/API health passed at app commit `a2d3f6be`.
- The approved fixture existed under the replay owner:
  `station-replay-owner-gate-alpha-persona`.
- Owner API readback proved default-off state:
  `publicAnonymousChatEnabled:false`, `signed_in_alpha`,
  blocker `owner_gate_disabled`.
- Public route for the fixture existed, exposed mode, and did not expose raw
  owner gate fields.
- Signed-out anonymous POST for the fixture was denied before owner enable with
  `public_persona_auth_required`.
- Owner API enable through `PATCH /personas/:id` set
  `publicAnonymousChatEnabled:true`.
- Owner API readback after enable proved `anonymous_alpha`,
  `owner_controlled_alpha`, fail-closed rate-limit posture, provider readiness,
  public-source-only scope, owner-paid attribution, aggregate-only counters, and
  no visitor transcript, identity, or raw-event storage.
- Signed-out anonymous POST succeeded for the owner-enabled fixture.
- Signed-out anonymous POST succeeded for `station-replay-alpha-persona`, which
  remained legacy `anonymous_alpha`.
- `station-replay-signed-in-alpha-persona` remained `signed_in_alpha` and
  anonymous-denied.
- Public roulette and Discover search cards exposed safe public chat mode and
  did not expose raw owner gate fields.
- Rollback through `PATCH /personas/:id` set the fixture back to
  `publicAnonymousChatEnabled:false`; signed-out anonymous POST was denied
  again.

## Browser Proof

Temporary dependency-free Chrome/CDP proof passed on desktop, `375px`, and
`390px` for:

- owner-enabled fixture public page;
- owner `/edit` control surface with rollback copy;
- rollback fixture public page;
- signed-in-alpha negative-control public page;
- replay alpha public page.

The browser pass checked fit/no-overflow, actionable controls, no placeholder
controls, no raw owner gate fields, no private/auth/request/provider leakage,
no public Salon chat-source overclaim in public chat cards, and no broad runtime
expansion copy.

## Boundary Preserved

- The signed-in-alpha fixture was not used as the owner-enabled target.
- Replay alpha was not modified beyond no-drift proof.
- The owner-gate fixture was restored to anonymous gate off.
- No private prompts, Memory, Canon, Archive, Continuity, Integrity,
  transcripts, files, provider payloads, or real user material were seeded.
- No secret values, owner ids, persona ids, raw rows, auth headers, cookies, IP
  addresses, user agents, or tokens were printed, pasted, screenshotted, or
  committed.
- Temporary harnesses and Chrome profiles were removed before commit.

## Next

MIMIR should close PR492A / PR492B.
