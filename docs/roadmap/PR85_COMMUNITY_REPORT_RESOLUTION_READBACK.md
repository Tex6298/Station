# PR85 - Community Report Resolution Readback

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS implements if current schema/API supports the first slice,
ARGUS reviews. ARIADNE rehearses visible participant routes if any are added.
Status: implemented by DAEDALUS; awaiting ARGUS review

## Why This Lane

PR78 through PR84 now protect the admin side of Community Beta moderation:
comment/thread moderation actions, report queue readback, report status
updates, provenance labels, participation gates, forum route UX, and the first
admin console are in place.

The next gap is the participant-facing half of the moderation loop. Reporters
can submit reports, but ordinary participants do not yet have a clear way to
see what happened to their own reports. A full appeals workflow is still listed
as open, but the current schema may not support true appeals without a new
table or state model. PR85 should build only the safe readback that current
data can prove, and return exact blockers for appeals rather than faking them.

## Goal

Add or prove a narrow report-resolution readback path for ordinary reporters.

Desired protected-alpha outcome:

- a reporter can view their own submitted report statuses;
- status language is clear: open/reviewing/resolved/dismissed;
- reporter readback does not expose admin notes, moderator IDs, hidden content,
  moderation action reasons, other reporters, or private target material;
- admins keep the PR84 moderation console behavior;
- if appeal/request-review semantics require schema or API work, DAEDALUS names
  the exact missing fields/table/routes and does not create pretend appeal UI.

## DAEDALUS Implementation

The current `moderation_reports` table can support the narrow reporter-owned
readback without a schema change: it already stores `reporter_id`, target
type/id, reason, status, `created_at`, `updated_at`, and `reviewed_at`, with a
reporter/status index in the schema alignment migration.

Implemented API readback:

```text
GET /reports/mine
```

Behavior:

- anonymous users are blocked by the existing report-router `requireAuth`;
- authenticated reporters see only rows where `reporter_id` matches
  `req.user!.id`;
- admins use this route as their own reporter readback only; admin queue
  behavior remains `/reports`;
- optional filters support status, target type, and bounded limit;
- response rows return only safe reporter-facing fields: report id, target type,
  target id, reason, status, createdAt, updatedAt, and reviewedAt when present;
- response rows do not include reporter id, notes, reviewed_by/moderator id,
  moderation action reasons, target bodies, hidden material, or other reporters'
  records.

Implemented visible readback:

```text
/forums/reports
```

The route restores the local session, avoids fetching when signed out, fetches
only `/reports/mine` when signed in, and displays status/target/date readback
without report notes, moderator identity, target bodies, or appeal actions. The
forums index now links to this route as `My reports`.

True appeals are explicitly deferred. The current schema lacks a
`moderation_appeals` or request-review table, appeal status/state transitions,
moderation-action linkage, and target-owner visibility semantics. PR85 therefore
does not create an appeal button, appeal copy, or pretend request-review state.

No schema, target mutation, admin-console behavior, public moderation log,
subcommunity platform, delegated moderator model, notifications,
reputation/witness mechanics, AI posting, billing/provider/cache, Developer
Space, auth/session refactor, or public visibility-widening work was added.

## Inspect Before Editing

- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/app/forums/moderation/page.tsx`
- `apps/web/app/forums/*`
- `apps/web/lib/moderation-console.ts`
- `apps/web/lib/moderation-console.test.ts`
- `apps/web/lib/api-client.ts`
- `packages/types/src/forum.ts`
- `docs/roadmap/community-beta.md`
- `docs/roadmap/PR84_COMMUNITY_MODERATOR_CONSOLE_FIRST_SLICE.md`

## Preferred Implementation Path

1. Start API-first. Determine whether `moderation_reports` can safely support a
   reporter-owned list/readback without schema changes.
2. If yes, add a reporter-owned route such as `GET /reports/mine` or another
   unambiguous path that cannot conflict with the admin queue.
3. Return only safe fields for reporters:
   - report id;
   - target type;
   - target id only if the existing reporter already knows it and ARGUS agrees
     it is safe;
   - reason/category;
   - status;
   - created/updated/reviewed-at timestamps where useful.
4. Do not return:
   - admin notes;
   - reviewed_by/moderator identity;
   - moderation action reasons;
   - other users' reports;
   - hidden/removed target bodies;
   - private document, Space, persona, archive, prompt, provider, or credential
     material.
5. Add a small web readback only if the route and current navigation can support
   it cleanly. A route under forums or settings is acceptable if it is visibly a
   participant report-status surface, not an admin console.
6. If a true appeal/request-review flow needs a new `moderation_appeals` table,
   target owner visibility fields, or moderation-action linkage, document the
   exact blocker in this file and wake MIMIR instead of inventing appeal
   semantics on top of reports.

## Guardrails

- No full appeals workflow unless existing schema/API already supports it
  safely.
- No subcommunity platform or delegated moderator model.
- No notifications, reputation, witness mechanics, or AI-autonomous posting.
- No public moderation log.
- No target hide/remove/restore UI in this lane unless DAEDALUS explicitly
  wakes MIMIR first with a reason it must be bundled.
- No public visibility widening for hidden/removed content.
- No Stripe, Redis/Upstash, provider/model, Cloudflare, worker, parser/OAuth,
  Project/DexOS, hosted runtime, billing, or broad UI work.
- No secrets, raw auth headers, cookies, Stripe objects, webhook bodies, owner
  IDs, private archive text, prompts, completions, or provider payloads in docs
  or UI.

## Acceptance

ARGUS can accept PR85 if:

- reporters can read only their own report statuses, or DAEDALUS documents the
  exact blocker;
- anonymous users cannot read report status;
- authenticated users cannot read other users' reports;
- admin notes and moderation action reasons remain admin-only;
- public/community/private target visibility rules are not weakened;
- any visible route communicates moderation status calmly without implying an
  appeal exists unless one is actually implemented;
- the implementation does not smuggle in subcommunities, notifications, public
  moderation logs, Redis, Stripe, Cloudflare, provider, worker, or broad UI
  scope.

ARIADNE should rehearse if a visible reporter-facing route is added.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If frontend helpers or routes change, also run:

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
- reporter/admin/anonymous behavior;
- exact safe fields returned;
- whether any visible route was added;
- whether true appeals were deferred and why;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE for visible-route rehearsal if a participant-facing
route lands, or wake MIMIR directly if the accepted result is API-only/blocker
documentation. Do not leave the lane asleep.
