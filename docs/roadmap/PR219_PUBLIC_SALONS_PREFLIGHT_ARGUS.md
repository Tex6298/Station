# PR219 Public Salons Alpha Preflight - ARGUS

Date opened: 2026-06-24
Agent: A3 / ARGUS
Opened by: A1 / MIMIR
Status: active

## Frame

DAEDALUS completed PR218 and recommends a Salon alpha built on existing
community/forum primitives:

- a branded `community_subcommunities` backed collection;
- ordinary forum categories, threads, comments, votes, watches, reports, and
  delegated moderation;
- optional public persona context through existing thread-level
  `linked_persona_id`;
- public or community-visible read paths only for the alpha;
- no real-time rooms, provider calls, event feeds, Redis/Cloudflare, queues, or
  billing/config dependency.

MIMIR accepts the direction, but Salons touch public/community visibility,
delegated moderation, membership expectations, persona linkage, Discover
routeability, and public persona readback. ARGUS must set the hostile gates
before DAEDALUS implements code.

Do not implement Salons in this lane.

## Proposed Alpha Shape To Review

Review this as the candidate implementation shape:

- Add an honest `salon` subcommunity type instead of relabeling `general`.
- Reuse the existing subcommunity creation gate unless ARGUS finds it unsafe:
  `canon`, `institutional`, or admin.
- First visibility set: `public` and `community` only.
- Posting and commenting keep the existing signed-in community participation
  and tier checks.
- Salon content remains asynchronous forum content. No live room semantics.
- Persona linkage stays on forum threads with existing public-persona
  eligibility checks.
- Public persona pages may later read back routeable Salon thread links/counts
  only if those links are already public/community-safe.
- Discover may later group or label routeable Salon content, but should not
  rewrite feed ranking or broaden private/community visibility.

## ARGUS Questions

1. Visibility and membership
   - Are `public` and `community` the only acceptable alpha visibilities?
   - Is the existing subcommunity creation gate safe for Salons?
   - Are posting/commenting gates already consistently enforced across thread
     create, comment create, thread detail, lists, and search?

2. Persona linkage
   - Does existing `linked_persona_id` validation fully prevent private or
     ineligible persona references?
   - What must public Salon surfaces say so a persona-linked thread does not
     imply private memory, archive, setup, transcript, or owner counters are
     being exposed?

3. Discover and routeability
   - If Discover labels Salon content, which serializers/routes can safely carry
     `salon` identity?
   - What tests prove private, unlisted, hidden, removed, locked, and
     community-only Salon material does not leak into anonymous public results?

4. Public persona readback
   - Should public persona pages include Salon links in the first
     implementation slice, or should that wait until after the `salon` type is
     proven?
   - If included, which fields are safe: title, route, category/subcommunity
     label, reply count, last activity, or none?

5. Moderation and reports
   - Does delegated moderation stay local to the Salon subcommunity?
   - Do report create/readback paths avoid reporter ids, report body leakage,
     admin notes, raw target ids, route hints that bypass visibility, and
     unsupported moderation actions?
   - Are self-moderation and cross-subcommunity moderation blocks covered?

6. Schema and compatibility
   - Is a migration adding `salon` to the existing subcommunity type check
     enough, or does the schema need a stronger boundary first?
   - Which type definitions and tests must change with the migration?

7. Scope discipline
   - Confirm no real-time rooms, provider/model calls, persona-to-persona
     behavior, public event feeds, billing, notifications, Redis/Cloudflare,
     workers, queues, storage buckets, auth/session policy, broad UI reskin, or
     moderation-role expansion belong in the first implementation.

## Required Repo Touchpoints

Use PR218 as the map, then inspect anything needed to answer the hostile
questions:

- `docs/roadmap/PR218_PUBLIC_SALONS_GATE_DAEDALUS.md`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/personas.ts`
- `apps/api/src/services/community-subcommunities.service.ts`
- `apps/api/src/services/community-moderation-permissions.service.ts`
- `apps/web/lib/community-subcommunities.ts`
- `apps/web/app/forums/subcommunities/page.tsx`
- `apps/web/app/forums/[categorySlug]/page.tsx`
- `apps/web/app/personas/[publicSlug]/page.tsx`
- `apps/web/components/discover/search-dropdown.tsx`
- `packages/types/src/forum.ts`
- `packages/db/src/types.ts`
- `infra/supabase/migrations/041_community_subcommunities.sql`

Use `rg` for any extra references.

## Output

Update this document and `docs/roadmap/ACTIVE_STATUS.md` with:

- verdict: accepted, accepted with required implementation gates, or blocked;
- exact PR220 implementation slice if accepted;
- files/routes/schema likely touched;
- must-have tests for DAEDALUS;
- privacy/moderation boundaries that must appear in code/tests;
- whether public persona readback and Discover labeling belong in PR220 or a
  later slice.

If ARGUS needs to patch this doc or the roadmap to correct the plan, do that.
Do not implement Salon product code in PR219.

## Validation

Run:

```text
git diff --check
git diff --cached --check
```

If you inspect or patch code for evidence, run only the focused tests needed to
support the preflight verdict.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR219 Salon Alpha Preflight.
Verdict:
- Accepted / accepted with gates / blocked.
Recommendation:
- Name the exact PR220 implementation lane or blocker.
Task:
- Decide the next lane and wake DAEDALUS or revise the plan.
```
