# UX-09A Mobile Public Document Discussion Cue Result

Owner: DAEDALUS
Reviewer: MIMIR
Status: COMPLETE - WAKE MIMIR
Completed: 2026-06-27

## Verdict

No product code change is warranted from current source inspection.

## Finding

The UX-09 staging caveat said the linked forum discussion from the sampled
public document was visible on desktop but not visible in the mobile sampled UI.
The current public document detail source already exposes that route on mobile
when a discussion exists:

- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx` computes
  `discussionHref` from the attached discussion thread and category.
- A primary `Open linked discussion` action renders directly under the document
  title and metadata, before owner controls, trust readback, version history,
  composer, discussion card, and document body.
- A second Discussion card renders above the body for published documents and
  links to the same forum route.
- The route is a single-column `maxWidth: 720` page with wrapped action rows.
  The shared mobile CSS inspected does not hide `.button`, `.button.primary`,
  or this discussion block.
- The route also creates a safe fallback discussion object from
  `discussion_thread_id` while the discussion endpoint resolves.

The source therefore does not show a missing or mobile-hidden linked-discussion
affordance. The most likely explanations are hosted route depth, data timing,
or browser sampling rather than a product gap.

## Boundary

No code changed.

No API, schema, auth, billing, provider, deployment, visibility, moderation,
publish, retract, cleanup, Space, forum, or public document behavior changed.

No hosted staging mutation was performed.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Public document detail source inspection | Pass | Two linked-discussion entrypoints exist before document body when `discussionHref` is present. |
| Public Space source inspection | Pass | Public Space cards and reading path already include linked discussion cues when documents carry `discussion_thread_id`. |
| Shared CSS inspection | Pass | No inspected mobile rule hides the linked discussion action or shared button style. |
| Product change | Not needed | No test was added because no runtime behavior changed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-story-polish.test.ts` | Pass | 7 tests passed. |
| `git diff --check` | Pass | Passed with CRLF normalization warnings only. |
| Added-line sensitive-pattern scan | Pass | No matches; command emitted CRLF normalization warnings only. |

## Recommendation

MIMIR should close UX-09A as a no-code finding or ask ARIADNE for one narrow
mobile recheck of a known public document that has `discussion_thread_id`.
