# PR220 Public Salon Type Foundation - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: accepted by ARGUS

## Frame

PR218 established that Public Salons should begin as branded
subcommunity-backed forum collections. PR219 ARGUS accepted that shape only with
implementation gates.

This is the first code lane. Keep it narrow.

## Goal

Implement the smallest durable Salon foundation:

- add `salon` as an honest `community_subcommunities.subcommunity_type`;
- carry the type through generated/manual DB types, shared forum types, API
  validation/serialization, and web labels;
- keep Salons backed by the existing forum category, thread, comment, report,
  watch, vote, and delegated moderation stack;
- preserve existing forum visibility and participation gates;
- tighten forum `linked_persona_id` writes so public-persona thread links match
  the accepted public persona routeability boundary.

## Required Scope

1. Schema and types
   - Add a Supabase migration extending the subcommunity type check to include
     `salon`.
   - Update `packages/db/src/types.ts` and `packages/types/src/forum.ts`.
   - Do not add a new Salon domain table, route namespace, event table, or
     direct subcommunity-to-persona relation.

2. API
   - Update `apps/api/src/routes/forums.ts` and any supporting
     subcommunity helpers so `salon` is a valid subcommunity type.
   - Restrict Salon alpha creation to `public` and `community` visibility.
     Reject `private` and `unlisted` Salon creation even if those visibilities
     remain valid for other subcommunity types.
   - Reuse existing creation authority: admin, `canon`, or `institutional`.
     Do not widen creation to `private`, `creator`, anonymous users, ordinary
     community users, public persona owners, or delegated moderators.
   - Preserve existing thread/comment/report/read gates:
     `requireTier("private")`, `canReadSubcommunity`, `canReadThread`, hidden,
     removed, locked, report target, and delegated moderation checks.

3. Persona-link guard
   - Tighten new forum `linked_persona_id` writes before Salon alpha ships.
   - A linked persona must be public, must have a safe routeable public slug,
     and must pass the same owner eligibility boundary used by public persona
     routes and Discover.
   - Apply this guard to all new forum thread persona links, not only Salon
     threads, unless repo evidence proves that is unsafe.
   - Do not expose private persona memory, archive, canon, setup, transcripts,
     source rows, owner aggregate counters, report internals, visitor identity,
     provider traces, or raw ids through Salon/persona linkage.

4. Web labels
   - Update web helpers and forum/subcommunity screens so `salon` renders as an
     honest Salon label.
   - Do not make private or unlisted rows appear in public directories.
   - Do not reskin the broader forum UI in this lane.

## Out Of Scope

Do not implement:

- Discover-specific Salon grouping, ranking, or new public feed behavior;
- public persona page Salon readback;
- real-time rooms;
- provider/model calls;
- persona-to-persona behavior;
- public event feeds;
- billing, notifications, Redis/Cloudflare, workers, queues, storage buckets,
  auth/session policy, or webhooks;
- moderation role expansion;
- broad UI reskin.

## Expected Touchpoints

Start from ARGUS' list and adjust only from code evidence:

- `infra/supabase/migrations/*_salon_subcommunity_type.sql`
- `packages/db/src/types.ts`
- `packages/types/src/forum.ts`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/services/community-subcommunities.service.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/lib/community-subcommunities.ts`
- `apps/web/lib/community-subcommunities.test.ts`
- `apps/web/app/forums/subcommunities/page.tsx`
- `apps/web/app/forums/[categorySlug]/page.tsx`
- `apps/web/app/forums/[categorySlug]/new/page.tsx`

Do not touch `apps/api/src/routes/discover.ts` or
`apps/web/app/personas/[publicSlug]/page.tsx` unless you find a direct compile
or type requirement. If you believe product scope needs them now, stop and wake
MIMIR instead of quietly expanding the lane.

## Must-Have Tests

Add or update focused coverage for:

- allowed Salon creation by admin, `canon`, and `institutional`;
- rejection for anonymous, `private`, `creator`, ordinary users, and delegated
  moderators;
- `public` and `community` Salon creation accepted, `private` and `unlisted`
  Salon creation rejected;
- anonymous reads include only public Salon categories/threads;
- community-only Salon content requires a community-eligible signed-in user;
- hidden, removed, inactive, locked, or unreadable Salon material stays
  blocked;
- Salon posting/commenting still requires private-tier auth;
- persona links reject private personas, ineligible public-persona owners,
  unsafe or UUID-shaped public slugs, and missing public routes;
- eligible public personas with safe public slugs are accepted;
- non-owner serialization omits subcommunity owner ids, linked private ids,
  report internals, private persona data, aggregate counters, and raw target ids
  outside existing admin scope;
- delegated moderation remains local, safety-action-only, and blocks
  self-moderation, revoked moderators, and cross-subcommunity actions;
- web helpers render `salon` labels without turning private/unlisted rows into
  directory entries.

## Validation

Run at minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/lib/community-subcommunities.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Run `test:personas` only if you change public persona helpers/readback. Run
Discover/search tests only if MIMIR explicitly expands PR220 into Discover.

## DAEDALUS Implementation Result

Completed: 2026-06-24

Implemented:

- Added migration `058_salon_subcommunity_type.sql` to extend the
  `community_subcommunities.subcommunity_type` check to include `salon`.
- Updated manual DB and shared forum type unions so `SubcommunityType` includes
  `salon`.
- Updated forum subcommunity creation validation so `salon` is a valid
  subcommunity type while preserving the existing admin, `canon`, or
  `institutional` creation gate and existing `public` / `community` visibility
  limit.
- Tightened all new forum `linked_persona_id` writes: linked personas must now
  be public, have a safe public slug / route, and pass
  `ownerCanExposeExistingPublicPersonas`.
- Added web helper and subcommunity creation UI labels for `Salon`.
- Kept Salons backed by existing forum categories, threads, comments, reports,
  watches, votes, and delegated moderation. No new Salon table, route namespace,
  event table, direct subcommunity-to-persona relation, Discover grouping, or
  public persona readback was added.

Focused test coverage added or extended:

- `test:community` now covers admin, non-admin `canon`, and `institutional`
  Salon creation.
- Rejection coverage includes anonymous, `private`, `creator`, and delegated
  moderator creation attempts, plus `private` and `unlisted` Salon visibility
  attempts.
- Public and community Salon read/list/category access now proves anonymous
  users see only public Salon content while community-visible Salon content
  requires a community-eligible signed-in user.
- Salon thread/comment mutation keeps existing private-tier gates and locked,
  hidden, removed, inactive, and unreadable material blocked.
- Persona-link tests now reject private personas, ineligible owners, unsafe
  UUID-shaped slugs, and missing public routes, while accepting an eligible
  public persona with a safe public slug.
- Existing delegated moderation action and queue tests now exercise
  Salon-backed subcommunities for local scope, safety-action-only controls,
  self-moderation blocks, revoked moderator blocks, and cross-subcommunity
  blocks.
- Web helper tests now prove the `Salon` label renders without changing
  private/unlisted directory exclusion.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 22 tests.
- `npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/lib/community-subcommunities.test.ts`
  passed with 4 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.

ARGUS review focus:

- Verify the migration/type/API/web label surface is complete.
- Review the tightened forum persona-link routeability guard.
- Review the expanded `test:community` cases for overclaiming, especially
  community visibility, non-owner serialization, delegated moderation locality,
  and missing public persona route failures.
- Confirm PR220 stayed out of Discover-specific Salon grouping and public
  persona Salon readback.

## ARGUS Review Result

Completed: 2026-06-24

Verdict: accepted.

Review notes:

- The migration/type/API/web label surface is complete for the narrow foundation
  lane: `salon` is now a durable subcommunity type and the creation UI labels it
  honestly without adding a separate Salon domain object or route namespace.
- Creation authority remains admin, `canon`, or `institutional`, and the alpha
  creation visibility remains bounded to `public` and `community`.
- Thread/comment read and mutation gates remain on the existing forum paths:
  private-tier posting/commenting, `canReadSubcommunity`, `canReadThread`,
  hidden/removed/locked checks, local delegated moderation, and safety-action
  bounds.
- The forum persona-link write guard now matches the accepted public-persona
  routeability boundary for new thread links: public visibility, safe public
  slug/route, and owner public-persona eligibility.
- PR220 stayed out of Discover-specific Salon grouping, public persona Salon
  readback, realtime rooms, provider/model calls, persona-to-persona behavior,
  public event feeds, billing, notifications, Redis/Cloudflare, workers,
  queues, storage buckets, auth/session policy, moderation-role expansion, and
  broad UI reskin.

Residual gate for future lanes:

- Existing forum thread payloads still include the established
  `linked_persona_id` / discussion-provenance id contract. ARGUS does not block
  PR220 on that pre-existing forum contract because this lane did not add
  Discover grouping or public persona readback. Any future Salon readback,
  Discover grouping, or public persona page surface for persona-linked Salon
  threads should prefer safe public slug/href fields and should not introduce a
  new raw persona-id public surface.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 22 tests.
- `npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/lib/community-subcommunities.test.ts`
  passed with 4 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `git diff --check` passed with CRLF normalization warnings only.
- `git diff --cached --check` passed.

## MIMIR Closeout

MIMIR closes PR220 on 2026-06-24 and opens
`docs/roadmap/PR221_PUBLIC_SALON_HOSTED_PROOF_DAEDALUS.md`.

Reason: PR220 added a real hosted Supabase type/check migration, so staging
must prove migration `058` and the Railway API/web code path before Salon UX is
widened.

## Wakeup

When done, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR220 Public Salon Type Foundation.
Risk:
- Salon type/schema/API/web labels and persona-link routeability need hostile
  review.
Task:
- Review implementation, run validation, patch if needed, and wake MIMIR with
  the verdict.
```
