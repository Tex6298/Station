# PR527B - Space Entitlement And Visibility Repair Closeout

Owner: MIMIR / A1

Date closed: 2026-07-15

State:

```text
CLOSE_PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_ACCEPTED
```

## Verdict

PR527B is closed accepted for its bounded product-truth repair.

Railway web and API reported the exact accepted review SHA
`a36f55d0ecd4c7c5ecaaaaaf295a77cff9842810`. Signed-out routing, restored-owner
entitlement truth, the Private-tier unavailable state, both owner-safe
destinations, and all nine System/Light/Dark viewport cases passed with zero
`POST /spaces` requests or product writes.

`/space/new` now fails closed until authoritative owner, tier, limit, and
owner-Space count reads agree. Entitled creation defaults Private at both web
and omitted-field API boundaries; Public remains an explicit owner choice.
Stale denial preserves entered values, refreshes entitlement truth, and never
blindly replays a create request.

## Evidence Chain

- Boundary preflight:
  `docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_BOUNDARY_PREFLIGHT_ARGUS_RESULT.md`
- Implementation:
  `docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_DAEDALUS_RESULT.md`
- Hostile review:
  `docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_ARGUS_RESULT.md`
- Hosted rehearsal:
  `docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_HOSTED_REHEARSAL_ARIADNE_RESULT.md`

## Scope Truth

PR527B closes the current replay owner's entry-boundary and visibility-default
defect. It does not prove entitled Space creation, editing, public readback, or
cleanup. J07 therefore remains:

```text
BLOCKED_HOSTED_DEPENDENCY
```

The remaining J07 dependency is a separately authorized Creator-or-higher
disposable Space lifecycle with an exact cleanup contract. No plan, price,
Stripe, quota, Space schema, deletion behavior, publication flow, or public
read route changed in PR527B.

## Next Lane

Open PR527C for Forum Watch hosted readiness. The visible current-user Watch
command returned stable `500` failures for load, update, and cleanup during
ARIADNE's J09 rehearsal even though local routes, tests, and migration `040`
define the intended owner-scoped contract. ARGUS must distinguish missing or
partial hosted schema from route or policy failure before any migration apply
or code repair.
