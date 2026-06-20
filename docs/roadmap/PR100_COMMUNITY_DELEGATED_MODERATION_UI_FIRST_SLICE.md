# PR100 - Community Delegated Moderation UI First Slice

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses visible routes
after ARGUS technical acceptance.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

PR98 added durable subcommunity moderator roles. PR99 wired those roles into
bounded API moderation actions, but there is still no honest product surface for
subcommunity owners or active moderators to use those actions.

PR100 should expose the smallest visible control surface on forum thread detail,
where the target context is already present and route behavior can be rehearsed
without building a full moderator console.

## Goal

Make delegated moderation usable on subcommunity-backed thread pages without
leaking private moderation internals or implying broader powers.

Desired protected-beta outcome:

- signed-out visitors, below-tier users, ordinary members, revoked moderators,
  unrelated owners, and authors without delegated authority do not see live
  delegated moderation controls and do not call moderation mutation routes;
- subcommunity owners and active moderators see bounded safety controls for
  readable subcommunity-backed threads and thread-parent comments when the API
  can prove they are allowed;
- platform admins retain existing access and may also see controls if the route
  already supports the action;
- non-admin visible controls are limited to:
  - `hide`;
  - `unhide`;
  - `remove`;
  - `restore`;
- thread lock/unlock/pin/unpin and comment pin/unpin are not exposed to
  non-admin delegated users;
- ordinary categories, document comments, and Space-page comments do not gain
  delegated UI controls;
- successful actions update local route state or refetch the thread in a way
  that does not leave fake-live buttons behind;
- visible copy labels the action as moderation, not reputation or witness.

## Inspect Before Editing

- `docs/roadmap/PR99_COMMUNITY_SUBCOMMUNITY_MODERATION_ACTIONS.md`
- `docs/roadmap/PR96_COMMUNITY_WITNESS_UI_FIRST_SLICE.md`
- `docs/roadmap/community-beta.md`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `packages/types/src/forum.ts`
- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/auth.ts`
- `apps/web/lib/community-witness.ts`
- `apps/web/lib/moderation-console.ts`
- `apps/web/lib/*.test.ts`

## Preferred Implementation Path

1. Start API/type-first if the current thread detail payload lacks enough
   current-user capability data. Add a minimal current-viewer capability readback
   only if needed, for example per thread/comment:
   - allowed moderation actions for the current viewer;
   - no moderator identity lists;
   - no moderation reasons;
   - no role assignment rows;
   - no private action history.
2. Add narrow web helpers for:
   - `PATCH /threads/:id/moderation`;
   - `PATCH /comments/:id/moderation`.
3. Render compact controls near the existing thread/comment action rows, using
   the PR99 allowed action set.
4. Keep states explicit:
   - no controls for signed-out users;
   - no controls for below-tier/non-authorized users;
   - no controls for ordinary categories;
   - no controls for document/Space-page comments;
   - unavailable/forbidden responses should show a calm error and remove or
     disable fake-live state.
5. Avoid broad page redesign. Reuse existing button/panel patterns from watch,
   witness, report, and moderation-console helpers.
6. After a successful action, either update the affected target state from the
   response or refetch the thread. Removed/hidden targets should not leave a
   stale active comment/thread control in place.
7. Add focused helper/tests for:
   - path construction;
   - allowed action filtering;
   - signed-out/below-tier/unrelated states not calling mutations;
   - no admin-only actions exposed to non-admin delegated users;
   - no moderator identities/reasons/private action metadata rendered.

## Guardrails

- No full moderator console redesign.
- No report queue expansion.
- No public moderator directory, badges, rankings, reputation, or witness
  expansion.
- No public moderation log.
- No review-request/appeal expansion.
- No notification fanout.
- No document/Space/persona/user target mutation UI.
- No billing, provider/model, Redis/Upstash, Cloudflare, Developer Space,
  auth/session, styling overhaul, or broad UI work.
- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No public exposure of moderator identities, role assignments, emails, auth
  ids, provider ids, raw owner ids, private profile fields, moderation reasons,
  hidden bodies, prompts, provider payloads, or private notes.

## Acceptance

ARGUS can accept PR100 technically if:

- visible controls use only PR99-supported thread/comment moderation endpoints;
- non-admin delegated users see only `hide`, `unhide`, `remove`, and `restore`;
- admin-only lock/pin actions are not exposed to non-admin delegated users;
- signed-out, below-tier, ordinary member, revoked moderator, unrelated owner,
  and ordinary-category states do not call moderation mutation routes;
- document/Space-page comments do not receive delegated UI controls;
- public/member thread/comment readback does not expose moderation reasons,
  moderator identities, role assignment rows, or private action metadata;
- successful and failed action states remain honest and do not leave fake-live
  controls;
- desktop and 390px mobile layouts avoid horizontal overflow and offscreen
  primary controls.

ARIADNE must rehearse visible routes after ARGUS technical acceptance.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Also run the web build because forum visible routes change:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known local Windows standalone symlink `EPERM` remains acceptable only
after the web build compiles, lints/typechecks, collects page data, and
generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- visible routes changed;
- API/type capability readback added or reason none was needed;
- helper/API calls added;
- signed-out/below-tier/ordinary/revoked/unrelated/owner/moderator/admin
  behavior;
- action allow/deny matrix in UI;
- successful/failed state handling;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE if accepted. ARIADNE should wake MIMIR after visible
route rehearsal, or DAEDALUS with exact defects. Do not leave the lane asleep.

## DAEDALUS Implementation

Implemented the first visible delegated moderation slice on forum thread
detail: `/forums/[categorySlug]/[threadId]`.

API/type capability readback:

- `GET /threads/:id` now includes `viewer_moderation_actions` on the thread and
  each returned thread-parent comment.
- The readback is current-viewer scoped and contains only action names from the
  PR99 safety set: `hide`, `unhide`, `remove`, and `restore`.
- It does not include moderator identities, role assignments, moderation
  reasons, action history, private action metadata, or admin-only actions.
- Capability lookup fails closed to an empty action list if subcommunity
  moderator checks cannot be proven.

Visible route behavior:

- Signed-out users, below-tier users, ordinary members, revoked moderators,
  unrelated owners, ordinary-category readers, and self-authored active
  moderator targets receive no live moderation buttons because the API/helper
  action list is empty.
- Subcommunity owners and active moderators see compact `Moderation` controls
  only when `viewer_moderation_actions` proves the current viewer can act.
- Non-admin controls are limited to `hide`, `unhide`, `remove`, and `restore`;
  thread lock/unlock/pin/unpin and comment pin/unpin are not rendered.
- Thread actions call `PATCH /threads/:id/moderation`; comment actions call
  `PATCH /comments/:id/moderation`.
- Successful actions refetch the thread. Comment hide/remove also removes the
  local comment row immediately; thread hide/remove clears local controls and
  shows an honest no-longer-visible state if the refetch is no longer readable.
- Failed actions show a calm inline error and leave API authority as the source
  of truth.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

Passed except for the known local Windows standalone symlink `EPERM` at the end
of the web build. The web build compiled, linted/typechecked, collected page
data, and generated 35 static pages first. Only the pre-existing raw `<img>`
warnings appeared. `git diff --check` reported CRLF normalization warnings only.

No full moderator console redesign, report queue expansion, public moderator
directory, public moderation log, review-request expansion, notification
fanout, document/Space/persona/user target mutation UI, billing/provider/cache
work, Redis/Upstash, Cloudflare, Developer Space work, auth/session refactor,
styling overhaul, or visibility widening was added.
