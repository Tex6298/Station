# PR101 - Community Delegated Moderation Queue Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

PR98 added subcommunity moderator roles, PR99 wired bounded moderation actions,
and PR100 exposed thread-detail controls for viewers who can already act.

The remaining delegated moderation gap is report queue context. Platform admins
have the global `/reports` queue, but subcommunity owners and moderators do not
yet have a scoped way to see reports that belong to their own subcommunity.
Opening a visible console before proving the queue contract would risk leaking
global report data or private target details.

## Goal

Add the smallest safe delegated report queue foundation for subcommunity owners
and active moderators.

Desired protected-beta outcome:

- platform admin `/reports` behavior remains unchanged;
- subcommunity owners and active moderators can read a scoped report queue for
  their own subcommunity;
- scoped delegated queue rows include only reports whose target is:
  - a thread in that subcommunity-backed category; or
  - a thread-parent comment whose parent thread is in that subcommunity-backed
    category;
- ordinary categories, document reports, Space reports, persona reports, user
  reports, document comments, and Space-page comments stay out of delegated
  queues;
- revoked moderators, ordinary members, unrelated owners, visitors, and
  anonymous users cannot read delegated report queues;
- delegated queue serialization is narrower than the global admin queue and
  does not expose admin-only fields, reporter identities, admin notes,
  moderator identities, hidden bodies, private action history, role assignments,
  or private target metadata;
- report status mutations remain platform-admin-only unless this PR proves a
  separate safe delegated status rule and ARGUS accepts it. Default: readback
  only.

## Inspect Before Editing

- `docs/roadmap/PR98_COMMUNITY_SUBCOMMUNITY_MODERATOR_ROLE_FOUNDATION.md`
- `docs/roadmap/PR99_COMMUNITY_SUBCOMMUNITY_MODERATION_ACTIONS.md`
- `docs/roadmap/PR100_COMMUNITY_DELEGATED_MODERATION_UI_FIRST_SLICE.md`
- `docs/roadmap/community-beta.md`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/services/community-subcommunities.service.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/routes/community.test.ts`
- `packages/types/src/forum.ts`
- `packages/db/src/types.ts`

## Preferred Implementation Path

1. Prefer a new scoped route over widening global `/reports`, for example:
   - `GET /forums/subcommunities/:slug/moderation/reports`.
2. Resolve the subcommunity by slug and use PR98 permissions:
   - platform admins pass;
   - owners pass;
   - active moderators pass;
   - revoked moderators, ordinary members, unrelated owners, visitors, and
     anonymous users fail.
3. Build the delegated queue by resolving report targets safely:
   - include `thread` reports only when the thread category belongs to the
     requested subcommunity;
   - include `comment` reports only when the comment parent is a thread in the
     requested subcommunity;
   - exclude unsupported target types and non-thread comment parents.
4. Keep the delegated serializer separate from the admin serializer. Suggested
   fields:
   - report id;
   - target type and target id;
   - reason;
   - status;
   - created/updated timestamps;
   - bounded target context such as title/status/moderation state/hidden state
     and safe forum route hint when provable.
5. Do not include:
   - reporter user id or email;
   - admin notes;
   - reviewed by;
   - moderation action reasons;
   - moderator identities;
   - role assignment rows;
   - hidden/private target bodies;
   - document/Space/persona/user private metadata;
   - raw owner ids or source ids.
6. Keep report status update routes admin-only by default. If DAEDALUS believes
   delegated status transitions should be included now, implement only after
   documenting the exact action semantics and adding hostile tests; otherwise
   leave it for a later PR.
7. Add tests for:
   - owner and active moderator scoped readback;
   - platform admin scoped readback;
   - revoked moderator, ordinary member, unrelated owner, visitor, and anonymous
     denial;
   - cross-subcommunity report exclusion;
   - ordinary category report exclusion;
   - document/Space/persona/user and non-thread-comment exclusion;
   - delegated serializer privacy-negative assertions;
   - global admin `/reports` unchanged;
   - status mutation remains admin-only if not opened.

## Guardrails

- No visible moderator console UI.
- No global `/reports` visibility widening.
- No delegated report status mutation unless explicitly justified and reviewed.
- No public moderation log.
- No public moderator directory, badges, rankings, reputation, or witness
  expansion.
- No review-request/appeal expansion.
- No notification fanout.
- No document/Space/persona/user target mutation UI or API.
- No billing, provider/model, Redis/Upstash, Cloudflare, Developer Space,
  auth/session, styling, or broad UI work.
- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No exposure of reporter identities, moderator identities, role assignments,
  emails, auth ids, provider ids, raw owner ids, private profile fields,
  moderation reasons, hidden bodies, prompts, provider payloads, or private
  notes.

## Acceptance

ARGUS can accept PR101 if:

- delegated queue readback is scoped to one subcommunity;
- only platform admins, subcommunity owners, and active moderators can read it;
- revoked moderators, ordinary members, unrelated owners, visitors, and
  anonymous users are denied;
- cross-subcommunity, ordinary-category, document, Space, persona, user,
  document-comment, and Space-page-comment reports are excluded;
- global admin `/reports` behavior remains unchanged;
- delegated serializers do not expose reporter identities, admin notes,
  moderator identities, role assignments, moderation reasons, private action
  metadata, hidden bodies, or private target metadata;
- status mutation remains admin-only unless explicitly opened with accepted
  semantics and tests;
- tests cover positive, hostile, and privacy-negative cases.

ARIADNE should rehearse only if visible routes change. If PR101 stays
API/service/type/test-only, ARGUS should wake MIMIR directly.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
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

- route shape;
- delegated permission behavior;
- included/excluded target matrix;
- serializer field list and privacy proof;
- status mutation decision;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE only if visible routes changed; otherwise ARGUS
should wake MIMIR with the PR101 verdict. Do not leave the lane asleep.

## DAEDALUS Implementation

Implemented an API-only scoped delegated queue route:

```text
GET /forums/subcommunities/:slug/moderation/reports
```

Permission behavior:

- platform admins can read the scoped queue;
- subcommunity owners can read their own scoped queue;
- active moderators for that subcommunity can read the scoped queue;
- ordinary members, unrelated owners, revoked moderators, visitors, and
  anonymous users are denied.

Included target matrix:

- included: thread reports whose thread category is the requested
  subcommunity-backed category;
- included: comment reports only when the comment parent is a thread in the
  requested subcommunity-backed category.

Excluded target matrix:

- ordinary-category thread reports;
- cross-subcommunity thread/comment reports;
- document, Space, persona, and user reports;
- document-comment and Space-page-comment reports;
- missing or unsupported targets.

Delegated serializer fields:

- report id;
- target type and target id;
- reason;
- status;
- created/updated timestamps;
- bounded target context: title, status, visibility/moderation state where
  applicable, hidden state, safe action list.

Privacy proof:

- no reporter user id, reporter email, admin notes, reviewed-by/reviewed-at,
  moderator identity, role assignment row, moderation action reason, hidden
  body, private target body, private target metadata, raw owner id, source id,
  or route hint with raw category id is serialized.
- delegated route hints are intentionally unavailable until a later visible
  route can prove a safe slug; `canOpenRoute` is false.

Status mutation decision:

- delegated report status mutation remains closed. Global `PATCH /reports/:id`
  is unchanged and remains platform-admin-only.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Passed. `test:community` now covers 17 tests including delegated queue
positive, hostile, target-exclusion, and serializer privacy cases. `git diff
--check` reported CRLF normalization warnings only.

No visible moderator console UI, global `/reports` visibility widening,
delegated status mutation, public moderation log, public moderator directory,
review-request expansion, notification fanout, document/Space/persona/user
target mutation UI/API, billing/provider/cache work, Redis/Upstash, Cloudflare,
Developer Space work, auth/session refactor, styling, broad UI work, or
visibility widening was added.
