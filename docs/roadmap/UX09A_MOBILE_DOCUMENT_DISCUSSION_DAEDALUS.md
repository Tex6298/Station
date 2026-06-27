# UX-09A Mobile Public Document Discussion Cue

Owner: DAEDALUS
Reviewer: ARGUS, then ARIADNE
Status: COMPLETE - WAKE MIMIR
Opened: 2026-06-27
Completed: 2026-06-27

## Why This Exists

ARIADNE completed UX-09 Railway Staging UX Review with `PASS WITH CAVEAT`:
`docs/roadmap/UX09_RAILWAY_STAGING_UX_REVIEW_RESULT.md`.

The caveat is narrow:

```text
The linked forum discussion from the first visible public document was visible
on desktop but not visible in the mobile public-document sampled UI.
```

The public document, public Space, Forums, and replay Salon thread routes loaded
safely. This is not a staging blocker and not a broad redesign request. It is a
mobile route-story clarity repair if source inspection confirms the linked
discussion affordance can disappear or become too hard to see on mobile.

## Product Intent

Public document readers should be able to understand that a public document has
a linked forum discussion under the same visibility boundary, and they should be
able to navigate to it on mobile without guessing.

Do not change the underlying visibility, moderation, discussion, document,
Space, or forum data contract.

## DAEDALUS Finding

No product code change is warranted from source inspection.

The public document detail route already renders a mobile-reachable linked
discussion action when a visible discussion exists:

- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx` builds
  `discussionHref` from the attached forum thread.
- The first `Open linked discussion` action renders directly under the
  document title and metadata, before owner controls, document trust readback,
  version history, composer, discussion readback, and document body.
- A second Discussion card with the same action renders above the document
  body for published documents.
- The page uses a narrow `maxWidth: 720` single-column layout, flex wrapping,
  and shared `.button` styles; no mobile CSS rule inspected hides or disables
  the action.
- `discussionFallbackFromDocument` creates a safe fallback route from
  `discussion_thread_id`, so a public document row that carries the linked
  thread still has an immediate cue while the discussion endpoint resolves.

This points to the UX-09 caveat being either hosted sample depth, data timing,
or screenshot/sampling coverage rather than a missing mobile affordance in the
current source.

Result:

- No API, route, schema, auth, billing, provider, deployment, visibility,
  moderation, publish, retract, cleanup, Space, forum, or public document
  contract changed.
- No tests were added because no behavior changed.
- MIMIR should decide whether ARIADNE should rerun only the mobile public
  document sample after deploy/browser refresh, or simply carry the caveat as
  non-blocking staging evidence.

## Likely Source Area

Start with:

- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`
- `apps/web/lib/publishing.ts`
- `apps/web/lib/publishing-ui.test.ts`
- any local public-document or Space document tests that already cover linked
  discussion/readback copy.

Related helpers and cues worth checking:

- `documentTrustReadback`
- `discussionTrustValue`
- `discussionTrustBody`
- `publishingDashboardRouteStoryRows`
- public Space document cards and public document detail rendering.

## DAEDALUS Task

1. Inspect the public document detail source and tests.
2. Determine whether the mobile linked-discussion cue is missing, visually
   hidden, pushed below an unreasonable mobile point, or merely not present in
   the sampled hosted data.
3. If source shows a real mobile affordance issue, implement the smallest repair
   that keeps the desktop behavior and data contract intact.
4. If source does not show a product issue, document the finding and wake MIMIR
   instead of forcing a code change.
5. Add or update focused tests around the public document linked-discussion
   readback/cue if code changes.
6. Wake ARGUS for technical review if code changes; wake MIMIR if no product
   change is warranted.

## Boundaries

Do not:

- change API routes, database schema, migrations, auth, billing, provider,
  Redis, Cloudflare, Supabase, deployment, package, or config behavior;
- alter discussion visibility, moderation, report, publish, retract, cleanup,
  or thread semantics;
- create, publish, retract, delete, report, moderate, upload, import, generate
  keys, send Assistant messages, or trigger billing flows on hosted staging;
- redesign Discover, Forums, Studio, public Spaces, or Developer Spaces;
- reopen generic Discern parity.

Keep the change limited to public document mobile discussion visibility or
document that no code change is needed.

## Acceptance Criteria

If implemented:

- a mobile reader on a public document with `discussion_thread_id` can see a
  clear linked-discussion cue or action;
- the cue/action navigates to the existing linked forum discussion route;
- desktop public document behavior remains intact;
- no private source, owner-only, prompt, completion, credential, or raw owner
  identifier is exposed;
- tests cover the linked-discussion cue/readback path.

If not implemented:

- the result explains why the caveat is data/sampling-only or already covered by
  source behavior;
- the result names what ARIADNE should recheck, if anything.

## Suggested Validation

Run the narrowest meaningful set:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If the touched code has a more focused public-document route test, run that
instead of or in addition to `test:studio-ui`.

Run an added-line sensitive-pattern scan and explain any boundary-wording
matches.

## Wakeup Contract

If code changes:

```text
WAKEUP A3:
Codename: ARGUS
```

If no code change is warranted:

```text
WAKEUP A1:
Codename: MIMIR
```
