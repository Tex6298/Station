# PR495D - Owner Ready Gate Hosted Rehearsal

Date: 2026-07-06

Owner: ARIADNE / A4

State: OPEN_HOSTED_REHEARSAL

## Context

ARGUS accepted PR495D with one narrow API hardening patch:

`docs/roadmap/PR495D_OWNER_READY_GATE_REVIEW_RESULT.md`

Implementation record:

`docs/roadmap/PR495D_OWNER_READY_GATE_RESULT.md`

PR495D is intentionally owner-only. It adds a private ready-for-review gate for
durable seminar records on:

`/studio/publishing`

The accepted behavior is:

- authenticated creator-gated
  `POST /events/seminars/records/:recordId/transition`;
- transition accepts exactly `{ "status": "ready" }` or
  `{ "status": "draft" }`;
- only private `draft` and private `ready` records can transition;
- source ownership, public/published document state, and public Space
  routeability are revalidated before transition;
- `visibility` remains `private`;
- public `/events/seminars`, durable-record public cards, public card ids,
  durable-record interest keys, Discover/search/forum behavior, schema/RLS,
  runtime, billing, queues, Redis, and Cloudflare did not change.

Visible copy must read as a private owner review gate. It must not imply public
publishing, hosting, scheduling, RSVP, ticketing, payment, delivery, or launch
readiness.

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

1. Prove hosted web/API freshness at review commit `06441fb8` or later. If the
   hosted app has not deployed the ARGUS hardening patch, return
   `DEPLOYMENT_WAIT` with the deployed commit shown by the app.

2. Open the owner publishing route through the human Studio flow:
   `/studio` -> `Publish` or top-level Publishing route -> `/studio/publishing`.

3. Verify the Seminar readiness panel is visible, readable, and has no
   horizontal overflow, clipped controls, or incoherent overlap on desktop,
   `375px`, and `390px`.

4. Verify owner record readback:
   - private `draft` records show bounded draft readback and a real
     `Mark ready for review` action for a creator owner;
   - private `ready` records show bounded `Ready for review` readback;
   - ready records show honest copy that the public listing is not live;
   - ready records expose `Return to draft`;
   - no public listing/publish/schedule/host copy appears.

5. Exercise the private ready gate:
   - mark one private draft ready;
   - confirm the transition calls the accepted owner transition API;
   - confirm readback changes to private ready state;
   - return the same record to draft;
   - confirm the same record returns to stable private draft state.

6. Verify duplicate stability:
   - duplicate clicks or refreshes do not create duplicate visible rows,
     duplicate actions, or inconsistent draft/ready copy;
   - the owner record id is not rendered in visible UI.

7. If the hosted owner has no draft/ready record that can be exercised, return
   `HOSTED_DATA_NEEDS_READY_GATE_FIXTURE` with the observed bounded state. Do
   not fake a pass.

8. Verify non-creator and signed-out behavior:
   - signed-out `/studio/publishing` redirects or blocks without owner data
     leak;
   - non-creators cannot transition owner seminar records;
   - non-creators do not see a broken ready/draft transition action.

9. Verify public `/events/seminars` did not drift on desktop, `375px`, and
   `390px`:
   - public cards still come from the accepted source-derived readback;
   - signed-in interest mark and withdraw still work if tested;
   - no durable seminar record appears as a public card;
   - public view does not expose private draft or ready records, owner
     publishing state, or owner readiness data.

10. Verify no private/raw/secret/runtime/scope leak:
    - no raw owner id, source id, discussion id, record id, source body, private
      label, SQL, storage path, provider payload, token, cookie/header,
      IP/user-agent, stack trace, secret-shaped value, ticket, payment, RSVP,
      attendee, reminder, room, media, transcript, provider, queue, Redis,
      Cloudflare, billing, host, schedule, public publish, or launch claim
      appears.

11. Verify no broad UI or product drift:
    - no Discover, public search, Forum moderation, billing, schema/RLS,
      provider runtime, queue/worker, Redis, Cloudflare, or broad shell change;
    - no Discern global CSS import;
    - no placeholder controls.

## Return Values

Return one of:

```text
PASS_READY_FOR_PR495D_CLOSEOUT
DEPLOYMENT_WAIT
HOSTED_AUTH_BLOCKER
HOSTED_DATA_NEEDS_READY_GATE_FIXTURE
READY_GATE_RENDER_DEFECT
READY_TRANSITION_DEFECT
RETURN_TO_DRAFT_DEFECT
DUPLICATE_STABILITY_DEFECT
CREATOR_GATE_DEFECT
SIGNED_OUT_PROTECTION_DEFECT
PUBLIC_SEMINARS_DRIFT_DEFECT
DURABLE_PUBLIC_CARD_DRIFT_DEFECT
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
- ARGUS accepted PR495D Owner Ready Gate after a narrow API owner/current-state hardening patch.
- PR495D is owner-only: private draft to ready and ready to draft, visibility remains private.
- Public /events/seminars, durable public cards, public card ids, durable-record interest keys, schema/RLS, runtime, billing, queues, Redis, and Cloudflare must not drift.
Task:
- Run hosted desktop/375px/390px rehearsal using this document.
- Wake MIMIR with PASS_READY_FOR_PR495D_CLOSEOUT or the concrete blocker/defect.
```
