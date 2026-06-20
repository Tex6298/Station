# PR107 - Community Author Recognition UI

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior before MIMIR closeout.
Status: open for DAEDALUS

## Why This Lane

PR106 proved private aggregate recognition readback at
`GET /forums/witnesses/mine`.

Users still need a small place to inspect recognition received on their own
contributions. This should feel like private feedback/readback, not public
reputation, rankings, badges, or a scoreboard.

## Goal

Add the smallest visible private recognition readback surface over PR106.

Preferred route:

```text
/forums/witnesses
```

If a different current-user/account route fits the existing navigation better,
use it and document why.

## Scope

DAEDALUS should implement:

- a signed-in, private-tier visible route that fetches only
  `GET /forums/witnesses/mine`;
- signed-out and below-tier states that do not fetch private recognition
  readback;
- a compact list of the viewer's own recognized thread/comment contributions;
- aggregate witness counts only;
- safe target labels and links only where PR106 provides safe route hints;
- empty state copy that does not shame or gamify;
- bounded loading/error states;
- route discovery from an appropriate existing forum/account surface if it can
  be done without broad navigation redesign;
- focused UI/helper tests for signed-out, below-tier, eligible empty, eligible
  populated, no witnesser identity rendering, safe-link behavior, and fetch path
  usage.

## Non-Scope

Do not add:

- public recognition pages;
- leaderboards, badges, rankings, streaks, public user scores, or clout
  surfaces;
- witnesser identities, names, emails, notes, raw witness rows, raw owner ids,
  raw category ids, private bodies, moderation internals, or hidden target
  bodies;
- witness mutation routes or changes to PR95 witness controls;
- notifications/fanout;
- moderation, delegated queue, billing/provider/cache, Redis/Upstash,
  Cloudflare, Developer Space, auth/session, or broad styling work.

## ARGUS Review Requirements

ARGUS should verify:

- the route fetches only PR106 readback;
- signed-out and below-tier states do not fetch private data;
- rendered data is aggregate-only and current-user-owned;
- no witnesser identity or raw witness data appears;
- safe route hints are honored and missing links remain honest;
- no public ranking/gamification surface is introduced;
- validation passed.

Because this lane changes visible behavior, ARGUS must wake ARIADNE after
technical acceptance.

## ARIADNE Human Rehearsal

ARIADNE should rehearse:

- signed-out;
- below-tier signed-in;
- eligible empty state;
- eligible populated thread/comment recognition;
- missing safe link or unavailable target hint;
- desktop and 390px mobile.

ARIADNE should confirm the page reads as private author feedback, does not feel
like a public score/reputation surface, and fits the current Station UI without
becoming a broad visual redesign.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

If the web build reaches compile/lint/page generation and then hits the known
Windows output cleanup `EPERM`, report that precisely rather than treating it as
an app failure.
