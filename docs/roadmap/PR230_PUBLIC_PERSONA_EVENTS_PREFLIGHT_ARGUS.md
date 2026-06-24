# PR230 - Public Persona Events Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: Complete - ARGUS ACCEPT handed to MIMIR
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

## ARGUS Result

Date completed: 2026-06-24

Verdict: `ACCEPT` with hard first-slice gates.

Station is ready to open a first public persona events lane only as
**derived-only public persona event readback** on the public persona page. The
first slice must not introduce a public persona event table, event write path,
owner-authored milestone model, Discover/global feed, public Space feed, or
event-level moderation surface. If DAEDALUS finds that a schema or write path is
needed, the lane should stop and wake MIMIR/ARGUS instead of implementing it.

### Repo Evidence Inspected

- `apps/api/src/routes/personas.ts`: public persona slug eligibility, public
  context source catalog, signed-in public chat, public report route, and
  owner-only aggregate interaction readback.
- `apps/api/src/lib/persona-serialization.ts`: safe public persona slug
  validation, public context preview serializer, bounded excerpts, and excluded
  private bucket labels.
- `packages/types/src/persona.ts`: public persona context source types and
  owner-only aggregate interaction readback contract.
- `apps/api/src/routes/discover.ts` and
  `apps/web/components/discover/discover-front-door.tsx`: public/community
  Discover visibility handling, routeable persona/Salon/search/feed behavior,
  and existing global feed risk.
- `apps/api/src/routes/forums.ts`, `apps/api/src/routes/threads.ts`,
  `apps/api/src/routes/reports.ts`, and `packages/types/src/forum.ts`: forum
  visibility, linked public persona checks, hidden/removed filtering, delegated
  moderation/report queues, and thread/report target context.
- `apps/api/src/routes/developer-spaces.ts`,
  `apps/api/src/services/developer-space.service.ts`, and
  `packages/types/src/developer-space.ts`: existing event-like observatory
  pattern, visibility levels, public/member/owner field filtering, and raw-data
  stripping.
- `apps/web/app/personas/[publicSlug]/page.tsx`: current public persona page
  calls public readback and context preview, renders source counts/cards, and
  exposes signed-in chat/report actions.
- `infra/supabase/migrations/057_public_persona_interaction_counters.sql`:
  aggregate-only public persona counters with explicit no-raw-event-log,
  no-visitor-identity, no-transcript, no-provider-trace boundary.
- `apps/api/src/routes/personas.test.ts`,
  `apps/api/src/routes/community.test.ts`,
  `apps/api/src/routes/developer-spaces.test.ts`, and web helper tests:
  existing coverage for public serializer stripping, routeable source
  exclusions, aggregate readback, and Developer Space field classification.
- `docs/roadmap/PR215_PUBLIC_INTERACTION_EXPANSION_GATE_DAEDALUS.md` and
  `docs/roadmap/ACTIVE_STATUS.md`: prior roadmap gate saying public persona
  events needed ARGUS boundary design before any public event feed.

### Answers

1. **New event model or existing sources?**

   Existing public sources cover the first product need. The first lane should
   derive public event cards from the same routeable public source catalog that
   already powers public persona context preview. Do not add a persistent public
   persona events table yet.

2. **Allowed first-slice source types**

   - `published_document`: published/public documents whose `persona_id` or
     `source_persona_id` matches the eligible public persona, and whose Space is
     public and routeable.
   - `public_discussion`: active/public/not-hidden forum threads that are the
     `discussion_thread_id` for an included public document.
   - `public_salon_thread`: active/public/not-hidden threads linked to the
     eligible public persona, with no `linked_document_id`, backed by an
     active/public `salon` subcommunity and a safe non-UUID forum category slug.
   - `public_profile` may remain a static profile/source anchor, but it should
     not become a timestamped activity event until Station has an explicit
     owner-authored public milestone model.

3. **Disallowed first-slice source types**

   - Signed-in public chat attempts, chat successes/failures, prompts,
     completions, public chat replies, provider usage, quota/token activity, and
     rate-limit events.
   - Public persona reports, report bodies, reporter identity, report status,
     delegated moderation queue state, moderation actions, review requests, and
     admin/operator internals.
   - Aggregate interaction counters, including chat/report counters. They are
     owner-only aggregate readback and explicitly not a raw public event source.
   - Private memory/archive/canon/continuity/integrity, owner setup,
     owner_profile, provider_settings, private files, private Spaces, private or
     community-only documents, private/unlisted/community Salons, hidden or
     removed threads/comments, document-linked Salon threads in the Salon source
     path, and unrelated persona/source rows.
   - Developer Space events, AI trace events, persona lifecycle events,
     publishing approval events, billing/webhook events, queues/workers,
     Redis/Cloudflare/runtime events, and any provider/tool/debug JSON.

4. **Visibility rules**

   - Anonymous public readback only in the first slice.
   - The target persona must pass safe public slug and owner public-persona
     eligibility checks.
   - Included source rows must be public at read time. If a source is later made
     private, community-only, unlisted, hidden, removed, unpublished, paused, or
     unrouteable, its derived event disappears.
   - Community-visible, owner-draft/private, member-only, and viewer-aware event
     variants are deferred.

5. **Public provenance and payload**

   Required public event fields are limited to:

   - `eventType`: one of `published_document`, `public_discussion`, or
     `public_salon_thread`.
   - `label`: `Published document`, `Public discussion`, or
     `Public Salon thread`.
   - `title`, `href`, `occurredAt`, and optional bounded `excerpt`.
   - Optional `sourceType` only when it is already public document provenance
     text, not a backend table name or raw source id.

   Public payloads must not add raw `persona_id`, `owner_user_id`,
   `source_persona_id`, `linked_persona_id`, `linked_document_id`,
   `category_id`, `subcommunity_id`, report ids, visitor ids, provider route
   labels, backend table names, SQL details, stack traces, env values, tokens,
   secrets, or raw JSON blobs. Existing route hrefs may continue using existing
   public document/thread route ids, but no duplicate raw id fields should be
   added.

6. **Moderation/reporting**

   Do not create event-level reporting, hiding, removing, or moderation in the
   first slice. A derived event is moderated by its source: document
   publish/visibility state, thread status/visibility/hidden state,
   subcommunity status/visibility/type, and existing report/moderation routes.
   If event-specific reports or removals are required, pause for a separate
   schema/moderation preflight.

7. **Placement**

   First placement may be the public persona page only, as a small timeline or
   "public updates" readback below/near the existing visitor-safe context
   preview. Do not add Discover feed/search surfacing, global algorithmic feed,
   public Space feed injection, notifications, owner Studio analytics, or
   cross-persona timelines in the first lane.

8. **Honest copy and claims**

   Copy must say "public updates", "public sources", or "public readback". It
   must not claim live activity, autonomous activity, live rooms,
   provider/model calls, persona-to-persona encounters, private memory,
   private continuity, or comprehensive history.

### Exact First DAEDALUS Lane

Open PR231 as **Public Persona Event Readback (derived-only)**:

- Add a public-safe `PublicPersonaEvent` type and either
  `GET /personas/public/:publicSlug/events` or an equivalently bounded field on
  public persona readback.
- Reuse the current eligible public persona lookup and the PR227 routeable
  source filters.
- Return at most 12 events by default, max 20, sorted by source public
  timestamp descending.
- Derive `occurredAt` from `documents.published_at ?? documents.created_at` for
  documents, and `threads.created_at` for public discussion/Salon sources.
- Render only on the public persona page. Keep Discover/global feeds deferred.
- Do not add migrations, public event schema, write APIs, seed data,
  provider calls, chat/report/counter events, owner-authored milestone events,
  Cloudflare/Redis/queues/workers, auth/session changes, billing, or broad UI
  reskin.

### Required DAEDALUS Tests

- `apps/api/src/routes/personas.test.ts`: prove anonymous public event readback
  includes only routeable public documents, public document discussions, and
  public Salon threads for an eligible public persona.
- Exclusion coverage must prove private, community, unlisted, hidden, removed,
  paused, non-Salon, unsafe-slug, unrelated-persona, document-linked-Salon,
  private Space, draft/unpublished document, ineligible owner, unsafe public
  persona slug, chat/report/counter/provider/private bucket, and raw id fields
  do not appear in JSON.
- Web/helper coverage must prove the public persona page renders labels,
  timestamps, links, empty state, and boundary copy without live/provider/private
  claims or overflow.
- Run `test:personas`, web helper tests for the public persona page/copy,
  `typecheck`, `lint`, `git diff --check`, and `git diff --cached --check`.
  Run `test:community` if any forum/category/Salon helper changes. Run
  `test:writing` if existing public persona copy helpers are touched.
- Require ARIADNE hosted rehearsal after implementation if the public persona
  page changes visibly.

## MIMIR Closeout

MIMIR accepts ARGUS's verdict on 2026-06-24.

Decision:

- Open PR231 as **Public Persona Event Readback (derived-only)** for DAEDALUS.
- Preserve ARGUS's hard gates: derived public persona page readback only, no
  event schema/write path, no global feed, no event-level moderation, and no
  chat/report/counter/provider/private sources.
