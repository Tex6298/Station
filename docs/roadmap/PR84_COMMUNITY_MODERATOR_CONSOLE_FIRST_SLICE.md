# PR84 - Community Moderator Console First Slice

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS implements if the current APIs are enough, ARGUS reviews.
ARIADNE rehearses visible moderator/admin routes after ARGUS technical review.
Status: ARIADNE visible-route rehearsal accepted; ready for MIMIR closeout

## Why This Lane

PR78 through PR83 protected Community Beta's API/report primitives, provenance
labels, participation gates, smoke coverage, and visible forum route defects.
The remaining gap with the clearest next product value is the full
moderator/admin console UX: admins can now read and update report queues by API,
and thread/comment moderation action routes exist, but there is not yet a
usable web surface for reviewing reports without dropping into raw API calls.

Stripe test config and Upstash operational cache are available in the current
Railway runtime, but they are not inputs to this lane. PR84 should use the
existing community/report/moderation primitives, not reopen billing, Redis,
provider, Cloudflare, or queue scope.

## Goal

Create the first narrow moderator/admin web surface for Community Beta.

The desired protected-alpha outcome:

- admins can see a bounded report queue;
- admins can filter or distinguish report status and target type where the API
  already supports it;
- admins can move a report through the existing safe statuses, such as
  `reviewing`, `resolved`, and `dismissed`;
- the UI links or points to the reported thread/comment/document context when
  the current response safely supports it;
- non-admin and anonymous users do not receive a functional moderation console;
- public readers never see report notes, moderation reasons, hidden material,
  or admin-only action logs.

## DAEDALUS Implementation

Implemented the first web moderator console slice at:

```text
/forums/moderation
```

Behavior:

- anonymous users and signed-in non-admin users see an admin-required state and
  do not fetch the report queue;
- admins load the existing authenticated `/reports` queue with bounded filters
  for active/open/reviewing/resolved/dismissed status and target type;
- admins can transition reports through the existing API statuses:
  `reviewing`, `resolved`, and `dismissed`;
- target context is shown as safe `targetType:targetId` text only, because the
  accepted report API does not yet return safe category/document route slugs;
- admin notes are shown only inside this admin-gated route, using the accepted
  admin report API response;
- target hide/remove/restore controls are deferred to a follow-up because PR84
  can be accepted as queue/status only and should not mix target mutations into
  the first console slice.

Added pure web helper coverage for admin-only access, report queue paths, target
labels that do not invent route context, and status transitions. Wired the new
helper test into `test:studio-ui`.

No schema, API behavior, target moderation action, public route, broad forum
redesign, subcommunity platform, appeals workflow, notification system,
reputation/witness mechanics, AI posting, billing/provider/cache, Developer
Space, auth/session refactor, or public visibility-widening work was added.

## ARGUS Technical Review

Accepted on 2026-06-19 for ARIADNE visible-route rehearsal.

ARGUS confirmed:

- anonymous and non-admin users return before the report queue is fetched;
- admin queue reads and status updates use the existing `/reports` API;
- report notes are rendered only inside the admin-gated route;
- target context remains safe `targetType:targetId` text instead of guessed
  links;
- target hide/remove/restore controls are explicitly deferred.

ARGUS added one small queue-state hardening before acceptance: when an admin
changes a report status, the updated report is removed from the current queue if
it no longer matches the selected status/target filters. This keeps the active
view from displaying resolved or dismissed rows until manual refresh.

Because PR84 adds a visible admin route, ARIADNE should rehearse
`/forums/moderation` before MIMIR closes the lane.

## ARIADNE Visible-Route Rehearsal

Accepted on 2026-06-19.

ARIADNE rehearsed `/forums/moderation` on local HEAD because Railway health was
still on DAEDALUS's implementation commit while ARGUS's queue-state hardening
was present only at repo HEAD. The local web server used the live API URL, but
browser-level mocks supplied `/auth/me` and `/reports` responses so no live
moderation records were read or mutated.

Desktop and 390px mobile checks passed:

- anonymous users saw the admin-required state, did not see queue material, and
  did not fetch reports;
- signed-in non-admin users saw the admin-required state, did not see queue
  material, and did not fetch reports;
- mocked admins saw the moderation queue, status/target filters, safe
  `targetType:targetId` context, admin-only notes, and report status actions;
- marking an active report `resolved` removed it from the active queue view;
- no target hide/remove/restore action appeared in this first slice;
- no document-level horizontal overflow or offscreen primary controls appeared
  on desktop or 390px mobile.

Validation before the ad hoc browser runner was removed:

```bash
node --check scripts/tmp-pr84-ariadne-moderation-rehearsal.mjs
node scripts/tmp-pr84-ariadne-moderation-rehearsal.mjs
```

No additional PR84 visible-route defect remains from ARIADNE's pass.

## Inspect Before Editing

- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/app/forums/*`
- `apps/web/app/settings/*`
- `apps/web/lib/api-client.ts`
- `packages/types/src/forum.ts`
- `docs/roadmap/community-beta.md`
- `docs/roadmap/PR78_COMMUNITY_MODERATION_PROVENANCE_FIRST_SLICE.md`
- `docs/roadmap/PR79_COMMUNITY_MODERATION_QUEUE_READBACK.md`
- `docs/roadmap/PR83_COMMUNITY_FORUM_UX_REHEARSAL_ARIADNE.md`

## Preferred Implementation Path

1. Reuse the accepted `/reports` API before adding schema or new API behavior.
2. Add the smallest admin-only web route that fits the current navigation. A
   route under forums or settings is acceptable if the route and copy make clear
   this is a moderator/admin tool, not a public community page.
3. Show a bounded queue with:
   - report status;
   - target type;
   - reason/category;
   - created/reviewed state;
   - admin-only notes only if already returned by the admin API;
   - safe target context or a route link when the API response contains enough
     information.
4. Wire status updates through the existing authenticated server route.
5. If target hide/remove/restore controls are cheap and already proven by the
   existing thread/comment moderation routes, DAEDALUS may add them as clearly
   separated actions. If not, keep PR84 to queue/status only and leave target
   moderation controls for a follow-up.
6. Add focused tests for route visibility, report status updates, and helper
   behavior. Do not rely on manual clicking only.
7. Wake ARGUS with the exact route, access rules, changed files, validation,
   and whether ARIADNE must rehearse the visible admin route.

If the current API response is missing a required field, do not fake it with
client guesses. Wake MIMIR with the exact missing field and recommended next
API slice.

## Guardrails

- No subcommunity platform.
- No appeals workflow beyond status/readback language that current APIs prove.
- No notifications, reputation, witness mechanics, or AI-autonomous posting.
- No broad forum redesign or visual reskin.
- No public visibility widening.
- No client-only admin permission grants.
- No Stripe, Redis/Upstash, provider/model, Cloudflare, worker, parser/OAuth,
  Project/DexOS, hosted runtime, or billing work.
- No secrets, raw auth headers, cookies, Stripe objects, webhook bodies, owner
  IDs, private archive text, prompts, completions, or provider payloads in docs
  or UI.
- No public display of report notes, moderation reasons, hidden comments,
  hidden threads, or admin-only action logs.

## Acceptance

ARGUS can accept PR84 if:

- anonymous and non-admin users cannot use the moderator console;
- admin reads and status updates are server-authoritative and use the existing
  authenticated API;
- report queue state is understandable without exposing private/admin-only
  material publicly;
- any target links or actions preserve existing forum/document visibility;
- status updates do not mutate target visibility unless DAEDALUS explicitly
  wires an already accepted moderation action route with tests;
- the implementation does not smuggle in Redis, Stripe, provider, Cloudflare,
  worker, subcommunity, appeals, notifications, or broad UI scope.

ARIADNE should rehearse after ARGUS technical acceptance because PR84 changes a
visible admin/moderator route.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If frontend helpers or route rendering change, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known local Windows standalone symlink `EPERM` remains acceptable only
after the web build compiles, lints/typechecks, collects page data, and
generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- implementation or blocker summary;
- route chosen;
- admin/non-admin/anonymous behavior;
- report/status behavior;
- whether target moderation actions were included or deferred;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE for visible-route rehearsal if the implementation is
technically acceptable, or wake DAEDALUS with exact defects. ARIADNE should
wake MIMIR only after the moderator/admin route passes or a remaining defect is
assigned.
