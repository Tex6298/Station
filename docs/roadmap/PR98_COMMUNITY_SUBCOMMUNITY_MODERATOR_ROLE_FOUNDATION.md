# PR98 - Community Subcommunity Moderator Role Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: implemented by DAEDALUS; ready for ARGUS technical review

## Why This Lane

Community Beta now has subcommunities, forum participation gates, platform-admin
moderation routes, report/review flows, notifications, and witness controls.
The remaining structural moderation gap is delegation: a Canon/Developer
subcommunity owner cannot yet appoint bounded moderators, and moderator powers
are still platform-admin-only.

Do not jump straight to visible moderation buttons. PR98 should make the role
foundation durable and testable first, then a later lane can wire owner/moderator
actions into thread/comment moderation routes.

## Goal

Add the smallest safe foundation for subcommunity owner/moderator roles.

Desired protected-beta outcome:

- the repo has a durable representation for subcommunity moderator membership
  or a documented exact blocker if the current schema cannot support it safely;
- subcommunity owners and platform admins can read the current moderator set;
- subcommunity owners and platform admins can add/remove bounded moderator
  assignments if the user identity lookup can be made safely;
- serializers expose role state only to owners/admins, not to anonymous visitors
  or ordinary community members;
- a shared permission helper can answer whether a user can moderate a
  subcommunity-backed category/thread/comment;
- existing platform-admin moderation routes keep their current behavior;
- no non-admin moderation action is enabled until the role foundation is
  accepted.

## Inspect Before Editing

- `docs/roadmap/PR91_COMMUNITY_SUBCOMMUNITY_FOUNDATION.md`
- `docs/roadmap/PR92_COMMUNITY_SUBCOMMUNITY_UI_FIRST_SLICE.md`
- `docs/roadmap/PR97_COMMUNITY_MODERATION_UNSUPPORTED_TARGET_CONTEXT.md`
- `docs/roadmap/community-beta.md`
- `infra/supabase/migrations/041_community_subcommunities.sql`
- `packages/db/src/types.ts`
- `packages/types/src/forum.ts`
- `apps/api/src/services/community-subcommunities.service.ts`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`

## Preferred Implementation Path

1. Add a durable role model if safe. Prefer a new table such as
   `community_subcommunity_moderators` or
   `community_subcommunity_memberships` with:
   - `subcommunity_id`;
   - `user_id`;
   - role limited to `moderator` for this first slice, with owner derived from
     `community_subcommunities.owner_user_id`;
   - status such as `active`/`revoked`;
   - `created_by`, `created_at`, and `updated_at`.
2. Keep ownership distinct from moderator assignment. Do not duplicate the owner
   as a mutable moderator row unless the implementation explains why that is
   safer.
3. Add service helpers for:
   - owner/admin management authority;
   - reading active moderators for owner/admin contexts;
   - `canModerateSubcommunity(user, subcommunity)` or equivalent permission
     checks that return true for platform admins, owners, and active moderators.
4. Add bounded API routes only if identity lookup can be safe:
   - owner/admin list moderators for one subcommunity;
   - owner/admin add moderator by stable user id or by an existing safe profile
     lookup;
   - owner/admin revoke moderator.
5. If user lookup is not safe or no current route can identify users without
   emails/auth ids/provider ids, implement only schema/service helpers and
   document the exact blocker.
6. Keep all public/community list/read serializers unchanged unless adding an
   owner/admin-only field such as `currentUserRole` or `moderatorCount` is
   required and tested. Do not expose moderator identities publicly.
7. Do not wire owner/moderator access into `PATCH /threads/:id/moderation` or
   `PATCH /comments/:id/moderation` in this PR unless ARGUS can review a very
   small helper-only proof without visible route changes. The default is to
   defer action wiring to PR99.

## Guardrails

- No visible moderator UI.
- No delegated moderation action buttons.
- No public moderator directory, badges, rankings, reputation, or witness
  expansion.
- No target mutation route changes unless explicitly justified as helper-only
  proof and covered by tests.
- No public moderation log.
- No review-request/appeal expansion.
- No notification fanout.
- No billing, provider/model, Redis/Upstash, Cloudflare, Developer Space,
  auth/session, styling, or broad UI work.
- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No emails, auth ids, provider ids, raw owner ids, prompts, private archive
  text, moderation notes, hidden target bodies, or private profile fields in
  public/community serializers.

## Acceptance

ARGUS can accept PR98 if:

- the durable role model exists or the exact blocker is documented;
- only subcommunity owners and platform admins can manage moderator assignments;
- ordinary members, unrelated owners, anonymous users, and revoked moderators
  cannot manage roles;
- public/community subcommunity serializers do not expose moderator identities
  or owner/admin-only fields;
- any owner/admin role readback is scoped to the current user's owned/admin
  subcommunities;
- permission helpers are covered for admin, owner, active moderator, revoked
  moderator, ordinary member, and anonymous states;
- existing forum/subcommunity/moderation tests stay green.

ARIADNE should rehearse only if visible routes change. If PR98 stays
schema/API/service/test-only, ARGUS should wake MIMIR directly.

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

- schema/model shape or exact blocker;
- management route summary or exact user-lookup blocker;
- permission helper behavior;
- owner/admin/member/revoked/anonymous behavior;
- serializer visibility proof;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE only if visible routes changed; otherwise ARGUS
should wake MIMIR with the PR98 verdict. Do not leave the lane asleep.
