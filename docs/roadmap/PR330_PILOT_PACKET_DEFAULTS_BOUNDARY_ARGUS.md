# PR330 - Pilot Packet Defaults Boundary Review

Owner: ARGUS

Date: 2026-06-26

Status: Complete

## Why This Opens

MIMIR revised PR329 after the wakeup:

```text
WAKEUP A1:
Summary:
- Marty clarifies he does not need to be present for the pilot-entry packet work.
- Do not treat missing Marty presence as a blocker for details MIMIR can safely
  define from repo truth and the accepted pilot constraints.
```

MIMIR filled the PR329 pilot-entry packet with conservative defaults where repo
truth already defines the safe choice. The remaining non-inventable details are
the real signed-in tester account identities and the private feedback channel.

ARGUS should review the revised defaults before any tester contact.

## Inputs

Review:

- `docs/roadmap/PR329_SIGNED_IN_PILOT_ENTRY_PACKET_RESULT.md`
- `docs/roadmap/PR328_POST_PR327_PILOT_ENTRY_BOUNDARY_RESULT.md`
- `docs/roadmap/PR327_NAMED_SIGNED_IN_PILOT_HOSTED_REHEARSAL_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`

## Defaults To Review

MIMIR filled these defaults:

- first wave is three trusted signed-in testers, not five;
- Tester 1 gets one public persona chat plus route navigation;
- Tester 2 gets one public persona report plus route navigation;
- Tester 3 gets read/navigation only;
- Tester 4 and Tester 5 are unused by default;
- tester-facing routes:
  - `/personas/station-replay-alpha-persona`;
  - `/space/station-replay-alpha`;
  - `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`;
  - `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`;
- owner monitor defaults to the replay owner alias used in PR327;
- admin monitor defaults to the admin-capable replay alias used in PR327;
- monitoring cadence is pre-start, after each tester action, closeout, and
  immediate check on any reported confusion, breakage, unsafe behavior, or
  leakage;
- pilot starts only after the three tester account rows are filled and
  instructions are sent;
- pilot stops 60 minutes after instructions are sent, or earlier on any stop
  condition;
- early stop authority is MIMIR, Marty, owner monitor, or admin monitor;
- rollback is coordinated by MIMIR, with the owner monitor disabling public
  persona chat if needed;
- private feedback channel remains the only non-route operational placeholder.

## Review Questions

Classify exactly one:

```text
DEFAULTS ACCEPTED
DEFAULTS NEED REVISION
DAEDALUS ALLOWLIST REQUIRED
BLOCKED ON SAFETY
```

Check whether:

- the three-tester action split is safer than giving every tester chat/report;
- the route set is safe to send once tester identities are filled;
- the 60-minute window is narrow enough for this first wave;
- the monitor and rollback defaults are sufficient under operational
  invite-only;
- the packet still avoids product-enforced named-user allowlist claims;
- the packet still avoids anonymous chat, public launch, commercial/customer/
  partner readiness, durable transcripts, visitor identity analytics,
  Cloudflare, Redis/queue/worker, provider/model, billing, deploy, key, and
  infrastructure expansion;
- the remaining real-person details truly require MIMIR/Marty.

## Hard Limits

Do not:

- contact testers;
- use real tester accounts;
- run hosted mutations;
- change code, schemas, config, Railway, Supabase, Stripe, provider/model,
  Redis, Cloudflare, queue, worker, deploy, key, or database-admin state;
- wake DAEDALUS unless ARGUS classifies `DAEDALUS ALLOWLIST REQUIRED`;
- widen scope beyond the accepted signed-in operational pilot.

## Result Required

Create:

```text
docs/roadmap/PR330_PILOT_PACKET_DEFAULTS_BOUNDARY_RESULT.md
```

Wake MIMIR with:

- classification;
- whether MIMIR can proceed after tester identities and feedback channel are
  supplied;
- any required packet revision;
- whether a DAEDALUS allowlist/access-control lane is required.
