# PR326 - Named Signed-In External Pilot Preflight

Owner: ARGUS

Status: Open

## Decision

MIMIR chooses the next Phase 3 move:

```text
Run a small named external signed-in pilot preflight.
```

This is the next step after PR325 classified the repo as needing a product
boundary decision. MIMIR is making that decision now.

## Why This Opens

The internal protected-alpha evidence is accepted but bounded:

- public persona internal pilot is closed for invited signed-in test scope;
- owner Memory/readback and protected-alpha demo posture are proven;
- public Space -> document -> linked forum discussion is now hosted-proven.

The next useful product move is not another hidden internal cleanup lane and not
anonymous/public launch. It is a controlled external pilot with named signed-in
people so Station can learn from real users without opening the full anonymous,
commercial, or launch-risk surface.

## Pilot Shape

Default pilot shape unless ARGUS finds a blocker:

- 3-5 named trusted testers;
- signed-in only;
- invitation-only;
- one public persona path;
- one public Space/document/discussion path;
- owner aggregate/status readback;
- admin moderation readback;
- no anonymous chat;
- no durable visitor transcripts beyond the already accepted signed-in alpha
  non-storage posture;
- no visitor identity analytics expansion;
- no commercial/customer/partner/public-launch claim.

## ARGUS Task

ARGUS should produce a preflight packet answering:

- Is the named signed-in pilot safe to run with the current accepted surfaces?
- What exact gates must be true before ARIADNE rehearses or real testers enter?
- Which existing surfaces are in scope?
- Which surfaces remain explicitly out of scope?
- What must be monitored by the owner/admin during the pilot?
- What is the smallest success/fail bar?
- Is a DAEDALUS repair required before pilot rehearsal?

Classify the result as one of:

```text
READY WITH GATES
NEEDS DAEDALUS REPAIR
MARTY DETAIL REQUIRED
BLOCKED ON SAFETY
```

Use `NEEDS DAEDALUS REPAIR` only for a concrete code/docs/test defect. Use
`MARTY DETAIL REQUIRED` only if the missing detail cannot be chosen safely by
MIMIR, such as actual tester identities or a real external audience commitment.

## Required Boundary Gates

ARGUS should verify or specify gates for:

- tester access: signed-in and invited only;
- route scope: public persona, public Space/document/discussion, owner readback,
  and admin moderation only;
- retention: no anonymous durable transcript expansion;
- moderation: owner/admin can read aggregate/status and admin queue safely;
- abuse: reports remain available and non-admin boundaries hold;
- privacy: no private Memory, Archive, Continuity, Canon, Integrity, raw event,
  reporter identity, report body, visitor identity, provider payload, token,
  credential, SQL, or raw id leakage in public UI;
- copy: no public launch, production readiness, commercial readiness, partner
  readiness, or generalized all-personas claim;
- rollback: MIMIR can stop the pilot by removing tester access or disabling the
  public persona surface without new infrastructure.

## Non-Goals

Do not open:

- anonymous public chat;
- durable visitor transcripts;
- visitor identity analytics;
- public launch claim;
- commercial/customer/partner packaging;
- live-money billing expansion;
- Cloudflare edge/index/worker commitment;
- Redis/queue/worker job execution;
- provider/model swap;
- repo push/deploy action;
- key rotation or signing-secret creation;
- broad UI redesign.

## Result

Wake MIMIR with:

- classification;
- exact gates;
- exact next owner;
- whether DAEDALUS must repair anything;
- whether ARIADNE should run a hosted human rehearsal before tester entry;
- any concrete detail MIMIR must get from Marty before running the pilot.
