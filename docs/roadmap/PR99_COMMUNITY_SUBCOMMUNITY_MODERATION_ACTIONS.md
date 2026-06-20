# PR99 - Community Subcommunity Moderation Actions

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: open

## Why This Lane

PR98 made subcommunity moderator assignments durable and testable, but kept
thread/comment moderation actions platform-admin-only. PR99 should wire that
accepted role foundation into the smallest safe action surface.

This is not a moderator console redesign. It is the backend permission step
that lets subcommunity owners and active moderators act on their own
subcommunity-backed forum content through existing moderation routes.

## Goal

Allow subcommunity owners and active moderators to perform bounded moderation
actions on thread/comment targets inside their subcommunity.

Desired protected-beta outcome:

- platform admins keep all current thread/comment moderation powers;
- ordinary forum categories remain platform-admin-only;
- subcommunity owners can moderate thread/comment targets in their own
  subcommunity-backed categories;
- active subcommunity moderators can moderate thread/comment targets in their
  assigned subcommunity-backed categories;
- revoked moderators, ordinary members, unrelated owners, visitors, and
  anonymous users cannot moderate those targets;
- delegated moderation is limited to safety actions unless ARGUS accepts a
  stronger reason:
  - `hide`;
  - `unhide`;
  - `remove`;
  - `restore`;
- platform-admin-only actions stay platform-admin-only:
  - thread `lock`, `unlock`, `pin`, `unpin`;
  - comment `pin`, `unpin`;
- document and Space-page comments remain platform-admin-only until a separate
  route/ownership policy exists;
- moderation action logging still records the acting user and target, and uses
  only private/admin readback.

## Inspect Before Editing

- `docs/roadmap/PR98_COMMUNITY_SUBCOMMUNITY_MODERATOR_ROLE_FOUNDATION.md`
- `docs/roadmap/PR86_COMMUNITY_MODERATION_TARGET_CONTEXT_ACTIONS.md`
- `docs/roadmap/community-beta.md`
- `apps/api/src/services/community-subcommunities.service.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/reports.test.ts`
- `packages/types/src/forum.ts`
- `packages/db/src/types.ts`

## Preferred Implementation Path

1. Add or reuse a helper that resolves a moderation target to a subcommunity:
   - thread target: load the thread category and its subcommunity;
   - comment target: only thread-parent comments can inherit subcommunity
     authority; document and Space-page comments stay admin-only.
2. Keep fail-closed behavior. If the subcommunity lookup errors or cannot prove
   the target's subcommunity, return a denial instead of falling back to admin
   assumptions for non-admin users.
3. Add a permission gate for moderation routes:
   - platform admins pass exactly as before;
   - non-admin delegated users must satisfy `canModerateSubcommunity` for the
     resolved subcommunity;
   - non-admin delegated users can use only `hide`, `unhide`, `remove`, and
     `restore`;
   - non-admin delegated users cannot use thread lock/pin actions or comment
     pin actions.
4. Decide and document self-moderation behavior. Default preference:
   - platform admins and subcommunity owners can moderate their own rows;
   - active moderators who are not owners/admins should not moderate their own
     thread/comment through delegated moderation routes, because their existing
     owner delete path is separate and safer.
5. Preserve existing response shapes unless a small private/admin metadata field
   is needed for tests. Do not expose delegated role or moderation history in
   public thread/comment readback.
6. Keep `/forums/moderation` behavior unchanged unless the web component already
   uses existing routes without new UI. This lane should not add visible owner
   moderator controls.
7. Add hostile tests:
   - admin still succeeds on ordinary and subcommunity targets;
   - owner succeeds on own subcommunity target safety actions;
   - active moderator succeeds on assigned subcommunity target safety actions;
   - active moderator cannot pin/lock;
   - active moderator cannot moderate another subcommunity;
   - revoked moderator cannot moderate;
   - ordinary member, visitor, anonymous user, and unrelated owner cannot
     moderate;
   - document/Space-page comment moderation stays admin-only;
   - moderation action logs do not leak through public thread/comment readback.

## Guardrails

- No visible moderator UI or console redesign.
- No public moderator directory, badges, rankings, reputation, or witness
  expansion.
- No public moderation log.
- No review-request/appeal expansion.
- No notification fanout.
- No new document/Space/persona/user target mutation actions.
- No billing, provider/model, Redis/Upstash, Cloudflare, Developer Space,
  auth/session, styling, or broad UI work.
- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No public exposure of moderator identities, emails, auth ids, provider ids,
  raw owner ids, private profile fields, moderation reasons, hidden bodies,
  prompts, provider payloads, or private notes.

## Acceptance

ARGUS can accept PR99 if:

- existing platform-admin moderation behavior remains intact;
- delegated owner/moderator authority applies only to subcommunity-backed
  thread targets and thread-parent comment targets;
- non-admin delegated users are limited to `hide`, `unhide`, `remove`, and
  `restore`;
- thread lock/pin and comment pin actions remain admin-only;
- revoked moderators, ordinary members, unrelated owners, visitors, and
  anonymous users are denied;
- subcommunity lookup failures fail closed;
- document and Space-page comments stay admin-only;
- public thread/comment readback does not expose delegated moderation reasons,
  moderator identities, role assignments, or private action metadata;
- tests cover the positive and hostile cases.

ARIADNE should rehearse only if visible routes change. If PR99 stays
API/service/test-only, ARGUS should wake MIMIR directly.

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

- thread/comment permission gate summary;
- action allow/deny matrix;
- self-moderation decision;
- ordinary category, subcommunity, document-comment, and Space-page-comment
  behavior;
- action logging/readback behavior;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE only if visible routes changed; otherwise ARGUS
should wake MIMIR with the PR99 verdict. Do not leave the lane asleep.
