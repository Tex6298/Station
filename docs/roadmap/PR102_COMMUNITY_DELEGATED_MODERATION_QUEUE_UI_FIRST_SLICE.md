# PR102 - Community Delegated Moderation Queue UI First Slice

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior before MIMIR closeout.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

PR101 proved the scoped delegated moderation queue API:
`GET /forums/subcommunities/:slug/moderation/reports`.

That route is accepted as API-only foundation work. The next smallest user
value is a visible queue surface for people who are already allowed to moderate
one subcommunity, without opening the global admin moderation console or adding
mutation controls.

## Goal

Expose a small scoped delegated moderation queue UI over the PR101 route.

Preferred shape: a dedicated subcommunity moderation route such as
`/forums/subcommunities/[slug]/moderation`, linked only where the viewer is
allowed to see it. If the existing route structure makes a different dedicated
route safer, use that, but keep it scoped to one subcommunity.

## Scope

DAEDALUS should implement:

- a visible scoped queue surface for platform admins, subcommunity owners, and
  active moderators;
- fetch behavior that uses only
  `GET /forums/subcommunities/:slug/moderation/reports`;
- denied/empty states that do not fetch or render live queue data for
  signed-out users, below-tier users, ordinary members, revoked moderators, or
  unrelated owners;
- row display for the safe PR101 serializer fields only: report id, target
  type/id, reason, status, created/updated timestamps, and bounded target
  context;
- honest target navigation behavior. If PR101 reports `canOpenRoute: false` or
  no safe route hint, do not invent links. Show the row as read-only context;
- minimal route/link wiring so permitted users can discover the scoped queue
  from relevant subcommunity/forum context;
- focused tests for the permission matrix, empty queue, included rows, excluded
  rows, and non-leaking serialized fields.

## Non-Scope

Do not add:

- report status mutation controls;
- delegated `PATCH /reports/:id`;
- global `/reports` visibility widening;
- public moderation logs;
- public moderator directory;
- review-request expansion;
- notification fanout;
- document, Space, persona, user, or unsupported target handling;
- reporter identities, reporter email, admin notes, reviewed-by/reviewed-at,
  moderation reasons/action history, moderator identities, role assignments,
  hidden/private target bodies, private target metadata, raw owner ids, source
  ids, or raw category ids;
- broad forum redesign, global styling pass, billing/provider/cache work,
  Redis/Upstash, Cloudflare, Developer Space work, or auth/session refactor.

## ARGUS Review Requirements

ARGUS should verify:

- the visible route is scoped to exactly one subcommunity;
- unauthorized viewers cannot fetch or render live queue data;
- active moderator, owner, and admin states can read the scoped queue;
- revoked moderator and unrelated owner states are denied;
- included and excluded target behavior matches PR101;
- UI output does not leak fields outside the delegated serializer;
- no mutation controls were introduced;
- global admin moderation behavior is unchanged;
- validation passed.

Because this lane changes visible route behavior, ARGUS must wake ARIADNE after
technical acceptance.

## ARIADNE Human Rehearsal

ARIADNE should run a human-eye rehearsal on desktop and 390px mobile for:

- signed-out viewer;
- ordinary member;
- subcommunity owner;
- active moderator;
- revoked moderator;
- unrelated owner;
- platform admin;
- empty queue;
- mixed queue with included and excluded mocked rows.

ARIADNE should confirm whether the route feels discoverable, whether read-only
rows are honest when no safe target link exists, whether denied states are clear,
and whether the page visually belongs to the current Station UI direction
without becoming a broad redesign.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

If the web build reaches compile/lint/page generation and then hits the known
Windows output cleanup `EPERM`, report that precisely rather than treating it as
an app failure.

## DAEDALUS Implementation

Implemented on 2026-06-20.

Visible route:

- Added `/forums/subcommunities/[slug]/moderation`.
- The page is scoped to exactly one subcommunity slug.
- It reads queue rows only from
  `GET /forums/subcommunities/:slug/moderation/reports`.
- It does not call global `/reports` and does not add status mutation controls.

Route/link behavior:

- Added a `viewerCanModerate` boolean to subcommunity readback for viewers who
  already pass the delegated queue permission check.
- The category page links to the scoped moderation queue only when the current
  viewer is an admin, the owner, or has API-confirmed delegated moderator
  access.
- Signed-out and denied direct-route states show friendly copy and do not render
  queue rows or controls.

Visible fields:

- Rows display only report id-derived target labels, target type/id, reason,
  status, created/updated timestamps, and bounded target context.
- The UI sanitizer drops unsupported target rows and strips reporter ids,
  reporter emails, admin notes, reviewed-by/reviewed-at, moderation reasons,
  moderator identities, role assignments, hidden/private bodies, private target
  metadata, raw owner ids, source ids, and raw category ids.
- If `canOpenRoute` is false or no safe route hint exists, rows stay read-only
  and show the unavailable reason instead of inventing links.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 75 tests passed, including delegated queue path, permission, sanitization, unsupported-row, and no-invented-link helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 17 tests passed, including active-moderator `viewerCanModerate` preflight readback and revoked-moderator removal. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed; global admin `/reports` behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, generated 35 static pages, finalized optimization, and collected build traces before the known local Windows standalone symlink `EPERM` during traced-file copy. Only the pre-existing raw `<img>` warnings appeared. |

Non-scope confirmation:

- No delegated `PATCH /reports/:id`, report status mutation controls, global
  report visibility widening, public moderation logs, public moderator
  directory, review-request expansion, notification fanout, unsupported target
  handling, broad styling pass, billing/provider/cache work, Redis/Upstash,
  Cloudflare, Developer Space work, or auth/session refactor was added.

## ARGUS Technical Review

Accepted by ARGUS on 2026-06-20 for ARIADNE visible-route rehearsal.

Review result:

- The visible moderation route is scoped to one encoded subcommunity slug at
  `/forums/subcommunities/[slug]/moderation`.
- Queue rows are fetched only after signed-in session and subcommunity
  preflight pass; signed-out and denied states do not fetch or render live queue
  rows.
- Category-page discovery is limited to platform admins, subcommunity owners,
  and API-confirmed active moderators through the current-viewer
  `viewerCanModerate` readback.
- The UI sanitizer drops unsupported rows and strips reporter identities,
  emails, admin notes, reviewed fields, moderator identities, role assignments,
  private target body/metadata, raw owner ids, source ids, and raw category ids.
- Target links are not invented when `canOpenRoute` is false or no safe route
  hint exists.
- No delegated status mutation controls, delegated `PATCH /reports/:id`, global
  `/reports` widening, public moderation log, public moderator directory, or
  review-request expansion was added.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 75 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 17 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | First run hit stale missing `.next/types`; after the web build regenerated Next types, API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, generated 35 static pages, finalized optimization, and collected build traces before the known local Windows standalone symlink `EPERM` during traced-file copy. Only pre-existing raw `<img>` warnings appeared. |
| `git diff --check` | Pass | CRLF normalization warnings only for triad state. |

ARIADNE should rehearse signed-out, ordinary member, revoked moderator,
unrelated owner, subcommunity owner, active moderator, platform admin, empty
queue, mixed mocked rows, desktop, and 390px mobile states. Confirm denied
states show no live rows or controls, permitted states can discover the scoped
queue, unsupported/private fields do not appear, and read-only target rows stay
honest when no safe link exists.
