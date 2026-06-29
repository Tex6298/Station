# PR468 - Anonymous Public Persona Chat Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR468 as accepted.

PR468 completed the full lane Marty allowed: preflight, DAEDALUS
implementation, ARGUS review, hosted ARIADNE rehearsal, the PR468A hosted route
reachability patch, ARGUS review of that patch, and the final ARIADNE hosted
rerun.

The closing hosted result is:

`docs/roadmap/PR468_ANONYMOUS_PUBLIC_PERSONA_CHAT_REHEARSAL_RERUN_RESULT.md`

Verdict:

```text
PASS
```

## Accepted Product Shape

- Anonymous public persona chat is enabled only for
  `/personas/station-replay-alpha-persona`.
- Other public personas continue to require a signed-in visitor unless a later
  lane explicitly opens another boundary.
- Owner enable/disable remains the rollback switch for anonymous and signed-in
  public chat.
- Anonymous visitor rate limiting uses minimized hashed request-address state,
  not raw visitor identity, cookies, prompts, auth headers, or provider data.
- Rate-limit store failure fails closed before provider calls or token usage.
- Token spend remains charged to the persona owner with no visitor transcript
  or visitor identity persistence.
- The provider prompt remains public-source-only: public persona profile,
  routeable public documents, and linked public discussions only.
- Private Memory, Archive, Canon, Continuity, Integrity, owner setup, provider
  settings, private documents, raw ids, credentials, storage paths, and source
  bodies stay out of public responses and provider payloads.
- Public persona reporting remains signed-in only.

## Validation Accepted

- ARGUS accepted the PR468 implementation:
  `docs/roadmap/PR468_ANONYMOUS_PUBLIC_PERSONA_CHAT_REVIEW_RESULT.md`.
- ARIADNE found the initial hosted rehearsal blocked on public persona route
  reachability:
  `docs/roadmap/PR468_ANONYMOUS_PUBLIC_PERSONA_CHAT_REHEARSAL_RESULT.md`.
- DAEDALUS implemented PR468A route reachability:
  `docs/roadmap/PR468A_PUBLIC_PERSONA_HOSTED_ROUTE_REACHABILITY_RESULT.md`.
- ARGUS accepted PR468A after a narrow optional-read sanitizer patch:
  `docs/roadmap/PR468A_PUBLIC_PERSONA_HOSTED_ROUTE_REACHABILITY_REVIEW_RESULT.md`.
- ARIADNE reran hosted desktop and 390px mobile proof and passed:
  `docs/roadmap/PR468_ANONYMOUS_PUBLIC_PERSONA_CHAT_REHEARSAL_RERUN_RESULT.md`.

## Residual Caveat

The hosted public sample exposed only `station-replay-alpha-persona`, so the
final hosted rerun did not visually sample a second public persona deny/default
route. That does not block closeout because ARGUS accepted the focused deny,
owner rollback, and boundary tests.

## Next Lane Rule Applied

Marty clarified that after PR468 closes, the next feature choice should move
toward a named Phase 3 feature, not another extension of an already-built
surface or open-ended hardening sweep.

MIMIR therefore opens a named Phase 3 feature preflight:

`docs/roadmap/PR469_LIVE_EVENTS_SEMINARS_PREFLIGHT_ARGUS.md`
