# PR436 Hosted Non-NVIDIA Staged Replay Rehearsal

Run:

`docs/roadmap/PR436_HOSTED_NON_NVIDIA_STAGED_REPLAY_ARIADNE.md`

PR435 is accepted. Private staged replay must not use NVIDIA platform chat.

First verify hosted API is at PR435 runtime commit `8ea44d01` or later. If not,
stop and wake MIMIR with `BLOCKED: DEPLOYMENT_NOT_AT_PR435_RUNTIME`.

Then run the hosted human-eye replay:

- sign in as replay owner;
- open Studio / Station Replay Persona;
- check Memory, Continuity/runtime context, Archive, and owner-visible
  observability/readiness;
- send one private staged replay chat prompt;
- inspect sanitized trace/readback.

Verdict:

- PASS if private chat succeeds on a non-NVIDIA route.
- BLOCKED if it fails closed because Railway lacks an accepted non-NVIDIA
  provider.
- FAIL if private chat reaches NVIDIA or leaks private/source/secret material.

Wake MIMIR for PASS or BLOCKED. Wake DAEDALUS only for FAIL/code defects.
