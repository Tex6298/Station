# PR104 - Community Delegated Report Status UI

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior before MIMIR closeout.
Status: implemented by DAEDALUS; ready for ARGUS review

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

## DAEDALUS Implementation

Implemented on 2026-06-20.

Visible route:

- Updated `/forums/subcommunities/[slug]/moderation`.
- Status controls render only after the same access preflight that permits
  scoped queue readback.
- Signed-out, denied, ordinary, revoked, unrelated-owner, and other blocked
  states do not render live queue rows or controls.

Scoped status behavior:

- Row controls call only
  `PATCH /forums/subcommunities/:slug/moderation/reports/:id`.
- Allowed visible actions are `reviewing`, `resolved`, and `dismissed`.
- Same-status actions are not offered.
- Successful responses are sanitized through the delegated queue sanitizer
  before rendering.
- Active filters keep `open` and `reviewing` rows; if a row transitions to
  `resolved` or `dismissed`, it leaves the active view. Explicit status filters
  keep or drop updated rows according to the selected filter.
- Failed updates keep the row visible and show a bounded row-level error.

Privacy and non-scope:

- The UI still renders only delegated report fields: report id-derived target
  labels, target type/id, reason, status, timestamps, and bounded target
  context.
- No reporter identities, admin notes, reviewed-by/reviewed-at fields,
  moderator identities, role assignments, moderation reasons, hidden/private
  target bodies, private metadata, raw owner ids, source ids, raw category ids,
  or unsafe route hints are rendered.
- No target hide/unhide/remove/restore controls, target mutation from the report
  route, global `/reports` widening, global admin patch behavior change, public
  moderation logs, public moderator directory, review-request expansion,
  notification UI changes, broad styling pass, billing/provider/cache work,
  Redis/Upstash, Cloudflare, Developer Space work, or auth/session refactor was
  added.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 77 tests passed, including delegated status path construction, transition labels, permission-gated controls, same-status omission, and active/explicit filter row behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 17 tests passed; PR103 scoped status API and hostile route coverage stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed; global admin `/reports` behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache and web typecheck ran. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, generated 35 static pages, finalized optimization, and collected build traces before the known local Windows standalone symlink `EPERM` during traced-file copy. Only the pre-existing raw `<img>` warnings appeared. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local watcher state. |

## ARGUS Technical Review

Accepted by ARGUS on 2026-06-20 for ARIADNE visible-route rehearsal.

Review result:

- Visible controls render only on the existing scoped queue page after the same
  signed-in/subcommunity preflight that permits queue readback.
- Signed-out and denied states still render no live queue rows or controls.
- Status updates call only
  `PATCH /forums/subcommunities/:slug/moderation/reports/:id` through encoded
  slug/report id path construction.
- The UI does not call global `/reports/:id` and does not add global report
  console widening.
- Controls are limited to report status transitions: `reviewing`, `resolved`,
  and `dismissed`; same-status actions are not offered.
- Successful responses are passed back through the delegated queue sanitizer
  before rendering.
- Active and explicit filters keep or remove updated rows honestly.
- Failed updates keep the row visible and show a bounded row-level error.
- Rendered rows stay inside delegated report fields and do not expose reporter
  identities, admin notes, reviewed fields, moderator identities, role
  assignments, hidden/private bodies, private metadata, raw owner ids, source
  ids, category ids, or unsafe route hints.
- No target hide/unhide/remove/restore controls, target mutation from the report
  status route, global admin patch behavior change, public moderation log,
  public moderator directory, review-request expansion, notification UI
  changes, broad styling, billing/provider/cache work, Developer Space work, or
  auth/session refactor was added.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 77 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 17 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, generated 35 static pages, finalized optimization, and collected build traces before the known local Windows standalone symlink `EPERM` during traced-file copy. Only pre-existing raw `<img>` warnings appeared. |
| `git diff --check` | Pass | CRLF normalization warnings only for triad state. |

ARIADNE should rehearse signed-out, ordinary, revoked, unrelated-owner,
subcommunity owner, active moderator, platform admin, empty queue, open,
reviewing, resolved, dismissed, successful reviewing/resolved/dismissed
transitions, failed transition copy, desktop, and 390px mobile. Confirm the
controls read as report triage rather than target moderation actions.
