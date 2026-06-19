# PR78 - Community Moderation And Provenance First Slice

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses only if visible forum
or document-discussion UI changes.
Status: closed by MIMIR

## Why This Lane

PR75 through PR77 closed the current Developer Space partner-readiness cluster.
The remaining launch-core gap with the most product leverage is Community Beta:
forum and document-discussion primitives exist, but the launch plan still calls
out moderation workflows, action logging, appeals, notifications, subcommunity
controls, and persona/AI provenance labels as incomplete.

This PR is not a full community rebuild. It is the first safe productization
slice: inspect the existing community primitives, implement the smallest
supported moderation/provenance improvement, and return exact blockers if the
schema cannot support the intended behavior yet.

Stripe test config and Upstash Redis config are available, but they are not the
default tool for this lane. Use them only if the existing code path already
requires them.

## Goal

Advance Community Beta without broadening the surface area.

The desired outcome is one of:

- a working, tested moderation/provenance slice over the current schema; or
- a precise blocker report naming the missing table, column, route, policy, or
  type needed before that slice can be implemented safely.

## DAEDALUS Implementation

Implemented the smallest schema-supported slice: comment moderation action
write/readback using the existing `comments` columns and
`community_moderation_actions` log.

Changed behavior:

- admins can hide, unhide, remove, restore, pin, and unpin comments through an
  admin-only comment moderation route;
- each admin comment moderation action attempts to record a
  `community_moderation_actions` row with `target_type = "comment"`;
- admins can read comment moderation actions through an admin-only readback
  route;
- non-admin authenticated users are blocked from comment moderation write and
  readback;
- unauthenticated users are blocked from comment moderation readback by the
  existing auth middleware;
- public comment listing still returns only active, non-hidden comments and does
  not expose moderation action reasons or metadata.

No schema change was needed. No visible forum UI, report queue, subcommunity
platform, notification system, AI posting, billing/provider/cache, Developer
Space, auth/session, or visibility-widening work was added.

## Inspect Before Editing

- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/services/community.service.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/document-discussions.test.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/web/app/forums/*`
- `packages/types/src/forum.ts`
- `docs/roadmap/community-beta.md`
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`
- `docs/ops/open-repo-upgrade-review.md`

## Preferred Implementation Order

1. Inventory the current moderation/provenance primitives.
   - What roles can currently hide, remove, lock, pin, report, or restore?
   - Where are actions logged?
   - What does public thread/comment/document-discussion serialization reveal?
   - Are persona-authored or AI-assisted labels represented anywhere yet?
2. If the current schema supports it, implement the narrowest safe improvement:
   - admin/moderator moderation queue or readback for reports/actions;
   - moderation action provenance that is visible to admins/moderators and safe
     for public readers;
   - persona-authored/AI-assisted labels on public forum or discussion entries;
   - or another small slice that directly closes one launch-core Community Beta
     gap.
3. If the schema does not support the slice, do not fake it. Wake MIMIR with:
   - exact missing schema/API/type pieces;
   - the safest next migration boundary;
   - tests that should guard the future implementation.
4. Keep existing forum/report/vote/reply behavior intact.

## Guardrails

- No full subcommunity platform unless the existing schema already makes a tiny
  safe slice obvious.
- No broad forum redesign or visual reskin.
- No notification platform unless existing notification primitives are already
  ready.
- No federation, reputation economy, saved-post system, image upload pipeline,
  social graph, or AI-autonomous posting.
- No billing/provider/Redis/Cloudflare/Developer Space work.
- No auth/session changes.
- No public/private/community visibility widening without hostile-path tests.
- Do not expose raw moderation notes, hidden comments, hidden actions, or
  community-only content to anonymous readers.

## Acceptance

- Anonymous readers cannot see community-only/private/admin-only moderation
  material.
- Admin/moderator readback respects role boundaries.
- Reports or moderation actions are actionable and logged, or the exact blocker
  is documented.
- Persona/AI provenance labels are visible if implemented, without implying
  live autonomous AI posting when none exists.
- Existing document discussion visibility still holds for public, community,
  unlisted, private, and owner paths.

## Validation

Run the narrow relevant gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If web forum UI changes, also run the relevant web check and call out whether
ARIADNE should rehearse the human route.

## Handoff

DAEDALUS wakes ARGUS with:

- implementation or blocker summary;
- files changed;
- role/visibility proof;
- validation results;
- explicit non-scope confirmation.

ARGUS wakes MIMIR with the closeout verdict, or wakes ARIADNE first if visible
forum/document-discussion UI changed enough to need a human-eye route rehearsal.

## ARGUS Review - 2026-06-19

ARGUS accepts PR78 as the first narrow Community Beta moderation/provenance
slice.

Review confirmed:

- Comment moderation readback and writes are admin-only behind the existing
  auth middleware.
- Anonymous users cannot read moderation actions; non-admin authenticated users
  cannot read or write comment moderation actions.
- Admin hide/restore actions update the comment visibility state and write
  `community_moderation_actions` rows with `target_type = "comment"`.
- Public comment lists still return only active, non-hidden comments and do not
  expose moderation action reasons or metadata.
- Existing document discussion boundaries remain intact for public, community,
  unlisted, private, and owner paths.

ARGUS patched one test guardrail:

- The comment moderation test now proves restore actions are logged and the
  restore reason stays out of public comment list responses.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 9 tests passed, including admin-only comment moderation write/readback, hide/restore logging, and public hiding behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed; public, community, unlisted, private, and owner document-discussion boundaries remain intact. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 1 test passed; report persistence and reporter scoping remain green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local triad state. |

Verdict: PR78 can close. No ARIADNE visible-route rehearsal is required.

## MIMIR Closeout - 2026-06-19

Closed after ARGUS acceptance.

PR78 proves the first safe Community Beta moderation/provenance slice:
admin-only comment moderation write/readback, action logging through
`community_moderation_actions`, and tests that hidden/restored comments do not
leak moderation reasons or metadata into public comment lists.

No repair lane or ARIADNE visible-route rehearsal is needed. The next Community
Beta gap is moderation queue/readback over the existing `moderation_reports`
and moderation-action primitives, not a new forum platform.
