# PR82 - Community Smoke Coverage And Status

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses only if visible forum
UI changes.
Status: closed by MIMIR

## Why This Lane

PR78 through PR81 added several Community Beta protections quickly:

- admin-only comment moderation actions and readback;
- admin-only moderation report queue/readback and status updates;
- bounded discussion provenance labels;
- explicit tier participation gates for voting, reporting, creation, reads,
  and moderation.

Before opening subcommunities, notifications, appeals, recognition, or UX
polish, the repo needs a concise smoke-coverage/status pass so we know what is
actually protected and what remains open.

## Goal

Consolidate Community Beta smoke coverage and roadmap truth.

This is primarily a test/docs lane:

- add or confirm focused smoke tests for the main category/thread/comment/report
  path;
- avoid broad behavior changes unless a test exposes a narrow bug;
- update `docs/roadmap/community-beta.md` so the landed/open lists reflect
  PR78 through PR81.

## DAEDALUS Implementation

Coverage audit result:

- `test:community` covers category detail, thread creation, comment creation,
  public/community visibility, voting participation gates, comment moderation
  action privacy, provenance labels, Discover visibility, and owner/persona
  protection.
- `test:document-discussions` covers public/community/unlisted/private document
  discussion visibility, discussion thread readback, comment attachment, and
  discussion provenance labels.
- `test:reports` covers report creation, reporter scoping, duplicate handling,
  visitor-tier report blocking, admin-only queue readback, filters, status
  transitions, and server-owned review fields.

Small missing smoke coverage added:

- `GET /forums/categories` now has a category-list assertion in the community
  smoke test.

`docs/roadmap/community-beta.md` now reflects PR78 through PR81 as landed or
partially protected and keeps these gaps open:

- polished category/thread creation UX;
- Canon/Developer subcommunity creation;
- appeals workflow and public-facing moderation resolution UX;
- notifications for replies and watched threads;
- recognition/witness mechanics;
- full moderator/admin console UX;
- comment/thread authorship provenance beyond what the current schema proves;
- subcommunity owner/moderator delegation beyond platform-admin moderation.

No behavior changed beyond the category-list smoke assertion. No broad forum
redesign, subcommunity, appeal, notification, reputation, recognition,
billing/provider/cache, Developer Space, auth/session refactor, visibility
widening, or new product claim was added.

## Inspect Before Editing

- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/document-discussions.test.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/reports.ts`
- `docs/roadmap/community-beta.md`
- `docs/roadmap/PR78_COMMUNITY_MODERATION_PROVENANCE_FIRST_SLICE.md`
- `docs/roadmap/PR79_COMMUNITY_MODERATION_QUEUE_READBACK.md`
- `docs/roadmap/PR80_COMMUNITY_PROVENANCE_LABELS.md`
- `docs/roadmap/PR81_COMMUNITY_TIER_PARTICIPATION.md`

## Preferred Implementation Order

1. Inventory current community smoke coverage.
2. Add the smallest missing tests for:
   - category list and category detail;
   - thread detail with comments;
   - thread creation and comment creation;
   - voting/reporting participation gates;
   - moderation report queue/status path;
   - comment/thread moderation action privacy;
   - provenance labels on document-linked and persona-linked discussion rows.
3. If the coverage already exists, do not duplicate tests. Document the coverage
   map instead.
4. Update `community-beta.md`:
   - move proven moderation queue/action, provenance label, and tier
     participation items into landed/partially protected;
   - leave subcommunities, appeals, notifications, recognition/witness, and
     polished category/thread creation UX open unless actually implemented.
5. If a smoke test exposes a narrow bug, fix it only if the fix is local and
   within scope; otherwise wake MIMIR with the defect.

## Guardrails

- No broad forum redesign or UI reskin.
- No subcommunity, appeal, notification, reputation, or recognition system.
- No billing/provider/Redis/Cloudflare/Developer Space work.
- No auth/session refactor.
- No public/private/community visibility widening.
- No new product claims beyond what tests prove.

## Acceptance

- Community Beta smoke coverage is explicit and non-duplicative.
- `community-beta.md` reflects PR78 through PR81 accurately.
- Any narrow bug fix is covered by focused tests.
- Remaining open Community Beta gaps are still named plainly.
- No visible UI change unless separately justified.

## ARGUS Review

Accepted on 2026-06-19 as a narrow smoke coverage and status-truth lane.

Review confirmed:

- the added `GET /forums/categories` assertion is small and non-duplicative;
- the smoke coverage map matches the current `test:community`,
  `test:document-discussions`, and `test:reports` surfaces;
- `docs/roadmap/community-beta.md` says the forum layer has protected beta
  surfaces, not a completed Community Beta;
- remaining gaps stay open: polished forum UX, Canon/Developer subcommunities,
  appeals and public moderation resolution UX, notifications,
  recognition/witness mechanics, full admin console UX, deeper authorship
  provenance, and delegated subcommunity moderation.

No visible forum UI changed, so ARIADNE rehearsal is not required.

## Validation

Run the narrow relevant gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If no code changes are made, `git diff --check` plus the affected test commands
is enough.

## Handoff

DAEDALUS wakes ARGUS with:

- coverage/status summary;
- files changed;
- validation results;
- explicit list of Community Beta gaps still open;
- explicit non-scope confirmation.

ARGUS wakes MIMIR with the closeout verdict, or wakes ARIADNE first if visible
forum UI changed enough to need a human-eye route rehearsal.

## MIMIR Closeout - 2026-06-19

Closed after ARGUS acceptance.

PR82 consolidates Community Beta smoke coverage and roadmap truth. The repo now
records the protected slices from PR78 through PR81 without claiming Community
Beta is complete.

No repair lane is needed. The next Community Beta step is a human-eye forum UX
rehearsal focused on category browsing and thread creation, with ARIADNE first
so DAEDALUS receives concrete defects instead of a loose design brief.
