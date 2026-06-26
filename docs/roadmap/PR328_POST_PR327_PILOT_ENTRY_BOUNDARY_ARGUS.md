# PR328 - Post-PR327 Pilot Entry Boundary

Owner: ARGUS

Date: 2026-06-26

Status: Complete

## Why This Opens

ARIADNE passed PR327:

```text
PASS
```

The hosted named signed-in pilot rehearsal is accepted as internally proven.
MIMIR is not starting real external tester entry yet because the real tester
list, allowed actions, monitoring owners, and pilot start/stop window are not
named in repo truth.

This PR asks ARGUS to classify the boundary before MIMIR either collects those
details from Marty or opens a different internal lane while the pilot waits.

## Accepted Evidence

Use:

- `docs/roadmap/PR326_NAMED_SIGNED_IN_EXTERNAL_PILOT_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR327_NAMED_SIGNED_IN_PILOT_HOSTED_REHEARSAL_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`

Accepted PR327 facts:

- hosted web/API were fresh at `f89dd2b921c9`;
- PR318 and PR323 gates were present;
- signed-out users could read the public persona but could not chat or report;
- one signed-in replay chat and one persona report were completed with capped
  mutations;
- owner readback stayed aggregate/status-only;
- admin persona moderation readback stayed safe;
- public Space/document/discussion chain passed on desktop and mobile;
- no real tester entry, moderation mutation, billing/provider/deploy/key/infra
  mutation, leakage, or launch/commercial/partner overclaim was observed.

## Boundary Question

Classify the next move as exactly one of:

```text
PILOT ENTRY READY AFTER MARTY DETAILS
DAEDALUS ALLOWLIST REQUIRED BEFORE TESTERS
MARTY DETAILS REQUIRED BEFORE CLASSIFICATION
RETURN TO INTERNAL LANE WHILE WAITING
BLOCKED ON SAFETY
```

Use these meanings:

- `PILOT ENTRY READY AFTER MARTY DETAILS`: operational invite-only is acceptable
  for the first 3-5 trusted named signed-in testers once Marty/MIMIR names
  accounts, allowed actions, monitoring owners, and pilot start/stop window.
- `DAEDALUS ALLOWLIST REQUIRED BEFORE TESTERS`: the current public signed-in
  route is too broad for the promised named-only pilot, so code must enforce
  named tester access before any real tester enters.
- `MARTY DETAILS REQUIRED BEFORE CLASSIFICATION`: ARGUS cannot choose between
  operational invite-only and enforced allowlist until exact tester/action/
  monitoring/window details are supplied.
- `RETURN TO INTERNAL LANE WHILE WAITING`: real tester entry is gated on Marty
  details, but there is no code/safety reason to block other internal Station
  work while those details are pending.
- `BLOCKED ON SAFETY`: do not proceed with real testers or unrelated expansion
  until a named safety issue is resolved.

## Review Scope

Stay narrow:

- no code changes;
- no hosted mutation;
- no real tester contact;
- no billing, provider/model, Redis, Cloudflare, queue, worker, deploy, key, or
  database-admin work;
- no broad public launch or commercial readiness claim.

If ARGUS recommends `RETURN TO INTERNAL LANE WHILE WAITING`, name the safest
next owner and the smallest lane shape, but do not wake that owner directly.
Wake MIMIR with the classification.

## Result Required

Create:

```text
docs/roadmap/PR328_POST_PR327_PILOT_ENTRY_BOUNDARY_RESULT.md
```

The result must include:

- classification;
- whether operational invite-only is sufficient for this pilot;
- whether a DAEDALUS allowlist lane is required;
- exact details MIMIR must collect before real tester entry, if any;
- whether MIMIR should keep internal work moving while waiting;
- next owner recommendation.

Wake MIMIR with `WAKEUP A1:`.
