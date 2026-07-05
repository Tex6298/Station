# PR493A - Persona Roulette Visitor Encounter Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for DAEDALUS implementation

## Verdict

```text
ACCEPT_PR493A_ROULETTE_VISITOR_ENCOUNTER
```

ARGUS accepts a narrow protected-alpha Persona Roulette visitor text encounter.
This is not a public launch, not a broad anonymous runtime expansion, and not a
new chat backend.

## Decision

PR492 closed the owner-controlled anonymous public chat gate. PR493A can safely
build one visitor encounter surface by reusing that accepted gate.

The safe slice is:

- a public `/discover/roulette` route that draws one eligible public persona;
- an optional anonymous-eligible filter on the existing public roulette API;
- the existing `POST /personas/public/:publicSlug/chat` endpoint for messages;
- local browser-only encounter state with no transcript or visitor identity
  persistence;
- an honest five submitted-message visitor limit for the current browser
  session;
- a sign-up / create-your-own Studio CTA when the visitor exhausts the local
  encounter or chooses to continue.

The five-message limit is a product and browser-session boundary. It must not
be documented or presented as the abuse-control boundary. Existing server
anonymous public chat rate limits, provider readiness checks, quota checks, and
owner-paid token accounting remain the real enforcement boundaries.

## Required Route And API Boundary

DAEDALUS may add:

```text
apps/web/app/discover/roulette/page.tsx
```

The page should draw one random anonymous-eligible public persona and render a
bounded signed-out visitor text encounter.

DAEDALUS may extend:

```text
GET /personas/public/roulette
```

with one optional filter:

```text
chatMode=anonymous_alpha
```

Default roulette behavior must remain compatible for the existing Discover
right rail and any current public-persona readback. The filter must only narrow
results. It must not change the default response shape, leak new fields, or
make existing discovery cards point into the encounter unless the card is known
anonymous-eligible.

When `chatMode=anonymous_alpha` is present, the API may return only candidates
that satisfy the already accepted public anonymous chat boundary:

- `visibility:"public"`;
- safe public slug;
- owner remains eligible for public personas;
- `public_chat_enabled:true`;
- `publicPersonaChatMode(...) === "anonymous_alpha"`;
- owner anonymous gate enabled for non-replay personas, with replay alpha
  compatibility unchanged;
- provider and rate-limit readiness can be verified locally without provider
  calls, token use, counters, or visitor state.

If provider or rate-limit readiness cannot be verified safely, the filter should
fail closed by excluding the candidate or returning a bounded empty/unavailable
state. It must not probe providers, spend tokens, increment chat counters, or
create visitor records.

## Required Encounter Boundary

Messages must go through the existing route:

```text
POST /personas/public/:publicSlug/chat
```

DAEDALUS must not add another public chat backend, websocket channel, queue,
worker, provider path, transcript table, session table, event table, or durable
visitor identity.

The encounter may store only browser-local/session state needed for the current
UI, such as:

- safe public slug;
- submitted-message count;
- exhausted/unavailable state.

The encounter must not persist or expose:

- visitor transcripts;
- visitor identity;
- raw events;
- prompts;
- completions;
- provider payloads;
- source bodies;
- private ids;
- owner ids;
- persona ids;
- document ids;
- storage paths;
- cookies;
- auth headers;
- user agents;
- IP addresses;
- tokens or secret-shaped values.

The visible conversation can live in component memory while the page is open.
`sessionStorage` may be used for safe slug/count/exhausted state only. It must
not store message text, assistant replies, prompts, completions, provider
payloads, source bodies, visitor identifiers, cookies, headers, IPs, or raw
events.

## Required UI Boundary

The first screen should be the actual encounter, not a marketing landing page.

Required states:

- loading/drawing one eligible persona;
- bounded empty or unavailable state when no eligible candidate exists;
- ready encounter state for one anonymous-eligible public persona;
- send pending/error states that keep the message local and do not claim
  persistence;
- exhausted state after five submitted visitor messages with CTA;
- continue/sign-up CTA that routes to existing account or Studio creation
  surfaces.

Copy must stay protected-alpha and honest. It may invite visitors to sign up or
create a Studio, but it must not claim launch readiness, commercial conversion
success, moderation completeness, durable memory, saved transcripts, voice,
avatar, public Salon/live chat, or matching/recommendation intelligence.

## Allowed Files

Implementation should stay in this file set unless DAEDALUS finds a directly
necessary neighboring focused test or type file:

- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/personas.test.ts`
- `packages/types/src/persona.ts`, only for a narrow optional response type if
  needed
- `apps/web/app/discover/roulette/page.tsx`
- `apps/web/components/discover/discover-front-door.tsx`, only for a small CTA
  to `/discover/roulette`
- `apps/web/lib/discover-roulette.ts`
- `apps/web/lib/discover-roulette.test.ts`
- `apps/web/lib/public-persona-route.ts`
- `apps/web/lib/public-persona-route.test.ts`
- `apps/web/lib/public-persona-interaction.ts`
- `apps/web/lib/public-persona-interaction.test.ts`
- `apps/web/app/globals.css`, only for scoped encounter classes if needed
- roadmap and validation docs

## Forbidden Scope

PR493A must not:

- enable anonymous chat for signed-in-alpha personas;
- bypass owner anonymous gate consent;
- select private, unsafe-slug, owner-ineligible, provider-unready,
  rate-limit-unavailable, disabled, or hidden personas;
- change signed-in public chat behavior;
- change public reports, moderation, or reporting auth;
- persist anonymous visitor transcripts, identities, raw events, prompts,
  completions, provider payloads, private source bodies, cookies, auth headers,
  user agents, IP addresses, or secret-shaped values;
- add voice, avatar mode, public Salon chat, live event chat, matching,
  recommendation infrastructure, billing, Stripe, queues, Redis, Cloudflare,
  workers, provider architecture, new hosted runtime architecture, social
  dispatch, OAuth, connectors, or broad Discover redesign;
- reuse the private owner-only `/persona-encounters/preview` runtime for this
  public anonymous encounter;
- import broad Discern CSS or reskin unrelated pages;
- make public launch, commercial, conversion, durable-memory, transcript-saving,
  or moderation-complete claims.

## Required Tests

DAEDALUS must add or update focused tests proving:

- default `GET /personas/public/roulette` remains compatible;
- `GET /personas/public/roulette?chatMode=anonymous_alpha` returns only enabled
  anonymous-alpha personas;
- the anonymous filter excludes signed-in-alpha, disabled, private,
  unsafe-slug, owner-ineligible, provider-unready, and rate-limit-unavailable
  candidates;
- the encounter page/helper stores only safe public slug/count/session state and
  no transcript, prompt, completion, provider payload, visitor identity, raw
  event, cookie, auth header, user agent, IP address, source body, private id,
  owner id, or persona id;
- the five-message exhausted state stops further sends from the browser UI and
  shows CTA copy without claiming hard anti-abuse enforcement;
- public persona chat helper copy remains public-source-only;
- public reports remain signed-in/server-owned;
- Discover right-rail behavior remains compatible and leaks no raw owner gate,
  private, provider, setup, owner id, persona id, or secret-shaped fields.

If DAEDALUS changes Discover front-door/search/card behavior beyond a small CTA,
or changes API card serialization beyond the optional filter, DAEDALUS must add
or run the closest focused Discover/community no-drift test and name it in the
result.

## Required Validation

DAEDALUS must run:

```powershell
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/discover-roulette.test.ts apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

## Required ARGUS Review Focus

ARGUS should review the implementation for:

- anonymous eligibility filter correctness;
- default roulette compatibility;
- owner gate and signed-in-alpha no-drift;
- no provider calls, token accounting, counters, or visitor records during
  candidate selection;
- no private-source, raw id, secret-shaped, provider, setup, cookie, header,
  user-agent, IP, prompt, completion, or source-body leakage;
- no stored anonymous visitor transcript or identity;
- five-message limit honesty;
- reuse of the existing public persona chat endpoint;
- public reports remaining signed-in/server-owned;
- no private encounter runtime reuse;
- no Cloudflare, hosted runtime, worker, queue, Redis, billing, Stripe,
  connector, OAuth, provider architecture, Salon/live chat, voice/avatar,
  matching, recommendation, launch-claim, or broad Discover redesign drift.

## Required ARIADNE Hosted Proof

After ARGUS accepts implementation, MIMIR should route ARIADNE hosted rehearsal.

ARIADNE must verify desktop plus `375px` and `390px` mobile:

- hosted web/API freshness at the accepted implementation commit or later;
- `/discover/roulette` loads an anonymous-eligible owner-gated persona or a
  bounded empty/unavailable state;
- a signed-out visitor can send within the local five-message limit when an
  eligible persona exists;
- exhausted state stops further UI sends and shows CTA copy;
- `station-replay-signed-in-alpha-persona` is not selected for anonymous
  encounter;
- replay alpha and the owner-gated fixture have no mode drift;
- existing public persona page and Discover right rail remain compatible;
- no transcript, identity, raw event, source body, private id, owner id, persona
  id, provider payload, token, cookie, header, user-agent, IP, or secret-shaped
  readback appears;
- no launch, voice, avatar, Salon/live chat, matching, billing, queue, worker,
  Redis, Cloudflare, or provider-architecture claim appears.

If hosted has no anonymous-eligible candidates, ARIADNE should return a concrete
blocker without printing or requesting secret values.

## Preflight Validation Performed

ARGUS reviewed the PR493 handoff, PR492 closeout, existing public roulette API,
public persona mode and chat boundaries, Discover roulette helper and right
rail, public persona route/interaction helpers, public reports, and relevant
tests.

Validation run on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Existing PR492 owner gate is enough for a narrow encounter if selection is filtered to anonymous-eligible personas and messaging reuses the existing public chat endpoint. |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 16 personas tests passed, including owner gate, replay compatibility, signed-in-alpha denial, public-source-only behavior, and no anonymous transcript/identity persistence. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 report tests passed; public reports remain signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/discover-roulette.test.ts apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 14 focused web helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR493A as a narrow Persona Roulette Visitor Encounter lane.
- Implement /discover/roulette as a protected-alpha public text encounter that draws one anonymous-eligible public persona and reuses POST /personas/public/:publicSlug/chat.
- Extend GET /personas/public/roulette only with optional chatMode=anonymous_alpha; default roulette discovery/readback behavior must remain compatible.
- The five-message encounter limit is honest browser-session UX with no transcript/identity/raw-event storage; existing server anonymous chat rate limits remain the real abuse boundary.
Task:
- Add the bounded page/helper/API filter/tests within the accepted preflight scope.
- Keep messages in component memory only and, if using sessionStorage, store only safe slug/count/exhausted state.
- Preserve owner gate, signed-in-alpha denial, public-source-only prompting, fail-closed rate/provider/quota behavior, owner-paid token attribution, aggregate-only counters, public report auth, and no-leak public cards.
Guardrails:
- Do not add a new chat backend, durable visitor sessions, transcripts, visitor identities, raw events, private encounter runtime reuse, voice/avatar, Salon/live chat, matching/recommendation infra, billing, Stripe, queue, Redis, Cloudflare, workers, provider architecture, hosted runtime architecture, launch claims, or broad Discover redesign.
- Do not persist or expose visitor messages/replies, prompts, completions, provider payloads, source bodies, raw events, private ids, owner ids, persona ids, cookies, auth headers, user agents, IP addresses, tokens, credentials, or secret-shaped values.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:personas
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/discover-roulette.test.ts apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
ARIADNE:
- After ARGUS accepts implementation, MIMIR should route hosted desktop/375px/390px rehearsal proving /discover/roulette, local five-message exhaustion, eligible-persona selection or bounded empty state, signed-in-alpha exclusion, public page/Discover compatibility, privacy/scope, and no forbidden runtime or launch claims.
```
