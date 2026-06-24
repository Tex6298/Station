# PR230 - Public Persona Events Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR216 through PR229 completed the current no-new-config public interaction
bridge:

- public persona Roulette discovery/readback;
- public Salon feasibility, foundation, hosted proof, and rehearsal;
- Discover public Salon surfacing;
- public persona Salon readback, hosted proof, and rehearsal.

Public persona events are the next candidate family from PR215, but they are
not a harmless feed by default. Events can easily leak owner-only activity,
private source material, moderation internals, visitor identity, transcripts,
or raw system/provider traces if the boundary is not designed first.

This lane is ARGUS preflight only. Do not implement schema, API routes, UI, or
seed data in this PR.

## Goal

Decide whether Station is ready to open a first public persona events
implementation lane, and if yes, define the smallest safe DAEDALUS slice.

## Repo Evidence To Inspect

Use `rg` first and record concrete files/routes inspected.

Inspect at least:

- public persona routes, serializers, context preview, reporting, and owner
  readback;
- Discover search/feed surfaces and public source catalog behavior;
- public Salon and forum thread visibility/moderation/report behavior;
- Developer Space event-like surfaces, public observatory serialization, and
  raw-data stripping;
- published document references and linked forum discussion routes;
- aggregate-only public persona interaction counters;
- tier/entitlement checks if event creation or visibility would touch owner
  capabilities.

Likely files:

- `apps/api/src/routes/personas.ts`
- `apps/api/src/lib/persona-serialization.ts`
- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/services/developer-space.service.ts`
- `apps/web/app/personas/[publicSlug]/page.tsx`
- `apps/web/components/discover/discover-front-door.tsx`
- `packages/types/src/persona.ts`
- `packages/types/src/forum.ts`
- `packages/types/src/developer-space.ts`
- `infra/supabase/migrations/057_public_persona_interaction_counters.sql`

## Questions ARGUS Must Answer

1. Should the first slice introduce a new public persona event model, or can
   existing public sources cover the first product need?
2. Which event source types are allowed in the first slice?
   - Possible examples: owner-authored public milestone, published document,
     linked public Salon thread, aggregate-safe counter milestone.
   - Disallowed candidates should be explicit.
3. What visibility states are allowed?
   - Public-only first?
   - Owner draft/private deferred?
   - Community-visible deferred?
4. What provenance fields and labels must the public user see?
5. What source material must never appear in a public event?
6. Can public events be reported, hidden, removed, or moderated? If yes, what
   is the minimal safe route and owner/admin readback?
7. Where should a first event appear, if at all?
   - Public persona page timeline/readback.
   - Discover public feed/search.
   - Public Space feed.
   - Owner Studio readback only.
8. What tests must DAEDALUS add before this can ship?
9. Should ARIADNE rehearse copy/navigation before implementation, or after a
   narrow DAEDALUS patch?

## Hard Boundaries

Do not implement or approve:

- raw chat transcript events;
- private memory/archive/canon/continuity/integrity events;
- owner-only moderation/report internals;
- visitor identity, private owner identity, raw owner ids, raw persona ids, or
  raw event payloads in public readback;
- provider traces, prompts, completions, tool calls, SQL, stack traces, tokens,
  service keys, or debug JSON;
- live-room, provider-call, persona-to-persona, voice/avatar, or autonomous
  activity claims;
- Redis, Cloudflare, queues/workers, billing, auth/session, or broad UI reskin
  work;
- event feeds sourced from private aggregate counters unless ARGUS proves the
  aggregate is public-safe and non-identifying.

## Preferred Shape If Safe

MIMIR's preferred first safe shape, if ARGUS agrees:

- owner-authored or already-public-source-derived event readback only;
- public persona page first, not a global algorithmic feed;
- clear provenance label such as `Published note`, `Public Salon thread`, or
  `Owner milestone`;
- no provider calls and no live activity claims;
- no new external config;
- narrow tests proving private and unlisted material cannot enter the public
  event list.

ARGUS may reject this shape if the repo evidence says it is not safe.

## Output

Append an ARGUS result section to this doc and update `ACTIVE_STATUS` with:

- verdict: `ACCEPT`, `PATCH`, or `REJECT`;
- inspected files/routes;
- allowed source types;
- disallowed source types;
- visibility/provenance/moderation rules;
- the exact first DAEDALUS lane if accepted;
- the reason to pause if rejected;
- required tests and validation commands.

## Validation

Docs-only unless ARGUS adds a mapping helper.

Run:

```text
git diff --check
git diff --cached --check
```

If any helper is added, run the relevant syntax or test command.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR230 public persona events preflight.
Verdict:
- ACCEPT / PATCH / REJECT.
Task:
- If accepted, open the exact DAEDALUS implementation lane.
- If patch/reject, decide whether to revise the boundary or pause public events.
```
