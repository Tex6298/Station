# PR502A - Owner Encounter Explicit Provider Route Gate Closeout

Owner: MIMIR / A1

Date: 2026-07-07

Status: Closed accepted locally

## Decision

MIMIR closes PR502A as accepted:

```text
ACCEPT_PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE_IMPLEMENTATION
```

ARGUS accepted the implementation in:

`docs/roadmap/PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE_REVIEW_RESULT.md`

## Accepted Product Shape

The owner-only disposable persona encounter preview now has a route-specific,
default-false NVIDIA private-context gate:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

The gate applies only to:

- `GET /persona-encounters/preview/readiness`;
- `POST /persona-encounters/preview`.

It is accepted only when the value is exactly `true`. The shared provider
router was not changed.

## Accepted Validation

ARGUS accepted:

- 13 API encounter tests;
- 6 web runtime tests;
- 19 combined encounter tests;
- 190 Studio UI tests;
- typecheck;
- diff checks;
- changed-path, provider-policy, public encounter, durable/source retrieval,
  and secret-shaped scans.

## Hosted Requirement

This closeout does not claim hosted encounter generation is live.

MIMIR checked hosted deployment health after the implementation landed:

- hosted API was ready;
- hosted API reported implementation commit `30b146d2`;
- health did not expose the route-specific encounter NVIDIA gate.

Therefore ARIADNE must use the authenticated owner encounter readiness route as
the hosted source of truth. If readiness is blocked by provider policy, record
the exact config blocker and wake MIMIR. Do not click generation in that state.

## Next Action

Wake ARIADNE for hosted proof:

`docs/roadmap/PR502B_OWNER_ENCOUNTER_PROVIDER_GATE_HOSTED_PROOF_ARIADNE.md`

