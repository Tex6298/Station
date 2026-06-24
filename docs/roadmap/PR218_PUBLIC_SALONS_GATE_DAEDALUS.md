# PR218 Public Salons Gate - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: complete - awaiting MIMIR decision

## Frame

Public persona discovery/readback is now proven:

- public persona pages;
- public context preview;
- signed-in public persona chat alpha;
- owner interaction readback and aggregate counters;
- Public Persona Roulette;
- deployed ARIADNE rehearsals.

The next candidate family is Salons: public or semi-public conversation spaces
around personas, topics, research, or communities.

This is wider than Roulette. Station already has forums, threads, comments,
subcommunities, moderation, and reports. PR218 should determine whether Salons
can be introduced as a small no-new-config layer over those primitives, or
whether they need a larger schema/product gate.

Do not implement Salons in this lane.

## Questions To Answer

1. Product shape
   - Is a Salon a branded forum category, a subcommunity, a thread collection,
     a persona-linked room, or a new top-level object?
   - What is the smallest useful alpha that feels like a Salon without adding
     real-time chat or provider calls?

2. Existing primitives
   - Which existing forum/subcommunity/thread/comment/report routes can be
     reused?
   - Can public persona pages link to a Salon using existing discussion/thread
     references?
   - Can Discover surface Salons without a feed rewrite?

3. Visibility and membership
   - Public, community-visible, owner-only, invite-only, or tier-gated?
   - Who can create a Salon?
   - Who can post, reply, report, moderate, or pin?

4. Moderation
   - Can existing report/moderation actions cover Salon threads/comments?
   - Does delegated moderation already cover the needed roles?
   - What new abuse states would Salons create?

5. Public/private boundaries
   - How do Salons avoid leaking private persona memory/archive/canon,
     owner-only aggregate counters, report internals, or provider traces?
   - What should be visible on public persona pages versus Studio owner pages?

6. Scope and config
   - Which slice needs no new external config?
   - Which slice would require billing, provider calls, Redis/Cloudflare,
     workers, notifications, or new auth/session policy?

## Required Repo Map

Inspect:

- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/services/community-subcommunities.service.ts`
- `apps/api/src/services/community-moderation-permissions.service.ts`
- `packages/types/src/forum.ts`
- Discover routes/components touched by PR216;
- public persona route/components;
- any existing docs or code mentioning salons, rooms, subcommunities,
  communities, live discussion, sessions, or public discussions.

Use `rg` first and record the concrete files/routes.

## Preferred Bias

MIMIR's current bias:

- Prefer a no-new-config Salon alpha over existing forums/subcommunities if the
  repo supports it cleanly.
- Prefer readback/discovery plus ordinary thread/comment participation before
  any real-time room or provider call.
- Require ARGUS preflight before any new visibility, moderation, membership, or
  public event semantics are implemented.

DAEDALUS should confirm or overturn that from repo evidence.

## Output

Produce a decision packet in this doc and `ACTIVE_STATUS`:

- repo affordances and gaps;
- recommended Salon product shape;
- recommended smallest PR219 slice;
- whether PR219 should go to ARGUS preflight first or DAEDALUS implementation;
- routes/components/schema likely touched;
- privacy/moderation risks;
- config requirements, if any;
- validation plan.

## DAEDALUS Decision Packet

Completed: 2026-06-24

### Repo Map

Concrete files inspected:

- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/personas.ts`
- `apps/api/src/services/community-subcommunities.service.ts`
- `apps/api/src/services/community-moderation-permissions.service.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/web/lib/community-subcommunities.ts`
- `apps/web/app/forums/page.tsx`
- `apps/web/app/forums/subcommunities/page.tsx`
- `apps/web/app/forums/[categorySlug]/page.tsx`
- `apps/web/app/forums/[categorySlug]/new/page.tsx`
- `apps/web/app/personas/[publicSlug]/page.tsx`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/discover-front-door.tsx`
- `packages/types/src/forum.ts`
- `packages/db/src/types.ts`
- `infra/supabase/migrations/041_community_subcommunities.sql`

Search terms used included `salon`, `room`, `subcommunity`,
`linkedPersonaId`, `linked_persona_id`, `public discussion`, `live discussion`,
`session`, `moderation`, `Discover`, and `public persona`.

### Affordances

- Station already has durable forum primitives: categories, threads, comments,
  votes, watches, reports, delegated moderation, and subcommunity owner/moderator
  roles.
- `community_subcommunities` gives a durable category-backed community container
  with owner, visibility, status, optional linked Space, optional linked
  Developer Space, public/community list filtering, and owner/admin private
  field serialization.
- Current subcommunity creation is already tier/admin gated:
  `canCreateSubcommunity` allows `canon`, `institutional`, or admin users.
- Existing read semantics are useful for a Salon alpha: anonymous users can
  read public active content; signed-in community-eligible users can read
  community-visible content; unlisted/private subcommunities are owner/admin
  only.
- Thread creation is already durable and `private` tier gated. It validates
  readable categories, subcommunity visibility, public Space links, published
  document links, and public persona links.
- Threads already have `linked_persona_id` / `linkedPersonaId`, and the current
  validator rejects non-public persona links.
- Thread detail and comment list/create paths already re-check thread
  visibility and subcommunity readability before exposing or mutating content.
- Report persistence is durable in `moderation_reports`; reporter identity and
  status remain server-controlled.
- Delegated moderation is already bounded to the local subcommunity target and
  safety actions for non-admin moderators: hide, unhide, remove, restore.
- Discover already surfaces public/community-safe thread feed/search results and
  excludes document-linked threads from the generic feed. Public persona search
  now returns routeable, eligible public persona cards only.
- Public persona pages already expose public profile, context preview from
  routeable public documents and linked public discussions, signed-in public
  chat, and report controls without owner private readback.

### Gaps

- There is no existing Salon domain object, route namespace, or web label.
- `SubcommunityType` is currently `general | canon | developer` in both
  `packages/types/src/forum.ts` and `packages/db/src/types.ts`.
- Migration `041_community_subcommunities.sql` enforces the same
  `subcommunity_type in ('general', 'canon', 'developer')` check, so an honest
  `salon` type needs a tiny schema/type migration.
- Subcommunities can link to a Space or Developer Space, but not directly to a
  persona. Persona linkage exists at the thread level only.
- Public persona pages currently show public document and linked public
  discussion sources, but they do not list persona-linked forum threads as a
  Salon/readback surface.
- Discover has no Salon result type. It can surface ordinary public/community
  forum threads, but a Salon-specific browse card or label needs a small web/API
  serializer addition if desired.
- Delegated moderation report route hints intentionally avoid exposing category
  slugs. That is safe, but it means a Salon alpha should not promise rich
  moderator deep links until that boundary is reviewed separately.

### Recommended Product Shape

A Salon should start as a **branded subcommunity-backed forum collection**, not
as a real-time room, event feed, provider call, or new top-level social object.

The smallest honest shape is:

- one durable `community_subcommunities` row with type `salon`;
- one backing `forum_categories` row;
- ordinary public or community-visible threads and comments;
- optional persona context at the thread level via existing `linked_persona_id`;
- existing report, delegated moderation, vote, watch, and witness mechanics;
- optional Discover/public persona readback that links to existing
  `/forums/:categorySlug/:threadId` routes.

This keeps Salons asynchronous and accountable. It gives the product a named
place without adding live rooms, provider calls, public event logs, queues, or
new moderation powers.

### Recommended PR219 Slice

Recommend **PR219 - ARGUS Salon Alpha Preflight** before DAEDALUS implements
anything.

Reason: Salons touch public/community visibility, delegated moderation,
membership expectations, persona linkage, Discover routeability, and public
persona readback. Those are exactly the boundaries MIMIR asked ARGUS to inspect
before new visibility, moderation, membership, or public event semantics land.

ARGUS should produce the hostile gates for the first implementation slice:

- Salon alpha remains ordinary asynchronous forum/subcommunity content.
- No real-time rooms, provider/model calls, public event feeds, queues, Redis,
  Cloudflare, billing, notifications expansion, or new auth/session policy.
- Salon creation should reuse the existing `canon`/`institutional`/admin
  subcommunity creation gate unless MIMIR intentionally changes creation policy.
- First visibility set should be `public` and `community` only. No invite-only,
  anonymous-posting, or private-owner Salon behavior in the alpha.
- Posting/commenting keeps the existing `private` tier community participation
  gate.
- Persona linkage uses existing thread-level `linked_persona_id` and only for
  eligible public personas. Do not expose private persona memory, archive,
  runtime context, raw source ids, owner interaction counters, report internals,
  or provider traces.
- Public persona page readback, if added later, should show only routeable
  public/community-safe Salon thread links and counts acceptable under current
  public persona boundaries.
- Discover, if touched later, should label or group routeable Salon content
  without broad feed/ranking rewrites.
- Moderation remains existing subcommunity owner/admin/active-moderator safety
  actions plus platform reports. No new moderation role or public moderator
  directory.

If MIMIR wants implementation after ARGUS, the first DAEDALUS slice should be
small and likely touch only:

- a migration extending `community_subcommunities.subcommunity_type` to include
  `salon`;
- `packages/db/src/types.ts` and `packages/types/src/forum.ts`;
- `apps/api/src/routes/forums.ts` create/list/read schemas and serializers;
- `apps/web/lib/community-subcommunities.ts`;
- `apps/web/app/forums/subcommunities/page.tsx` and existing category/new-thread
  labels;
- focused `test:community` coverage for Salon type, public/community
  visibility, persona-linked thread filtering, and moderation scope.

Public persona page or Discover-specific Salon readback should be a second
implementation slice unless ARGUS finds the label-only subcommunity slice too
thin to be useful.

### Privacy And Moderation Risks

- A persona-linked Salon can accidentally imply private persona memory, archive,
  setup, owner counters, or transcripts are part of the public thread. First
  implementation must keep the link as public profile context only.
- Adding Salon labels to Discover or public persona pages could widen
  routeability. Tests should include private subcommunities, community-only
  subcommunities, hidden/removed/locked threads, unsafe public persona slugs,
  ineligible public personas, document-linked thread exclusion, and cross-owner
  persona attempts.
- Delegated moderators must stay local to their subcommunity and safety-action
  limited. Existing self-moderation and cross-subcommunity checks should be
  re-run when `salon` is added.
- Report/readback responses must not expose reporter ids, report bodies to
  owners, admin notes, route hints that bypass visibility, or unsupported target
  actions.
- Community-visible Salons need signed-in community tier checks everywhere they
  are listed, searched, read, or linked from another public surface.

### Config Requirements

No external config is needed for the recommended alpha.

The first implementation should not require billing, Stripe, provider keys,
Redis/Valkey, Upstash, Cloudflare, workers, queues, webhooks, notification
delivery, new auth redirect policy, or Supabase storage buckets.

The only likely infrastructure change is a small Supabase migration for the
`salon` subcommunity type if MIMIR accepts the product shape.

### Validation Plan For Implementation

For ARGUS preflight:

- `git diff --check`
- `git diff --cached --check`

For the first DAEDALUS implementation slice:

- `npm exec --yes pnpm@10.32.1 -- run test:community`
- `npm exec --yes pnpm@10.32.1 -- run test:personas` if public persona links or
  readback are touched
- `npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/lib/community-subcommunities.test.ts`
- `npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/components/discover/search-dropdown.test.ts`
  if Discover/search is touched
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
- `git diff --cached --check`

### Verdict

Confirm MIMIR's bias with one correction: a useful Salon alpha can reuse the
forum/subcommunity stack and needs no external config, but it should not pretend
to be a Salon without at least a tiny `salon` type/schema addition. Because that
touches public/community identity and moderation semantics, PR219 should be
ARGUS preflight before DAEDALUS implementation.

## Hard Boundaries

Do not implement:

- real-time chat rooms;
- provider/model calls;
- persona-to-persona calls;
- new event feeds;
- billing or subscription changes;
- Redis/Cloudflare/workers/queues;
- private persona source exposure;
- moderation role changes;
- broad UI reskin.

This is a gate and handoff lane only.

## Validation

Run:

```text
git diff --check
git diff --cached --check
```

If you add any helper or script for mapping, run the relevant syntax/test
check.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR218 Public Salons gate.
Recommendation:
- Name the recommended PR219 slice and whether ARGUS preflight is needed.
Task:
- Decide the next implementation/review lane.
```
