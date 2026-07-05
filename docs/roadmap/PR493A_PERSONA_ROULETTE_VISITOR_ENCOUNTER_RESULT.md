# PR493A - Persona Roulette Visitor Encounter Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Preflight accepted by: ARGUS / A3

Date implemented: 2026-07-05

Status: Ready for ARGUS review

## Result

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the narrow protected-alpha Persona Roulette visitor
encounter accepted in:

`docs/roadmap/PR493A_PERSONA_ROULETTE_VISITOR_ENCOUNTER_PREFLIGHT_RESULT.md`

## Implementation

- Added public `/discover/roulette` as a real visitor encounter screen.
- The route draws one public persona through
  `GET /personas/public/roulette?limit=1&chatMode=anonymous_alpha`.
- The page reuses the existing
  `POST /personas/public/:publicSlug/chat` endpoint for messages.
- Visible conversation text stays in React component memory only.
- `sessionStorage` stores only safe route-local encounter state:
  public slug, submitted count, and exhausted state.
- The five-message limit is presented as browser-session UX, while server rate
  limits, provider readiness, quota checks, and owner-paid token accounting
  remain the real enforcement boundaries.
- Discover keeps default roulette compatibility and adds only a small
  `/discover/roulette` CTA.

## API Boundary

`GET /personas/public/roulette` now accepts the optional filter:

```text
chatMode=anonymous_alpha
```

Default behavior remains compatible when the filter is absent.

When present, the filter narrows candidates to public personas that already
satisfy the anonymous public chat boundary:

- public visibility and safe public slug;
- owner remains eligible for public personas;
- public chat enabled;
- anonymous mode derived from the existing public persona chat mode resolver;
- non-replay personas require the owner anonymous gate;
- rate-limit backing must be available;
- provider route must be locally configured for the owner tier.

Candidate selection does not call providers, spend tokens, create visitor
records, increment chat counters, or write transcript/event rows.

## Storage Boundary

The encounter does not persist:

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

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 16 tests passed, including default roulette compatibility, anonymous filter narrowing, owner gate, rate-limit unavailable, provider unavailable, public no-leak, and replay compatibility coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed; public reports remain signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/discover-roulette.test.ts apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 17 focused web helper tests passed, including browser-session limit, safe session serialization, public-source-only copy, and route helper no-leak coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are documented as non-failures in the validation baseline.

## Non-Goals Preserved

PR493A did not add a new chat backend, durable visitor session, transcript
table, visitor identity, raw event table, provider route, queue, worker, Redis,
Cloudflare, billing, Stripe, OAuth, connector, voice/avatar mode, Salon/live
chat, matching, recommendation infrastructure, public launch claim, moderation
console, or broad Discover redesign.

## ARGUS Review Focus

ARGUS should review:

- anonymous eligibility filter correctness;
- default roulette compatibility;
- owner gate and signed-in-alpha no-drift;
- no candidate-selection provider calls, token use, counters, or visitor rows;
- no private-source, raw id, secret-shaped, provider, setup, cookie, header,
  user-agent, IP, prompt, completion, source-body, transcript, or identity
  leakage;
- five-message limit honesty;
- reuse of the existing public persona chat endpoint;
- public reports remaining signed-in/server-owned;
- no private encounter runtime reuse;
- no broad runtime, billing, queue, worker, Cloudflare, Redis, Salon/live chat,
  voice/avatar, matching, recommendation, launch-claim, or Discover redesign
  drift.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR493A as a bounded protected-alpha Persona Roulette visitor encounter.
- /discover/roulette draws one anonymous-eligible public persona, reuses POST /personas/public/:publicSlug/chat, and keeps visible transcript text in component memory only.
- GET /personas/public/roulette now has optional chatMode=anonymous_alpha narrowing; default roulette behavior remains compatible.
- Browser session storage contains only safe slug/count/exhausted state, and the five-message limit is honest UX rather than abuse enforcement.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:personas
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/discover-roulette.test.ts apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
Task:
- Review PR493A against the accepted preflight, especially anonymous eligibility, owner-gate no-drift, storage/no-leak boundaries, and default roulette compatibility.
- If accepted, wake MIMIR for ARIADNE hosted desktop/375px/390px rehearsal routing.
- If fixes are needed, wake DAEDALUS with the smallest repair.
```
