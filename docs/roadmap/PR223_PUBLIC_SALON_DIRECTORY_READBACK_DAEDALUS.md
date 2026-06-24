# PR223 Public Salon Directory Readback - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: active

## Frame

PR220 added the `salon` subcommunity type. PR221 repaired and proved hosted
Supabase/Railway. PR222 ARIADNE rehearsal passed the current public Salon
foundation and found one non-blocking visible issue:

- `/forums/subcommunities` still introduces the directory as `Canon and
  Developer community areas.` even though Salon rows are now valid and visible.

The next lane should make the existing public forum directory/category readback
honestly Salon-aware. Do not jump into Discover or public persona surfaces yet.

## Goal

Improve the existing public forum routes so a human can understand Salons from
the current directory/category surfaces:

- `/forums/subcommunities` copy should include Salons or use a neutral phrase
  that covers Canon, Developer, and Salon community areas.
- The public subcommunity directory should clearly label Salon rows without
  implying real-time rooms, provider calls, persona-to-persona behavior, or
  wider product features.
- The existing category route for a Salon-backed category, for example
  `/forums/station-replay-salon-alpha`, should keep showing the Salon label,
  public visibility, description, search/sort controls, and honest empty state.
- If a small type-aware filter, count, or section label already fits the local
  component patterns, add it. If it would require a larger UI rewrite, leave it
  out and document why.

## Required Scope

1. Copy polish
   - Fix the stale `Canon and Developer community areas.` wording.
   - Avoid overpromising a dedicated Salon product if the current surface is
     still a forum/subcommunity-backed foundation.

2. Directory readback
   - Preserve the existing `/forums/subcommunities` route.
   - Keep public and community visibility behavior unchanged.
   - Keep private/unlisted rows out of public directory readback.
   - Keep non-owner readback limited to accepted public-safe fields.

3. Category readback
   - Preserve the existing `/forums/[categorySlug]` route.
   - Keep the Salon category route asynchronous and thread-based.
   - Do not introduce live-room, provider, persona-to-persona, or public-event
     semantics.

4. Tests
   - Add/update focused web tests for the copy/label/readback behavior if the
     repo has suitable coverage.
   - Keep API tests focused only if API behavior changes.

## Out Of Scope

Do not implement:

- Discover-specific Salon grouping, ranking, or search result sections;
- public persona page Salon readback;
- new public persona safe slug/href serializer work beyond what PR220 already
  did;
- direct subcommunity-to-persona links;
- Salon creation policy changes;
- real-time rooms;
- provider/model calls;
- persona-to-persona behavior;
- public event feeds;
- billing, notifications, Redis/Cloudflare, workers, queues, storage buckets,
  auth/session policy, webhooks, moderation-role expansion, or broad UI reskin.

## Expected Touchpoints

Likely files:

- `apps/web/app/forums/subcommunities/page.tsx`
- `apps/web/app/forums/[categorySlug]/page.tsx`
- `apps/web/lib/community-subcommunities.ts`
- `apps/web/lib/community-subcommunities.test.ts`

Only touch API files if the web work proves an API gap.

## Validation

Run focused checks for touched files. Expected minimum:

```text
npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/lib/community-subcommunities.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Run `test:community` if any API, serializer, visibility, or route behavior
changes.

## Wakeup

When done, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR223 Public Salon Directory Readback.
Risk:
- Public forum directory/category readback changed and needs hostile boundary
  review.
Task:
- Review visible copy, public-safe readback boundaries, validation, and whether
  ARIADNE needs another hosted rehearsal.
```
