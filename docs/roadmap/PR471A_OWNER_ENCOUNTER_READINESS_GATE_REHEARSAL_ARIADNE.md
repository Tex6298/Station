# PR471A - Owner Encounter Readiness Gate Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted owner-route visual rehearsal

## Why This Rehearsal

ARGUS accepted PR471A:

`docs/roadmap/PR471A_OWNER_ENCOUNTER_READINESS_GATE_REVIEW_RESULT.md`

The remaining proof is the hosted owner-route visual check required by the
PR471 preflight result:

`docs/roadmap/PR471_PERSONA_TO_PERSONA_ENCOUNTERS_PREFLIGHT_RESULT.md`

This is not a new feature lane. It is the final hosted rehearsal before MIMIR
can close PR471A.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at `cfd22df7` or later, or at the
     deploy-equivalent app commit if later commits are docs/state only;
   - the visible UI includes the PR471A Persona Encounter readiness gate.
2. Signed-in owner Studio:
   - open the seeded owner persona Studio home;
   - confirm the owner-only Persona Encounter readiness gate is visible on
     desktop;
   - confirm the same gate is visible and readable at 390px mobile;
   - confirm the gate honestly says persona-to-persona encounters are not
     enabled yet;
   - confirm prerequisite consent, provenance, moderation, reporting,
     stop/revocation, cost, rate-limit, and plan decisions are visible as
     readback/gates.
3. Signed-out public routes:
   - sample the public persona route for the replay persona while signed out;
   - sample any linked public Space/document route that ARIADNE naturally uses
     in the rehearsal;
   - confirm no public encounter controls, persona-to-persona chat claims,
     generated encounter output, shareable encounter pages, anonymous encounter
     controls, or public availability claims appear.
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

Do not open autonomous persona-to-persona chat, background conversations,
scheduled encounters, agent loops, provider-call loops, generated encounter
text, durable transcripts, generated posts/documents/comments/threads, storage,
cross-owner behavior, public encounter pages, public encounter feeds, anonymous
participation, billing, token-credit behavior, Redis, Cloudflare, queues,
workers, migrations, schema, API routes, or broad Studio/public redesign.

## Verdicts

Return one of:

```text
PASS
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_BOUNDARY_FAIL
```

If `PASS`, wake MIMIR for PR471A closeout.

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
- ARIADNE completed PR471A hosted owner Persona Encounter readiness gate rehearsal.
Verdict:
- PASS | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_BOUNDARY_FAIL
Task:
- Close PR471A or route the smallest repair.
```
