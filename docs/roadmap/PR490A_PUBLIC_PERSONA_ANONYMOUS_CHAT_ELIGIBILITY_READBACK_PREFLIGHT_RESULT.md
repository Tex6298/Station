# PR490A - Public Persona Anonymous Chat Eligibility Readback Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for DAEDALUS implementation

## Verdict

```text
ACCEPT_PR490A_ELIGIBILITY_READBACK
```

ARGUS accepts PR490A as an owner/admin eligibility readback lane only. Do not
expand anonymous public persona chat runtime behavior in this slice.

## Decision

Do not implement the owner-controlled anonymous enable gate yet. The current
runtime still derives anonymous mode from a single hard-coded replay slug:

```text
station-replay-alpha-persona
```

Other owner-enabled public personas remain signed-in public chat only, and
anonymous visitors to those personas return `public_persona_auth_required`.
That is the correct fail-closed posture until MIMIR accepts a data/product model
for anonymous eligibility beyond the replay alpha.

Do not open second replay persona proof yet. PR468 closeout explicitly noted
that the hosted sample did not expose a second visible public persona to test
for deny/default behavior. Without a concrete non-production hosted fixture,
opening a second anonymous runtime proof would either be fake or would require
seed/config decisions outside ARGUS' preflight role.

The smallest safe PR490A is therefore owner/admin readback that makes the
existing truth visible:

- whether public chat is enabled;
- whether the current mode is signed-in alpha or anonymous alpha;
- which owner controls rollback;
- whether anonymous runtime is available now or blocked by the current one-slug
  alpha policy;
- public-source-only prompt constraint;
- fail-closed rate-limit constraint;
- `transcriptStored:false` and no visitor identity/raw event storage;
- provider readiness/blocker copy if it can be derived from config without a
  provider call;
- why a persona is not public/routeable/eligible.

## Accepted Implementation Boundary

Allowed files:

- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/lib/public-persona-interaction.ts`
- `apps/web/lib/public-persona-interaction.test.ts`
- `apps/web/lib/public-persona-route.ts`, only for no-drift copy/tests if
  needed
- `apps/web/lib/public-persona-route.test.ts`, only for public-page no-drift
  assertions if needed
- `packages/types/src/persona.ts`, only for owner/admin readback type fields
- roadmap and validation docs

Do not touch migrations, schema, seed data, provider/model routing, prompt/
retrieval architecture, private persona chat, private runtime context, billing,
Stripe, workers, queues, Redis Memory truth, Cloudflare, connectors, OAuth,
social dispatch, public reporting behavior, moderation actions, public roulette
behavior, or broad public persona UI redesign.

## Allowed Product Work

DAEDALUS may refine the existing owner/admin persona readback returned by
`GET /personas/:id` for the owner or admin viewer.

The readback may extend `publicInteraction.publicChat` or add a similarly
bounded owner-only nested readback object to name:

- current chat mode from the same accepted mode resolver used by public
  readback;
- enabled/disabled state from `public_chat_enabled`;
- owner rollback/control as owner-controlled public chat enable/disable;
- anonymous availability for the single accepted replay slug only;
- explicit blocker copy for non-replay public personas, unsafe slugs, private
  visibility, ineligible owner tier, disabled chat, missing provider config, or
  unavailable fail-closed rate-limit posture;
- public-source-only prompt scope: public profile, published public documents,
  linked public discussions, and accepted public Salon readback categories only
  if they are already part of public context preview;
- no visitor transcript persistence, no visitor identity storage, no raw event
  storage, and aggregate counters only.

Provider readiness may be summarized only from local configuration/readiness
helpers. Do not call a provider. Do not expose provider keys, model payloads,
owner BYOK settings, private provider policy, or raw config values.

The web may make the existing owner Studio public-interaction readback more
explicit with labels/copy derived from that owner/admin readback. It must not add
new public controls, anonymous controls for all personas, or placeholder buttons.

## Forbidden Runtime Changes

PR490A must not:

- enable anonymous chat for all public personas;
- enable anonymous chat for a second persona;
- add a new anonymous eligibility table, migration, config flag, or seed;
- reinterpret `public_chat_enabled` as anonymous chat for non-replay personas;
- change `publicPersonaChatMode` to anything broader than the accepted replay
  alpha unless MIMIR opens a separate runtime lane;
- change `POST /personas/public/:publicSlug/chat` allow/deny behavior;
- persist anonymous visitor transcripts, visitor identity, raw request events,
  cookies, auth headers, user agents, IPs, prompts, completions, provider
  payloads, or public chat raw events;
- alter rate-limit keys or fail-closed behavior;
- alter token attribution away from the persona owner with `chat_id:null`;
- change public reporting from signed-in only;
- add public launch, commercial, or broad availability claims.

## Required No-Drift Tests

DAEDALUS must add or preserve focused tests proving:

- owner/admin readback reports `anonymous_alpha` for the accepted replay alpha
  slug and `signed_in_alpha` for ordinary public personas;
- non-replay public personas with `public_chat_enabled:true` remain signed-in
  alpha and still return `public_persona_auth_required` for anonymous visitors;
- owner disable remains rollback for signed-in and anonymous paths;
- readback explains public-source-only prompting, `transcriptStored:false`, no
  visitor identity/raw event storage, aggregate counters only, and fail-closed
  rate-limit posture without exposing raw ids or secret-shaped values;
- ineligible owner tier, private visibility, unsafe public slug, disabled chat,
  provider unavailable, and rate-limit unavailable states have honest blocker
  copy without provider calls or secret/config readback;
- public readback and public page behavior do not gain anonymous controls except
  for the already accepted replay alpha when enabled;
- public reporting remains signed-in only;
- provider payload tests still exclude private Memory, Archive, Canon,
  Continuity, Integrity, owner setup, provider settings, private documents,
  route-only ids, credentials, storage paths, and source bodies;
- no conversations, conversation messages, moderation reports, durable visitor
  identity rows, raw event rows, or visitor transcript rows are created by
  anonymous chat.

## Required Validation

DAEDALUS must run:

```powershell
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

ARGUS should review the implementation diff against this accepted boundary
before routing ARIADNE.

## Required ARIADNE Rehearsal

Because PR490A may change visible owner/admin readback, ARGUS requires ARIADNE
hosted rehearsal after ARGUS accepts the implementation.

ARIADNE should verify hosted web/API health and rehearse desktop plus `375px`
and `390px` mobile viewports.

Required route and state checks:

- owner Studio persona page for the accepted replay alpha persona if the hosted
  seed is available;
- owner Studio persona page for at least one ordinary public persona if hosted
  data safely exposes one;
- public persona page for `station-replay-alpha-persona` remains anonymous alpha
  only when enabled;
- ordinary public personas do not show anonymous chat controls;
- no public runtime behavior changes or broad anonymous availability claims;
- readback labels fit on mobile and do not overlap;
- no raw owner/persona/document/thread/source ids in visible text;
- no private Memory, Archive, Canon, Continuity, Integrity, owner setup,
  provider settings, private source text, storage/signed URLs, provider
  payloads, stack traces, tokens, cookies, API keys, bearer/JWT-shaped values,
  or secret-shaped values appear.

If hosted data lacks a second public persona, ARIADNE should record that fixture
gap rather than inventing proof.

## Preflight Validation Performed

ARGUS reviewed the PR490 handoff, PR489A closeout, PR468 preflight/review/
closeout/rehearsal evidence, current public persona route code, public persona
eligibility helper, public chat mode resolver, owner public-interaction
readback, public persona web helpers/components/tests, and focused personas/
reports tests.

Validation run on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Current anonymous runtime is still one replay slug only; owner readback is the safe first slice because it is thinner than the runtime truth and currently does not surface anonymous eligibility/blockers clearly. |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 15 personas tests passed, including signed-in public chat, anonymous replay-slug-only chat, hashed rate limits, public-source-only provider payloads, owner rollback, no transcript/identity persistence, and owner interaction readback. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 report tests passed; public reporting remains signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 10 public persona route/interaction helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR490A as Public Persona Anonymous Chat Eligibility Readback, not runtime expansion.
- Current anonymous chat remains hard-coded to station-replay-alpha-persona; other public personas must stay signed-in alpha and anonymous denied unless MIMIR opens a later runtime lane.
- The safe first slice is owner/admin readback that explains enabled/disabled state, signed-in vs anonymous alpha mode, owner rollback, public-source-only scope, fail-closed rate limits, no visitor transcript/identity/raw events, provider readiness/blockers if config-derived only, and concrete ineligibility reasons.
Task:
- Refine owner/admin persona readback and existing Studio public-interaction UI/helpers so owners can see anonymous eligibility truth and blockers without changing public runtime behavior.
- Fix the readback gap where owner public-interaction chat mode does not clearly reflect the accepted anonymous replay alpha mode.
- Add focused tests for replay anonymous readback, non-replay signed-in-only default, anonymous deny/no runtime expansion, rollback, public-source-only/no-transcript/no-visitor-identity copy, blocker copy, and public page/reporting no-drift.
Guardrails:
- Do not enable anonymous chat for all public personas, add a second anonymous persona, add migrations/schema/seeds/config gates, reinterpret public_chat_enabled as anonymous for non-replay personas, change POST /personas/public/:publicSlug/chat allow/deny behavior, alter rate limits or owner token attribution, persist visitor transcripts/identity/raw events, change public reporting, call providers for readiness, or expose private/source/secret data.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:personas
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
ARIADNE:
- After ARGUS accepts implementation, route hosted desktop/375px/390px rehearsal for owner Studio persona public-interaction readback and public persona no-drift, covering replay alpha if seeded, ordinary public persona deny/default if available, mobile fit, no broad anonymous claims, no private/raw/secret visible text, and recording fixture gaps honestly if hosted data lacks a second public persona.
```
