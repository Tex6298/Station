# PR215 Public Interaction Expansion Gate - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: complete - recommendation handed to MIMIR

## Frame

PR208 through PR214 completed the first public persona interaction bridge:

- signed-in public persona chat alpha;
- public-source-only context;
- public persona report route;
- owner/admin interaction readback;
- aggregate-only owner activity counters;
- hosted migration/deploy proof;
- ARIADNE human rehearsal.

The next step should not be chosen by vibe. Station can now consider several
larger public interaction families, but they have very different risk and
implementation shapes.

This lane compares options and recommends the smallest next implementation
slice. Do not implement the next product family in this PR.

## Candidate Families

Compare at least these:

1. Roulette
   - Random or guided public persona discovery/encounter.
   - Likely discovery/readback first, no provider call until a later lane.

2. Salons
   - Public or semi-public conversation spaces around personas/topics.
   - Likely needs moderation, membership, visibility, and rate-limit choices.

3. Public persona events
   - Public-safe activity, announcements, or milestone events for public
     personas.
   - Must not expose private aggregate counters, owner-only moderation state,
     visitor identity, or transcripts.

4. Voice/avatar
   - Media/provider integration for public or owner persona experience.
   - Likely config/provider-heavy and should not be first unless repo evidence
     says otherwise.

5. Institutional/research features
   - Researcher-facing collection, citation, export, and observatory workflows.
   - Likely useful but may be a separate audience lane.

6. Persona-to-persona encounters
   - Persona interactions with other personas.
   - High risk for runaway claims, moderation, storage, and provenance; likely
     not first unless bounded to dry-run/readback.

## Required Repo Map

Inspect current route/component/schema support for:

- public persona routes and serializers;
- Discover/public feed/public Space surfaces;
- forums/moderation/report routes;
- Developer Space observatory/event-like surfaces;
- aggregate owner counters from PR213;
- tier limits and entitlement checks;
- any existing docs mentioning Roulette, Salons, events, voice/avatar,
  institutional/research, or persona-to-persona.

Use `rg` first. Record the concrete files/routes you inspected.

## Output

Produce a short decision packet in this doc and `ACTIVE_STATUS` with:

- current repo affordances for each candidate;
- missing schema/API/UI pieces;
- privacy/moderation/billing/provider/config risks;
- which candidates require new external config;
- which candidates can be built without new config;
- recommended first implementation slice;
- why the other candidates wait;
- exact PR216 handoff proposal.

## Preferred Bias

MIMIR's current bias:

- Prefer a no-new-config, low-risk, public-readback/discovery slice first.
- Avoid media/provider-heavy work, persona-to-persona behavior, or public
  event feeds that expose private/owner-only activity before ARGUS has gated
  the public boundary.
- If Roulette can be introduced as a discovery/readback surface using already
  public eligible personas and no provider call, it is probably the first
  candidate to beat.

DAEDALUS should confirm or overturn that bias from the repo, not from vibes.

## Hard Boundaries

Do not implement:

- new provider calls;
- anonymous chat expansion;
- public event feeds;
- voice/avatar media;
- persona-to-persona model calls;
- new billing flows;
- Redis/Cloudflare/workers/queues;
- raw event logs;
- private memory/archive/canon/continuity/integrity exposure;
- broad UI reskin.

This is a comparison and recommendation lane only.

## Validation

Run:

```text
git diff --check
git diff --cached --check
```

If you add any helper script or test fixture for mapping, run the matching
syntax/test check. Otherwise this should remain docs-only.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR215 public interaction expansion gate.
Recommendation:
- Name the recommended PR216 first implementation slice.
Task:
- Decide whether to open the recommended implementation lane or ask ARGUS for a
  hostile preflight first.
```

## DAEDALUS Result

Date completed: 2026-06-24

Recommendation: open PR216 as **Public Persona Roulette discovery/readback**,
not as a provider-call encounter. The first slice should be a no-new-config
routeable public persona draw that uses existing eligibility, slug, serializer,
context-preview, and public page boundaries.

### Repo Evidence Inspected

- Public persona routes/serializers:
  - `apps/api/src/routes/personas.ts`
  - `apps/api/src/lib/persona-serialization.ts`
  - `packages/types/src/persona.ts`
  - `apps/api/src/routes/personas.test.ts`
- Public persona web/readback:
  - `apps/web/app/personas/[publicSlug]/page.tsx`
  - `apps/web/lib/public-persona-route.ts`
  - `apps/web/lib/public-persona-interaction.ts`
  - `apps/web/components/studio/persona-workspace.tsx`
- Discover/public feed/search:
  - `apps/api/src/routes/discover.ts`
  - `apps/web/components/discover/discover-front-door.tsx`
  - `apps/web/components/discover/search-dropdown.tsx`
  - `apps/web/components/discover/feed-shared.ts`
- Community/forum/moderation/reporting:
  - `apps/api/src/routes/forums.ts`
  - `apps/api/src/routes/threads.ts`
  - `apps/api/src/routes/comments.ts`
  - `apps/api/src/routes/reports.ts`
  - `apps/api/src/services/community-moderation-permissions.service.ts`
  - `apps/api/src/services/community-subcommunities.service.ts`
  - `packages/types/src/forum.ts`
- Developer Space event-like surfaces:
  - `apps/api/src/routes/developer-spaces.ts`
  - `apps/api/src/services/developer-space.service.ts`
  - `packages/types/src/developer-space.ts`
- Aggregate counters/tier gates:
  - `infra/supabase/migrations/057_public_persona_interaction_counters.sql`
  - `packages/auth/src/permissions.ts`
  - `packages/config/src/tiers.ts`
- Current roadmap/product references:
  - `docs/roadmap/STATION_FUTURE_LANES.md`
  - `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`
  - `docs/roadmap/PR213_PUBLIC_INTERACTION_AGGREGATE_COUNTERS_DAEDALUS.md`
  - `docs/roadmap/PR214_AGGREGATE_COUNTERS_HOSTED_PROOF_DAEDALUS.md`

### Current Affordances

| Candidate | What exists now | Missing pieces | Risk/config shape |
| --- | --- | --- | --- |
| Roulette | Eligible public personas have safe slugs, public serializers, public pages, anonymous context preview, signed-in chat alpha, reporting, and owner aggregate readback. Discover search already queries public personas, but does not route/render them because the web search groups omit `personas` and the API query does not select `public_slug`. | A small draw/list endpoint, routeable public persona cards, deterministic tests, and a tiny web affordance. No new schema is required for the first slice. | Lowest risk if it is discovery/readback only. No new external config. Must keep provider calls out of roulette itself and reuse the existing signed-in chat page. |
| Salons | Forum categories, threads, comments, subcommunities, delegated moderation, report queues, public/community visibility, linked public personas, and moderation actions exist. | Salon identity/model, membership rules, persona/topic relation, event/session lifecycle, rate limits, moderation queue semantics, and UI. | No external provider config is inherently required, but product/schema/moderation surface is wider than PR216 should be. |
| Public persona events | Developer Spaces prove an event-like pattern with visibility filtering and raw-data stripping; aggregate persona counters exist. | Public persona event schema, event author/source model, public-safe serializer, owner controls, moderation/report semantics, and feed placement. | Medium/high privacy risk. Could be no-config later, but should get ARGUS boundary design before any public event feed. |
| Voice/avatar | Persona avatars exist as profile media and Studio copy mentions voice as setup semantics. | Media providers, storage/processing policy, consent/copyright rules, cost controls, rate limits, and UI. | Requires new provider/media configuration and billing/cost decisions. Not first. |
| Institutional/research | Developer Spaces, document types, exports, public project observatories, and institutional tier naming exist. | Multi-seat/institution ownership, research collection workflows, citation/export contracts, admin/operator surfaces, pricing/contracts. | Mostly not provider-config blocked, but it is a separate audience lane and broader than public interaction PR216. |
| Persona-to-persona encounters | Persona records, handoffs, lifecycle events, private chat, public chat, and owner-paid model call plumbing exist. | Encounter schema, consent/ownership rules, transcript/provenance policy, runaway-call controls, rate limits, moderation, storage/readback, UI. | Highest product and safety risk. Requires provider calls and possibly queue/rate-limit architecture. Not first. |

### No-New-Config Candidates

- Roulette discovery/readback is the strongest no-new-config candidate because it
  can use only public persona rows, safe public slugs, existing public pages, and
  optional public context preview.
- Salons could avoid external config, but the schema/moderation surface is not a
  small first public-persona slice.
- Public persona events could avoid external config only if they are manual or
  aggregate-only, but public activity feeds need ARGUS boundary review first.
- Institutional/research features can mostly avoid provider config, but they
  should remain a separate project/research lane.

### Config-Heavy Or Boundary-Heavy Candidates

- Voice/avatar needs media/provider/storage decisions.
- Persona-to-persona encounters need provider-call policy, durable provenance,
  runaway-call controls, and probably stronger queue/rate-limit boundaries.
- Public persona event feeds are boundary-heavy because raw events would be easy
  to confuse with safe aggregate readback.

### Recommended PR216 Slice

Open PR216 as **Public Persona Roulette discovery/readback**:

- Add an API route such as `GET /personas/public/roulette` or
  `GET /personas/public/roulette/draw`, registered before
  `/public/:publicSlug`.
- Return a small bounded set of eligible public personas only:
  `name`, `shortDescription`, `avatarUrl`, `publicSlug`, public route `href`,
  and `publicChat` capability from the existing public serializer.
- Exclude private personas, ineligible owners, unsafe/UUID-shaped slugs,
  owner ids, raw persona ids, provider/setup/private fields, owner aggregate
  counters, report counts/statuses, and private context buckets.
- Prefer deterministic seed/order support for tests and repeatable UX; avoid
  analytics, events, anonymous chat expansion, and provider calls.
- Add focused API tests, plus small web helper/search tests if web routeability
  is touched.
- Optionally fix the existing Discover public persona search gap by selecting
  `public_slug` and adding `personas` to the routeable public search groups.
  Keep this as routeability/discovery only, not a feed algorithm rewrite.

### Why The Others Wait

- Salons should wait until MIMIR explicitly opens a community/session lane; the
  current forum/moderation primitives are useful but not yet a Salon product.
- Public persona events should wait for ARGUS to define the public event
  boundary, especially around counters, reports, owner-only activity, and
  transcript-free guarantees.
- Voice/avatar should wait for provider/media/storage/cost policy.
- Institutional/research should wait for the project/institution ownership lane.
- Persona-to-persona encounters should wait until provider-call, provenance,
  storage, and moderation limits are designed.

### Exact PR216 Handoff Proposal

```text
PR216 - Public Persona Roulette discovery/readback

Work directly on main. No branch.

Goal:
Add the smallest public persona Roulette affordance as discovery/readback only:
routeable eligible public persona cards with no model call, no anonymous chat
expansion, no public event feed, and no new external config.

Scope:
1. Reuse existing public persona eligibility and serializers.
2. Add a bounded roulette/draw API route before /personas/public/:publicSlug.
3. Return only public profile fields, safe public route href, and publicChat
   capability.
4. Exclude private/ineligible/unsafe-slug personas and all owner/private fields.
5. Add deterministic tests for eligible-only routeability and leakage absence.
6. Add the smallest web affordance or helper needed to make the draw discoverable.
7. If touching Discover search, make public persona results routeable via
   public_slug without changing feed behavior broadly.

Non-goals:
- No provider call from Roulette.
- No anonymous chat expansion.
- No event feed.
- No voice/avatar media.
- No persona-to-persona calls.
- No billing, queues, Redis/Cloudflare/workers, or broad UI reskin.

Validation:
- test:personas
- relevant web helper tests if touched
- typecheck
- lint if web/API surfaces changed
- git diff --check
- git diff --cached --check
```
