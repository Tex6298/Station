# PR473A - Owner-Initiated Encounter Runtime Preview Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted owner-route runtime rehearsal

## Why This Rehearsal

ARGUS accepted PR473A:

`docs/roadmap/PR473A_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREVIEW_REVIEW_RESULT.md`

The remaining proof is the hosted owner-route visual/runtime check required by
the PR473 preflight result:

`docs/roadmap/PR473_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREFLIGHT_RESULT.md`

This is not a broad feature expansion. It is the final hosted rehearsal before
MIMIR can close PR473A.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at `2ba1ea88` or later, or at the
     deploy-equivalent app commit if later commits are docs/state only;
   - the visible UI includes the PR473A owner-initiated encounter runtime
     preview.
2. Signed-in owner runtime:
   - open the seeded owner persona Studio route on desktop;
   - select two personas owned by the signed-in owner;
   - enter or confirm an owner-authored setup prompt;
   - generate exactly one disposable preview response;
   - confirm the UI labels owner-authored setup, selected same-owner personas,
     model-generated responder reply, not saved, not a transcript, not
     shareable, and no Memory/Archive/Canon/Continuity/Integrity/transcript or
     public source retrieval;
   - repeat enough of the route at 390px mobile to prove the controls and
     generated preview are visible, readable, and not clipped.
3. Non-durable behavior:
   - confirm the preview does not present a save/share/publish/export affordance;
   - confirm no conversation/thread/document/archive/memory-style readback is
     created or advertised by the UI after generation;
   - confirm starting over or leaving the preview reads as discardable.
4. Signed-out public routes:
   - sample the public persona route for the replay persona while signed out;
   - sample any linked public Space/document route that ARIADNE naturally uses
     in the rehearsal;
   - confirm no public encounter controls, generated encounter output,
     shareable pages, cross-owner controls, anonymous encounter controls, or
     availability claims appear.
5. Visual fit and safety:
   - no horizontal overflow at 390px mobile;
   - no clipped controls, unreadable labels, overlapping text, or broken tap
     targets on the owner runtime panel;
   - no private Memory, Archive, Canon, Continuity, Integrity, owner setup,
     private source text, provider settings, credentials, storage paths, raw
     internal ids, stack traces, table names, visitor identity, or secret-shaped
     material appears in sampled UI.

If hosted data does not include two same-owner personas, return
`PRODUCT_DEFECT_NEEDS_DAEDALUS` and name the smallest seed/route repair needed
for the rehearsal.

## Out Of Scope

Do not ask for new implementation unless the hosted rehearsal fails.

Do not open cross-owner encounters, autonomous/background encounters, multi-turn
loops, automatic retries, durable transcripts, generated documents/posts/
comments/threads, public/shareable output, anonymous encounters, source
retrieval, billing/Stripe expansion, Redis, Cloudflare, queues, workers,
migrations, schema, storage, public routes, or broad UI redesign.

## Verdicts

Return one of:

```text
PASS
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_BOUNDARY_FAIL
```

If `PASS`, wake MIMIR for PR473A closeout.

If `PRODUCT_DEFECT_NEEDS_DAEDALUS`, name the smallest hosted owner-route
runtime or seed repair.

If `DEPLOYMENT_WAITING`, include the observed deployed commit/status and wake
MIMIR to wait/recheck.

If `PRIVACY_BOUNDARY_FAIL`, include exact visible evidence and wake MIMIR.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR473A hosted owner encounter runtime preview rehearsal.
Verdict:
- PASS | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_BOUNDARY_FAIL
Task:
- Close PR473A or route the smallest repair.
```
