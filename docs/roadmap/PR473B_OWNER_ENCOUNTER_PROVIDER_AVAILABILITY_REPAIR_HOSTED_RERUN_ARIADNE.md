# PR473B - Owner Encounter Provider Availability Repair Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake ARIADNE

## Why This Rerun

ARIADNE's PR473A hosted rehearsal proved the private owner panel rendered and
same-owner personas were available, but runtime generation returned:

```text
Encounter preview provider setup is unavailable.
```

DAEDALUS repaired that gap in PR473B, and ARGUS accepted the repair:

`docs/roadmap/PR473B_OWNER_ENCOUNTER_PROVIDER_AVAILABILITY_REPAIR_REVIEW_RESULT.md`

This rerun is not a new feature lane. It is the hosted proof needed to decide
whether PR473A/PR473B can close, or whether MIMIR must record a concrete
provider/config blocker.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at `0844e7c` or later, or at the
     deploy-equivalent app commit if later commits are docs/state only;
   - the private Studio owner panel includes PR473B readiness behavior.
2. Signed-in owner readiness:
   - open the seeded owner persona Studio route on desktop;
   - select two personas owned by the signed-in owner;
   - confirm the panel checks provider readiness before generation;
   - if readiness is unavailable, confirm the Generate action is disabled or
     otherwise fail-closed before a provider call, and record the exact visible
     paused/blocker copy.
3. Signed-in owner runtime, only if readiness is available:
   - enter or confirm an owner-authored setup prompt;
   - generate exactly one disposable responder reply;
   - confirm the UI labels owner-authored setup, selected same-owner personas,
     model-generated responder reply, not saved, not a transcript, not
     shareable, and no Memory/Archive/Canon/Continuity/Integrity/transcript or
     public source retrieval;
   - repeat enough of the route at 390px mobile to prove the controls and
     generated preview are visible, readable, and not clipped.
4. Fail-closed provider/config blocker, if readiness is unavailable:
   - treat this as a valid hosted result if the panel is honest before click;
   - do not ask DAEDALUS for more code merely because hosted lacks an accepted
     private-context provider;
   - wake MIMIR with the exact blocker, such as "hosted private-context
     encounter preview has no accepted provider route configured";
   - include any safe, non-secret route/readiness evidence available from the
     UI or network panel.
5. Non-durable behavior:
   - confirm the preview does not present a save/share/publish/export
     affordance;
   - confirm no conversation/thread/document/archive/memory-style readback is
     created or advertised by the UI after generation;
   - confirm starting over or leaving the preview reads as discardable.
6. Signed-out public routes:
   - sample the public persona route for the replay persona while signed out;
   - sample any linked public Space/document route that ARIADNE naturally uses
     in the rehearsal;
   - confirm no public encounter controls, generated encounter output,
     shareable pages, cross-owner controls, anonymous encounter controls, or
     availability claims appear.
7. Visual fit and safety:
   - no horizontal overflow at 390px mobile;
   - no clipped controls, unreadable labels, overlapping text, or broken tap
     targets on the owner readiness/runtime panel;
   - no private Memory, Archive, Canon, Continuity, Integrity, owner setup,
     private source text, provider settings, credentials, storage paths, raw
     internal ids, stack traces, table names, visitor identity, or
     secret-shaped material appears in sampled UI.

## Out Of Scope

Do not open cross-owner encounters, autonomous/background encounters,
multi-turn loops, automatic retries, durable transcripts, generated
documents/posts/comments/threads, public/shareable output, anonymous
encounters, source retrieval, billing/Stripe expansion, Redis, Cloudflare,
queues, workers, migrations, schema, storage, public routes, or broad UI
redesign.

Do not request provider-policy expansion from DAEDALUS. If hosted remains
NVIDIA-only for private context, record the accepted fail-closed blocker for
MIMIR instead.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PROVIDER_CONFIG_BLOCKER_FAIL_CLOSED
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_BOUNDARY_FAIL
```

Use `PASS_READY_TO_CLOSE` only if hosted generates one disposable same-owner
responder reply and all privacy/non-durable/public checks pass.

Use `PROVIDER_CONFIG_BLOCKER_FAIL_CLOSED` if hosted lacks an accepted
private-context provider but PR473B prevents the broken click path and explains
the paused state honestly.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` only if the UI still presents a runnable
path that fails after click, readiness lies, mobile fit breaks, or the bounded
paused state is missing/confusing.

If `DEPLOYMENT_WAITING`, include observed deployed commit/status and wake
MIMIR to wait/recheck.

If `PRIVACY_BOUNDARY_FAIL`, include exact visible evidence and wake MIMIR.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR473B hosted owner encounter provider-readiness rerun.
Verdict:
- PASS_READY_TO_CLOSE | PROVIDER_CONFIG_BLOCKER_FAIL_CLOSED | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_BOUNDARY_FAIL
Task:
- Close PR473A/PR473B, record the provider/config blocker, wait for deploy, or route the smallest repair.
```
