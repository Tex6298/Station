# PR497B - Companion Home Initial Scroll Fix

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-07-06

Status: Open

## Source

ARIADNE completed PR497A hosted proof:

`docs/roadmap/PR497A_COMPANION_HOME_USABILITY_TRANSLATION_REHEARSAL_RESULT.md`

Return value:

```text
PRODUCT_DEFECT_ROUTE_DAEDALUS
```

## Goal

Fix the active-thread persona-home landing behavior so PR497A's companion-first
first viewport is preserved after chat data loads.

The current hosted structure is otherwise accepted: desktop/mobile fit,
privacy/scope checks, and local return-card actions passed. The defect is only
that a non-empty active thread auto-scrolls the page down to the lower
chat/composer area, hiding the persona identity/header, `Companion Home`
heading, shortcut strip, and return card above the landed viewport.

## Current Suspect

`apps/web/components/studio/persona-chat.tsx` currently runs:

```text
bottomRef.current?.scrollIntoView({ behavior: "smooth" });
```

whenever `state.messages` changes. Even though `.studio-persona-chat-thread`
already has `overflow-y: auto`, the child `scrollIntoView` can still move the
document viewport during initial conversation load.

## Required Implementation Shape

Keep this narrow and web-local:

- keep chat auto-scroll contained inside `.studio-persona-chat-thread`; or
- suppress page-level auto-scroll on initial conversation load and only
  auto-scroll after user-triggered chat activity;
- preserve manual in-thread scrolling and the current send/stream experience;
- preserve the return-card local actions:
  - `Pick up where you left off` focuses the composer only;
  - `Ask for recap` pre-fills the composer only;
  - `Start fresh` clears local thread state only;
- preserve the accepted PR497A first-viewport hierarchy and copy.

Implementation options are up to DAEDALUS, but likely acceptable approaches
include adding a thread container ref and setting only that element's
`scrollTop`, or gating the existing bottom-scroll so it does not run for the
initial loaded conversation.

## Expected Files

Likely files:

- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/components/studio/persona-chat.test.ts`
- `apps/web/app/globals.css` only if a small containment style is needed

If more files are required, keep them in the web/UI slice and explain why in
the result.

## Non-Goals

Do not add or change:

- API routes;
- database schema, RLS, migrations, seeds, auth, quota, storage, billing,
  Stripe, provider/model, prompt/runtime, Redis, Cloudflare, workers, queues,
  deployment config, or package metadata;
- global Discern CSS import;
- broad Studio shell, topbar, sidebar, or right-panel replacement;
- public persona chat behavior;
- public/private visibility rules;
- Memory/Canon/Archive/Continuity/Integrity semantics;
- new placeholder controls, attach/mic/tool buttons, automation claims, browse
  claims, edit claims, or durable presence claims.

## Required Tests

Run the focused test first:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/persona-chat.test.ts
```

Then run the PR497A companion stack:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Also run a diff-only scope scan proving no changed files in API, DB,
migrations, provider/runtime, billing/Stripe, Redis/Cloudflare, worker/queue,
deployment config, or package metadata unless you stop and wake MIMIR with a
blocker.

## Result Required

Create:

```text
docs/roadmap/PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_RESULT.md
```

Include:

- the exact scroll behavior changed;
- whether initial active-thread load preserves the companion-first first
  viewport;
- files touched;
- boundaries kept;
- validation results;
- whether ARGUS should review directly or whether you hit a blocker.

## Handoff

Wake ARGUS after implementation:

```text
WAKEUP A3:
Codename: ARGUS
```

ARGUS should review that the fix is genuinely contained to page/thread scroll
behavior, does not regress send/stream/return-card behavior, and keeps PR497A's
accepted privacy and scope boundaries.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARIADNE found one PR497A hosted product defect: active-thread persona home
  auto-scrolls below the promised companion-first first viewport.
- Desktop/mobile fit, privacy/scope checks, and return-card local actions
  passed.
- The likely culprit is chat bottom `scrollIntoView` moving the document during
  initial conversation load.
Task:
- Implement PR497B Companion Home Initial Scroll Fix.
- Keep chat auto-scroll contained inside the chat thread or suppress initial
  page-level scroll on conversation load.
- Keep scope web-only and wake ARGUS with the result.
```
