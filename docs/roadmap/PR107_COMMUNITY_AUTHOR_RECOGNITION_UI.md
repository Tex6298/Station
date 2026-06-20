# PR107 - Community Author Recognition UI

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior before MIMIR closeout.
Status: implemented by DAEDALUS; awaiting ARGUS review and ARIADNE rehearsal

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

## DAEDALUS Implementation

Implemented on 2026-06-20 as:

```text
/forums/witnesses
```

The page uses `GET /forums/witnesses/mine?limit=50` only after `getSession()`
restores a signed-in user whose tier is `private` or above. Signed-out and
below-tier states render local guidance and do not call the private recognition
readback route.

Visible scope:

- added a small `/forums/witnesses` private readback page;
- added a forum-directory link labeled `My recognition`;
- rendered the viewer's recognized thread/comment contributions with aggregate
  `helpful`, `grounded`, and `careful` counts only;
- used PR106 route hints only when `canOpenRoute` is true and the href stays
  under `/forums/`;
- rendered missing links honestly without inventing target context;
- kept empty, loading, refresh, and error states bounded.

Safety boundaries:

- no witnesser identities, names, emails, notes, raw witness rows, raw owner
  ids, raw category ids, private bodies, hidden bodies, or moderation internals
  are rendered;
- no public recognition page, leaderboard, badge, ranking, streak, public user
  score, clout surface, notification, witness mutation change, moderation,
  billing/provider/cache, Cloudflare, Developer Space, auth/session, or broad
  styling work was added.

Validation run by DAEDALUS:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

`test:studio-ui`, `test:community`, `test:document-discussions`, and
`typecheck` passed. The web build compiled, linted/typechecked, collected page
data, generated 36 static pages, finalized optimization, and collected build
traces before the known local Windows standalone symlink `EPERM` while copying
traced files. `git diff --check` should be run after final docs edits.

## ARGUS Technical Review

Accepted by ARGUS on 2026-06-20 for ARIADNE visible-route rehearsal.

Review result:

- `/forums/witnesses` fetches only `GET /forums/witnesses/mine?limit=50`.
- The page restores session first; signed-out and below-tier states render local
  guidance and do not fetch the private recognition readback route.
- Eligible users see aggregate helpful/grounded/careful counts only for their
  own recognized thread/comment contributions returned by PR106.
- Helper sanitization drops witnesser identity, raw witness rows, owner/category
  ids, bodies, and unknown fields.
- Links are used only when PR106 provides `canOpenRoute` and the href stays
  under `/forums/`; missing/unsafe links render as unavailable instead of
  inventing target context.
- The forum landing page adds one private discovery link, `My recognition`.
- The route reads as private author feedback and does not add a public
  recognition page, leaderboard, badge, ranking, streak, public user score,
  clout surface, notification, witness mutation change, moderation,
  billing/provider/cache work, Developer Space work, auth/session change, or
  broad styling pass.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 82 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 17 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, generated 36 static pages, finalized optimization, and collected build traces before the known local Windows standalone symlink `EPERM` while copying traced files. Only pre-existing raw `<img>` warnings appeared. |
| `git diff --check` | Pass | CRLF normalization warnings only for triad state. |

ARIADNE should rehearse signed-out, below-tier signed-in, eligible empty,
eligible populated thread/comment recognition, missing unsafe link, desktop, and
390px mobile states. Confirm the page reads as private feedback, not public
reputation.
