# PR89 - Community Notifications Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements if current schema/API can support the foundation,
ARGUS reviews. ARIADNE rehearses only if a visible route changes.
Status: accepted by ARGUS; ready for MIMIR closeout/sequencing

## Why This Lane

Community Beta now has protected forum primitives, moderation reports, admin
moderation actions, reporter readback, review request schema/API, and visible
review request UI. The next open loop is notification: users can participate,
report, and request review, but the app has no durable way to tell them about
new activity or moderation/review outcomes.

PR89 should add the foundation only. This is not email, push, realtime,
WebSocket/SSE, digest jobs, or a broad notification-center redesign.

## Goal

Add a durable in-app notification/watch foundation for Community Beta.

Desired protected-beta outcome:

- users can watch or unwatch eligible forum threads;
- new comments can create in-app notification rows for the thread author and
  watchers, excluding the acting user;
- moderation report status updates and review request status updates can create
  participant-safe notification rows for the affected participant;
- users can read their own notifications, filter unread/all, and mark one or
  all as read;
- notification serializers return safe labels and route hints without hidden
  target bodies, admin notes, moderator identities, private material, or other
  users' notifications;
- admin-only moderation internals remain admin-only.

## Inspect Before Editing

- `infra/supabase/migrations/004_forum_seed_and_helpers.sql`
- `infra/supabase/migrations/024_community_trust_votes_moderation.sql`
- `infra/supabase/migrations/039_moderation_review_requests.sql`
- `packages/db/src/types.ts`
- `packages/types/src/forum.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/services/community.service.ts`
- `apps/web/app/forums/*`
- `apps/web/lib/api-client.ts`
- `docs/roadmap/community-beta.md`
- `docs/roadmap/PR88_COMMUNITY_REVIEW_REQUEST_UI_FIRST_SLICE.md`

## Preferred Implementation Path

1. Start schema-first with a new migration after the current highest migration
   number.
2. Prefer two durable tables:
   - `community_thread_watches` keyed by user/thread, with created/muted state;
   - `community_notifications` keyed by recipient, type, target refs, safe
     title/summary, route hint, read timestamp, and created timestamp.
3. Add DB/types and shared DTO surfaces.
4. Add API routes for the minimum in-app contract:
   - watch/unwatch/read watch state for a thread;
   - list current user's notifications with unread/all filter and bounded limit;
   - mark one notification read;
   - mark all current user's notifications read.
5. On comment creation, create notification rows for:
   - the thread author if they are not the commenter;
   - thread watchers if they are not the commenter;
   - no duplicate recipient rows for the same comment event.
6. On moderation report status update, notify the reporter with safe status
   language only. Do not include admin notes, moderator identity, target body,
   or action reasons.
7. On review request status update, notify the requester with safe status and
   resolution summary only. Do not include admin notes or moderator identity.
8. Add visible UI only if it is tiny and honest. A thread watch button or a
   simple notifications readback may be acceptable; a full notification center
   can be deferred.

## Guardrails

- No email, push notifications, browser push, scheduled digests, background
  workers, WebSockets, SSE, Redis pub/sub, or realtime fanout.
- No public notification feed.
- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No participant access to admin notes, moderator identities, private target
  bodies, moderation internals, or other users' notifications.
- No notification rows for the acting user.
- No subcommunity platform, delegated moderator model, reputation, witness
  mechanics, AI-autonomous posting, billing/provider/cache, Cloudflare,
  Developer Space, auth/session refactor, or broad UI redesign.

## Acceptance

ARGUS can accept PR89 if:

- notification/watch schema exists or exact blockers are named;
- thread watch/unwatch is owner-scoped and idempotent;
- comment creation notifies eligible thread authors/watchers and excludes the
  commenter;
- report/review status updates create only participant-safe notifications;
- users can read and mark only their own notifications;
- serializers omit admin notes, moderator identity, hidden target bodies,
  private material, and other-user rows;
- no external delivery or realtime behavior is claimed.

ARIADNE should rehearse only if visible routes change.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If visible web routes change, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known local Windows standalone symlink `EPERM` remains acceptable only
after the web build compiles, lints/typechecks, collects page data, and
generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- schema/table shape and migration number if implemented;
- thread watch route behavior;
- notification creation triggers;
- current-user read/mark-read route behavior;
- serializer safety summary;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE if visible routes change, or wake MIMIR directly if
PR89 closes as API/schema-only or blocker documentation. Do not leave the lane
asleep.

## ARGUS Review

ARGUS accepted PR89 on 2026-06-20 as an API/schema-only Community
Notifications Foundation.

Review notes:

- Thread watch routes are current-user scoped, validate readable thread state
  before creating/removing watch rows, and keep watch writes idempotent.
- Notification list/read routes filter by `recipient_user_id` and do not expose
  actor ids, recipient ids, admin notes, moderator identity, target bodies, or
  other-user rows.
- Comment fanout excludes the commenter, deduplicates thread author/watch
  recipients, and stores safe thread labels rather than comment bodies.
- Report and review-request status notifications intentionally store no
  moderator actor id and contain only participant-safe status/resolution fields.
- ARGUS fixed the unread filter parser so `?unreadOnly=false` returns all
  current-user notifications instead of being coerced truthy.
- No visible notification center, email, push, browser push, realtime, Redis
  pub/sub, scheduled digest, public notification feed, subcommunity/delegated
  moderation, reputation/witness, billing/provider/cache, Developer Space,
  auth/session refactor, or broad forum UI was added.

Validation rerun by ARGUS:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```
