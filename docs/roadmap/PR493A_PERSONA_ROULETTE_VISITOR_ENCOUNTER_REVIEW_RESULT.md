# PR493A - Persona Roulette Visitor Encounter Review Result

Owner: ARGUS / A3

Implemented by: DAEDALUS / A2

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for MIMIR hosted rehearsal routing

## Verdict

```text
ACCEPT_PR493A_ROULETTE_VISITOR_ENCOUNTER_IMPLEMENTATION
```

ARGUS accepts the PR493A implementation without a code patch. The implemented
slice matches the accepted protected-alpha Persona Roulette visitor encounter
lane and stays inside the preflight boundary.

## Review

DAEDALUS added the public `/discover/roulette` encounter route and reused the
existing `POST /personas/public/:publicSlug/chat` endpoint. The page draws one
candidate through:

```text
GET /personas/public/roulette?limit=1&chatMode=anonymous_alpha
```

The encounter keeps visible message text in component memory only.
`sessionStorage` is limited to safe public slug, submitted-count, and exhausted
state. It does not store prompts, completions, provider payloads, visitor
identity, raw events, private source bodies, cookies, auth headers, user agents,
IP addresses, owner ids, persona ids, or secret-shaped values.

The five-message limit is presented honestly as browser-session UX. Existing
server anonymous public chat rate limits, provider readiness, quota checks, and
owner-paid token accounting remain the real enforcement boundaries.

## API Boundary

`GET /personas/public/roulette` now accepts only the optional
`chatMode=anonymous_alpha` narrowing filter. Default roulette behavior remains
compatible for Discover cards.

When the filter is present, candidate selection:

- keeps public visibility, safe slug, and owner public-persona eligibility;
- requires existing `publicPersonaChatMode(...) === "anonymous_alpha"`;
- preserves the owner anonymous gate for non-replay personas and replay alpha
  compatibility;
- excludes disabled public chat;
- fails closed when operational rate-limit backing is unavailable;
- excludes candidates when the platform public persona provider route is not
  locally configured;
- does not call providers, spend tokens, increment chat counters, create
  visitor rows, or write transcript/event rows.

The public card serializer still returns routeable public fields only and does
not expose raw owner gate, owner id, persona id, provider config, setup fields,
private source fields, report counters, or secret-shaped values.

## Scope Check

Allowed surfaces changed:

- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/web/app/discover/roulette/page.tsx`
- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/lib/discover-roulette.ts`
- `apps/web/lib/discover-roulette.test.ts`
- roadmap and validation docs

No forbidden scope entered PR493A. ARGUS found no new chat backend, durable
visitor session, transcript table, visitor identity, raw event table, provider
route, queue, worker, Redis, Cloudflare, billing, Stripe, OAuth, connector,
voice/avatar mode, Salon/live chat, matching, recommendation infrastructure,
public launch claim, moderation/reporting change, private encounter runtime
reuse, or broad Discover redesign.

## Validation

ARGUS reran the requested validation on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Implementation matches the accepted PR493A boundary and keeps anonymous eligibility, owner gate, storage, no-leak, and default roulette compatibility intact. |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 16 tests passed, including roulette default compatibility, anonymous filter narrowing, owner gate, rate-limit unavailable, provider unavailable, public no-leak, replay compatibility, and public chat boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed; public reports remain signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/discover-roulette.test.ts apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 17 focused web helper tests passed, including browser-session limit, safe session serialization, public-source-only copy, and route helper no-leak coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning only for `.station-agents/state/ARGUS.json`; no whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are documented as non-failures in the validation baseline.

## Required MIMIR / ARIADNE Next Step

MIMIR should route ARIADNE hosted rehearsal before PR493A closeout.

ARIADNE should verify hosted desktop plus `375px` and `390px` mobile:

- hosted web/API freshness at `d554f493` or later;
- `/discover/roulette` loads an anonymous-eligible owner-gated persona or a
  bounded empty/unavailable state;
- signed-out visitor can send within the local five-message UX limit when an
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

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted the PR493A Persona Roulette Visitor Encounter implementation without a code patch.
- /discover/roulette reuses POST /personas/public/:publicSlug/chat, draws through the optional chatMode=anonymous_alpha roulette filter, and keeps visible messages in component memory only.
- sessionStorage is limited to safe slug/count/exhausted state; no transcript, visitor identity, raw event, provider payload, source body, cookie, header, IP, user-agent, owner id, persona id, or secret-shaped storage/readback was found.
- Default roulette compatibility, owner gate, signed-in-alpha denial, provider/rate fail-closed behavior, public-source-only chat, and signed-in/server-owned public reports passed review validation.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:personas
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/discover-roulette.test.ts apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
Task:
- Route ARIADNE hosted desktop/375px/390px rehearsal for PR493A before closeout.
- Verify /discover/roulette candidate selection or bounded empty state, local five-message exhaustion, CTA, signed-in-alpha exclusion, replay/owner-gated no-drift, Discover/public page compatibility, privacy/no-leak readback, and no forbidden launch/runtime claims.
```
