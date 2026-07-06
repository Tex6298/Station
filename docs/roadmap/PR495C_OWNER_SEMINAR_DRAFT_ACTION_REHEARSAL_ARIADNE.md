# PR495C - Owner Seminar Draft Action Hosted Rehearsal

Date: 2026-07-05

Owner: ARIADNE / A4

State: OPEN_HOSTED_REHEARSAL

## Context

ARGUS accepted PR495C with one narrow tier-gate patch:

`docs/roadmap/PR495C_OWNER_SEMINAR_DRAFT_ACTION_REVIEW_RESULT.md`

Implementation record:

`docs/roadmap/PR495C_OWNER_SEMINAR_DRAFT_ACTION_RESULT.md`

PR495C wires the existing `/studio/publishing` Seminar readiness panel to the
hosted-proved PR495B owner records API.

The accepted behavior is:

- load owner records with `GET /events/seminars/records`;
- match existing private drafts to ready candidates by `publicDocumentHref`;
- create or restore drafts with `POST /events/seminars/records` and exactly
  `{ sourceType: "document", sourceId }`;
- swap a successful action to bounded private draft readback;
- creator-gate the visible action with `hasTier(session.user, "creator")`;
- preserve public `/events/seminars` and interest no-drift.

## Task

Run hosted rehearsal against:

`https://stationweb-production.up.railway.app`

Hosted API:

`https://stationapi-production.up.railway.app`

Use desktop plus mobile widths `375px` and `390px`.

Use the existing hosted replay owner account/session. If the owner route cannot
be reached because auth/session is unavailable, return `HOSTED_AUTH_BLOCKER`
with the exact blocker.

## Checks

1. Prove hosted web/API freshness at review commit `6ca19c88` or later. If the
   hosted app has not deployed the ARGUS tier-gate patch, return
   `DEPLOYMENT_WAIT` with the deployed commit shown by the app.

2. Open the owner publishing route through the human Studio flow:
   `/studio` -> `Publish` or top-level Publishing route -> `/studio/publishing`.

3. Verify the Seminar readiness panel is visible, readable, and has no
   horizontal overflow, clipped controls, or incoherent overlap on desktop,
   `375px`, and `390px`.

4. Verify owner record readback:
   - existing private draft records, if present, show bounded private draft
     readback;
   - ready public document candidates without an existing private draft show one
     real draft action for the creator owner;
   - the action copy uses draft/private-draft vocabulary only.

5. Create or restore a seminar draft from a ready candidate:
   - the action should call the accepted owner records API;
   - success should update local readback to private draft state;
   - duplicate action/click/refresh must be stable and must not create duplicate
     visible draft rows.

6. If the hosted owner has no visible candidate without an existing draft, return
   `HOSTED_DATA_ALREADY_DRAFTED_NEEDS_FIXTURE` with the observed bounded state.
   Do not fake a pass.

7. Verify non-creator and signed-out behavior:
   - signed-out `/studio/publishing` redirects or blocks without owner data leak;
   - non-creator users do not see a broken draft action and cannot create owner
     drafts;
   - bounded `Creator required` or equivalent honest unavailable copy is
     acceptable.

8. Verify public `/events/seminars` did not drift on desktop, `375px`, and
   `390px`:
   - signed-out public cards still render or bounded empty/unavailable copy
     remains honest;
   - signed-in interest mark and withdraw still work if tested;
   - public view does not expose owner draft records or owner readiness data.

9. Verify no private/raw/secret/runtime/scope leak:
   - no raw owner id, source id, discussion id, source body, private label,
     SQL, storage path, provider payload, token, cookie/header, IP/user-agent,
     stack trace, secret-shaped value, ticket, payment, RSVP, attendee,
     reminder, room, media, transcript, provider, queue, Redis, Cloudflare,
     billing, host, schedule, public publish, or launch claim appears.

10. Verify no broad UI or product drift:
    - no Discover, public search, Forum moderation, billing, API/schema,
      provider runtime, queue/worker, Redis, Cloudflare, or broad shell change;
    - no Discern global CSS import;
    - no placeholder controls.

## Return Values

Return one of:

```text
PASS_READY_FOR_PR495C_CLOSEOUT
DEPLOYMENT_WAIT
HOSTED_AUTH_BLOCKER
HOSTED_DATA_ALREADY_DRAFTED_NEEDS_FIXTURE
DRAFT_ACTION_RENDER_DEFECT
DRAFT_CREATE_DEFECT
DUPLICATE_STABILITY_DEFECT
CREATOR_GATE_DEFECT
SIGNED_OUT_PROTECTION_DEFECT
PUBLIC_SEMINARS_DRIFT_DEFECT
MOBILE_FIT_DEFECT
PRIVACY_LEAK_DEFECT
PRODUCT_DRIFT_DEFECT
PRODUCT_DEFECT
```

Wake MIMIR with the return value and the concrete proof or blocker.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR495C Owner Seminar Draft Action after a narrow creator-tier gate patch.
- PR495C wires /studio/publishing to the hosted-proved owner seminar records API.
- Hosted proof must cover owner draft create/readback, duplicate stability, creator/signed-out gates, public seminars no-drift, privacy, and mobile fit.
Task:
- Run hosted desktop/375px/390px rehearsal using this document.
- Wake MIMIR with PASS_READY_FOR_PR495C_CLOSEOUT or the concrete blocker/defect.
```
