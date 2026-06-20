# PR88 - Community Review Request UI First Slice

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE rehearses visible participant
and admin routes after ARGUS technical acceptance.
Status: implemented by DAEDALUS; awaiting ARGUS review

## Why This Lane

PR87 added durable moderation review request schema and API routes, but kept
the product invisible. That was correct: review requests should not appear in
the UI until the database contract, requester standing, serializers, and admin
queue behavior exist.

Now they do. PR88 should add the smallest visible workflow that proves the
contract without expanding into a public moderation log, moderation-action
appeals, subcommunities, notifications, or broad forum redesign.

## Goal

Make moderation review requests usable and honest in the web app.

Desired protected-beta outcome:

- reporters can request review from their own eligible `/forums/reports` rows
  when PR87 standing supports it;
- participants can read their own review-request statuses and safe resolution
  summaries;
- target authors can request review for their own thread/comment target only if
  DAEDALUS can add the affordance without confusing it with public report
  controls;
- admins can view and update review requests through an admin-only moderation
  surface;
- admin notes stay admin-only and participant resolution summaries stay
  participant-safe;
- unsupported target types, missing standing, and moderation-action-linked
  appeals are visibly unavailable rather than fake-live.

## DAEDALUS Implementation

Implemented the first visible review-request workflow backed only by PR87 API
routes.

Participant route:

- `/forums/reports` now fetches both `/reports/mine` and
  `/reports/review-requests/mine` only after a local signed-in session exists;
- eligible thread/comment report rows show `Request review`;
- unsupported user/space/document/persona report rows show an unavailable state
  instead of a fake-live button;
- successful or duplicate request creation merges the returned participant-safe
  review request into the local list;
- existing review requests show status and participant-safe resolution summary
  only;
- no admin notes, moderator identity, target bodies, private material, or other
  users' requests are shown.

Admin route:

- `/forums/moderation` now includes a separate admin-only Review requests
  section after admin authorization is known;
- the section fetches admin `GET /reports/review-requests`, supports active or
  explicit status filters, and updates requests through
  `PATCH /reports/review-requests/:id`;
- review-request status controls are visually and logically separate from report
  status controls and target moderation actions;
- admin notes and participant-safe resolution summaries are displayed separately.

Supported affordances:

- reporter review requests for eligible thread/comment reports;
- participant readback for the signed-in user's own review requests;
- admin queue/readback and status updates for `reviewing`, `upheld`, `denied`,
  and `dismissed`.

Deferred/unavailable:

- target-author affordances outside `/forums/reports` are deferred to avoid
  confusing report controls with public target controls;
- moderation-action-linked appeals remain unavailable until the PR87 action-link
  blocker is solved;
- unsupported target types remain unavailable in the UI.

No public moderation log, public visibility widening, participant admin-note or
moderator-identity exposure, target mutation as part of review status updates,
subcommunity platform, delegated moderator model, notifications,
reputation/witness mechanics, AI posting, billing/provider/cache, Developer
Space, auth/session refactor, or broad forum redesign was added.

## Inspect Before Editing

- `apps/web/app/forums/reports/page.tsx`
- `apps/web/app/forums/moderation/page.tsx`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/moderation-console.ts`
- `apps/web/lib/moderation-console.test.ts`
- `apps/web/app/forums/*`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `packages/types/src/forum.ts`
- `docs/roadmap/PR85_COMMUNITY_REPORT_RESOLUTION_READBACK.md`
- `docs/roadmap/PR86_COMMUNITY_MODERATION_TARGET_CONTEXT_ACTIONS.md`
- `docs/roadmap/PR87_COMMUNITY_APPEALS_REQUEST_REVIEW_FOUNDATION.md`
- `docs/roadmap/community-beta.md`

## Preferred Implementation Path

1. Start with API-client helpers for the PR87 routes:
   - `POST /reports/review-requests`;
   - `GET /reports/review-requests/mine`;
   - admin `GET /reports/review-requests`;
   - admin `PATCH /reports/review-requests/:id`.
2. Extend `/forums/reports` first:
   - fetch `/reports/mine` and `/reports/review-requests/mine` only for
     signed-in users;
   - show the user's review requests as status readback, not as a public appeal
     log;
   - add a bounded `Request review` action only for thread/comment reports that
     the API accepts;
   - after a successful create or duplicate response, refresh or merge the
     returned review request visibly;
   - show API standing errors as calm unavailable states.
3. Add the admin surface:
   - either a review-request section in `/forums/moderation` or a clearly linked
     admin-only route under moderation;
   - fetch review requests only after admin state is known;
   - support status filter/readback and admin updates for reviewing/upheld/
     denied/dismissed;
   - keep admin notes visually separate from participant-safe resolution
     summaries.
4. Add target-author affordances only if narrow and obvious. If the route work
   would blur report controls, defer it and document the blocker.
5. Keep copy plain: this is "request review" and status readback, not a court,
   public drama board, or guaranteed reversal.

## Guardrails

- No visible review request UI unless backed by PR87 API calls.
- No moderation-action appeal UI until the PR87 action-link blocker is solved.
- No public moderation log.
- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No participant access to admin notes, moderator identities, private target
  bodies, moderation internals, or other users' requests.
- No target mutation as part of review-request status updates.
- No subcommunity platform, delegated moderator model, notifications,
  reputation, witness mechanics, or AI-autonomous posting.
- No Stripe, Redis/Upstash, provider/model, Cloudflare, worker, parser/OAuth,
  Project/DexOS, hosted runtime, billing, or broad UI redesign.

## Acceptance

ARGUS can accept PR88 if:

- signed-out users cannot fetch review request data;
- participants only see their own review requests;
- unsupported target types and missing standing are visibly unavailable, not
  fake-live;
- `Request review` creates or idempotently returns PR87 rows and does not send
  participant-controlled admin fields;
- admin review queue/update UI fetches only for admins;
- admin notes and moderator identity do not leak to participant routes;
- moderation report status actions remain separate from review request actions;
- tests cover the new web helpers/state logic and existing API gates remain
  green.

ARIADNE must rehearse visible routes after ARGUS technical acceptance.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Also run the web build because visible forum routes change:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known local Windows standalone symlink `EPERM` remains acceptable only
after the web build compiles, lints/typechecks, collects page data, and
generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- participant route summary;
- admin route summary;
- supported and unsupported review request affordances;
- data fields shown to participant versus admin;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE if accepted. ARIADNE should wake MIMIR if visible
routes pass, or DAEDALUS with exact defects if they do not. Do not leave the
lane asleep.
