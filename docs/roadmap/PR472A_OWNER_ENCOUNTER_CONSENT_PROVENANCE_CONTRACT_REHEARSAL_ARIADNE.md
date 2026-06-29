# PR472A - Owner Encounter Consent / Provenance Contract Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted owner-route visual rehearsal

## Why This Rehearsal

ARGUS accepted PR472A:

`docs/roadmap/PR472A_OWNER_ENCOUNTER_CONSENT_PROVENANCE_CONTRACT_REVIEW_RESULT.md`

The remaining proof is the hosted owner-route visual check required by the
PR472 preflight result:

`docs/roadmap/PR472_PERSONA_ENCOUNTER_CONSENT_PROVENANCE_PREFLIGHT_RESULT.md`

This is not a new feature lane. It is the final hosted rehearsal before MIMIR
can close PR472A.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at `96b28b18` or later, or at the
     deploy-equivalent app commit if later commits are docs/state only;
   - the visible UI includes the PR472A Encounter Consent / Provenance contract
     readback.
2. Signed-in owner Studio:
   - open the seeded owner persona Studio home;
   - confirm the owner-only Encounter Consent / Provenance contract readback is
     visible on desktop;
   - confirm the same contract is visible and readable at 390px mobile;
   - confirm the contract says persona-to-persona encounters still have no
     runtime;
   - confirm same-owner consent, cross-owner blockers, provenance labels,
     stop/revocation controls, cost/rate-limit/plan controls, and public/
     shareable moderation/reporting blockers are visible as readback.
3. Signed-out public routes:
   - sample the public persona route for the replay persona while signed out;
   - sample any linked public Space/document route that ARIADNE naturally uses
     in the rehearsal;
   - confirm no public encounter controls, generated encounter output,
     shareable pages, cross-owner controls, anonymous encounter controls, or
     availability claims appear.
4. Visual fit:
   - no horizontal overflow at 390px mobile;
   - no clipped controls, unreadable labels, overlapping text, or broken tap
     targets on the contract readback;
   - the contract reads as a private owner policy surface, not a public product
     launch promise.
5. Safety scan:
   - no private Memory, Archive, Canon, Continuity, Integrity, owner setup,
     private source text, provider settings, credentials, storage paths, raw
     internal ids, stack traces, table names, visitor identity, or secret-shaped
     material appears in sampled UI.

## Out Of Scope

Do not ask for new implementation unless the hosted rehearsal fails.

Do not open encounter runtime, provider calls, generated text, transcript/draft
persistence, storage, queue/worker behavior, schema, migrations, API routes,
billing/token-credit behavior, public routes, public controls, cross-owner
behavior, Redis, Cloudflare, or broad Studio/public redesign.

## Verdicts

Return one of:

```text
PASS
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_BOUNDARY_FAIL
```

If `PASS`, wake MIMIR for PR472A closeout.

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
- ARIADNE completed PR472A hosted owner Encounter Consent / Provenance contract rehearsal.
Verdict:
- PASS | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_BOUNDARY_FAIL
Task:
- Close PR472A or route the smallest repair.
```
