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

Add server-authoritative eligibility/readback and close the current public
persona visibility gaps. Owners should be able to see whether a persona can
become public, why it is blocked, and what making it public would expose.

This lane must also ensure existing persona create/update/read serializers
cannot bypass the eligibility decision. In particular, public persona exposure
must not rely on client copy or the current owner serializer. This does not add
a standalone public persona page or visitor chat.

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
public persona eligibility, owner readback, and server-side public visibility
guards.

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

## ARGUS Preflight Result

Completed on 2026-06-23.

Verdict: accept the bridge sequence only with the P3-B1 correction above.

P3-B1 as originally worded was not safe enough as passive owner readback. The
first implementation lane must be:

```text
P3-B1A - Public persona eligibility, serializer split, and owner readback
```

Why:

- `packages/config/src/tiers.ts` says `private.publicPersonas` is `0`, but
  `apps/api/src/routes/personas.ts` currently accepts `visibility: "public"` on
  persona create/update under the private-tier persona route.
- `apps/api/src/routes/personas.ts` also allows a non-owner authenticated user
  to fetch a public persona by id and receive the owner serializer shape, which
  includes owner/setup fields that are not public-page safe.
- `apps/api/src/routes/spaces.ts` already lists `visibility = public` personas
  on public Space responses. That existing public-card path is not a standalone
  persona page, but it means public persona eligibility cannot wait until
  visitor chat work.

Required P3-B1A gates:

- Add a server-side public-persona eligibility helper using
  `TIER_LIMITS.publicPersonas` and owner/admin identity. `visitor` and
  `private` tier owners must not be able to create or transition a persona to
  public visibility.
- Count existing public personas for limited tiers if finite limits are added
  later; treat `-1` as unlimited, matching the existing tier convention.
- Remove or contain client-supplied `skipIntegrityPreflight` as a public
  visibility bypass. It must not override tier/public-persona eligibility.
- Split owner and public/non-owner persona serializers. Public/non-owner
  persona readback may include only explicit public profile/card fields such as
  name, short description, avatar, visibility, and a future dedicated public
  slug/copy field if one is added.
- Never expose these fields through public/non-owner persona routes, public
  Space persona cards, reports, analytics, or future visitor context:
  `owner_user_id`, owner id hashes, emails, provider/model/provider config,
  API/BYOK state, `awakening_prompt`, `style_notes`, owner-only
  `long_description`, layer profiles, lifecycle events, handoffs, conversations
  and archived chats, memory, canon, archive/import source material, continuity
  records/candidates, export package data, private documents, private Space
  links, raw ids, storage paths, trace ids, prompts, completions, provider
  payloads, cookies, tokens, secrets, billing identifiers, and Stripe objects.
- Treat existing `long_description`, `awakening_prompt`, and `style_notes` as
  Studio setup/private by default. If Phase 3 needs longer public copy, add a
  dedicated public copy field with explicit owner confirmation in a later lane.
- Keep `GET /personas/:id` owner-scoped for owner detail. If non-owner public
  readback remains available before P3-B2, it must use the public serializer and
  tests must prove private fields are absent.
- Keep public Space persona cards on `apps/api/src/routes/spaces.ts` to the
  same public serializer. Do not return provider, owner ids, prompts, style
  notes, long setup copy, or private source labels.
- P3-B1A is not allowed to add public visitor chat, provider calls, embedding
  changes, Redis/Cloudflare/cache architecture, queues, workers, billing,
  Stripe changes, new entitlement policy, public persona analytics, or
  moderation actions.

Reporting and moderation gates:

- `apps/api/src/routes/reports.ts` and PR97 remain the current source truth:
  persona target context is label/visibility-only with no route hint until a
  real public persona route exists.
- Before P3-B2 public persona pages launch, DAEDALUS must define a minimal
  report path for the public persona page or explicitly limit reporting to the
  existing signed-in `/reports` flow with `targetType: "persona"`.
- Adding a public persona route in P3-B2 must update report target context tests
  so route hints are safe only for public persona pages and remain unavailable
  for private personas.
- No target mutation actions for persona reports in P3-B1A or P3-B2.

Rate, analytics, provider, cache, and billing gates:

- P3-B1A and P3-B2 have no visitor chat, so no message/session counters are
  needed yet beyond route abuse protections already used by the app.
- P3-B3 is readback/preview only and must not call providers.
- P3-B4 visitor chat requires server-side per-session/per-user/per-IP message
  limits, owner disable controls, report/abuse handling, transcript policy, and
  no private writes or memory/canon promotion.
- Owner analytics must be aggregate-only: page views, interaction counts,
  report status counts, and opt-in state. Do not expose visitor identity, IPs,
  reporter identity, prompts, completions, or transcript bodies.
- Redis/Upstash may only store short-lived counters/cache if a later lane proves
  a need. It is not memory truth and must not store persona context, prompts, or
  transcripts.
- Billing work is limited to using existing tier limits. No Stripe/pricing,
  checkout, portal, invoice, token-credit, or entitlement-policy expansion in
  P3-B1A.

Files DAEDALUS must inspect first:

- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/spaces.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/routes/spaces.test.ts`
- `apps/web/components/studio/awakening-flow.tsx`
- `apps/web/app/space/[slug]/page.tsx`
- `apps/web/lib/moderation-console.ts`
- `packages/auth/src/permissions.ts`
- `packages/config/src/tiers.ts`
- `packages/types/src/persona.ts`
- `packages/types/src/forum.ts`

Required first-lane tests:

- Private-tier users cannot create a public persona or transition an existing
  persona to public visibility.
- Creator/canon/institutional eligibility follows `publicPersonas` limits and
  admin override behavior intentionally.
- `skipIntegrityPreflight` cannot bypass public-persona tier eligibility.
- Owner readback reports eligibility, blockers, and exact public fields without
  changing visibility.
- Non-owner/authenticated persona readback, if still allowed for public
  personas, uses the public serializer and omits owner/setup/private fields.
- Public Space persona cards use the same public serializer and omit provider,
  owner ids, prompts, style notes, long setup copy, and private source labels.
- Reporter-owned report readback remains target-context-free; admin persona
  report context remains label/visibility-only with no route hint until P3-B2.

ARIADNE:

- No ARIADNE rehearsal is needed before P3-B1A because the first lane is API
  contract, owner readback, and safety copy. ARIADNE should rehearse before or
  during P3-B2 if a public persona page or visible public copy is added.
