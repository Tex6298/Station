# PR106 - Community Author Recognition Readback

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: implemented by DAEDALUS; awaiting ARGUS review

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

## DAEDALUS Implementation

Implemented on 2026-06-20 as:

```text
GET /forums/witnesses/mine
```

The route is authenticated and private-tier gated. It returns bounded
current-user recognition readback for aggregate witness counts received on the
viewer's own authored thread contributions and authored comment contributions
whose parent thread remains readable to the viewer.

Safety boundaries:

- hidden and removed threads are excluded;
- hidden, removed, unsupported-parent, and unreadable comments are excluded;
- thread entries require the current user to be the thread author;
- comment entries require the current user to be the comment author, while the
  parent thread only needs to remain readable;
- public, unlisted, and eligible community visibility use the existing forum
  visibility helpers;
- subcommunity-gated parent threads use existing subcommunity read checks;
- empty aggregate targets are omitted;
- response context is limited to safe labels, route hints, timestamps, and
  aggregate witness counts.

The response does not expose witnesser ids, witnesser names/emails, notes, raw
witness rows, raw owner ids, raw category ids, comment bodies, private bodies,
moderation internals, rankings, badges, or public scores.

Validation run by DAEDALUS:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

`test:community`, `test:document-discussions`, and `typecheck` passed.
`git diff --check` passed with CRLF normalization warnings only. No visible web
routes changed, so `test:studio-ui` was not part of this implementation gate.

## ARGUS Technical Review

Accepted by ARGUS on 2026-06-20 for MIMIR sequencing.

Review result:

- `GET /forums/witnesses/mine` is authenticated and private-tier gated.
- Thread recognitions require current-user thread authorship and readable
  thread state.
- Comment recognitions require current-user comment authorship and a readable
  parent thread, including readable parent threads authored by someone else.
- Hidden, removed, unsupported-parent, unreadable, empty-aggregate, and
  cross-user authored targets are excluded.
- The existing thread/comment status model has `removed`, not a separate
  `deleted` status, so deleted-style exclusion is covered by the stored removed
  state plus hidden checks.
- Response data is aggregate-only: safe target type/id, witness counts, safe
  route labels/hints, and timestamps.
- No witnesser ids, witnesser names/emails, notes, raw witness rows, raw owner
  ids, raw category ids, comment bodies, private bodies, moderation internals,
  rankings, badges, public scores, or clout surfaces are serialized.
- The bounded `limit` parameter caps readback at 100.
- No visible UI, public recognition page, leaderboard, badges, rankings,
  notifications, mutation semantics changes, moderation changes,
  billing/provider/cache work, Developer Space work, auth/session work, or
  broad styling was added.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 17 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `git diff --check` | Pass | CRLF normalization warnings only for triad state. |

No ARIADNE visible-route rehearsal is required because PR106 adds no visible
route behavior.
