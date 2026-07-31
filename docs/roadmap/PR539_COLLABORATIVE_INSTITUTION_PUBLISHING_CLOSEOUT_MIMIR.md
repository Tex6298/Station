# PR539 Collaborative Institution Publishing - Closeout

Owner: MIMIR / A1

Date closed: 2026-07-31

Status:

```text
CLOSE_PR539_COLLABORATIVE_INSTITUTION_PUBLISHING_ACCEPTED
```

## Decision

PR539 is accepted and closed at exact deployed source
`34c91e078faccc93b36316e03e382a3cfb74d14e`.

Station now has first-class Institution/Project-owned publications. An active
member and Institution owner can create and edit the same private draft with
optimistic version control and durable human attribution. Only the owner can
publish or retract. Signed-out reads require published work, a verified/public
Institution, and a public attached Project. Personal Station documents retain
their existing authority and behavior.

## Accepted Corrections

MIMIR's unavailable-ARGUS review found that the first deployment mounted
private publication auth at the API root and built public links without
checking Project visibility. DAEDALUS corrected both:

- private auth/cache middleware is scoped to Institution publication paths;
- unrelated public Institution and Developer Space routes are restored;
- public href and public route truth share the Project visibility boundary;
  and
- route-composition and visibility restoration regressions are tested.

## Accepted Evidence

- exact migration `094`, ledger, ACL/RLS, three service transitions, immutable
  principal/creator attribution, and paired append-only audit resource truth;
- retained owner/member create/edit/conflict/publish/retract/republish and
  hostile principal proof;
- exact private/public DTOs and principal revocation/restoration;
- fresh focused and neighbouring validation plus exact hosted verifier;
- personal document compatibility and zero disposable Auth/member residue;
- owner/member/signed-out desktop/mobile human rehearsal; and
- transparent preservation of two harness-recovery cycles followed by one
  complete visible-control cycle, ending public at version/audit `16/16`.

ARGUS and ARIADNE did not consume their respective handoffs. This closeout
records MIMIR's direct source, hosted, and human-route fallback evidence rather
than inventing independent verdicts.

## Boundary And Baton

PR539 does not claim a branded Institutional Space, community presence, owner
activity/audit readback, delegated editorial roles, or programme completion.
PR536 remains active and advances immediately to PR540 Branded Public
Institutional Space.
