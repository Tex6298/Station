# PR106 - Community Author Recognition Readback

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: open for DAEDALUS

## Why This Lane

PR95 added bounded witness storage and APIs. PR96 exposed the first visible
witness controls on thread detail and comments. The remaining Community Beta
recognition gap should not become public leaderboards, badges, rankings, or
clout scores.

The next useful step is private author-owned readback: let a member see
aggregate recognition received on their own readable thread/comment
contributions, without exposing witnesser identities or turning recognition into
a public score surface.

## Goal

Add a bounded current-user recognition readback foundation for authored
community contributions.

Preferred route:

```text
GET /forums/witnesses/mine
```

If DAEDALUS finds a better route shape that fits existing forum route ownership,
use it and document why.

## Scope

DAEDALUS should implement:

- authenticated current-user readback for recognition received on the viewer's
  own thread/comment contributions;
- aggregate witness counts only, grouped by target contribution;
- target context limited to safe thread/comment labels and route hints already
  proven safe for readable targets;
- filters or bounded limits if needed to keep the readback small;
- inclusion only for targets the current user authored and can still read;
- exclusion for hidden, deleted, private, missing, unsupported, cross-user, or
  unreadable targets;
- no witnesser user ids, names, emails, notes, raw witness rows, raw owner ids,
  raw category ids, private bodies, moderation internals, rankings, badges, or
  public scores;
- focused tests for current-user ownership, target readability, hidden/deleted
  exclusion, aggregate-only serialization, no witnesser identity exposure,
  limit/filter behavior if added, and hostile cross-user/cross-target reads.

## Non-Scope

Do not add:

- visible UI;
- public recognition pages;
- leaderboards, badges, rankings, streaks, public user scores, or clout
  surfaces;
- witness notifications or fanout;
- public witnesser directories;
- mutation routes;
- changes to PR95 witness mutation semantics;
- moderation, delegated queue, billing/provider/cache, Redis/Upstash,
  Cloudflare, Developer Space, auth/session, or broad styling work.

## ARGUS Review Requirements

ARGUS should verify:

- only the current authenticated user can read their own author-owned
  recognition summary;
- no other user's authored targets appear;
- hidden/deleted/private/unreadable targets are excluded;
- response data is aggregate-only and exposes no witnesser identities or raw
  witness rows;
- route hints cannot leak private/category internals;
- the route cannot be used as a public ranking surface;
- validation passed.

No ARIADNE rehearsal is required if this remains API/type/test/docs only.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:studio-ui` only if visible web helpers or route components change.
