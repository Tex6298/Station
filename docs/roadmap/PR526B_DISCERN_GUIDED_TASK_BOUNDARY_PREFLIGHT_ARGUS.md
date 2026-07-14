# PR526B - Discern Guided-Task Boundary Preflight

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
READY_FOR_ARGUS_PREFLIGHT_AFTER_PR525D_REVIEW
```

## Placement Decision

ARIADNE's PR526A verdict is accepted as the current-Discern reconciliation
map:

```text
ADAPT_PRESENTATION_DIRECTION_ONLY
REJECT_SOURCE_ENGINE_PROVIDER_PERSISTENCE_AND_REPLACEMENT_FLOWS
ARGUS_BOUNDARY_PREFLIGHT_REQUIRED_BEFORE_ANY_PR526_IMPLEMENTATION
```

The current UI integration may close without implementing PR526C-F. Their
useful one-question guidance, deterministic choices, typed previews, and
complete-form fallback are parked behind the terminal PR525 closeout pause.
They are not silently rejected and are not authorized current work.

PR526B is a docs-only hostile boundary preflight. It follows PR525D review in
the same ARGUS turn so current implementation is reviewed before any fresh-head
placement claim is accepted.

## Questions ARGUS Must Resolve

1. Does the accepted PR526A map clearly prevent the source action runner from
   advancing after failed mutations or rendering false success?
2. Does it reject generic `POST /flow/generate`, hard-coded Deepseek, full
   gathered-context forwarding, and any provider path outside Station routing,
   policy, quota, credits, and observability?
3. Does it reject localStorage for private/durable flow state and require an
   identity-scoped, versioned, expiring server draft contract before resume is
   ever implemented?
4. Does it preserve server authorization, visibility, moderation, provenance,
   secret, billing, archive/export, idempotency, and explicit recoverable error
   contracts on every affected surface?
5. Does it reject the broad auth-token sweep, duplicate route aliases, global
   `.conv-*` CSS, and replacement of existing complete Station surfaces?
6. Can PR525G truthfully call fresh-head reconciliation complete by recording
   the accepted adaptation/deviation map and this preflight, without importing
   rejected behavior?
7. Is any concrete correction required before PR525E/F/G/H can close? If so,
   name the smallest exact correction; do not turn it into PR526 implementation.

## Locked Placement

```text
PR526C - deterministic guided-task primitives                 PARKED
PR526D - companion setup pilot                                PARKED
PR526E - Space create pilot                                   PARKED
PR526F - server-driven memory lifecycle review queue          PARKED
```

Publishing, forum creation, Developer key management, Integrity, billing,
export, profile/account replacement, generic generated guidance, and route
aliases remain explicitly deferred or rejected as described in PR526A.

PR525D-F continue within their locked files. PR525G may include the accepted
map and deviation statement. PR525H owns shared light/dark theme treatment
only. None of those lanes authorizes a guided-task engine.

## Allowed Work

```text
docs/roadmap/PR526B_DISCERN_GUIDED_TASK_BOUNDARY_PREFLIGHT_ARGUS.md
docs/roadmap/PR526B_DISCERN_GUIDED_TASK_BOUNDARY_PREFLIGHT_RESULT.md
docs/roadmap/ACTIVE_STATUS.md                         result-state update only
docs/roadmap/LANE_INDEX.md                            result-state update only
```

Read-only source inspection is allowed. Do not change production code, tests,
API, schema, auth, provider, storage, CSS, package metadata, or lockfiles in
PR526B.

## Acceptance Gate

ARGUS returns one of:

```text
ACCEPT_PR526B_GUIDED_TASK_BOUNDARIES_AND_PARKED_PLACEMENT
BLOCK_PR526B_<EXACT_CONCRETE_BOUNDARY>
```

Acceptance must name every rejected source mechanism, confirm PR526C-F remain
parked, confirm whether PR525G can close current-head reconciliation without
implementation, and identify any exact correction needed before UI closeout.

## Handoff

Wake MIMIR with the PR525D verdict and then the PR526B verdict in one committed
handoff. Do not open PR526C-F, wake DAEDALUS for implementation, or start a
provider/backend/auth sweep.
