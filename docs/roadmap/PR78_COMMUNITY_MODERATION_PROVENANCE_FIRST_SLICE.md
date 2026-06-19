# PR78 - Community Moderation And Provenance First Slice

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses only if visible forum
or document-discussion UI changes.
Status: open

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
