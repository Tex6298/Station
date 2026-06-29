# PR470A - Owner Voice / Avatar Readiness Gate Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted owner-route visual rehearsal

## Why This Rehearsal

ARGUS accepted PR470A:

`docs/roadmap/PR470A_OWNER_VOICE_AVATAR_READINESS_GATE_REVIEW_RESULT.md`

The remaining proof is the hosted owner-route visual check required by the
PR470 preflight result:

`docs/roadmap/PR470_VOICE_AVATAR_PREFLIGHT_RESULT.md`

This is not a new feature lane. It is the final hosted rehearsal before MIMIR
can close PR470A.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at `72488e6b` or later;
   - the visible UI includes the PR470A Voice / Avatar readiness gate.
2. Signed-in owner Studio:
   - open the seeded owner persona Studio home;
   - confirm the owner-only Voice / Avatar readiness gate is visible on desktop;
   - confirm the same gate is visible and readable at 390px mobile;
   - confirm the gate honestly says voice/avatar behavior is not enabled yet;
   - confirm prerequisite provider/media, consent/copyright, storage/privacy,
     cost, rate-limit, and plan decisions are visible as readback/gates.
3. Signed-out public routes:
   - sample the public persona route for the replay persona while signed out;
   - sample any linked public Space/document route that ARIADNE naturally uses
     in the rehearsal;
   - confirm no public voice/avatar controls, availability claims, recording
     affordances, media upload controls, or anonymous audio input appear.
4. Visual fit:
   - no horizontal overflow at 390px mobile;
   - no clipped controls, unreadable labels, overlapping text, or broken tap
     targets on the readiness gate;
   - the gate reads as a private owner readiness surface, not a public product
     launch promise.
5. Safety scan:
   - no private Memory, Archive, Canon, Continuity, Integrity, owner setup,
     private source text, provider settings, credentials, storage paths, raw
     internal ids, stack traces, table names, visitor identity, or secret-shaped
     material appears in sampled UI.

## Out Of Scope

Do not ask for new implementation unless the hosted rehearsal fails.

Do not open realtime voice calls, WebRTC, livestreaming, speech-to-text,
text-to-speech, voice cloning, avatar likeness generation, audio/video upload,
generated media storage, provider media calls, public controls, anonymous audio,
billing, Stripe, Redis, Cloudflare, queues, workers, migrations, schema, API
routes, or broad Studio/public redesign.

## Verdicts

Return one of:

```text
PASS
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_BOUNDARY_FAIL
```

If `PASS`, wake MIMIR for PR470A closeout.

If `PRODUCT_DEFECT_NEEDS_DAEDALUS`, name the smallest owner-route visual or copy
repair.

If `DEPLOYMENT_WAITING`, include the observed deployed commit/status and wake
MIMIR to wait/recheck.

If `PRIVACY_BOUNDARY_FAIL`, include exact visible evidence and wake MIMIR.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR470A hosted owner Voice / Avatar readiness gate rehearsal.
Verdict:
- PASS | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_BOUNDARY_FAIL
Task:
- Close PR470A or route the smallest repair.
```
