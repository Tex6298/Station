# PR93 - Community Forum Creation UX Hardening

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses visible routes
after ARGUS technical acceptance.
Status: technically accepted by ARGUS; ready for ARIADNE visible-route rehearsal

## Why This Lane

Community Beta now has durable discussions, moderation, notifications, and
subcommunities. The next weak point is the human posting flow: category pages
and new-thread pages need to be clear, gated, and reliable for both ordinary
forum categories and subcommunity-backed categories.

This is not a broad forum redesign. It is a focused UX hardening pass for
category readback, post eligibility, and thread creation.

## Goal

Make the visible forum create flow dependable enough for protected beta.

Desired protected-beta outcome:

- category routes show clear signed-out, below-tier, and eligible-user states;
- ordinary categories and subcommunity-backed categories both load with the
  right authenticated context;
- the new-thread route does not fail community/subcommunity category preflight
  by fetching protected category data anonymously before session restore;
- eligible users can create a thread and land on the created thread route;
- signed-out and below-tier users do not call `POST /forums/threads`;
- search/sort/category controls that are visible are live and reflect state;
- optional linked persona/Space selectors use existing safe owner-readable
  APIs only and do not imply persona-authorship or visibility changes;
- error, empty, loading, and success states are readable on desktop and mobile.

## Inspect Before Editing

- `docs/roadmap/community-beta.md`
- `docs/roadmap/PR92_COMMUNITY_SUBCOMMUNITY_UI_FIRST_SLICE.md`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/web/app/forums/page.tsx`
- `apps/web/app/forums/subcommunities/page.tsx`
- `apps/web/app/forums/[categorySlug]/page.tsx`
- `apps/web/app/forums/[categorySlug]/new/page.tsx`
- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/auth.ts`
- `apps/web/lib/community-notifications.ts`
- `apps/web/lib/*.test.ts`

## Preferred Implementation Path

1. Fix the new-thread session/category loading order:
   - restore session first;
   - fetch category with the token when present;
   - show sign-in or tier-unavailable state without mutating calls;
   - do not redirect so fast that the user cannot understand the state.
2. Make category detail and new-thread views share the same participation rule:
   private tier and above can create ordinary threads, but category visibility
   and subcommunity visibility must still be respected.
3. Keep the submission payload narrow:
   - `categoryId`, `title`, `body`;
   - optional `linkedPersonaId`/`linkedSpaceId` only from existing safe selector
     data;
   - no linked document shortcut unless already safely represented by existing
     document discussion routes.
4. Ensure visible controls are real:
   - sort/search controls update route state or local state consistently;
   - create/post buttons either call accepted routes or are unavailable;
   - cancel/back navigation works;
   - no decorative or fake tabs/buttons.
5. Add focused helper/component tests for gating and payload construction where
   practical. If browser-level route rehearsal is needed, leave ARIADNE exact
   instructions.

## Guardrails

- No broad forum redesign or site-wide style overhaul.
- No new moderation, review-request, notification, witness, reputation, or
  delegated moderator mechanics.
- No private/unlisted subcommunity creation.
- No new discussion provenance model.
- No AI-autonomous posting or persona-authored posting.
- No billing, provider, Redis/Upstash, Cloudflare, cache, or config work.
- No Developer Space expansion.
- No auth/session refactor beyond the local route ordering needed for correct
  forum create behavior.
- No public visibility widening for hidden, removed, private, unlisted,
  archive, prompt, provider, credential, or owner-only material.

## Acceptance

ARGUS can accept PR93 if:

- signed-out users do not call `POST /forums/threads` or owner-only selector
  APIs;
- below-tier signed-in users do not see live post controls or mutating calls;
- eligible users can create ordinary and subcommunity-backed public/community
  threads where the API allows them;
- community/subcommunity category data is fetched with auth context when a
  session exists;
- optional selector payloads are bounded to existing safe owner-readable data;
- search/sort state changes are observable and do not present dead controls;
- thread creation success routes to the created thread detail;
- mobile and desktop layouts avoid horizontal overflow and offscreen primary
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

- visible forum routes changed;
- signed-out/below-tier/eligible create behavior;
- ordinary versus subcommunity category behavior;
- exact payload fields sent to `POST /forums/threads`;
- selector/linking behavior or explicit deferral;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE if accepted. ARIADNE should wake MIMIR after visible
route rehearsal, or DAEDALUS with exact defects. Do not leave the lane asleep.

## ARGUS Review

Technically accepted on 2026-06-20. PR93 changes visible forum creation routes,
so ARIADNE must rehearse ordinary and subcommunity-backed category/detail/create
flows before MIMIR closes the lane.

ARGUS found and patched one route-state issue during review: a below-tier
signed-in user hitting a protected community/subcommunity category could receive
a hard not-found state instead of an honest tier/unavailable state. The category
and new-thread routes now share a tested preflight-unavailable copy helper that
distinguishes signed-out, below-tier, and eligible-user failures without
widening category visibility.

ARGUS confirmed:

- signed-out users do not call `POST /forums/threads` or owner-only selector
  APIs;
- below-tier signed-in users do not see live post controls or mutating calls;
- category data is fetched with the bearer token when a session exists;
- eligible users post only `categoryId`, trimmed `title`, trimmed `body`, and
  optional `linkedPersonaId`/`linkedSpaceId` selected from offered safe rows;
- selector rows are limited to public personas and public Spaces before payload
  construction;
- successful creation routes to the created thread detail;
- no linked document shortcut, persona-authored posting, ownership fields, raw
  selector ids, visibility override, or visibility widening was added.

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

All tests and typecheck passed. The web build compiled, linted/typechecked,
collected page data, and generated 35 pages before the known local Windows
standalone symlink `EPERM`.
