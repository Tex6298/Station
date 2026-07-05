# PR492A - Owner-Controlled Anonymous Public Chat Gate Review Result

Owner: ARGUS / A3

Implemented by: DAEDALUS / A2

Date reviewed: 2026-07-05

Status: Accepted by ARGUS - ready for MIMIR to route hosted proof

## Verdict

```text
ACCEPT_PR492A_OWNER_CONTROLLED_ANONYMOUS_GATE_IMPLEMENTATION
```

ARGUS accepts DAEDALUS' PR492A implementation without a review patch.

## Review Summary

The implementation matches the accepted owner-controlled anonymous gate
boundary:

- added `personas.public_anonymous_chat_enabled boolean not null default false`;
- added API patch field `publicAnonymousChatEnabled`;
- kept `public_chat_enabled` as the base public chat enable/disable and rollback
  switch;
- added a database check constraint requiring anonymous gate true to have public
  visibility and public chat enabled;
- forced the anonymous gate false when public chat is disabled or visibility is
  private;
- kept `station-replay-alpha-persona` as the legacy replay anonymous alpha slug;
- made non-replay anonymous alpha require the new owner gate;
- kept ordinary public personas defaulted to `signed_in_alpha`;
- kept public readback/cards exposing mode without exposing the raw owner gate;
- added scoped owner Studio control through the existing owner PATCH route.

No ARGUS review patch was needed.

## Boundary Checks

ARGUS confirmed:

- owner mutation remains scoped by authenticated owner and persona id;
- non-owner anonymous gate mutation returns not found;
- private, unsafe-slug, disabled-public-chat, and public-persona-ineligible
  owner attempts fail closed;
- signed-out non-anonymous requests still return
  `public_persona_auth_required` before counters, rate limits, source retrieval,
  provider calls, or token usage;
- anonymous requests still hit fail-closed rate limits before provider calls;
- provider unavailable and quota failures still stop before provider success;
- token attribution remains owner-paid with `chat_id:null`;
- anonymous chat still creates no conversations, conversation messages, visitor
  identity rows, raw event rows, transcripts, moderation reports, raw
  IP/user-agent/cookie/auth-header storage, prompts, completions, or provider
  payload persistence;
- public chat prompt/source scope remains public profile, published public
  documents, and linked public discussions only;
- public reporting remains signed-in/server-owned;
- Space, Discover, roulette, and public persona cards serialize `publicChat`
  mode without leaking `public_anonymous_chat_enabled` or
  `publicAnonymousChatEnabled`;
- `station-replay-signed-in-alpha-persona` remains a signed-in-alpha negative
  control unless an owner explicitly enables the new gate;
- no provider/model routing, prompt architecture, billing, worker, queue, Redis,
  Cloudflare, connector, OAuth, social dispatch, moderation/reporting, or broad
  launch/UI behavior changed.

## Validation

ARGUS reran the requested validation on 2026-07-05:

| Command | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Reviewed migration, DB/types, API resolver/routes, public card serialization, owner Studio control, helper copy, docs, and focused tests against the PR492A preflight boundary. |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 16 tests passed, including owner-gated default-off behavior, owner-only mutation, signed-in fixture no-drift, rollback, fail-closed provider/rate-limit behavior, aggregate-only storage, replay compatibility, and public-source-only payloads. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 report tests passed; public reports remain signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/spaces.test.ts` | Pass | 2 spaces tests passed; public Space persona cards serialize anonymous mode without raw gate leakage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 13 public persona route/interaction helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/community.test.ts` | Pass | 27 community/Discover tests passed, including public persona card mode serialization and raw gate no-leak. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed with fresh cache misses. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only for ARGUS/DAEDALUS state receipts. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Required Hosted Proof

MIMIR should route ARIADNE hosted desktop/`375px`/`390px` rehearsal before
closeout.

Required hosted checks:

- hosted web/API health and implementation commit freshness at `a2d3f6be` or
  later;
- migration applied and default-off gate visible on the ordinary public persona
  fixture;
- owner can enable anonymous gate for one approved non-replay public persona
  only when public chat is enabled and owner is eligible;
- signed-out anonymous POST succeeds only for the explicitly enabled non-replay
  persona and the replay alpha slug;
- `station-replay-signed-in-alpha-persona` remains signed-in alpha and
  anonymous-denied; use a different approved non-replay persona for the
  owner-enabled proof;
- disabling public chat closes anonymous chat and forces the gate off;
- owner/admin readback names gate state, rollback, fail-closed rate-limit
  posture, provider readiness/blockers, no transcript/identity/raw-event
  storage, aggregate counters, and owner-paid attribution;
- public pages fit on desktop, `375px`, and `390px` without overlap;
- public cards/pages expose mode but not the raw owner gate;
- public-source-only prompt scope, signed-in reporting, replay no-drift, and
  privacy/scope checks pass;
- no private/raw/secret/provider/token/cookie/header/IP/user-agent readback,
  public Salon chat-source overclaim, broad launch claim, placeholder control,
  or runtime expansion beyond owner-enabled personas appears.

If hosted migration/seed/control access is unavailable, ARIADNE should return a
concrete blocker without printing or requesting secret values.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted DAEDALUS' PR492A owner-controlled anonymous public chat gate implementation without a review patch.
- The implementation adds a separate default-off public_anonymous_chat_enabled owner gate and publicAnonymousChatEnabled PATCH field; public_chat_enabled remains the base public chat enable/disable and rollback switch.
- Non-replay anonymous alpha requires the owner gate, while station-replay-alpha-persona remains legacy anonymous alpha and ordinary public personas remain signed-in alpha by default.
- ARGUS confirmed owner scope, rollback, public card/readback no-leak, fail-closed rate/provider behavior, owner-paid token attribution, public-source-only prompting, signed-in reporting, aggregate-only counters, and no anonymous transcript/identity/raw-event storage.
Task:
- Route ARIADNE hosted desktop/375px/390px proof before PR492A closeout.
- Verify hosted freshness at a2d3f6be or later, migration/default-off gate, owner enable for one approved non-replay persona, signed-out success only for owner-enabled/replay personas, signed-in fixture denial, rollback, public card/page no-leak, mobile fit, privacy/scope, and no broad runtime expansion claims.
Guardrails:
- Do not print or request secret values.
- Do not treat local tests as hosted proof.
- If hosted migration/seed/control access is unavailable, record the exact blocker without exposing secrets.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:personas
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/spaces.test.ts
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/community.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
```
