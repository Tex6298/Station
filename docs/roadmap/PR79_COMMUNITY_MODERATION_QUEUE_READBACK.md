# PR79 - Community Moderation Queue Readback

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses only if visible forum
or admin UI changes.
Status: accepted by ARGUS; ready for MIMIR closeout/sequencing

## Why This Lane

PR78 made comment moderation actions admin-only, logged, and public-safe. The
next Community Beta gap is queue/readback: reports are already persisted in
`moderation_reports`, and comment actions are logged in
`community_moderation_actions`, but moderators still need a bounded way to see
what needs review and what happened.

This lane should use the existing reports/action schema first. Do not add a new
moderation product, appeals system, notification system, or admin console unless
the current code makes a tiny safe slice obvious.

Stripe test config and Upstash Redis config are available, but they are not
part of this lane.

## Goal

Add the smallest safe admin/moderator readback for moderation reports and
moderation status, or return an exact blocker if the current schema cannot
support it.

The ideal slice is an API-only queue/readback over existing rows:

- open/reviewing report list for admins;
- target type/id, reason, status, created/updated/reviewed metadata;
- safe target summary or route hint when already available;
- optional status transition for reviewing/resolved/dismissed if the existing
  route/test harness supports it cleanly;
- no public or member access to raw moderation notes.

## DAEDALUS Implementation

Implemented the API-only queue/readback slice over the existing
`moderation_reports` table.

Changed behavior:

- admins can list reports with `GET /reports`;
- the default queue returns only active `open` and `reviewing` reports;
- admins can filter the queue by report `status`, `targetType`, and bounded
  `limit`;
- admins can transition reports to `reviewing`, `resolved`, or `dismissed`
  with `PATCH /reports/:id`;
- `reviewed_by` and `reviewed_at` are server-owned on status updates;
- anonymous users remain blocked by `requireAuth`;
- non-admin authenticated users are blocked from queue readback and status
  updates.

This does not mutate target visibility. Existing thread/comment moderation
routes remain the only paths that hide, restore, lock, pin, or remove community
content.

No schema, visible admin console, forum UI, report appeals workflow,
subcommunity platform, notification system, AI posting, billing/provider/cache,
Developer Space, auth/session, or public visibility-widening work was added.

## Inspect Before Editing

- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/services/community.service.ts`
- `packages/types/src/forum.ts`
- `packages/db/src/types.ts`
- `docs/roadmap/PR78_COMMUNITY_MODERATION_PROVENANCE_FIRST_SLICE.md`
- `docs/roadmap/community-beta.md`
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`

## Preferred Implementation Order

1. Inventory current report persistence and action logging.
   - Report create/dedupe path.
   - Existing statuses: `open`, `reviewing`, `resolved`, `dismissed`.
   - Existing reviewed-by/reviewed-at fields.
   - Any role checks already available in auth/profile data.
2. If supported, add admin-only readback:
   - list active reports with stable ordering;
   - optionally filter by status/target type;
   - serialize through shared types without exposing secrets or private bodies;
   - keep reporter spoofing impossible.
3. If supported without broadening, add one bounded status update endpoint:
   - only admins may transition reports;
   - `reviewedBy` and `reviewedAt` are server-owned;
   - invalid statuses are rejected;
   - the update does not mutate target visibility unless an existing moderation
     action route explicitly does that.
4. If schema or policy is missing, wake MIMIR with exact blockers and the tests
   that should guard the future migration.

## Guardrails

- No broad forum redesign, visible admin console, or UI reskin by default.
- No subcommunity platform, appeals workflow, notification system, reputation
  economy, or AI-autonomous posting.
- No billing/provider/Redis/Cloudflare/Developer Space work.
- No auth/session changes.
- No public/private/community visibility widening.
- No report notes, moderation reasons, hidden actions, or admin metadata in
  anonymous/member public responses.

## Acceptance

- Anonymous users cannot access report queue/readback.
- Non-admin authenticated users cannot access report queue/readback or status
  updates.
- Admins can read the bounded moderation queue.
- If status updates are implemented, reviewed-by/reviewed-at are server-owned
  and tested.
- Existing report creation/dedupe and PR78 comment moderation behavior still
  pass.
- Existing document discussion visibility still holds for public, community,
  unlisted, private, and owner paths.

## Validation

Run the narrow relevant gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If web UI changes, add the relevant web check and wake ARIADNE for a human-eye
route rehearsal.

## Handoff

DAEDALUS wakes ARGUS with:

- implementation or blocker summary;
- files changed;
- role/visibility proof;
- validation results;
- explicit non-scope confirmation.

ARGUS wakes MIMIR with the closeout verdict, or wakes ARIADNE first if visible
forum/admin UI changed enough to need a human-eye route rehearsal.

## ARGUS Review - 2026-06-19

ARGUS accepts PR79 as the API-only Community Beta report queue/readback slice.

Review confirmed:

- `GET /reports` and `PATCH /reports/:id` are authenticated and admin-only.
- Anonymous users cannot read the queue or update report status; non-admin
  authenticated users receive 403 for both paths.
- The default queue returns active `open` and `reviewing` reports, ordered by
  newest first.
- Admin filters for `status`, `targetType`, and bounded `limit` behave as
  documented.
- Status updates support `reviewing`, `resolved`, and `dismissed`; invalid
  `open` updates are rejected.
- `reviewed_by` and `reviewed_at` are server-owned and ignore spoofed request
  fields.
- Report status updates do not mutate target visibility; thread/comment
  moderation routes remain the visibility-changing paths.
- Existing report creation/dedupe, PR78 comment moderation, and document
  discussion boundaries remain green.

ARGUS patched one test guardrail:

- The reports queue test now proves anonymous status updates are blocked and
  `limit=1` returns the newest active report only.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 2 tests passed, including admin-only queue readback, limit/status/target filters, status transitions, and server-owned review fields. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 9 tests passed; PR78 comment moderation action logging/readback remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed; document discussion visibility boundaries remain intact. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local triad state. |

Verdict: PR79 can close. No ARIADNE visible-route rehearsal is required.
