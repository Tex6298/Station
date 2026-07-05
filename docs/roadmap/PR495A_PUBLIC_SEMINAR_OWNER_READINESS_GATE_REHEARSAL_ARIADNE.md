# PR495A - Public Seminar Owner Readiness Gate Hosted Rehearsal

Date: 2026-07-05

Owner: ARIADNE / A4

State: OPEN_HOSTED_REHEARSAL

## Context

ARGUS accepted PR495A with one narrow routeability patch:

`docs/roadmap/PR495A_PUBLIC_SEMINAR_OWNER_READINESS_GATE_REVIEW_RESULT.md`

Implementation record:

`docs/roadmap/PR495A_PUBLIC_SEMINAR_OWNER_READINESS_GATE_RESULT.md`

PR495A adds a readback-only owner seminar readiness gate on:

`/studio/publishing`

The panel uses the already-loaded owner documents and Spaces on the Publishing
Dashboard. It counts only public published documents in routeable public Spaces,
and linked discussion readiness is metadata-only from `discussion_thread_id`.

It does not add seminar persistence, scheduling, RSVP, tickets, payments,
reminders, live rooms, media, recordings, transcripts, provider/runtime work,
queue/worker behavior, Redis, Cloudflare, billing, public search, Discover
curation, or public `/events/seminars` behavior.

## Task

Run hosted rehearsal against:

`https://stationweb-production.up.railway.app`

Use desktop plus mobile widths `375px` and `390px`.

Use the existing hosted owner replay account/session. If the owner route cannot
be reached because auth/session is unavailable, return `HOSTED_AUTH_BLOCKER`
with the exact blocker.

## Checks

1. Prove hosted web/API freshness at code commit `1afa30b3` or later. If the
   hosted app has not deployed the ARGUS routeability patch, return
   `DEPLOYMENT_WAIT` with the deployed commit shown by the app.

2. Open the owner publishing route through the human Studio flow:
   `/studio` -> `Publish` or top-level Publishing route -> `/studio/publishing`.

3. Verify the Seminar readiness panel is visible, readable, and has no
   horizontal overflow, clipped controls, or incoherent overlap on desktop,
   `375px`, and `390px`.

4. Verify the panel is readback-only:
   - no create seminar button;
   - no schedule/host/propose/RSVP/ticket/payment/waitlist/reminder control;
   - no live room, media, recording, transcript, provider, queue, Redis,
     Cloudflare, or launch-readiness claim.

5. Verify candidate and gap readback:
   - public published documents in routeable public Spaces count as candidates;
   - draft, archived, private, community, unlisted, no-Space, private-Space,
     UUID-shaped Space slug, and unsafe Space slug material does not count;
   - if hosted data has no candidates, the empty/gap state is honest and bounded.

6. Verify candidate links, if candidates are visible:
   - document links stay on existing public document routes;
   - Space links stay on existing public Space routes;
   - no href exposes raw UUID-shaped public Space slugs, source IDs, owner IDs,
     persona IDs, private storage paths, or secret-shaped values.

7. Verify linked discussion readiness remains metadata-only:
   - the panel may say linked discussion metadata exists;
   - it must not display private discussion bodies, moderation bodies, raw
     thread IDs, hidden comments, removed comments, private source bodies, or
     forum implementation details.

8. Verify public `/events/seminars` did not drift on desktop, `375px`, and
   `390px`:
   - signed-out users still see the accepted public readback surface or bounded
     unavailable/empty state;
   - signed-in users still see aggregate/viewer-local interest readback if
     tested;
   - the public page does not expose owner readiness, private documents, private
     Spaces, private archive material, raw IDs, source bodies, provider payloads,
     tokens, cookies, headers, IP/user-agent values, stack traces, SQL, or
     secret-shaped values;
   - interest copy remains honest that this is not ticketing, booking,
     waitlisting, reminders, payment, attendance, or delivery guarantee.

9. Verify signed-out users cannot reach `/studio/publishing`. They should be
   redirected or blocked by the existing protected-route behavior without
   leaking owner readiness data.

10. Confirm no broad UI or product drift entered the hosted surface:
    - no Discover/public search/Forum moderation behavior changes;
    - no broad Studio shell/sidebar/topbar replacement;
    - no Discern global CSS import;
    - no launch, production, provider architecture, billing, Redis, Cloudflare,
      queue, worker, or runtime-readiness claim.

## Return Values

Return one of:

```text
PASS_READY_FOR_PR495A_CLOSEOUT
DEPLOYMENT_WAIT
HOSTED_AUTH_BLOCKER
READINESS_PANEL_RENDER_DEFECT
READINESS_CANDIDATE_GATE_DEFECT
READINESS_LINK_ROUTE_DEFECT
DISCUSSION_METADATA_LEAK_DEFECT
PUBLIC_SEMINARS_DRIFT_DEFECT
SIGNED_OUT_PROTECTION_DEFECT
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
- ARGUS accepted PR495A Owner Seminar Readiness Gate after a narrow routeability patch.
- PR495A adds a readback-only owner gate on /studio/publishing over already-loaded owner documents and Spaces.
- Public /events/seminars must not drift.
Task:
- Run hosted desktop/375px/390px rehearsal using this document.
- Wake MIMIR with PASS_READY_FOR_PR495A_CLOSEOUT or the concrete blocker/defect.
```
