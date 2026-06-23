# PR201 - Phase 3 Bridge Preflight

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: ARGUS
Reviewer: MIMIR; DAEDALUS only after ARGUS accepts or patches the bridge gates
Status: open

## MIMIR Verdict

Phase 3 is not ready for direct product-code opening. It is ready for a
bridge/preflight sequence.

The repo has proven public-safe patterns for Public Spaces, Developer Spaces,
published documents, community read paths, and protected-alpha Studio
continuity/archive/export. It has not proven the public persona substrate that
Phase 3 assumes: opted-in public persona pages, visitor-safe persona context,
bounded visitor interaction, owner controls, reporting/moderation, and rate or
message limits.

This lane is docs/preflight only. It should not implement Phase 3 product code.

## Repo Source Truth

- `docs/roadmap/pr-plan.md` already names PR-12 as public persona pages with
  bounded interaction. Its deliverables are public persona pages, visitor or
  session message limits, public-safe context assembly, and owner analytics.
  It explicitly excludes Persona Roulette, voice/avatar mode, and
  persona-to-persona encounters.
- `docs/roadmap/prep-lane-audit.md` marks Public Spaces as beta candidate and
  says public persona cards/interactions remain open.
- `docs/roadmap/PR97_COMMUNITY_MODERATION_UNSUPPORTED_TARGET_CONTEXT.md` says
  persona target context remains label-only until a real public persona route
  exists.
- `packages/config/src/tiers.ts` already models `publicPersonas` limits:
  visitor/private are `0`, creator/canon/institutional are unlimited. Limits
  exist, but they are not the route, context, interaction, reporting, or owner
  control substrate.
- `apps/web/app` has public Space, Developer Space, Discover, Forums, and
  private Studio persona routes. It does not currently expose a real public
  persona route separate from protected Studio.
- `docs/roadmap/STATION_UI_UX_ROADMAP.md` keeps Public Spaces, Discover,
  Forums, and Developer Spaces in current UX scope, while Salon events,
  institutional Spaces, API platform, marketplace, Connect, and research-product
  UI remain out of scope for the current UI lanes.

## Bridge Sequence

### P3-B0 - Hostile Boundary Preflight

Owner: ARGUS.

Confirm, patch, or reject this bridge plan before DAEDALUS opens implementation.

Questions ARGUS must answer:

- What private persona fields, memory, canon, archive, continuity, chat, export,
  and owner metadata must never reach public persona pages or visitor calls?
- What current public/community/reporting helpers can be reused without
  overstating support for public personas?
- What tier and owner opt-in gates are required before a persona can be public?
- What is the minimal reporting/moderation path for a public persona page or
  visitor interaction?
- What rate/message limits are required before bounded visitor chat can exist?
- What analytics can owners see without exposing visitor-private data?
- What provider/model/embedding/cache assumptions must remain out of scope for
  first public persona proof?

### P3-B1 - Public Persona Eligibility And Owner Readback

Owner: DAEDALUS after ARGUS preflight.

Add owner-side eligibility/readback only. Owners should be able to see whether a
persona can become public, why it is blocked, and what making it public would
expose. This does not add a public persona page or visitor chat.

### P3-B2 - Public Persona Page Readback

Add a public-safe persona page for opted-in personas. It should show public
profile material, public copy, linked public Space/doc/forum material where
allowed, and clear provenance/visibility labels. It must not expose private
memory, private canon, Archive, continuity, chat, exports, owner notes, or
protected Studio links.

### P3-B3 - Visitor-Safe Context Assembly Contract

Create and test the exact context contract that a future public visitor
interaction may use. Start with readback/preview before live provider calls.
Allowed context should be explicit public persona profile/copy plus separately
public documents or public Space material. Private memory, private Archive,
private continuity, owner-only canon, and protected chat history are excluded.

### P3-B4 - Bounded Visitor Chat Alpha

Only after P3-B1 through P3-B3 pass review, open a narrow visitor interaction
slice with message/session limits, owner disable controls, reporting, abuse
handling, no private writes, no canon/memory promotion, and clear transcript
policy.

### P3-B5 - Owner Analytics, Moderation, And Reporting Readback

Add owner-visible aggregate counts and moderation/reporting status for public
persona interactions. Avoid visitor identity leakage and do not create a broad
community moderation expansion unless ARGUS requires it.

### P3-B6 - Phase 3 Feature Gates

Roulette, Salons, voice/avatar, public persona events, institutional/research
features, and persona-to-persona encounters stay closed until the public
persona substrate above is accepted.

## First Lane

The first bridge lane is this ARGUS preflight. DAEDALUS should not start public
persona implementation until ARGUS either accepts this sequence or patches the
required gates.

If ARGUS accepts, the first implementation lane should be P3-B1:
public persona eligibility and owner readback.

## Explicit Non-Scope

This wakeup does not open:

- public visitor chat;
- public persona page implementation;
- Persona Roulette;
- Salon events;
- voice/avatar mode;
- persona-to-persona encounters;
- institutional/research product UI;
- provider calls or model selection changes;
- embeddings, Redis, Cloudflare, queues, workers, or cache architecture;
- pricing, Stripe changes, or new entitlement policy;
- broad site reskin or Studio UX follow-up;
- production launch claims.

## Interaction With Current Work

PR199/PR200 continues independently as the UX-01A Studio workbench review. It
improves private Studio orientation and does not prove or block Phase 3.

The protected-alpha product demo remains ready as PR196/PR197 described. The
demo can proceed without Phase 3. The demo must not claim public persona
interaction, Roulette, Salons, voice, or institutional/research surfaces are
implemented.

If PR200 returns a narrow DAEDALUS follow-up, MIMIR should decide whether that
follow-up blocks UX closure before opening P3-B1. If PR200 accepts, MIMIR can
choose between the next owner-side UX slice and P3-B1 based on ARGUS's PR201
verdict.

## Expected ARGUS Response

Wake MIMIR with:

- accept/patch/reject verdict for the bridge sequence;
- required privacy, visibility, tier, reporting, moderation, analytics, rate,
  provider, cache, or billing gates;
- the corrected first implementation lane if P3-B1 is not safe enough;
- exact files, routes, docs, or tests that DAEDALUS must inspect first;
- whether ARIADNE should rehearse any public persona copy before code starts.

Do not go quiet without a wakeup.
