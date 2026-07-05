# PR492A - Owner-Controlled Anonymous Public Chat Gate Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for DAEDALUS implementation

## Verdict

```text
ACCEPT_PR492A_OWNER_CONTROLLED_ANONYMOUS_GATE
```

ARGUS accepts the smallest runtime expansion slice for owner-controlled
anonymous public persona chat. This is not a broad public launch and not a
default-on anonymous mode.

## Decision

The safe PR492A slice is a separate default-off owner consent gate for
anonymous public chat.

`public_chat_enabled` must remain the base public chat enable/disable switch
and rollback control. It must not be reinterpreted as anonymous visitor consent.

The new owner-controlled source of truth should be:

```text
personas.public_anonymous_chat_enabled boolean not null default false
API patch field: publicAnonymousChatEnabled
```

For non-replay personas, anonymous public chat may be available only when all
of these are true:

- the persona is `visibility:"public"`;
- the persona has a safe non-UUID public slug;
- the owner is still eligible to expose public personas through the existing
  public persona tier/eligibility helper;
- `public_chat_enabled` is true;
- `public_anonymous_chat_enabled` is true;
- fail-closed operational rate limiting is available;
- the platform public persona provider route is configured;
- owner token budget checks pass before provider calls.

The existing replay alpha slug may remain a legacy compatibility allow:

```text
station-replay-alpha-persona
```

That compatibility must not become a second broad allowlist, pattern match, env
flag, or seed-driven bypass. Any new non-replay anonymous availability must use
the new owner gate.

## Required Data Boundary

DAEDALUS should add one migration:

```text
infra/supabase/migrations/068_public_persona_anonymous_chat_gate.sql
```

Required migration behavior:

- add `public.personas.public_anonymous_chat_enabled boolean not null default false`;
- leave every existing non-replay persona defaulted to false;
- do not backfill `station-replay-signed-in-alpha-persona`;
- do not create a new visitor, session, transcript, event, queue, billing, or
  provider table;
- add a column comment that names this as owner opt-in for anonymous public
  chat alpha;
- add a database check constraint plus API fail-closed behavior so anonymous
  gate true cannot survive private visibility or disabled public chat.

`station-replay-signed-in-alpha-persona` must remain a negative control:

```text
public_chat_enabled:true
public_anonymous_chat_enabled:false
publicPersonaChatMode: signed_in_alpha
signed-out anonymous POST: public_persona_auth_required
```

## Required Runtime Boundary

DAEDALUS may update the public persona mode resolver so it accepts the persona
row or an equivalent capability input instead of deriving mode from only the
slug.

Accepted resolver shape:

```text
anonymous_alpha when:
- public_slug is station-replay-alpha-persona, or
- public_anonymous_chat_enabled is true

signed_in_alpha otherwise
```

The public chat POST route must keep the existing order and fail-closed shape:

- load only eligible public persona fields needed for the route;
- reject disabled public chat before any counters, rate-limit increments,
  provider calls, token accounting, or source retrieval;
- reject signed-out visitors with `public_persona_auth_required` unless the
  resolved mode is `anonymous_alpha`;
- increment aggregate counters only after the persona passed auth/mode checks;
- rate-limit signed-in visitors by user id and anonymous visitors by minimized
  hashed request-address key only;
- fail closed before provider calls or token usage when rate limiting is
  unavailable;
- keep owner-paid token attribution with `chat_id:null`;
- persist no anonymous visitor transcript, identity, raw request event, cookie,
  auth header, user agent, IP address, prompt, completion, provider payload, or
  public chat raw event.

Prompt/source behavior must not change. Anonymous public chat remains limited
to:

```text
public_profile
published_public_documents
linked_public_discussions
```

Do not add private Memory, Archive, Canon, Continuity, Integrity, owner setup,
provider settings, private documents, source bodies, storage paths, signed URLs,
public Salon prompt-source overclaim, or broad public context expansion.

## Required Owner Control And Readback

Owner control may be added only to existing owner-scoped persona surfaces:

- existing `PATCH /personas/:id`;
- existing Studio persona management/workspace public interaction area;
- existing owner/admin public interaction readback helpers.

API behavior:

- accept `publicAnonymousChatEnabled?: boolean` only for the authenticated
  persona owner;
- reject enabling anonymous chat for private personas, unsafe slugs, disabled
  public chat, or public-persona-ineligible owners;
- if `publicChatEnabled:false` or private visibility is set, force
  `public_anonymous_chat_enabled:false`;
- do not let non-owners observe or mutate the raw owner gate;
- do not expose raw owner ids, persona ids, provider config values, stack
  traces, secrets, or env names in responses.

Owner/admin readback should make the gate truth visible without exposing private
state:

- owner gate enabled/disabled;
- current mode: `signed_in_alpha` or `anonymous_alpha`;
- blocker when the owner gate is off;
- blocker when rate limit or provider readiness is unavailable;
- rollback copy: disabling public chat closes signed-in and anonymous public
  chat;
- no transcript/identity/raw-event storage;
- aggregate counters only;
- owner-paid token attribution.

Public pages may naturally show anonymous chat controls when public readback
returns enabled `anonymous_alpha`. They must not show owner/admin readiness
details, private ids, provider readiness internals, placeholder controls, or
broad launch claims.

## Allowed Files

Implementation should stay in this file set unless DAEDALUS finds a directly
necessary neighboring test or type file:

- `infra/supabase/migrations/068_public_persona_anonymous_chat_gate.sql`
- `packages/db/src/types.ts`
- `packages/types/src/persona.ts`
- `apps/api/src/lib/persona-serialization.ts`
- `apps/api/src/lib/public-persona-eligibility.ts`, only if existing helper
  reuse needs a small wrapper;
- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/api/src/routes/spaces.ts` and `apps/api/src/routes/spaces.test.ts`,
  only to keep public persona cards serialized with the new mode source;
- `apps/api/src/routes/discover.ts`, only if public persona search cards need
  the new selected field;
- `apps/web/lib/public-persona-route.ts`
- `apps/web/lib/public-persona-route.test.ts`
- `apps/web/lib/public-persona-interaction.ts`
- `apps/web/lib/public-persona-interaction.test.ts`
- `apps/web/components/studio/persona-management.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- roadmap and validation docs.

## Forbidden Scope

PR492A must not:

- enable anonymous chat for all public personas by default;
- treat `public_chat_enabled:true` alone as anonymous consent;
- add env flags, remote config, Cloudflare, Redis, queues, workers, background
  jobs, billing, Stripe, OAuth, connectors, social dispatch, public launch copy,
  or broad UI redesign;
- change provider/model routing, prompt/retrieval architecture, token
  attribution, signed-in public chat behavior, public reporting/moderation, or
  public roulette beyond serialization no-drift;
- change private persona chat, private runtime context, Memory, Archive, Canon,
  Continuity, Integrity, owner setup, provider settings, private documents, or
  private source retrieval;
- persist anonymous visitor transcripts, identities, raw events, cookies, auth
  headers, user agents, IPs, prompts, completions, provider payloads, or public
  chat raw events;
- expose private/raw/secret-shaped values in logs, docs, UI, tests, or committed
  fixtures.

## Required Tests

DAEDALUS must add or update focused tests proving:

- existing replay slug remains `anonymous_alpha`;
- `station-replay-signed-in-alpha-persona` remains `signed_in_alpha` and
  signed-out anonymous POST returns `public_persona_auth_required`;
- ordinary public personas default to signed-in alpha even with
  `public_chat_enabled:true`;
- setting `publicAnonymousChatEnabled:true` on an eligible public persona makes
  only that persona anonymous alpha;
- disabling public chat or making the persona private forces anonymous gate
  false and denies signed-out anonymous POST before provider calls/token usage;
- non-owner, private, unsafe-slug, and public-persona-ineligible owner attempts
  fail closed;
- rate-limit unavailable and provider unavailable states block anonymous chat
  before provider calls and show bounded owner readback;
- provider payload remains public profile, published public documents, and
  linked public discussions only;
- no conversations, conversation messages, moderation reports, visitor identity
  rows, raw event rows, transcript rows, raw IP/user-agent/cookie/auth values,
  prompts, completions, provider payloads, or visitor ids are stored by
  anonymous chat;
- public Space/discover cards, public persona page helper behavior, and owner
  readback labels reflect the new mode without leaking private fields;
- public reports remain signed-in/server-owned.

## Required Validation

DAEDALUS must run:

```powershell
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/spaces.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If `apps/api/src/routes/discover.ts` changes, DAEDALUS should add or run the
closest available focused discover/search serialization test and name it in the
result.

## Required ARGUS Review Focus

ARGUS should review the implementation for:

- owner scope on every mutation;
- default-off and rollback behavior;
- no accidental `public_chat_enabled` reinterpretation;
- no broad anonymous enablement;
- signed-in-only fixture no-drift;
- no private-context or public Salon prompt-source overclaim;
- fail-closed rate limit/provider/token behavior before provider calls;
- aggregate-only storage;
- no secret/raw/private values in UI, logs, docs, tests, or committed fixtures;
- no Cloudflare, Redis, queue, worker, connector, OAuth, billing, or public
  launch drift.

## Required ARIADNE Hosted Proof

After ARGUS accepts implementation, MIMIR should route ARIADNE hosted rehearsal.

ARIADNE must verify desktop plus `375px` and `390px` mobile where UI changed:

- hosted web/API freshness at the accepted implementation commit or later;
- owner route shows default-off anonymous gate for the ordinary fixture;
- owner can enable anonymous gate for an approved test persona only when public
  chat is enabled and owner is eligible;
- signed-out anonymous POST succeeds only for the explicitly enabled persona and
  replay alpha;
- `station-replay-signed-in-alpha-persona` remains signed-in alpha and
  anonymous-denied;
- disabling public chat closes anonymous chat;
- rate-limit/provider readiness copy remains bounded;
- public page fit has no overlapping controls;
- no private/raw/secret/provider/token/cookie/header/IP/user-agent readback,
  public Salon chat-source overclaim, broad launch claim, placeholder control,
  or runtime expansion beyond the owner-enabled test persona appears.

If hosted seed or owner control access is unavailable, ARIADNE should return a
concrete blocker without printing or requesting secret values.

## Preflight Validation Performed

ARGUS reviewed the PR492 handoff, PR491A closeout, PR490B closeout, PR490A
preflight result, PR468 closeout, current public persona resolver, route,
rate-limit, provider payload, owner/admin readback, public page helpers, Studio
readback, migrations/types, and relevant tests.

Validation run on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Current runtime is still replay-slug-only for anonymous alpha; the accepted next slice is a separate owner gate, not `public_chat_enabled` reinterpretation. |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 15 tests passed, including replay-only anonymous alpha, ordinary signed-in denial, hashed rate limits, public-source-only provider payloads, owner rollback, no transcript/identity persistence, and owner interaction readback. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 report tests passed; public reporting remains signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 12 public persona route/interaction helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched docs files. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR492A as the smallest safe owner-controlled anonymous public chat gate runtime slice.
- Anonymous eligibility for non-replay public personas must use a new separate default-off owner gate, personas.public_anonymous_chat_enabled / publicAnonymousChatEnabled, not public_chat_enabled alone.
- public_chat_enabled remains the base public chat enable/disable and rollback switch; disabling public chat or making the persona private must close anonymous chat.
- station-replay-alpha-persona may remain the legacy anonymous alpha slug, but station-replay-signed-in-alpha-persona must stay signed-in alpha and anonymous-denied.
- Preserve public-source-only prompting, fail-closed rate limits, provider readiness blocks, owner-paid token attribution, aggregate-only counters, signed-in public reporting, and no anonymous transcript/identity/raw-event storage.
Task:
- Implement the bounded PR492A gate using the allowed API/schema/type/Studio/helper/test surfaces named in the preflight result.
- Add focused tests for default-off behavior, one owner-enabled non-replay anonymous persona, rollback, negative fixture no-drift, owner scope, ineligible/private/unsafe denial, rate-limit/provider fail-closed behavior, source/persistence boundaries, public card serialization, and report no-drift.
Guardrails:
- Do not reinterpret public_chat_enabled as anonymous consent, enable anonymous chat for all public personas, add broad launch/UI copy, change provider/model routing, prompt architecture, billing, workers, queues, Redis, Cloudflare, connectors, OAuth, social dispatch, or public reporting/moderation.
- Do not persist or expose anonymous visitor transcripts, identities, raw events, IPs, user agents, cookies, auth headers, prompts, completions, provider payloads, private source bodies, owner setup, provider settings, route-only ids, credentials, tokens, or secret-shaped values.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:personas
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/spaces.test.ts
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
ARIADNE:
- After ARGUS accepts implementation, MIMIR should route hosted desktop/375px/390px rehearsal proving owner gate default-off, one approved owner-enabled non-replay anonymous persona, replay no-drift, signed-in fixture anonymous denial, rollback, mobile fit, privacy/scope, safe readback, and no broad runtime expansion claims.
```
