# PR495F - Owner Seminar Publish/Rollback Hosted Rehearsal

Date: 2026-07-06

Owner: ARIADNE / A4

State: OPEN_HOSTED_REHEARSAL

## Context

ARGUS accepted PR495F after applying one narrow duplicate-stability patch:

`docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_REVIEW_RESULT.md`

Implementation record:

`docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_RESULT.md`

PR495F is intentionally owner-only. It adds publish/rollback eligibility for
durable seminar records on:

`/studio/publishing`

The accepted behavior is:

- authenticated creator-gated
  `POST /events/seminars/records/:recordId/transition`;
- transition bodies contain exactly `{ "status": "published" }`,
  `{ "status": "ready" }`, or the already accepted draft/ready values;
- `ready` + `private` records publish to `published` + `public`;
- `published` + `public` records roll back to `ready` + `private`;
- duplicate/self transitions are retry-safe for accepted owner states;
- publish revalidates owner/source authority, public/published source state,
  public Space routeability, and PR495E serializer compatibility;
- rollback does not require source routeability because it reduces public
  eligibility;
- public `/events/seminars` and public interest mark/withdraw remain
  source-derived and unwired from durable records;
- migrations/RLS/schema, billing, provider runtime, queues/workers, Redis,
  Cloudflare, hosting, scheduling, RSVP, tickets, payments, reminders, rooms,
  media, transcripts, and launch claims did not change.

Visible copy must say the public listing is pending or not live yet. It must
not imply public durable readback, hosting, scheduling, RSVP, ticketing,
payment, delivery, or launch readiness.

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

1. Prove hosted web/API freshness at review commit `b991662c` or later. If the
   hosted app has not deployed the ARGUS duplicate-stability patch, return
   `DEPLOYMENT_WAIT` with the deployed commit shown by the app.

2. Open the owner publishing route through the human Studio flow:
   `/studio` -> `Publish` or top-level Publishing route -> `/studio/publishing`.

3. Verify the Seminar readiness panel is visible, readable, and has no
   horizontal overflow, clipped controls, or incoherent overlap on desktop,
   `375px`, and `390px`.

4. Verify owner record readback:
   - private `ready` records show a bounded publish action for a creator owner;
   - private `ready` records keep `Return to draft`;
   - published/public records show bounded public-record readback;
   - published/public records show `Public listing pending` or equivalent
     not-live copy;
   - published/public records expose `Return to ready`;
   - no raw record/source/owner/discussion id is visible.

5. Exercise owner publish:
   - publish one private ready seminar record;
   - confirm the transition calls the accepted owner transition API with only
     `{ "status": "published" }`;
   - confirm readback changes to `published` + `public`;
   - confirm visible copy says public listing is pending or not live yet.

6. Verify duplicate publish stability:
   - duplicate clicks or retries do not create duplicate visible rows,
     duplicate actions, inconsistent copy, or user-facing product errors;
   - the duplicate publish remains bounded and retry-safe.

7. Exercise owner rollback:
   - return the same published/public record to ready/private;
   - confirm the transition calls the accepted owner transition API with only
     `{ "status": "ready" }`;
   - confirm readback changes to private ready state.

8. Verify duplicate rollback stability:
   - duplicate clicks or retries do not create duplicate visible rows,
     duplicate actions, inconsistent copy, or user-facing product errors;
   - the duplicate rollback remains bounded and retry-safe.

9. If the hosted owner has no ready/published seminar record that can be
   exercised, return `HOSTED_DATA_NEEDS_PUBLISH_ROLLBACK_FIXTURE` with the
   observed bounded state. Do not fake a pass.

10. Verify non-creator and signed-out behavior:
    - signed-out `/studio/publishing` redirects or blocks without owner data
      leak;
    - non-creators cannot publish or roll back owner seminar records;
    - non-creators do not see a broken publish/rollback action.

11. Verify public `/events/seminars` did not drift on desktop, `375px`, and
    `390px`:
    - public cards still come from the accepted source-derived readback;
    - signed-in interest mark and withdraw still work if tested;
    - no durable seminar record appears as a public card yet;
    - public view does not expose private ready records, published eligibility
      internals, owner publishing state, or owner readiness data.

12. Verify no private/raw/secret/runtime/scope leak:
    - no raw owner id, source id, discussion id, record id, source body,
      private label, SQL, storage path, provider payload, token,
      cookie/header, IP/user-agent, stack trace, secret-shaped value, ticket,
      payment, RSVP, attendee, reminder, room, media, transcript, provider,
      queue, Redis, Cloudflare, billing, host, schedule, durable public
      readback, or launch claim appears.

13. Verify no broad UI or product drift:
    - no Discover, public search, Forum moderation, billing, schema/RLS,
      provider runtime, queue/worker, Redis, Cloudflare, or broad shell change;
    - no Discern global CSS import;
    - no placeholder controls.

## Return Values

Return one of:

```text
PASS_READY_FOR_PR495F_CLOSEOUT
DEPLOYMENT_WAIT
HOSTED_AUTH_BLOCKER
HOSTED_DATA_NEEDS_PUBLISH_ROLLBACK_FIXTURE
PUBLISH_ACTION_RENDER_DEFECT
PUBLISH_TRANSITION_DEFECT
DUPLICATE_PUBLISH_STABILITY_DEFECT
ROLLBACK_TRANSITION_DEFECT
DUPLICATE_ROLLBACK_STABILITY_DEFECT
CREATOR_GATE_DEFECT
SIGNED_OUT_PROTECTION_DEFECT
PUBLIC_SEMINARS_DRIFT_DEFECT
PUBLIC_INTEREST_DRIFT_DEFECT
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
- ARGUS accepted PR495F Owner Seminar Publish/Rollback Gate after a narrow duplicate-stability patch.
- PR495F remains owner-only: ready/private publishes to published/public, and published/public rolls back to ready/private.
- Public /events/seminars and interest routes remain source-derived and unwired from durable records; visible owner copy must say public listing is pending/not live yet.
Task:
- Run hosted desktop/375px/390px rehearsal using this document.
- Wake MIMIR with PASS_READY_FOR_PR495F_CLOSEOUT or the concrete blocker/defect.
```
