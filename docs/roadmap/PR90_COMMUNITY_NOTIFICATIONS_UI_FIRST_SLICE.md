# PR90 - Community Notifications UI First Slice

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE rehearses visible routes
after ARGUS technical acceptance.
Status: open for DAEDALUS

## Why This Lane

PR89 added durable thread-watch and notification APIs, but the product is still
invisible. PR90 should make the foundation usable without turning it into an
email/push/realtime platform or a broad notification-center redesign.

## Goal

Add a small visible in-app notification workflow.

Desired protected-beta outcome:

- signed-in eligible users can watch/unwatch readable forum threads;
- signed-out or below-tier users see honest unavailable states and do not call
  mutating watch routes;
- signed-in users can view their own notifications with unread/all filtering;
- users can mark one notification read and mark all unread notifications read;
- notifications show safe title/summary/type/time/route labels only;
- hidden/private/admin-only material, actor ids, recipient ids, moderator
  identity, admin notes, target bodies, and other users' notifications remain
  absent.

## Inspect Before Editing

- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- `apps/web/app/forums/*`
- `apps/web/app/settings/page.tsx`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/*notification*`
- `apps/api/src/routes/notifications.ts`
- `apps/api/src/routes/threads.ts`
- `packages/types/src/forum.ts`
- `docs/roadmap/PR89_COMMUNITY_NOTIFICATIONS_FOUNDATION.md`
- `docs/roadmap/community-beta.md`

## Preferred Implementation Path

1. Add web helpers for:
   - `GET /notifications?unreadOnly=...`;
   - `PATCH /notifications/:id/read`;
   - `PATCH /notifications/read-all`;
   - `GET /threads/:id/watch`;
   - `PUT /threads/:id/watch`;
   - `DELETE /threads/:id/watch`.
2. Add a small current-user notification readback surface. A dedicated
   `/notifications` route is acceptable; linking it from Settings or the
   account area is enough. Do not build a broad activity dashboard.
3. Add thread watch/unwatch affordance on thread detail:
   - fetch watch state only for signed-in users;
   - mutate only for eligible users;
   - show unavailable copy for signed-out or below-tier users;
   - do not auto-watch or silently subscribe anyone.
4. Keep notification rows calm and bounded:
   - type/status label;
   - safe title/summary;
   - route link only when API provides a safe route;
   - read/unread state.
5. If the current route structure makes thread detail watch controls too risky,
   implement the notification readback first and document the exact blocker.

## Guardrails

- No email, push notifications, browser push, scheduled digests, background
  workers, WebSockets, SSE, Redis pub/sub, or realtime fanout.
- No public notification feed.
- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No actor ids, recipient ids, admin notes, moderator identities, private target
  bodies, moderation internals, or other users' notifications in UI.
- No automatic watching on comment or thread creation unless already implemented
  by PR89 API behavior and accepted by ARGUS.
- No subcommunity platform, delegated moderator model, reputation, witness
  mechanics, AI-autonomous posting, billing/provider/cache, Cloudflare,
  Developer Space, auth/session refactor, or broad UI redesign.

## Acceptance

ARGUS can accept PR90 if:

- signed-out users do not fetch current-user notification data;
- signed-in users see only their own notifications;
- unread/all filtering and mark-read actions call the PR89 routes correctly;
- thread watch/unwatch controls are gated by signed-in/eligible state and call
  only PR89 watch routes;
- safe route links are not guessed;
- notification UI omits private/admin fields and target bodies;
- tests cover helper/state behavior and existing API gates remain green.

ARIADNE must rehearse visible routes after ARGUS technical acceptance.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Also run the web build because visible forum/settings routes change:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known local Windows standalone symlink `EPERM` remains acceptable only
after the web build compiles, lints/typechecks, collects page data, and
generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- notification route/UI summary;
- thread watch UI summary or exact blocker;
- signed-out/signed-in/tier gating behavior;
- fields shown and fields deliberately hidden;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE if accepted. ARIADNE should wake MIMIR if visible
routes pass, or DAEDALUS with exact defects if they do not. Do not leave the
lane asleep.
