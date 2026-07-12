# PR523 - Companion-First Persona Home Draft PR #1 Review Path

Owner: MIMIR / A1

Date opened: 2026-07-12

Status:

```text
OPEN_REVIEW_PATH
```

## Source Of Truth

Draft PR:

```text
https://github.com/Tex6298/Station/pull/1
```

Title:

```text
Studio: make persona home companion-first
```

Branch:

```text
fork/agent/companion-shell-translation
```

Commit:

```text
2d4a23835e5aa0928488041168d48b4cb489e8bb
```

Marty clarified that this draft PR is the companion-first UI source of truth,
not loose polish context.

## Decision

Do not merge the draft PR blind and do not dilute it into generic UI polish.

Treat it as the product source of truth for the companion-first persona home,
then run the normal review path:

1. ARGUS reviews technical boundaries first.
2. ARIADNE reviews the human-eye, mobile, accessibility, and product-fit path
   after ARGUS accepts or names concrete fixes.
3. DAEDALUS receives implementation followups only if the reviews find fixes
   that belong in code.

## PR Snapshot

Draft PR #1 currently changes 24 files, including:

- `apps/api/src/routes/conversations.ts`;
- conversation archive tests;
- Studio persona home and Studio layout pages;
- `apps/web/components/studio/persona-chat.tsx`;
- new `apps/web/components/studio/persona-companion-sidebar.tsx`;
- new `apps/web/lib/persona-conversations.ts`;
- Studio navigation and import review helpers;
- `apps/web/app/globals.css`;
- `package.json` and CI test coverage.

The intended product behaviors include:

- companion-first persona home;
- URL-backed conversation/thread selection;
- New Chat route state;
- return-to-thread choices: continue, summarize/recap, start fresh;
- companion shortcut strip for Memory, Inbox, Timeline, Profile, Integrity;
- Memory Inbox/dashboard/Integrity honesty improvements;
- lazy Advanced Studio preservation for cross-owner encounter UI;
- mobile composer and overflow cleanup;
- accessibility improvements around chat log/composer/candidate controls.

## Review Order

### ARGUS First

ARGUS must check:

- conversation/thread owner scoping;
- `conversationId` plus `personaId` route/query behavior;
- race handling when switching threads mid-send, mid-archive, or mid-review;
- persona-boundary leaks in sidebar, chat, candidate review, and conversation
  loading;
- private archive/Memory/Continuity/Canon/Integrity boundaries;
- lazy Advanced Studio preservation of cross-owner encounter UI;
- public/private route and payload drift;
- broad CSS/global-style contamination risk;
- CI/script changes;
- no secret-shaped values or raw ids in public/client payloads.

### ARIADNE Second

ARIADNE should get the baton only after ARGUS accepts or names concrete fixes.
ARIADNE should run a human-eye rehearsal of:

- companion home first impression;
- mobile and desktop layout;
- thread switching and New Chat;
- continue/summarize/start fresh return-to-thread UX;
- Memory Inbox and shortcut strip discoverability;
- Advanced Studio disclosure and cross-owner tools preservation;
- accessibility, focus behavior, overflow, and visible state honesty.

### DAEDALUS Only If Needed

DAEDALUS should not be woken for implementation until ARGUS or ARIADNE gives
specific defects or MIMIR decides the PR is ready for integration repair.

## Parked Backend Lane

PR521 still produced a real backend blocker:

`docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_DAEDALUS.md`

PR522 is the next backend unblock for generated cross-owner publication, but
it is parked while PR523 reviews the companion-first UI source-of-truth PR.
