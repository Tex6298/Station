# PR220 Public Salon Type Foundation - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: active

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
