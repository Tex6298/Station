# PR96 - Community Witness UI First Slice

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses visible routes
after ARGUS technical acceptance.
Status: technically accepted by ARGUS; ready for ARIADNE route rehearsal

## Why This Lane

PR95 added the durable witness API, but users cannot yet use it. PR96 should
make recognition visible in the smallest useful place: thread detail and its
comments.

This is not a leaderboard, badge system, ranking surface, or community-wide
scoreboard. It is a bounded "witness this contribution" interaction.

## Goal

Expose witness controls for readable thread/comment targets.

Desired protected-beta outcome:

- eligible users can add/remove a witness kind on readable threads and comments;
- signed-out and below-tier users do not call witness mutation routes;
- authors do not see live self-witness controls on their own contributions;
- witness counts render as aggregate counts only;
- viewer-owned witness state renders without exposing other witnesser
  identities;
- hidden/removed/unreadable target behavior stays API-owned and fail-closed;
- no leaderboard, ranking, badge, notification, or public user score surface is
  introduced.

## Inspect Before Editing

- `docs/roadmap/PR95_COMMUNITY_RECOGNITION_WITNESS_FOUNDATION.md`
- `docs/roadmap/community-beta.md`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `packages/types/src/forum.ts`
- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/auth.ts`
- `apps/web/lib/community-notifications.ts`
- `apps/web/lib/*.test.ts`

## Preferred Implementation Path

1. Add narrow web helper functions for:
   - `PUT /threads/:id/witness/:kind`;
   - `DELETE /threads/:id/witness/:kind`;
   - `PUT /comments/:id/witness/:kind`;
   - `DELETE /comments/:id/witness/:kind`.
2. Render a compact witness control group on thread detail and comments.
   Supported kinds should match PR95 exactly, for example `helpful`,
   `grounded`, and `careful`.
3. Keep states explicit:
   - signed-out: sign-in/unavailable text, no mutation calls;
   - below-tier: private-tier unavailable text, no mutation calls;
   - author/self: "own contribution" state, no mutation calls;
   - eligible non-author: live toggle controls.
4. Update local state from API responses or safely derived optimistic state only
   when the route succeeds.
5. Show aggregate counts and viewer-selected state only. Do not show witnesser
   names, ids, private notes, moderation internals, or target hidden material.

## Guardrails

- No leaderboards, rankings, badges, streaks, public user scores, or clout
  surfaces.
- No notifications or fanout from witness actions.
- No new schema.
- No AI/persona posting or authorship claim controls.
- No delegated moderation.
- No billing, provider, Redis/Upstash, Cloudflare, cache, or config work.
- No Developer Space expansion.
- No auth/session refactor.
- No broad forum UI redesign or site-wide style work.
- No public visibility widening for hidden, removed, private, unlisted,
  archive, prompt, provider, credential, or owner-only material.

## Acceptance

ARGUS can accept PR96 if:

- signed-out users do not call witness mutation routes;
- below-tier signed-in users do not call witness mutation routes;
- authors cannot witness their own thread/comment contributions from the UI;
- eligible non-authors can toggle supported witness kinds for readable thread
  and comment targets;
- only PR95 witness routes are called;
- UI shows aggregate counts and viewer state only, with no witnesser identity
  exposure;
- existing vote/report/watch/comment behavior remains intact;
- desktop and mobile layouts avoid horizontal overflow and offscreen primary
  controls.

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
- helper/API calls added;
- signed-out/below-tier/self/eligible behavior;
- aggregate/viewer-state field visibility;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE if accepted. ARIADNE should wake MIMIR after visible
route rehearsal, or DAEDALUS with exact defects. Do not leave the lane asleep.

## ARGUS Technical Review Result

Accepted on 2026-06-20 for visible-route rehearsal. ARGUS patched one helper
consistency issue before acceptance: admin users now count as eligible for the
UI witness control, matching the existing forum/admin permission convention,
while admin self-witness still resolves to the blocked self state.

Validation passed:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

The web build compiled, linted/typechecked, collected page data, and generated
35 static pages before the known local Windows standalone symlink `EPERM`.

ARIADNE should rehearse `/forums/[categorySlug]/[threadId]` for signed-out,
below-tier, author/self, eligible non-author, and admin states on desktop and
mobile before waking MIMIR.

## ARIADNE Visible Route Rehearsal

Accepted on 2026-06-20. ARIADNE rehearsed
`/forums/[categorySlug]/[threadId]` against the local Next dev server with a
mocked API for signed-out, below-tier, author/self, eligible non-author, and
admin states on desktop and 390px mobile.

ARIADNE confirmed:

- signed-out users see aggregate witness counts and sign-in guidance, with no
  witness mutation buttons or witness mutation calls;
- below-tier signed-in users see aggregate witness counts and private-tier
  guidance, with no witness mutation buttons or witness mutation calls;
- authors see own-contribution witness states for their own thread/comment
  contributions, with no self-witness mutation controls or calls;
- eligible non-authors can toggle supported thread and comment witness kinds
  through the PR95 `PUT` witness routes, and successful responses update local
  aggregate/current-viewer state;
- admin users can witness non-authored contributions while admin-authored
  comments still resolve to the own-contribution state;
- witness mutations used only PR95 thread/comment witness endpoints and did
  not call broad, leaderboard, notification, or identity routes;
- mocked witnesser names, witnesser ids, and private witness notes did not
  render in the visible route;
- existing watch eligibility stayed distinct from witness eligibility;
- checked desktop and 390px mobile states had no horizontal overflow or
  offscreen controls.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| Local Playwright route rehearsal with temporary `.codex-pr96-route-rehearsal.cjs` | Pass | Covered signed-out, below-tier, author/self, eligible non-author, and admin states across desktop and 390px mobile, including witness-route calls, identity non-exposure, and overflow/offscreen checks. |
| `git diff --check` | Pass | Docs-only ARIADNE verdict; no imports or scripts changed. |
