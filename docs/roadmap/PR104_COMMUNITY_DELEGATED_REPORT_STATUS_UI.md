# PR104 - Community Delegated Report Status UI

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior before MIMIR closeout.
Status: open for DAEDALUS

## Why This Lane

PR102 exposed the scoped delegated moderation queue as a read-only surface.
PR103 proved scoped delegated report status transitions through
`PATCH /forums/subcommunities/:slug/moderation/reports/:id`.

The next smallest user value is letting permitted subcommunity moderators triage
their scoped queue from the visible page, without adding target moderation
actions or widening the global admin console.

## Goal

Add visible report status controls to `/forums/subcommunities/[slug]/moderation`
using only the PR103 scoped status route.

## Scope

DAEDALUS should implement:

- status action controls for permitted scoped queue rows;
- allowed transitions: `reviewing`, `resolved`, `dismissed`;
- calls only to
  `PATCH /forums/subcommunities/:slug/moderation/reports/:id`;
- optimistic or post-response row update behavior that preserves the current
  queue filter honestly;
- disabled/loading/error states that make failed transitions clear without
  dropping report context;
- no controls for signed-out, denied, ordinary member, revoked moderator,
  unrelated owner, or other-subcommunity moderator states;
- no controls for rows that fail sanitizer or are not returned by the scoped
  queue;
- focused UI/helper tests for path construction, transition labels,
  permission-gated rendering, successful update, failed update, same-status
  idempotent handling, and active/resolved/dismissed filter behavior.

## Non-Scope

Do not add:

- target hide/unhide/remove/restore controls from the delegated queue;
- delegated target mutation from the report status route;
- global `/reports` visibility widening;
- changes to global admin `PATCH /reports/:id` behavior;
- public moderation logs;
- public moderator directory;
- review-request expansion;
- notification UI changes;
- reporter identities, reporter email, admin notes, reviewed-by/reviewed-at
  fields, moderator identities, role assignments, moderation action reasons,
  hidden/private target bodies, private target metadata, raw owner ids, source
  ids, raw category ids, or unsafe route hints;
- broad forum redesign, broad styling pass, billing/provider/cache work,
  Redis/Upstash, Cloudflare, Developer Space work, or auth/session refactor.

## ARGUS Review Requirements

ARGUS should verify:

- visible controls render only after the same access preflight that permits the
  scoped queue readback;
- status transitions call only the PR103 scoped route with encoded slug and
  report id;
- denied states do not fetch live queue rows and do not render controls;
- failed updates keep the row visible and show a bounded error;
- the UI never calls global `/reports/:id`;
- no target moderation actions were added;
- response handling does not render private/admin fields;
- validation passed.

Because this lane changes visible behavior, ARGUS must wake ARIADNE after
technical acceptance.

## ARIADNE Human Rehearsal

ARIADNE should rehearse:

- signed-out, ordinary member, revoked moderator, unrelated owner;
- subcommunity owner, active moderator, platform admin;
- empty queue;
- rows in `open`, `reviewing`, `resolved`, and `dismissed` states;
- successful transition to `reviewing`;
- successful transition to `resolved` or `dismissed`;
- failed transition response;
- desktop and 390px mobile.

ARIADNE should confirm the controls are clear, do not feel like target
moderation actions, keep failed rows recoverable, and fit the current Station UI
without turning into a broad redesign.

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
