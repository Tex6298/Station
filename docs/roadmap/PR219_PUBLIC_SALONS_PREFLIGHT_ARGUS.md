# PR219 Public Salons Alpha Preflight - ARGUS

Date opened: 2026-06-24
Agent: A3 / ARGUS
Opened by: A1 / MIMIR
Status: complete

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

## ARGUS Preflight Result

Completed: 2026-06-24

Verdict: accepted with required implementation gates.

Recommended PR220 lane: **Public Salon Type Foundation**.

PR220 should implement only the smallest durable Salon foundation:

- Add `salon` as an honest `community_subcommunities.subcommunity_type` value
  in the Supabase check constraint, generated DB/type surfaces, API validation,
  and web labels.
- Keep Salons backed by existing forum categories, threads, comments, reports,
  watches, votes, and delegated subcommunity moderation. Do not add a Salon
  domain object, real-time room, event stream, provider call, queue, worker,
  storage bucket, billing hook, notification flow, or new auth/session policy.
- Reuse the existing subcommunity creation authority: admin, `canon`, or
  `institutional`. Do not widen creation to `private`, `creator`, anonymous,
  public persona owners, delegated moderators, or ordinary community members.
- Keep the first Salon visibilities to `public` and `community` only. Do not
  expose `unlisted` or `private` Salon creation in the alpha UI or API.
- Keep existing thread and comment participation gates: thread creation and
  commenting remain signed-in and private-tier-gated, with read checks enforced
  on category lists, thread detail, comments, reports, and delegated queues.
- Tighten forum persona linkage before any Salon alpha ships. Current
  `validateThreadLinks` only checks `personas.visibility = 'public'`; PR220
  must require a safe `public_slug` and `ownerCanExposeExistingPublicPersonas`
  eligibility, matching public persona routes and Discover. ARGUS recommends
  applying that guard to all new forum `linked_persona_id` writes, not just
  Salon threads, so persona-linked threads cannot reference private,
  ineligible-owner, or unsafe-slug personas.

## Hostile Gate Answers

Visibility and membership:

- `public` and `community` are the only acceptable alpha visibilities.
  `community` readability must continue to be enforced by API checks; do not
  rely on the database policy alone as the privacy boundary.
- The existing admin, `canon`, or `institutional` creation gate is acceptable
  for the alpha and should not be widened.
- Posting/commenting gates are acceptable if PR220 leaves the existing
  `requireTier("private")`, `canReadSubcommunity`, `canReadThread`, hidden,
  removed, and locked checks intact and proves them with tests.

Persona linkage:

- Existing `linked_persona_id` validation is not sufficient for Salon launch.
  Public visibility alone is weaker than the accepted public persona route
  boundary. PR220 must require safe public slug routeability and eligible owner
  exposure before accepting a persona link.
- Public Salon surfaces may say a thread is linked to a public persona only.
  They must not imply exposure of private memory, archive content, setup,
  transcripts, source rows, owner aggregate counters, report internals, or
  visitor identity.

Discover and routeability:

- Existing subcommunity/category/thread serializers can carry `type: "salon"`
  and a label if they continue to omit owner-only fields from non-owner reads.
- Discover-specific Salon grouping, ranking changes, or new public feed
  behavior should wait for a later slice. PR220 may not broaden anonymous
  routeability beyond already-readable public forum content.

Public persona readback:

- Public persona pages should not list Salon links in PR220. That readback
  should wait until the `salon` type and persona-link guard are proven.
- If a later lane adds readback, safe fields are limited to title, route,
  category/subcommunity or Salon label, reply count, and last activity, and only
  for content already readable to that viewer.

Moderation and reports:

- Delegated moderation stays local to the Salon subcommunity and remains
  bounded to `hide`, `unhide`, `remove`, and `restore`.
- Report/admin/delegated readback must not expose reporter ids, report bodies
  to the wrong viewer, admin notes, raw target ids beyond existing scoped admin
  surfaces, unsafe route hints, or unsupported target actions.
- Self-moderation, revoked moderator, cross-subcommunity moderation, and
  unsupported report targets must stay blocked.

Schema and compatibility:

- A migration extending the existing subcommunity type check is enough for the
  first alpha if all corresponding TS types, DB types, route schemas,
  serializers, web helpers, and tests change in the same lane.
- Do not add direct subcommunity-to-persona linkage in PR220. Keep persona
  linkage at the existing thread-level `linked_persona_id` boundary.

## Likely PR220 Touchpoints

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
`apps/web/app/personas/[publicSlug]/page.tsx` in PR220 unless MIMIR explicitly
chooses to expand the lane after this preflight.

## Must-Have PR220 Tests

- `test:community` coverage for allowed Salon creation by admin, `canon`, and
  `institutional`, plus rejection for anonymous, `private`, `creator`, and
  ordinary users.
- API tests proving only `public` and `community` Salon creation is accepted;
  `unlisted` and `private` are rejected for the alpha.
- Read/list tests proving anonymous users see only public Salon categories and
  threads, community-only Salon content requires a community-eligible signed-in
  user, and hidden/removed/inactive material is excluded.
- Thread/comment tests proving Salon posting still requires private-tier auth,
  locked and removed threads block mutation, and unreadable subcommunities
  block thread detail and comments.
- Persona-link tests rejecting private personas, ineligible public-persona
  owners, unsafe or UUID-shaped public slugs, and missing public routes, while
  accepting an eligible public persona with a safe public slug.
- Serialization tests proving non-owners do not receive subcommunity owner ids,
  linked Space or Developer Space ids, report notes, reporter ids, raw target
  ids outside existing admin scope, private persona data, or aggregate counters.
- Delegated moderation tests proving local Salon scope, safety-action-only
  controls, self-moderation blocks, revoked moderator blocks, and
  cross-subcommunity blocks.
- Web helper tests proving `salon` labels render honestly without turning
  private/unlisted rows into directory entries.

Required validation for PR220: `test:community`, the focused web helper test
for subcommunity labels, `typecheck`, `lint`, `git diff --check`, and
`git diff --cached --check`. Run `test:personas` only if PR220 changes public
persona helpers or public persona readback, and run Discover/search tests only
if MIMIR explicitly expands PR220 into Discover.

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
