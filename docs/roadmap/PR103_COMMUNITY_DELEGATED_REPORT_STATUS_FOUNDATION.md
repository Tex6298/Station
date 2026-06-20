# PR103 - Community Delegated Report Status Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: closed by MIMIR on 2026-06-20

## Why This Lane

PR101 proved scoped delegated report queue readback. PR102 exposed the first
visible scoped delegated queue, but intentionally kept it read-only.

The next moderation gap is report triage. Subcommunity owners and active
moderators can already see reports for their own subcommunity, and PR99 already
proved bounded thread/comment safety actions. They still cannot mark a scoped
report as reviewing, resolved, or dismissed without escalating to the global
admin queue.

This PR should prove the API boundary before adding visible action buttons.

## Goal

Add the smallest safe scoped report status transition foundation for delegated
subcommunity moderators.

Preferred route:

```text
PATCH /forums/subcommunities/:slug/moderation/reports/:id
```

If DAEDALUS finds a better route shape that keeps the same scoped boundary, use
it and document why.

## Scope

DAEDALUS should implement:

- a scoped delegated report status update route for exactly one subcommunity;
- allowed statuses: `reviewing`, `resolved`, `dismissed`;
- permission parity with PR101 readback: platform admins, subcommunity owners,
  and active moderators may update only reports belonging to that subcommunity;
- target parity with PR101 readback: only thread reports in the requested
  subcommunity and thread-parent comment reports under those threads are
  eligible;
- ordinary-category, cross-subcommunity, document, Space, persona, user,
  document-comment, Space-page-comment, missing, and unsupported targets remain
  excluded;
- response serialization through the delegated serializer only;
- reporter-safe notification behavior if existing report-status notification
  hooks are reused;
- focused tests for permitted transitions, hostile transitions, target
  exclusion, serializer privacy, notification privacy if touched, invalid
  status, missing report, and idempotent/same-status behavior.

## Non-Scope

Do not add:

- visible queue action buttons;
- target hide/unhide/remove/restore mutation from this report route;
- global `/reports` visibility widening;
- changes to global admin `PATCH /reports/:id` behavior;
- public moderation logs;
- public moderator directory;
- review-request expansion;
- notification fanout beyond safe reporter status updates if already supported;
- reporter identities, reporter email, admin notes, reviewed-by/reviewed-at
  fields, moderator identities, role assignments, moderation action reasons,
  hidden/private target bodies, private target metadata, raw owner ids, source
  ids, raw category ids, or safe route hints not already proven by PR101/PR102;
- broad forum redesign, styling pass, billing/provider/cache work,
  Redis/Upstash, Cloudflare, Developer Space work, or auth/session refactor.

## Security Requirements

ARGUS should treat this as a hostile boundary review:

- anonymous users, ordinary members, below-tier users, unrelated owners,
  revoked moderators, and moderators from another subcommunity must be denied;
- a delegated moderator must not update a report for an ordinary category or a
  different subcommunity even if they know the report id;
- a delegated moderator must not update document, Space, persona, user, missing,
  unsupported, document-comment, or Space-page-comment reports;
- update by id must not bypass slug scoping;
- response data must remain narrower than the admin report serializer;
- `reviewed_by` may be stored server-side if the existing schema requires it,
  but delegated responses and reporter-owned readback must not expose moderator
  identity;
- updating report status must not mutate target visibility or target moderation
  state.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

No ARIADNE rehearsal is required if this remains API/type/test/docs only.

## DAEDALUS Implementation

Implemented on 2026-06-20.

Route:

- Added `PATCH /forums/subcommunities/:slug/moderation/reports/:id`.
- Allowed delegated statuses are `reviewing`, `resolved`, and `dismissed`.
- The route is scoped to one subcommunity slug and does not widen global
  `/reports`.

Permission and target proof:

- Permission parity matches PR101 queue readback: platform admins,
  subcommunity owners, and active moderators for that subcommunity may update.
- Anonymous users, ordinary members, unrelated owners, revoked moderators,
  missing subcommunities, and missing reports are denied or not found.
- Target eligibility matches PR101: only thread reports in the requested
  subcommunity-backed category and thread-parent comment reports under those
  threads are eligible.
- Ordinary-category, cross-subcommunity, document, Space, persona, user,
  document-comment, Space-page-comment, missing, and unsupported targets remain
  excluded.

Serializer and notification behavior:

- Responses use the delegated serializer only: report id, target type/id,
  reason, status, bounded target context, and timestamps.
- Responses do not expose reporter identities, admin notes,
  reviewed-by/reviewed-at, moderator identities, role assignments, moderation
  action reasons, hidden/private bodies, private metadata, raw owner ids, source
  ids, raw category ids, or unsafe route hints.
- Real status transitions store `reviewed_by` and `reviewed_at` server-side but
  keep those fields out of delegated responses.
- Same-status transitions are idempotent: they return the delegated row without
  rewriting or sending a duplicate notification.
- Existing reporter status notification behavior is reused safely. The
  notification stores `actor_user_id: null`, contains only report id/status in
  metadata, and does not expose moderator identity.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 17 tests passed, including delegated status transitions, invalid status, missing report/subcommunity, hostile target exclusion, idempotent same-status behavior, safe notification, serializer privacy, and no target visibility mutation. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed; global admin `/reports` behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran and web typecheck replayed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files. |

Non-scope confirmation:

- No visible queue buttons, target hide/unhide/remove/restore mutation from this
  report route, global `/reports` visibility widening, global admin
  `PATCH /reports/:id` behavior change, public moderation log, public
  moderator directory, review-request expansion, broad styling pass,
  billing/provider/cache work, Redis/Upstash, Cloudflare, Developer Space work,
  or auth/session refactor was added.

## ARGUS Technical Review

Accepted by ARGUS on 2026-06-20 for MIMIR sequencing.

Review result:

- `PATCH /forums/subcommunities/:slug/moderation/reports/:id` is API-only and
  scoped through one subcommunity slug before report mutation.
- Auth is enforced before the moderation route, and permission parity reuses
  the PR101 delegated queue gate for platform admins, subcommunity owners, and
  active moderators.
- Update-by-id does not bypass slug scoping because the report target is
  resolved against the requested subcommunity before any write.
- Eligible targets remain thread reports in the subcommunity-backed category and
  thread-parent comment reports under those threads.
- Ordinary-category, cross-subcommunity, document, Space, persona, user,
  document-comment, Space-page-comment, missing, and unsupported targets remain
  excluded.
- Responses use the delegated serializer only and do not expose reporter ids,
  emails, admin notes, reviewed fields, moderator identities, role assignments,
  moderation reasons, hidden/private target bodies, private metadata, raw owner
  ids, source ids, raw category ids, or unsafe route hints.
- Real transitions may store `reviewed_by` and `reviewed_at`, but delegated
  responses and report-status notifications keep moderator identity private.
- Same-status transitions are idempotent and do not duplicate notifications.
- Report status changes do not mutate target visibility or target moderation
  state.
- No visible buttons, delegated target hide/unhide/remove/restore mutation,
  global `/reports` widening, global admin patch behavior change, public
  moderation log, public moderator directory, review-request expansion, broad
  styling, billing/provider/cache work, Developer Space work, or auth/session
  refactor was added.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 17 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran and web typecheck replayed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only for triad state. |

No ARIADNE visible-route rehearsal is required because PR103 adds no visible
route behavior.

## MIMIR Closeout

MIMIR closes PR103 on 2026-06-20.

PR103 is accepted as API-only scoped delegated report status foundation work.
`PATCH /forums/subcommunities/:slug/moderation/reports/:id` is now the bounded
status-transition contract for platform admins, subcommunity owners, and active
moderators. Eligible targets remain exactly the PR101/PR102 scoped queue
targets: thread reports in the requested subcommunity and thread-parent comment
reports under those threads.

Delegated responses remain narrower than admin report responses. Reporter
notifications keep moderator identity private, same-status transitions are
idempotent, and report status changes do not mutate target visibility or target
moderation state.

Next lane: PR104 should add visible status controls to the accepted scoped
delegated queue UI over this route. Because PR104 changes visible behavior,
ARGUS review should be followed by ARIADNE human-eye rehearsal before MIMIR
closeout.
