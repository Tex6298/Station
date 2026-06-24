# PR218 Public Salons Gate - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: open

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
